# Unity Events API

Events available in Unity for handling phone interactions.

## NetworkManager Events

The `NetworkManager` singleton provides events that fire when the phone user interacts with the app.

| Event | Trigger | Parameter |
|-------|---------|-----------|
| `OnObjectSwiped` | User swipes RIGHT (accept) | `objectId` (string) |
| `OnObjectRejected` | User swipes LEFT (reject) | `objectId` (string) |
| `OnConnected` | WebSocket connects | none |
| `OnDisconnected` | WebSocket disconnects | none |

---

## Subscribing to Events

```csharp
using UnityEngine;
using DreamHackers.Networking;

public class PhoneEventHandler : MonoBehaviour
{
    void Start()
    {
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
        Debug.Log($"User ACCEPTED: {objectId}");
        // Spawn object, play sound, trigger effect, etc.
    }

    void OnRejected(string objectId)
    {
        Debug.Log($"User REJECTED: {objectId}");
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

| Object ID | Phone Display Name |
|-----------|--------------------|
| `"cylinder"` | Time Capsule |
| `"sphere"` | Memory Orb |
| `"cone"` | Dream Beacon |
| `"torus"` | Dream Ring |
| `"cube"` | Thought Block |

---

## Example: Custom Spawner

```csharp
using System.Collections.Generic;
using UnityEngine;
using DreamHackers.Networking;

public class CustomSpawner : MonoBehaviour
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
        prefabLookup = new Dictionary<string, GameObject>();
        foreach (var obj in spawnableObjects)
        {
            prefabLookup[obj.objectId] = obj.prefab;
        }

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
Phone                    Server                   Unity
  │                        │                        │
  │  swipe_right           │                        │
  │  {objectId}            │                        │
  │───────────────────────>│                        │
  │                        │  swipe_right           │
  │                        │  {objectId}            │
  │                        │───────────────────────>│
  │                        │                        │
  │                        │                        │ OnObjectSwiped(objectId)
  │                        │                        │
```

---

## Tips

1. **Always unsubscribe** in `OnDestroy()` to prevent memory leaks
2. **Check for null** before accessing `NetworkManager.Instance`
3. **Use the objectId** to determine which prefab/effect to use
4. The **SpawnController** already handles spawning — these events are for additional custom behavior
