using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit.Samples.StarterAssets;
using DreamHackers.Networking;

namespace DreamHackers.Spawning
{
    /// <summary>
    /// Controls object spawning in response to phone swipe events.
    /// Listens to NetworkManager and triggers ObjectSpawner.
    /// </summary>
    public class SpawnController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private ObjectSpawner objectSpawner;
        [SerializeField] private Camera vrCamera;

        [Header("Spawn Settings")]
        [SerializeField] private float spawnDistance = 2.5f;
        [SerializeField] private float spawnHeightOffset = 0f;
        [SerializeField] private float randomXZOffset = 0.5f;
        [SerializeField] private float spawnCooldown = 1f;

        [Header("Object Mappings")]
        [SerializeField] private List<ObjectMapping> objectMappings = new List<ObjectMapping>();

        [Header("Debug")]
        [SerializeField] private bool showDebugLogs = true;

        private float lastSpawnTime;
        private Dictionary<string, int> objectIdToIndex = new Dictionary<string, int>();

        private void Awake()
        {
            // Build lookup dictionary
            for (int i = 0; i < objectMappings.Count; i++)
            {
                if (!string.IsNullOrEmpty(objectMappings[i].objectId))
                {
                    objectIdToIndex[objectMappings[i].objectId] = objectMappings[i].prefabIndex;
                }
            }
        }

        private void Start()
        {
            // Validate references
            if (objectSpawner == null)
            {
                LogError("ObjectSpawner reference is missing!");
                return;
            }

            if (vrCamera == null)
            {
                vrCamera = Camera.main;
                if (vrCamera == null)
                {
                    LogError("VR Camera reference is missing!");
                    return;
                }
            }

            // Subscribe to network events
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.OnObjectSwiped += HandleObjectSwiped;
                NetworkManager.Instance.OnConnected += HandleConnected;
                NetworkManager.Instance.OnDisconnected += HandleDisconnected;
                Log("SpawnController initialized successfully");
            }
            else
            {
                LogError("NetworkManager.Instance is null! Make sure NetworkManager is in the scene.");
            }
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.OnObjectSwiped -= HandleObjectSwiped;
                NetworkManager.Instance.OnConnected -= HandleConnected;
                NetworkManager.Instance.OnDisconnected -= HandleDisconnected;
            }
        }

        private void HandleConnected()
        {
            Log("Network connected - ready to spawn objects");
        }

        private void HandleDisconnected()
        {
            Log("Network disconnected");
        }

        /// <summary>
        /// Handle object swipe event from phone
        /// </summary>
        private void HandleObjectSwiped(string objectId)
        {
            Log($"Received swipe for object: {objectId}");

            // Check cooldown
            if (Time.time - lastSpawnTime < spawnCooldown)
            {
                Log("Spawn on cooldown, ignoring");
                return;
            }

            // Get prefab index
            if (!objectIdToIndex.TryGetValue(objectId, out int prefabIndex))
            {
                LogError($"Unknown object ID: {objectId}");
                return;
            }

            // Spawn the object
            SpawnObject(objectId, prefabIndex);
        }

        /// <summary>
        /// Spawn object at calculated position
        /// </summary>
        private void SpawnObject(string objectId, int prefabIndex)
        {
            // Calculate spawn position
            Vector3 spawnPos = CalculateSpawnPosition();

            // Set the prefab to spawn
            objectSpawner.SetSpawnObjectIndex(prefabIndex);

            // Spawn using ObjectSpawner
            bool success = objectSpawner.TrySpawnObject(spawnPos, Vector3.up);

            if (success)
            {
                lastSpawnTime = Time.time;
                Log($"Successfully spawned object '{objectId}' at {spawnPos}");

                // Send confirmation back to phone
                NetworkManager.Instance?.SendSpawnConfirmation(objectId);
            }
            else
            {
                LogError($"Failed to spawn object '{objectId}'");
            }
        }

        /// <summary>
        /// Calculate spawn position in front of user
        /// </summary>
        private Vector3 CalculateSpawnPosition()
        {
            // Get forward direction (horizontal only)
            Vector3 forward = vrCamera.transform.forward;
            forward.y = 0;
            forward.Normalize();

            // Base position in front of camera
            Vector3 basePos = vrCamera.transform.position + forward * spawnDistance;

            // Add height offset
            basePos.y += spawnHeightOffset;

            // Add random offset for variety
            if (randomXZOffset > 0)
            {
                float randomX = UnityEngine.Random.Range(-randomXZOffset, randomXZOffset);
                float randomZ = UnityEngine.Random.Range(-randomXZOffset, randomXZOffset);
                basePos += new Vector3(randomX, 0, randomZ);
            }

            return basePos;
        }

        private void Log(string message)
        {
            if (showDebugLogs)
            {
                Debug.Log($"[SpawnController] {message}");
            }
        }

        private void LogError(string message)
        {
            Debug.LogError($"[SpawnController] {message}");
        }

        /// <summary>
        /// Editor helper to setup default mappings
        /// </summary>
        [ContextMenu("Setup Default Mappings")]
        private void SetupDefaultMappings()
        {
            objectMappings = new List<ObjectMapping>
            {
                new ObjectMapping { objectId = "sphere", prefabIndex = 0 },
                new ObjectMapping { objectId = "cube", prefabIndex = 1 },
                new ObjectMapping { objectId = "torus", prefabIndex = 2 },
                new ObjectMapping { objectId = "cylinder", prefabIndex = 3 }
            };
            Log("Default mappings configured");
        }
    }

    /// <summary>
    /// Maps object IDs from phone to prefab indices in ObjectSpawner
    /// </summary>
    [Serializable]
    public class ObjectMapping
    {
        public string objectId;
        public int prefabIndex;
    }
}
