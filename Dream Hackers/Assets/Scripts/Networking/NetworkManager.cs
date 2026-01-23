using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

#if UNITY_WEBGL && !UNITY_EDITOR
using System.Runtime.InteropServices;
#else
using System.Net.WebSockets;
using System.Threading;
#endif

namespace DreamHackers.Networking
{
    /// <summary>
    /// Manages WebSocket connection to the local server for phone-to-VR communication.
    /// Singleton pattern for global access.
    /// </summary>
    public class NetworkManager : MonoBehaviour
    {
        public static NetworkManager Instance { get; private set; }

        [Header("Server Configuration")]
        [SerializeField] private string serverIP = "192.168.1.100";
        [SerializeField] private int serverPort = 8080;
        [SerializeField] private bool autoConnectOnStart = true;

        [Header("Connection Settings")]
        [SerializeField] private float reconnectDelay = 3f;
        [SerializeField] private int maxReconnectAttempts = 5;

        [Header("Debug")]
        [SerializeField] private bool showDebugLogs = true;

        // Events
        public event Action<string> OnObjectSwiped;
        public event Action OnConnected;
        public event Action OnDisconnected;

        // Properties
        public bool IsConnected { get; private set; }
        public string ServerURL => $"ws://{serverIP}:{serverPort}";

        // Private fields
        private ClientWebSocket webSocket;
        private CancellationTokenSource cancellationTokenSource;
        private Task receiveTask;
        private int reconnectAttempts = 0;
        private bool isReconnecting = false;

        private void Awake()
        {
            // Singleton pattern
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            LogDebug("NetworkManager initialized");
        }

        private void Start()
        {
            if (autoConnectOnStart)
            {
                Connect();
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
            if (IsConnected)
            {
                LogDebug("Already connected");
                return;
            }

            try
            {
                LogDebug($"Connecting to {ServerURL}...");

                webSocket = new ClientWebSocket();
                cancellationTokenSource = new CancellationTokenSource();

                await webSocket.ConnectAsync(new Uri(ServerURL), cancellationTokenSource.Token);

                IsConnected = true;
                reconnectAttempts = 0;
                isReconnecting = false;

                LogDebug("Connected successfully!");

                // Send identification message
                await SendIdentifyMessage();

                // Start receiving messages
                receiveTask = Task.Run(ReceiveLoop);

                // Invoke connected event on main thread
                UnityMainThreadDispatcher.Instance().Enqueue(() => OnConnected?.Invoke());
            }
            catch (Exception e)
            {
                LogDebug($"Connection failed: {e.Message}");
                HandleConnectionFailure();
            }
        }

        /// <summary>
        /// Disconnect from the WebSocket server
        /// </summary>
        public async void Disconnect()
        {
            if (webSocket != null && IsConnected)
            {
                try
                {
                    cancellationTokenSource?.Cancel();

                    if (webSocket.State == WebSocketState.Open)
                    {
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client disconnecting", CancellationToken.None);
                    }

                    IsConnected = false;
                    LogDebug("Disconnected from server");

                    UnityMainThreadDispatcher.Instance().Enqueue(() => OnDisconnected?.Invoke());
                }
                catch (Exception e)
                {
                    LogDebug($"Error during disconnect: {e.Message}");
                }
                finally
                {
                    webSocket?.Dispose();
                    webSocket = null;
                    cancellationTokenSource?.Dispose();
                    cancellationTokenSource = null;
                }
            }
        }

        /// <summary>
        /// Send identification message to server
        /// </summary>
        private async Task SendIdentifyMessage()
        {
            var message = new Dictionary<string, object>
            {
                { "type", "identify" },
                { "clientType", "vr" },
                { "timestamp", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }
            };

            await SendMessage(message);
        }

        /// <summary>
        /// Send a message to the server
        /// </summary>
        private async Task SendMessage(Dictionary<string, object> message)
        {
            if (!IsConnected || webSocket == null || webSocket.State != WebSocketState.Open)
            {
                LogDebug("Cannot send message: not connected");
                return;
            }

            try
            {
                string json = JsonUtility.ToJson(new MessageWrapper(message));
                byte[] bytes = Encoding.UTF8.GetBytes(json);
                await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, cancellationTokenSource.Token);

                LogDebug($"Sent message: {json}");
            }
            catch (Exception e)
            {
                LogDebug($"Error sending message: {e.Message}");
            }
        }

