using UnityEngine;
using System.Collections.Generic;

public class MultiObjectMaterialController : MonoBehaviour
{
    [Header("Targeting")]
    [Tooltip("List of Renderers to control.")]
    public List<MeshRenderer> targetRenderers = new List<MeshRenderer>();
    
    [Tooltip("The index of the material slot (0 is the first slot).")]
    public int materialSlotIndex = 0;

    [Header("Shader Settings")]
    public string propertyName = "_FloatValue";
	[Range(50f, 110f)]
    public float floatValue = 1.0f;

    private int _propertyID;
    private MaterialPropertyBlock _propBlock;

    void Awake()
    {
        _propBlock = new MaterialPropertyBlock();
        _propertyID = Shader.PropertyToID(propertyName);
    }

    void Update()
    {
        if (targetRenderers == null) return;

        foreach (MeshRenderer renderer in targetRenderers)
        {
            if (renderer == null) continue;

            // 1. Get existing properties from the specific renderer
            // Passing the slot index ensures we target the right material
            renderer.GetPropertyBlock(_propBlock, materialSlotIndex);

            // 2. Update the float value in the block
            _propBlock.SetFloat(_propertyID, floatValue);

            // 3. Apply the block back to the specific material slot
            renderer.SetPropertyBlock(_propBlock, materialSlotIndex);
        }
    }
}