# Unity Events API

This document describes the events available in Unity that your scripts can subscribe to for handling phone interactions.

---

## NetworkManager Events

The `NetworkManager` singleton provides events that fire when the phone user interacts with the app.

### Available Events

| Event | Trigger | Parameter |
|-------|---------|-----------|
| `OnObjectSwiped` | User swipes RIGHT (accept) | `objectId` (string) - e.g., "cylinder", "sphere", "cone", "torus", "cube" |
| `OnObjectRejected` | User swipes LEFT (reject) | `objectId` (string) |
| `OnConnected` | WebSocket connects to server | none |
| `OnDisconnected` | WebSocket disconnects from server | none |

---

## How to Subscribe to Events

### Basic Example

```csharp
using UnityEngine;
using DreamHackers.Networking;

public class PhoneEventHandler : MonoBehaviour
{
    void Start()
    {
        // Subscribe to events
        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.OnObjectSwiped += OnAccepted;
            NetworkManager.Instance.OnObjectRejected += OnRejected;
            NetworkManager.Instance.OnConnected += OnPhoneConnected;
            NetworkManager.Instance.OnDisconnected += OnPhoneDisconnected;
        }
    }

    void OnAccepted(string objectId)
    {
        Debug.Log($"✓ User ACCEPTED: {objectId}");
        // Spawn object, play sound, trigger effect, etc.
    }

    void OnRejected(string objectId)
    {
        Debug.Log($"✗ User REJECTED: {objectId}");
        // Play rejection sound, show visual feedback, etc.
    }

    void OnPhoneConnected()
    {
        Debug.Log("Phone connected!");
    }

    void OnPhoneDisconnected()
    {
        Debug.Log("Phone disconnected!");
    }

    void OnDestroy()
    {
        // Always unsubscribe to prevent memory leaks
        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.OnObjectSwiped -= OnAccepted;
            NetworkManager.Instance.OnObjectRejected -= OnRejected;
            NetworkManager.Instance.OnConnected -= OnPhoneConnected;
            NetworkManager.Instance.OnDisconnected -= OnPhoneDisconnected;
        }
    }
}
```

---

## Object IDs

The `objectId` parameter will be one of these strings:

| Object ID | Phone Display Name |
|-----------|--------------------|
| `"cylinder"` | Time Capsule |
| `"sphere"` | Memory Orb |
| `"cone"` | Dream Beacon |
| `"torus"` | Dream Ring |
| `"cube"` | Thought Block |

---

## Example: Custom Reaction Script

Here's a more complete example that plays different sounds for accept/reject:

```csharp
using UnityEngine;
using DreamHackers.Networking;

public class SwipeReactionHandler : MonoBehaviour
{
    [Header("Audio")]
    [SerializeField] private AudioClip acceptSound;
    [SerializeField] private AudioClip rejectSound;
    private AudioSource audioSource;

    [Header("Visual Feedback")]
    [SerializeField] private ParticleSystem acceptParticles;
    [SerializeField] private ParticleSystem rejectParticles;

    void Start()
    {
        audioSource = GetComponent<AudioSource>();

        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.OnObjectSwiped += HandleAccept;
            NetworkManager.Instance.OnObjectRejected += HandleReject;
        }
    }

    void HandleAccept(string objectId)
    {
        Debug.Log($"Accepted: {objectId}");

        // Play accept sound
        if (audioSource && acceptSound)
            audioSource.PlayOneShot(acceptSound);

        // Play particles
        if (acceptParticles)
            acceptParticles.Play();
    }

    void HandleReject(string objectId)
    {
        Debug.Log($"Rejected: {objectId}");

        // Play reject sound
        if (audioSource && rejectSound)
            audioSource.PlayOneShot(rejectSound);

        // Play particles
        if (rejectParticles)
            rejectParticles.Play();
    }

    void OnDestroy()
    {
        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.OnObjectSwiped -= HandleAccept;
            NetworkManager.Instance.OnObjectRejected -= HandleReject;
        }
    }
}
```

---

## Example: Spawn Different Prefabs

```csharp
using System.Collections.Generic;
using UnityEngine;
using DreamHackers.Networking;

public class ObjectSpawner : MonoBehaviour
{
    [System.Serializable]
    public class SpawnableObject
    {
        public string objectId;
        public GameObject prefab;
    }

    [SerializeField] private List<SpawnableObject> spawnableObjects;
    [SerializeField] private Transform spawnPoint;

    private Dictionary<string, GameObject> prefabLookup;

    void Start()
    {
        // Build lookup dictionary
        prefabLookup = new Dictionary<string, GameObject>();
        foreach (var obj in spawnableObjects)
        {
            prefabLookup[obj.objectId] = obj.prefab;
        }

        // Subscribe to accept event
        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.OnObjectSwiped += SpawnObject;
        }
    }

    void SpawnObject(string objectId)
    {
        if (prefabLookup.TryGetValue(objectId, out GameObject prefab))
        {
            Vector3 position = spawnPoint ? spawnPoint.position : transform.position;
            Instantiate(prefab, position, Quaternion.identity);
            Debug.Log($"Spawned: {objectId}");
        }
        else
        {
            Debug.LogWarning($"No prefab found for: {objectId}");
        }
    }

    void OnDestroy()
    {
        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.OnObjectSwiped -= SpawnObject;
        }
    }
}
```

---

## Message Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Phone     │     │   Server    │     │    Unity    │
│   (iOS)     │     │  (Node.js)  │     │    (VR)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  swipe_right      │                   │
       │  {objectId}       │                   │
       │──────────────────>│                   │
       │                   │  swipe_right      │
       │                   │  {objectId}       │
       │                   │──────────────────>│
       │                   │                   │
       │                   │                   │ OnObjectSwiped(objectId)
       │                   │                   │ fires in Unity
       │                   │                   │
       │                   │  spawn_confirmed  │
       │                   │<──────────────────│
       │  spawn_confirmed  │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  (toast shown)    │                   │
       │                   │                   │
```

---

## Tips

1. **Always unsubscribe** in `OnDestroy()` to prevent memory leaks
2. **Check for null** before accessing `NetworkManager.Instance`
3. **Use the objectId** to determine which prefab/effect to use
4. The **SpawnController** already handles spawning - these events are for additional custom behavior