        /// <summary>
        /// Receive loop - runs in background thread
        /// </summary>
        private async Task ReceiveLoop()
        {
            var buffer = new byte[1024 * 4];

            try
            {
                while (IsConnected && webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationTokenSource.Token);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        LogDebug("Server closed connection");
                        HandleDisconnection();
                        break;
                    }

                    string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    LogDebug($"Received: {message}");

                    // Process message on main thread
                    UnityMainThreadDispatcher.Instance().Enqueue(() => ProcessMessage(message));
                }
            }
            catch (OperationCanceledException)
            {
                LogDebug("Receive loop cancelled");
            }
            catch (Exception e)
            {
                LogDebug($"Receive loop error: {e.Message}");
                HandleDisconnection();
            }
        }

        /// <summary>
        /// Process incoming message
        /// </summary>
        private void ProcessMessage(string json)
        {
            try
            {
                var message = JsonUtility.FromJson<NetworkMessage>(json);

                switch (message.type)
                {
                    case "connection_established":
                        LogDebug("Connection established message received");
                        break;

                    case "swipe_right":
                        LogDebug($"Swipe right received for object: {message.objectId}");
                        OnObjectSwiped?.Invoke(message.objectId);
                        break;

                    case "error":
                        LogDebug($"Server error: {message.message}");
                        break;

                    default:
                        LogDebug($"Unknown message type: {message.type}");
                        break;
                }
            }
            catch (Exception e)
            {
                LogDebug($"Error processing message: {e.Message}");
            }
        }

        /// <summary>
        /// Handle connection failure
        /// </summary>
        private void HandleConnectionFailure()
        {
            IsConnected = false;

            if (!isReconnecting && reconnectAttempts < maxReconnectAttempts)
            {
                isReconnecting = true;
                reconnectAttempts++;
                LogDebug($"Reconnecting... (attempt {reconnectAttempts}/{maxReconnectAttempts})");
                StartCoroutine(ReconnectAfterDelay());
            }
            else if (reconnectAttempts >= maxReconnectAttempts)
            {
                LogDebug("Max reconnect attempts reached");
                UnityMainThreadDispatcher.Instance().Enqueue(() => OnDisconnected?.Invoke());
            }
        }

        /// <summary>
        /// Handle disconnection
        /// </summary>
        private void HandleDisconnection()
        {
            IsConnected = false;
            UnityMainThreadDispatcher.Instance().Enqueue(() =>
            {
                OnDisconnected?.Invoke();
                HandleConnectionFailure();
            });
        }

        /// <summary>
        /// Reconnect after delay
        /// </summary>
        private IEnumerator ReconnectAfterDelay()
        {
            yield return new WaitForSeconds(reconnectDelay);
            Connect();
        }

        /// <summary>
        /// Log debug message
        /// </summary>
        private void LogDebug(string message)
        {
            if (showDebugLogs)
            {
                Debug.Log($"[NetworkManager] {message}");
            }
        }

        // Message classes for JSON serialization
        [Serializable]
        private class MessageWrapper
        {
            public string type;
            public string clientType;
            public long timestamp;

            public MessageWrapper(Dictionary<string, object> dict)
            {
                if (dict.ContainsKey("type")) type = dict["type"].ToString();
                if (dict.ContainsKey("clientType")) clientType = dict["clientType"].ToString();
                if (dict.ContainsKey("timestamp")) timestamp = (long)dict["timestamp"];
            }
        }

        [Serializable]
        public class NetworkMessage
        {
            public string type;
            public string objectId;
            public string message;
            public bool success;
            public long timestamp;
        }
    }

    /// <summary>
    /// Helper class to execute actions on Unity's main thread
    /// </summary>
    public class UnityMainThreadDispatcher : MonoBehaviour
    {
        private static readonly Queue<Action> executionQueue = new Queue<Action>();
        private static UnityMainThreadDispatcher instance;

        public static UnityMainThreadDispatcher Instance()
        {
            if (instance == null)
            {
                var obj = new GameObject("UnityMainThreadDispatcher");
                instance = obj.AddComponent<UnityMainThreadDispatcher>();
                DontDestroyOnLoad(obj);
            }
            return instance;
        }

        public void Enqueue(Action action)
        {
            lock (executionQueue)
            {
                executionQueue.Enqueue(action);
            }
        }

        private void Update()
        {
            lock (executionQueue)
            {
                while (executionQueue.Count > 0)
                {
                    executionQueue.Dequeue().Invoke();
                }
            }
        }
    }
}
