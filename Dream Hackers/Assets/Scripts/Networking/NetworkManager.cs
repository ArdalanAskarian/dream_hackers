using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

namespace DreamHackers.Networking
{
    /// <summary>
    /// Manages WebSocket connection to the Dream Hackers server.
    /// Singleton pattern - access via NetworkManager.Instance
    /// </summary>
    public class NetworkManager : MonoBehaviour
    {
        public static NetworkManager Instance { get; private set; }

        [Header("Server Configuration")]
        [SerializeField] private string serverIP = "192.168.1.100";
        [SerializeField] private int serverPort = 8080;
        [SerializeField] private bool autoConnectOnStart = true;

        [Header("Debug")]
        [SerializeField] private bool showDebugLogs = true;

        // Events
        public event Action<string> OnObjectSwiped;
        public event Action OnConnected;
        public event Action OnDisconnected;

        // Connection state
        public bool IsConnected { get; private set; }
        public string ServerAddress => $"{serverIP}:{serverPort}";

        private ClientWebSocket webSocket;
        private CancellationTokenSource cancellationTokenSource;
        private readonly ConcurrentQueue<string> messageQueue = new ConcurrentQueue<string>();
        private bool isConnecting = false;

        private void Awake()
        {
            // Singleton setup
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            if (autoConnectOnStart)
            {
                Connect();
            }
        }

        private void Update()
        {
            // Process messages on main thread
            while (messageQueue.TryDequeue(out string message))
            {
                ProcessMessage(message);
            }
        }

        private void OnDestroy()
        {
            Disconnect();
        }

        private void OnApplicationQuit()
        {
            Disconnect();
        }

        /// <summary>
        /// Connect to the WebSocket server
        /// </summary>
        public async void Connect()
        {
            if (IsConnected || isConnecting)
            {
                Log("Already connected or connecting");
                return;
            }

            isConnecting = true;
            cancellationTokenSource = new CancellationTokenSource();

            try
            {
                webSocket = new ClientWebSocket();
                var uri = new Uri($"ws://{serverIP}:{serverPort}");

                Log($"Connecting to {uri}...");

                await webSocket.ConnectAsync(uri, cancellationTokenSource.Token);

                IsConnected = true;
                isConnecting = false;

                Log("Connected successfully!");

                // Send identification message
                await SendIdentifyMessage();

                // Start receiving messages
                _ = ReceiveLoop();

                // Notify listeners on main thread
                UnityMainThreadDispatcher.Enqueue(() => OnConnected?.Invoke());
            }
            catch (Exception ex)
            {
                Log($"Connection failed: {ex.Message}");
                IsConnected = false;
                isConnecting = false;
            }
        }

        /// <summary>
        /// Disconnect from the WebSocket server
        /// </summary>
        public async void Disconnect()
        {
            if (webSocket == null) return;

            try
            {
                cancellationTokenSource?.Cancel();

                if (webSocket.State == WebSocketState.Open)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                Log($"Error during disconnect: {ex.Message}");
            }
            finally
            {
                webSocket?.Dispose();
                webSocket = null;
                IsConnected = false;

                UnityMainThreadDispatcher.Enqueue(() => OnDisconnected?.Invoke());
                Log("Disconnected");
            }
        }

        /// <summary>
        /// Send identification message to server
        /// </summary>
        private async Task SendIdentifyMessage()
        {
            var message = new NetworkMessage
            {
                type = "identify",
                clientType = "vr",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            await SendMessage(message);
            Log("Sent identify message as VR client");
        }

        /// <summary>
        /// Send spawn confirmation back to server (relayed to phone)
        /// </summary>
        public async void SendSpawnConfirmation(string objectId)
        {
            if (!IsConnected) return;

            var message = new NetworkMessage
            {
                type = "spawn_confirmed",
                objectId = objectId,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            await SendMessage(message);
            Log($"Sent spawn confirmation for: {objectId}");
        }

        /// <summary>
        /// Send a message to the server
        /// </summary>
        private async Task SendMessage(NetworkMessage message)
        {
            if (webSocket == null || webSocket.State != WebSocketState.Open)
            {
                Log("Cannot send - not connected");
                return;
            }

            try
            {
                string json = JsonUtility.ToJson(message);
                byte[] bytes = Encoding.UTF8.GetBytes(json);
                await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, cancellationTokenSource.Token);
            }
            catch (Exception ex)
            {
                Log($"Error sending message: {ex.Message}");
            }
        }

        /// <summary>
        /// Receive messages loop (runs on background thread)
        /// </summary>
        private async Task ReceiveLoop()
        {
            var buffer = new byte[4096];

            try
            {
                while (webSocket != null && webSocket.State == WebSocketState.Open && !cancellationTokenSource.Token.IsCancellationRequested)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationTokenSource.Token);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        Log($"Received: {message}");
                        messageQueue.Enqueue(message);
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Log("Server closed connection");
                        break;
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Normal cancellation
            }
            catch (Exception ex)
            {
                Log($"Receive error: {ex.Message}");
            }

            IsConnected = false;
            UnityMainThreadDispatcher.Enqueue(() => OnDisconnected?.Invoke());
        }

        /// <summary>
        /// Process received message (called on main thread)
        /// </summary>
        private void ProcessMessage(string json)
        {
            try
            {
                var message = JsonUtility.FromJson<NetworkMessage>(json);

                switch (message.type)
                {
                    case "swipe_right":
                        Log($"Object swiped: {message.objectId}");
                        OnObjectSwiped?.Invoke(message.objectId);
                        break;

                    case "connection_established":
                        Log("Server confirmed connection");
                        break;

                    case "pong":
                        // Keep-alive response
                        break;

                    default:
                        Log($"Unknown message type: {message.type}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Log($"Error processing message: {ex.Message}");
            }
        }

        private void Log(string message)
        {
            if (showDebugLogs)
            {
                Debug.Log($"[NetworkManager] {message}");
            }
        }

        /// <summary>
        /// Set server IP at runtime
        /// </summary>
        public void SetServerIP(string ip)
        {
            serverIP = ip;
        }

        /// <summary>
        /// Set server port at runtime
        /// </summary>
        public void SetServerPort(int port)
        {
            serverPort = port;
        }
    }

    /// <summary>
    /// Message structure for WebSocket communication
    /// </summary>
    [Serializable]
    public class NetworkMessage
    {
        public string type;
        public string clientType;
        public string objectId;
        public long timestamp;
        public string message;
    }

    /// <summary>
    /// Helper to dispatch actions to Unity's main thread
    /// </summary>
    public class UnityMainThreadDispatcher : MonoBehaviour
    {
        private static UnityMainThreadDispatcher instance;
        private static readonly ConcurrentQueue<Action> actions = new ConcurrentQueue<Action>();

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Initialize()
        {
            if (instance == null)
            {
                var go = new GameObject("UnityMainThreadDispatcher");
                instance = go.AddComponent<UnityMainThreadDispatcher>();
                DontDestroyOnLoad(go);
            }
        }

        public static void Enqueue(Action action)
        {
            actions.Enqueue(action);
        }

        private void Update()
        {
            while (actions.TryDequeue(out Action action))
            {
                action?.Invoke();
            }
        }
    }
}
