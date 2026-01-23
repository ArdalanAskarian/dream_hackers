using UnityEngine;
using System.Collections.Generic;

public class ObjectSpawner : MonoBehaviour
{
    [System.Serializable]
    public class Spawnable
    {
        public string id;          // "cube", "sphere", etc.
        public GameObject prefab;
    }

    public Transform spawnPoint;
    public List<Spawnable> spawnables;

    private Dictionary<string, GameObject> lookup;

    void Awake()
    {
        // Build fast lookup table
        lookup = new Dictionary<string, GameObject>();

        foreach (var item in spawnables)
        {
            if (!lookup.ContainsKey(item.id))
                lookup.Add(item.id, item.prefab);
        }
    }

    // 🔥 This is what your swipe event calls
    public void OnObjectSwiped(string objectId)
    {
        if (!lookup.ContainsKey(objectId))
        {
            Debug.LogWarning("No prefab found for: " + objectId);
            return;
        }

        Instantiate(
            lookup[objectId],
            spawnPoint.position,
            spawnPoint.rotation
        );
    }
}