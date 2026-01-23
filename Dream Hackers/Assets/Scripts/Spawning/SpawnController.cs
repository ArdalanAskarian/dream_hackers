using System;
using System.Collections.Generic;
using UnityEngine;
using DreamHackers.Networking;

namespace DreamHackers.Spawning
{
    /// <summary>
    /// Controls object spawning in response to phone swipe events.
    /// Directly spawns prefabs based on object ID from phone.
    /// </summary>
    public class SpawnController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Camera vrCamera;

        [Header("Spawn Settings")]
        [SerializeField] private float spawnDistance = 2.5f;
        [SerializeField] private float spawnHeightOffset = 0f;
        [SerializeField] private float randomXZOffset = 0.5f;
        [SerializeField] private float spawnCooldown = 0.5f;

        [Header("Object Prefabs - Drag your prefabs here")]
        [SerializeField] private GameObject cylinderPrefab;
        [SerializeField] private GameObject spherePrefab;
        [SerializeField] private GameObject conePrefab;
        [SerializeField] private GameObject torusPrefab;
        [SerializeField] private GameObject cubePrefab;

        [Header("Spawn Effect (Optional)")]
        [SerializeField] private GameObject spawnEffectPrefab;

        [Header("Debug")]
        [SerializeField] private bool showDebugLogs = true;

        private float lastSpawnTime;
        private Dictionary<string, GameObject> objectPrefabs = new Dictionary<string, GameObject>();

        private void Awake()
        {
            // Build lookup dictionary from serialized prefabs
            if (cylinderPrefab != null) objectPrefabs["cylinder"] = cylinderPrefab;
            if (spherePrefab != null) objectPrefabs["sphere"] = spherePrefab;
            if (conePrefab != null) objectPrefabs["cone"] = conePrefab;
            if (torusPrefab != null) objectPrefabs["torus"] = torusPrefab;
            if (cubePrefab != null) objectPrefabs["cube"] = cubePrefab;

            Log($"SpawnController initialized with {objectPrefabs.Count} prefabs");
        }

        private void Start()
        {
            // Get VR camera if not assigned
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
                Log("SpawnController subscribed to NetworkManager events");
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

            // Get prefab
            if (!objectPrefabs.TryGetValue(objectId, out GameObject prefab))
            {
                LogError($"Unknown object ID: {objectId}. Available: {string.Join(", ", objectPrefabs.Keys)}");
                return;
            }

            if (prefab == null)
            {
                LogError($"Prefab for '{objectId}' is null - make sure it's assigned in the Inspector!");
                return;
            }

            // Spawn the object
            SpawnObject(objectId, prefab);
        }

        /// <summary>
        /// Spawn object at calculated position
        /// </summary>
        private void SpawnObject(string objectId, GameObject prefab)
        {
            // Calculate spawn position
            Vector3 spawnPos = CalculateSpawnPosition();
            Quaternion spawnRot = Quaternion.identity;

            // Instantiate the prefab
            GameObject spawnedObject = Instantiate(prefab, spawnPos, spawnRot);
            spawnedObject.name = $"{objectId}_spawned_{Time.time:F0}";

            // Play spawn effect if assigned
            if (spawnEffectPrefab != null)
            {
                GameObject effect = Instantiate(spawnEffectPrefab, spawnPos, Quaternion.identity);
                Destroy(effect, 3f); // Clean up effect after 3 seconds
            }

            lastSpawnTime = Time.time;
            Log($"Successfully spawned '{objectId}' at {spawnPos}");

            // Send confirmation back to phone
            NetworkManager.Instance?.SendSpawnConfirmation(objectId);
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

            // Add height offset (spawn at eye level by default)
            basePos.y = vrCamera.transform.position.y + spawnHeightOffset;

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
        /// Test spawn from editor - right click component > Test Spawn
        /// </summary>
        [ContextMenu("Test Spawn Cylinder")]
        private void TestSpawnCylinder() { if (cylinderPrefab) SpawnObject("cylinder", cylinderPrefab); }

        [ContextMenu("Test Spawn Sphere")]
        private void TestSpawnSphere() { if (spherePrefab) SpawnObject("sphere", spherePrefab); }

        [ContextMenu("Test Spawn Cone")]
        private void TestSpawnCone() { if (conePrefab) SpawnObject("cone", conePrefab); }

        [ContextMenu("Test Spawn Torus")]
        private void TestSpawnTorus() { if (torusPrefab) SpawnObject("torus", torusPrefab); }

        [ContextMenu("Test Spawn Cube")]
        private void TestSpawnCube() { if (cubePrefab) SpawnObject("cube", cubePrefab); }
    }
}
