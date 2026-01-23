using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit.Samples.StarterAssets;

namespace DreamHackers.Spawning
{
    /// <summary>
    /// Controls object spawning based on network events from phone app.
    /// Acts as a bridge between NetworkManager and ObjectSpawner.
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

        // Private state
        private float lastSpawnTime;
        private bool isInitialized;

        [Serializable]
        public class ObjectMapping
        {
            public string objectId;
            public int prefabIndex;
        }

        private void Start()
        {
            Initialize();
        }

        private void Initialize()
        {
            // Validate references
            if (objectSpawner == null)
            {
                Debug.LogError("[SpawnController] ObjectSpawner reference is missing!");
                return;
            }

            if (vrCamera == null)
            {
                vrCamera = Camera.main;
                if (vrCamera == null)
                {
                    Debug.LogError("[SpawnController] VR Camera not found!");
                    return;
                }
            }

            // Subscribe to network events
            if (Networking.NetworkManager.Instance != null)
            {
                Networking.NetworkManager.Instance.OnObjectSwiped += HandleObjectSwiped;
                Networking.NetworkManager.Instance.OnConnected += HandleConnected;
                Networking.NetworkManager.Instance.OnDisconnected += HandleDisconnected;

                LogDebug("Subscribed to NetworkManager events");
            }
            else
            {
                Debug.LogWarning("[SpawnController] NetworkManager.Instance is null. Retrying in 1 second...");
                StartCoroutine(RetryInitializeAfterDelay());
                return;
            }

            // Setup default mappings if none exist
            if (objectMappings.Count == 0)
            {
                SetupDefaultMappings();
            }

            isInitialized = true;
            LogDebug("SpawnController initialized successfully");
        }

        private IEnumerator RetryInitializeAfterDelay()
        {
            yield return new WaitForSeconds(1f);
            Initialize();
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (Networking.NetworkManager.Instance != null)
            {
                Networking.NetworkManager.Instance.OnObjectSwiped -= HandleObjectSwiped;
                Networking.NetworkManager.Instance.OnConnected -= HandleConnected;
                Networking.NetworkManager.Instance.OnDisconnected -= HandleDisconnected;
            }
        }

        /// <summary>
        /// Setup default object ID to prefab index mappings
        /// </summary>
        private void SetupDefaultMappings()
        {
            objectMappings = new List<ObjectMapping>
            {
                new ObjectMapping { objectId = "sphere", prefabIndex = 0 },
                new ObjectMapping { objectId = "cube", prefabIndex = 1 },
                new ObjectMapping { objectId = "torus", prefabIndex = 2 },
                new ObjectMapping { objectId = "cylinder", prefabIndex = 3 }
            };

            LogDebug("Set up default object mappings");
        }

        /// <summary>
        /// Handle object swiped event from network
        /// </summary>
        private void HandleObjectSwiped(string objectId)
        {
            if (!isInitialized)
            {
                Debug.LogWarning("[SpawnController] Not initialized yet");
                return;
            }

            LogDebug($"Received swipe for object: {objectId}");

            // Check cooldown
            if (Time.time - lastSpawnTime < spawnCooldown)
            {
                LogDebug($"Spawn on cooldown. Wait {spawnCooldown - (Time.time - lastSpawnTime):F1}s");
                return;
            }

            // Get prefab index for this object ID
            int prefabIndex = GetPrefabIndex(objectId);
            if (prefabIndex < 0)
            {
                Debug.LogWarning($"[SpawnController] No mapping found for objectId: {objectId}");
                return;
            }

            // Calculate spawn position
            Vector3 spawnPosition = CalculateSpawnPosition();
            Vector3 spawnNormal = Vector3.up;

            // Set the prefab index and spawn
            objectSpawner.SetSpawnObjectIndex(prefabIndex);

            bool success = objectSpawner.TrySpawnObject(spawnPosition, spawnNormal);

            if (success)
            {
                lastSpawnTime = Time.time;
                LogDebug($"Successfully spawned object '{objectId}' at {spawnPosition}");
            }
            else
            {
                Debug.LogWarning($"[SpawnController] Failed to spawn object '{objectId}'");
            }
        }

        /// <summary>
        /// Calculate spawn position in front of VR camera
        /// </summary>
        private Vector3 CalculateSpawnPosition()
        {
            if (vrCamera == null)
            {
                Debug.LogError("[SpawnController] VR Camera is null!");
                return transform.position;
            }

            // Get camera forward direction (horizontal only)
            Vector3 forward = vrCamera.transform.forward;
            forward.y = 0;
            forward.Normalize();

            // Calculate base spawn position
            Vector3 spawnPosition = vrCamera.transform.position + forward * spawnDistance;

            // Apply height offset (relative to camera)
            spawnPosition.y = vrCamera.transform.position.y + spawnHeightOffset;

            // Add random XZ offset for variety
            Vector3 randomOffset = new Vector3(
                UnityEngine.Random.Range(-randomXZOffset, randomXZOffset),
                0,
                UnityEngine.Random.Range(-randomXZOffset, randomXZOffset)
            );
            spawnPosition += randomOffset;

            return spawnPosition;
        }

        /// <summary>
        /// Get prefab index for object ID
        /// </summary>
        private int GetPrefabIndex(string objectId)
        {
            foreach (var mapping in objectMappings)
            {
                if (mapping.objectId == objectId)
                {
                    return mapping.prefabIndex;
                }
            }
            return -1;
        }

        /// <summary>
        /// Handle network connected event
        /// </summary>
        private void HandleConnected()
        {
            LogDebug("Network connected - ready to spawn objects");
        }

        /// <summary>
        /// Handle network disconnected event
        /// </summary>
        private void HandleDisconnected()
        {
            LogDebug("Network disconnected");
        }

        /// <summary>
        /// Public method to manually test spawning
        /// </summary>
        public void TestSpawn(string objectId)
        {
            HandleObjectSwiped(objectId);
        }

        /// <summary>
        /// Add or update object mapping
        /// </summary>
        public void AddObjectMapping(string objectId, int prefabIndex)
        {
            // Check if mapping already exists
            foreach (var mapping in objectMappings)
            {
                if (mapping.objectId == objectId)
                {
                    mapping.prefabIndex = prefabIndex;
                    LogDebug($"Updated mapping: {objectId} -> index {prefabIndex}");
                    return;
                }
            }

            // Add new mapping
            objectMappings.Add(new ObjectMapping { objectId = objectId, prefabIndex = prefabIndex });
            LogDebug($"Added mapping: {objectId} -> index {prefabIndex}");
        }

        private void LogDebug(string message)
        {
            if (showDebugLogs)
            {
                Debug.Log($"[SpawnController] {message}");
            }
        }

        // Visualization for debugging in Scene view
        private void OnDrawGizmos()
        {
            if (vrCamera == null) return;

            // Draw spawn distance sphere
            Vector3 forward = vrCamera.transform.forward;
            forward.y = 0;
            forward.Normalize();

            Vector3 spawnCenter = vrCamera.transform.position + forward * spawnDistance;
            spawnCenter.y = vrCamera.transform.position.y + spawnHeightOffset;

            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(spawnCenter, randomXZOffset);

            Gizmos.color = Color.yellow;
            Gizmos.DrawLine(vrCamera.transform.position, spawnCenter);
        }
    }
}
