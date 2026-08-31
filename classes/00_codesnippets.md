# Unity C# Snippet Library (Production-Ready)

Tested, modern, and high-performance C# code snippets for common game engineering tasks in Unity.

## 1. Class 1: PlayerStart.cs Workshop Methods

Official Unity 6 API documentation reference links for `PlayerStart.cs`:
- Jump: [Rigidbody2D.AddForce](https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html)
- Move: [Rigidbody2D.linearVelocity](https://docs.unity3d.com/ScriptReference/Rigidbody2D-linearVelocity.html)
- ResetPlayer: [Rigidbody2D.MovePosition](https://docs.unity3d.com/ScriptReference/Rigidbody2D.MovePosition.html)
- OnCollisionEnter2D: [MonoBehaviour.OnCollisionEnter2D](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnCollisionEnter2D.html)
- OnTriggerEnter2D: [MonoBehaviour.OnTriggerEnter2D](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnTriggerEnter2D.html)
- CollectCoin: [Object.Destroy](https://docs.unity3d.com/ScriptReference/Object.Destroy.html)
- Audio: [AudioSource.PlayOneShot](https://docs.unity3d.com/ScriptReference/AudioSource.PlayOneShot.html)
- Triggers: [CircleCollider2D Is Trigger](https://docs.unity3d.com/Manual/class-CircleCollider2D.html)

### Option A: Lines to Paste Directly Inside Existing Methods

```csharp
// 1. Paste inside: Move(float directionX) -> if (directionX != 0) { ... }
rb.linearVelocity = new Vector2(directionX * walkSpeed, rb.linearVelocity.y);

// 2. Paste inside: Move(float directionX) -> else { ... }
rb.linearVelocity = new Vector2(rb.linearVelocity.x * 0.9f, rb.linearVelocity.y);

// 3. Paste inside: Jump() -> if (CheckGrounded()) { ... }
rb.AddForce(Vector2.up * jumpForce, ForceMode2D.Impulse);
if (currentSoundSource != null && jumpSound != null)
{
    currentSoundSource.PlayOneShot(jumpSound);
}

// 4. Paste inside: ResetPlayer() { ... }
rb.MovePosition(startPosition);
rb.linearVelocity = Vector2.zero; // Stop momentum

// 5. Paste inside: OnCollisionEnter2D(Collision2D other) { ... }
if (other.gameObject.CompareTag("Enemy"))
{
    Destroy(other.gameObject);
    if (currentSoundSource != null && enemySound != null)
    {
        currentSoundSource.PlayOneShot(enemySound);
    }
}

// 6. Paste inside: OnTriggerEnter2D(Collider2D collision) { ... }
if (collision.CompareTag("Coin"))
{
    CollectCoin(collision.gameObject);
}

// 7. Paste inside: CollectCoin(GameObject coinGameObject) { ... }
Destroy(coinGameObject);
if (currentSoundSource != null && coinSound != null)
{
    currentSoundSource.PlayOneShot(coinSound);
}
```

---

## 2. Timers & Delays

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

    private void Start() => StartTimer();

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
            if (repeat) timeRemaining = duration;
            else isRunning = false;
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
        yield return new WaitForSeconds(delay);
        Debug.Log("Action executed after delay!");
    }
}
```

---

## 2. 2D Platformer Character Controller (Unity 6 Standard)

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(Collider2D))]
public class Movement2D : MonoBehaviour
{
    [Header("Movement Config")]
    [SerializeField] private float speed = 7f;
    [SerializeField] private float jumpForce = 13f;
    [SerializeField] private Transform groundCheck;
    [SerializeField] private LayerMask groundLayer;
    [SerializeField] private Transform visualTransform; // Child Graphics object for juice!

    private Rigidbody2D rb;
    private Vector2 inputDirection;
    private bool isGrounded;

    private void Awake() => rb = GetComponent<Rigidbody2D>();

    public void OnMove(InputValue value) => inputDirection = value.Get<Vector2>();

    public void OnJump(InputValue value)
    {
        if (value.isPressed && isGrounded)
        {
            // Unity 6 linearVelocity standard
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, jumpForce);

            // Juice: Squash & stretch child visual transform without breaking physics collider!
            if (visualTransform != null)
            {
                visualTransform.localScale = new Vector3(0.8f, 1.25f, 1.0f);
            }
        }
    }

    private void Update()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, 0.2f, groundLayer);

        // Smoothly restore visual squash back to normal scale
        if (visualTransform != null && visualTransform.localScale != Vector3.one)
        {
            visualTransform.localScale = Vector3.MoveTowards(visualTransform.localScale, Vector3.one, Time.deltaTime * 3f);
        }
    }

    private void FixedUpdate()
    {
        // Unity 6 linearVelocity in FixedUpdate
        rb.linearVelocity = new Vector2(inputDirection.x * speed, rb.linearVelocity.y);
    }
}
```

---

## 3. Raycasting (2D & 3D)

### 2D Raycast with LayerMask & Debug Visualizer
```csharp
using UnityEngine;

public class RaycastExample2D : MonoBehaviour
{
    [SerializeField] private float rayDistance = 5f;
    [SerializeField] private LayerMask hitLayers;

    private void Update()
    {
        RaycastHit2D hit = Physics2D.Raycast(transform.position, transform.right, rayDistance, hitLayers);
        
        // Draw debug line in Scene View (Green if hit, Red if clear)
        Debug.DrawRay(transform.position, transform.right * rayDistance, hit.collider != null ? Color.green : Color.red);

        if (hit.collider != null)
        {
            Debug.Log($"Hit object: {hit.collider.name} at distance: {hit.distance}");
        }
    }
}
```

---

## 4. Object Pooling (Modern Built-in Pool)

### Unity 6 `UnityEngine.Pool.ObjectPool<T>` Standard
```csharp
using UnityEngine;
using UnityEngine.Pool;

public class ParticlePoolManager : MonoBehaviour
{
    [SerializeField] private ParticleSystem vfxPrefab;
    private IObjectPool<ParticleSystem> pool;

    private void Awake()
    {
        pool = new ObjectPool<ParticleSystem>(
            createFunc: () => Instantiate(vfxPrefab, transform),
            actionOnGet: (vfx) => vfx.gameObject.SetActive(true),
            actionOnRelease: (vfx) => vfx.gameObject.SetActive(false),
            actionOnDestroy: (vfx) => Destroy(vfx.gameObject),
            collectionCheck: false,
            defaultCapacity: 20,
            maxSize: 100
        );
    }

    public ParticleSystem SpawnEffect(Vector3 position)
    {
        ParticleSystem effect = pool.Get();
        effect.transform.position = position;
        return effect;
    }

    public void ReturnEffect(ParticleSystem effect)
    {
        pool.Release(effect);
    }
}
```

---

## 5. Editor Automation: Pixel Art Sprite Importer

Place this script in an `Editor/` folder to automatically apply crisp settings to all imported pixel art textures:

```csharp
using UnityEditor;
using UnityEngine;

public class PixelArtPostprocessor : AssetPostprocessor
{
    private void OnPreprocessTexture()
    {
        TextureImporter ti = (TextureImporter)assetImporter;
        
        // Auto-configure crisp 2D sprite settings
        ti.textureType = TextureImporterType.Sprite;
        ti.spritePixelsPerUnit = 16;
        ti.filterMode = FilterMode.Point;
        ti.textureCompression = TextureImporterCompression.Uncompressed;
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

    // Right-click this component in Inspector to test immediately during Play Mode!
    [ContextMenu("Trigger Test Impact")]
    public void TestImpact()
    {
        Debug.Log($"Test impact triggered at: {transform.position}");
    }

    // Visual boundary indicator in Scene View
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRadius);
    }
}
```
