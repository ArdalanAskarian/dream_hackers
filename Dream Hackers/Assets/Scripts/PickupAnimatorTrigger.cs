using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Interactables;

public class PickupAnimatorTrigger : MonoBehaviour
{
    [Header("Animator Settings")]
    [SerializeField] private string triggerName = "Room_State02";

    private XRGrabInteractable grabInteractable;
    private Animator targetAnimator;

    void OnEnable()
    {
        grabInteractable = GetComponent<XRGrabInteractable>();

        // Find the Room_Controller animator at runtime
        // The animator is on "Room" which is a child of "Environment"
        if (targetAnimator == null)
        {
            GameObject envObj = GameObject.Find("Environment");
            if (envObj != null)
                targetAnimator = envObj.GetComponentInChildren<Animator>();

            // Fallback: search for Room directly
            if (targetAnimator == null)
            {
                GameObject roomObj = GameObject.Find("Room");
                if (roomObj != null)
                    targetAnimator = roomObj.GetComponent<Animator>();
            }
        }

        if (grabInteractable != null)
            grabInteractable.selectEntered.AddListener(OnGrabbed);
    }

    void OnDisable()
    {
        if (grabInteractable != null)
            grabInteractable.selectEntered.RemoveListener(OnGrabbed);
    }

    void OnGrabbed(SelectEnterEventArgs args)
    {
        if (targetAnimator != null)
            targetAnimator.SetTrigger(triggerName);
    }
}
