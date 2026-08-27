# Unity C# Snippet Library (Production-Ready)

Tested, modern, and high-performance C# code snippets for common game engineering tasks in Unity.

---

## 1. Timers & Delays

### Option A: Update Timer (Framerate-Independent)
```csharp
using UnityEngine;
using UnityEngine.Events;

public class UpdateTimer : MonoBehaviour
{
    [SerializeField] private float duration = 3.0f;
    [SerializeField] private bool repeat = true;
    [SerializeField] private UnityEvent onTimerElapsed;

    private float timeRemaining;
    private bool isRunning;

    private void Start()
    {
        StartTimer();
    }

    public void StartTimer()
    {
        timeRemaining = duration;
        isRunning = true;
    }

    private void Update()
    {
        if (!isRunning) return;

        timeRemaining -= Time.deltaTime;
        if (timeRemaining <= 0f)
        {
            onTimerElapsed?.Invoke();
            if (repeat)
            {
                timeRemaining = duration;
            }
            else
            {
                isRunning = false;
            }
        }
    }
}
```

### Option B: Coroutine Timer (One-Shot Delays)
```csharp
using System.Collections;
using UnityEngine;

public class CoroutineTimer : MonoBehaviour
{
    public void TriggerDelayedAction(float delayInSeconds)
    {
        StartCoroutine(ExecuteAfterDelay(delayInSeconds));
    }

    private IEnumerator ExecuteAfterDelay(float delay)
    {
        // WaitForSeconds suspends the coroutine without CPU waste
        yield return new WaitForSeconds(delay);
        Debug.Log("Action executed after delay!");
    }
}
```

---

## 2. Input & Movement Systems

### 2D Rigidbody Controller (New Input System)
```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
public class Movement2D : MonoBehaviour
{
    [SerializeField] private float speed = 7f;
    [SerializeField] private float jumpForce = 12f;
    [SerializeField] private Transform groundCheck;
    [SerializeField] private LayerMask groundLayer;

    private Rigidbody2D rb;
    private Vector2 inputDirection;
    private bool isGrounded;

    private void Awake() => rb = GetComponent<Rigidbody2D>();

    public void OnMove(InputValue value) => inputDirection = value.Get<Vector2>();

    public void OnJump(InputValue value)
    {
        if (value.isPressed && isGrounded)
        {
            // Unity 6 linearVelocity standard (replaces legacy rb.velocity)
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, jumpForce);
        }
    }

    private void Update()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, 0.2f, groundLayer);
    }

    private void FixedUpdate()
    {
        // Unity 6 linearVelocity applied in FixedUpdate
        rb.linearVelocity = new Vector2(inputDirection.x * speed, rb.linearVelocity.y);
    }
}
```

### 3D CharacterController (Camera-Relative)
```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class Movement3D : MonoBehaviour
{
    [SerializeField] private float walkSpeed = 6f;
    [SerializeField] private float gravity = -18f;
    [SerializeField] private Transform cameraTransform;

    private CharacterController controller;
    private Vector2 moveInput;
    private float verticalVelocity;

    private void Awake() => controller = GetComponent<CharacterController>();

    public void OnMove(InputValue value) => moveInput = value.Get<Vector2>();

    private void Update()
    {
        // 1. Calculate direction relative to camera facing angle
        Vector3 forward = cameraTransform.forward;
        Vector3 right = cameraTransform.right;
        forward.y = 0f;
        right.y = 0f;
        forward.Normalize();
        right.Normalize();

        Vector3 desiredMove = (forward * moveInput.y + right * moveInput.x) * walkSpeed;

        // 2. Gravity handling
        if (controller.isGrounded && verticalVelocity < 0f)
        {
            verticalVelocity = -2f; // Slight downward force to keep grounded
        }
        else
        {
            verticalVelocity += gravity * Time.deltaTime;
        }
        desiredMove.y = verticalVelocity;

        // 3. Apply movement
        controller.Move(desiredMove * Time.deltaTime);

        // 4. Rotate character towards movement direction
        Vector3 horizontalVelocity = new Vector3(desiredMove.x, 0, desiredMove.z);
        if (horizontalVelocity.sqrMagnitude > 0.05f)
        {
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(horizontalVelocity), Time.deltaTime * 12f);
        }
    }
}
```

---

## 3. Raycasting (2D & 3D)

### 2D Raycast with LayerMask
```csharp
using UnityEngine;

public class RaycastExample2D : MonoBehaviour
{
    [SerializeField] private float rayDistance = 5f;
    [SerializeField] private LayerMask hitLayers;

    private void Update()
    {
        RaycastHit2D hit = Physics2D.Raycast(transform.position, transform.right, rayDistance, hitLayers);
        
        // Visualize the ray in editor
        Debug.DrawRay(transform.position, transform.right * rayDistance, hit.collider != null ? Color.green : Color.red);

        if (hit.collider != null)
        {
            Debug.Log($"Hit 2D object: {hit.collider.name} at distance: {hit.distance}");
        }
    }
}
```

### 3D Screen Center Raycast (Interaction)
```csharp
using UnityEngine;

public class RaycastExample3D : MonoBehaviour
{
    [SerializeField] private float interactRange = 3f;
    [SerializeField] private LayerMask interactableMask;

    public void CheckInteraction()
    {
        Ray ray = new Ray(Camera.main.transform.position, Camera.main.transform.forward);
        if (Physics.Raycast(ray, out RaycastHit hit, interactRange, interactableMask))
        {
            Debug.Log($"Interactable: {hit.collider.name}");
            if (hit.collider.TryGetComponent<IInteractable>(out var interactable))
            {
                interactable.Interact();
            }
        }
    }
}

public interface IInteractable
{
    void Interact();
}
```

---

## 4. Object Pooling Pattern (Eliminate GC Lag)

```csharp
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int initialSize = 20;

    private readonly Queue<GameObject> pool = new();

    private void Awake()
    {
        for (int i = 0; i < initialSize; i++)
        {
            CreateNewInstance();
        }
    }

    private GameObject CreateNewInstance()
    {
        GameObject obj = Instantiate(prefab, transform);
        obj.SetActive(false);
        pool.Enqueue(obj);
        return obj;
    }

    public GameObject Get(Vector3 position, Quaternion rotation)
    {
        GameObject obj = pool.Count > 0 ? pool.Dequeue() : CreateNewInstance();
        obj.transform.SetPositionAndRotation(position, rotation);
        obj.SetActive(true);
        return obj;
    }

    public void ReturnToPool(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

---

## 5. Scene Management & Fast Reload Helpers

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public static class SceneUtilityHelper
{
    // Reload the active scene immediately
    public static void ReloadActiveScene()
    {
        Scene currentScene = SceneManager.GetActiveScene();
        SceneManager.LoadScene(currentScene.buildIndex);
    }

    // Load scene by name
    public static void LoadSceneByName(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }
}
```

---

## 6. Fast In-Editor Debugging with ContextMenu & Gizmos

```csharp
using UnityEngine;

public class DebugHelpers : MonoBehaviour
{
    [SerializeField] private float detectionRadius = 4f;

    // Right-click this component in the Inspector to execute live!
    [ContextMenu("Test Spawn Explosion")]
    public void TestExplosion()
    {
        Debug.Log($"Simulating explosion at: {transform.position}");
    }

    // Draw visual gizmos in Scene View
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRadius);
    }
}
```
