# Basics 4: Game Architecture 1 – Decoupling & ScriptableObject Architecture

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics4) -
[Project Files](../projectfiles/readme.md) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
[Assignment](#assignment)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics4)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- [Unity Architecture Snippets](00_codesnippets.md) for quick reference on Event Channels and Persistent Singletons
- Official Unity Guide: [Create modular game architecture with ScriptableObjects](https://unity.com/resources/create-modular-game-architecture-with-scriptable-objects-ebook)
- Unity Manual: [Multi-Scene Editing & Additive Loading](https://docs.unity3d.com/Manual/setupmultiplescenes.html)

---

## Project Files & Setup
> **Note:** There is **no starter template package to download** for this class. You will apply these architectural patterns directly inside your team's ongoing **mobile game project** (or inside a dedicated testing scene at `Assets/Class4/Class4_ArchitectureTest.unity`). All patterns use native C# features and standard Unity 6 APIs.

---

## 🎯 Learning Objectives
By the end of this class, you will be able to:
1. Master the **Prefab as an API** design pattern (Black Box Encapsulation).
2. Completely decouple systems using **ScriptableObject Event Channels**.
3. Evaluate the trade-offs of the **Singleton Pattern** and write a leak-free `PersistentSingleton<T>`.
4. Organize your project using **Multi-Scene Additive Loading** for clean team collaboration.

---

## 🧱 1. Prefab as an API (Black Box Encapsulation)

### The Spaghetti Problem
In beginner projects, external scripts (like a `SpawnManager`, `GameManager`, or `CombatSystem`) often dig deep into child GameObjects:
```csharp
// ❌ ANTI-PATTERN: Tight internal coupling & fragile hierarchy dependencies
GameObject enemy = Instantiate(enemyPrefab);
enemy.transform.Find("Visuals/Sprite").GetComponent<SpriteRenderer>().color = Color.red;
enemy.transform.Find("Audio").GetComponent<AudioSource>().Play();
enemy.GetComponentInChildren<Animator>().SetTrigger("Spawn");
```
If an artist renames `"Sprite"` to `"Body"`, or moves the `AudioSource` to a separate child, your entire game throws `NullReferenceException`!

### The Architecture Principle: The Black Box
A Prefab must be treated as a **self-contained black box**:
1. The **Root GameObject** contains the main controller script (e.g. `GoblinController.cs`).
2. That controller script is the **only public API** exposed to the outside world.
3. Internal child objects (`SpriteRenderer`, `Collider2D`, `Animator`, `AudioSource`) are `private` or `[SerializeField] private` fields inside the controller.
4. Outside scripts interact **only** through public methods on the root.

```
[Enemy_Goblin Prefab]
  ├── Root GameObject -> Contains: GoblinController.cs (THE PUBLIC API)
  │                      [Public methods: Initialize(), TakeDamage(), Die()]
  ├── Visuals (Child) -> SpriteRenderer, Animator (Internal implementation)
  ├── Colliders (Child)-> CircleCollider2D, Hitbox (Internal implementation)
  └── Audio (Child)   -> AudioSource (Internal implementation)
```

### ✅ Production Example: Clean Root API
```csharp
using UnityEngine;

[SelectionBase] // Makes clicking any child in Scene View select the root GameObject!
public class GoblinController : MonoBehaviour
{
    [Header("Internal Components (Hidden from outside)")]
    [SerializeField] private Animator animator;
    [SerializeField] private AudioSource audioSource;
    [SerializeField] private AudioClip hitSound;
    [SerializeField] private AudioClip deathSound;

    [Header("Stats")]
    [SerializeField] private int maxHealth = 50;

    public int CurrentHealth { get; private set; }
    public bool IsDead => CurrentHealth <= 0;

    private void Awake()
    {
        CurrentHealth = maxHealth;
    }

    // ====================================================
    // THE PUBLIC API: External scripts call ONLY these methods
    // ====================================================

    /// <summary>
    /// Configures the goblin when spawned from a wave spawner.
    /// </summary>
    public void Initialize(int healthBonus, float speedMultiplier)
    {
        CurrentHealth = maxHealth + healthBonus;
        // Internal setup...
    }

    /// <summary>
    /// Applies damage, triggers animations, and plays hit feedback internally.
    /// </summary>
    public void TakeDamage(int damage)
    {
        if (IsDead) return;

        CurrentHealth = Mathf.Max(0, CurrentHealth - damage);
        
        if (animator != null) animator.SetTrigger("Hit");
        if (audioSource != null && hitSound != null) audioSource.PlayOneShot(hitSound);

        if (IsDead)
        {
            Die();
        }
    }

    private void Die()
    {
        if (animator != null) animator.SetTrigger("Die");
        if (audioSource != null && deathSound != null) audioSource.PlayOneShot(deathSound);

        // Disable colliders so dead body doesn't block player
        Collider2D col = GetComponent<Collider2D>();
        if (col != null) col.enabled = false;

        Destroy(gameObject, 1.5f);
    }
}
```

Now, outside spawners or weapons interact purely through the clean contract:
```csharp
// ✅ CLEAN CALL: Zero knowledge of internal hierarchy
if (hitCollider.TryGetComponent<GoblinController>(out var goblin))
{
    goblin.TakeDamage(25);
}
```

---

## 📡 2. ScriptableObject Event Channels (True Decoupling)

### The Direct Dependency Trap
Consider what happens when the player loses health in a typical prototype:
```csharp
public class Player : MonoBehaviour
{
    public HealthBarUI healthBar;
    public SoundManager soundManager;
    public ScreenFlasher screenFlasher;
    public AchievementTracker achievements;
    public QuestManager questManager;
    // ... Player is tightly bound to 5+ systems!
}
```
If you want to test the `Player` in a test gym scene without the full UI and quest systems, the scene crashes with `MissingReferenceException`.

### The Solution: Event Channel Architecture
An **Event Channel** is a `ScriptableObject` asset living in your `Project` folder (`Assets/Events/`). It acts as a neutral messaging bridge:

```
                      [Broadcaster]
                     PlayerHealth.cs
                            │
                            ▼
              ┌───────────────────────────┐
              │  PlayerDamagedEvent.asset │ (ScriptableObject Channel)
              └─────────────┬─────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[HealthBarUI]         [AudioManager]       [ScreenFlasher]
(Updates slider)      (Plays hurt audio)   (Flashes red)
```
- **Broadcaster** only knows the asset: `onPlayerHealthChanged.RaiseEvent(current, max)`.
- **Listeners** subscribe to the same asset in `OnEnable()` and unsubscribe in `OnDisable()`.
- **The Player has zero references to UI, Audio, or Camera!**

### Step 1: Base Event Channel Script
Create `IntEventChannelSO.cs`:
```csharp
using System;
using UnityEngine;

[CreateAssetMenu(fileName = "IntEventChannel", menuName = "Architecture/Events/Int Event Channel")]
public class IntEventChannelSO : ScriptableObject
{
    private Action<int> _onEventRaised;

    public void RaiseEvent(int value)
    {
        _onEventRaised?.Invoke(value);
    }

    public void RegisterListener(Action<int> listener)
    {
        _onEventRaised += listener;
    }

    public void UnregisterListener(Action<int> listener)
    {
        _onEventRaised -= listener;
    }
}
```

For parameterless events (like `OnPlayerDied` or `OnGamePaused`), create `VoidEventChannelSO.cs`:
```csharp
using System;
using UnityEngine;

[CreateAssetMenu(fileName = "VoidEventChannel", menuName = "Architecture/Events/Void Event Channel")]
public class VoidEventChannelSO : ScriptableObject
{
    private Action _onEventRaised;

    public void RaiseEvent() => _onEventRaised?.Invoke();
    public void RegisterListener(Action listener) => _onEventRaised += listener;
    public void UnregisterListener(Action listener) => _onEventRaised -= listener;
}
```

### Step 2: The Broadcaster
```csharp
using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    [Header("Broadcasting Channels")]
    [SerializeField] private IntEventChannelSO onHealthChangedChannel;
    [SerializeField] private VoidEventChannelSO onPlayerDiedChannel;

    [SerializeField] private int maxHealth = 100;
    private int _currentHealth;

    private void Awake()
    {
        _currentHealth = maxHealth;
    }

    public void TakeDamage(int damage)
    {
        _currentHealth = Mathf.Max(0, _currentHealth - damage);

        // Broadcast to whatever systems happen to be listening
        if (onHealthChangedChannel != null)
        {
            onHealthChangedChannel.RaiseEvent(_currentHealth);
        }

        if (_currentHealth <= 0 && onPlayerDiedChannel != null)
        {
            onPlayerDiedChannel.RaiseEvent();
        }
    }
}
```

### Step 3: The Listeners (Safe Lifecycle Subscriptions)
Always subscribe in `OnEnable()` and unsubscribe in `OnDisable()`. This prevents memory leaks and missing object references when scenes unload!

```csharp
using UnityEngine;
using UnityEngine.UI;

public class HealthBarUI : MonoBehaviour
{
    [SerializeField] private IntEventChannelSO onHealthChangedChannel;
    [SerializeField] private Slider healthSlider;

    private void OnEnable()
    {
        if (onHealthChangedChannel != null)
        {
            onHealthChangedChannel.RegisterListener(UpdateSlider);
        }
    }

    private void OnDisable()
    {
        if (onHealthChangedChannel != null)
        {
            onHealthChangedChannel.UnregisterListener(UpdateSlider);
        }
    }

    private void UpdateSlider(int currentHealth)
    {
        if (healthSlider != null)
        {
            healthSlider.value = currentHealth;
        }
    }
}
```

---

## ⚠️ 3. The Singleton Pattern: Pros, Cons & Robust Implementation

### The Problem with Naive Singletons
Beginner tutorials often teach:
```csharp
public class GameManager : MonoBehaviour
{
    public static GameManager Instance;
    void Awake() => Instance = this;
}
```
**Why this breaks in real production games:**
1. **Hidden Coupling:** Scripts everywhere call `GameManager.Instance.DoThing()`, creating spaghetti invisible in the Inspector.
2. **Scene Reload Duplication:** When reloading a scene, a second instance wakes up and overwrites `Instance`.
3. **Destruction Race Conditions:** If another script's `OnDestroy()` accesses `Instance` while quitting, Unity can spawn a ghost object that persists forever in the editor hierarchy.

### When Singletons Are Acceptable
Singletons should be reserved strictly for **true global infrastructure services** (e.g., persistent audio routing, platform save handlers). Never use them for gameplay data!

### ✅ Production-Grade `PersistentSingleton<T>`
```csharp
using UnityEngine;

public abstract class PersistentSingleton<T> : MonoBehaviour where T : MonoBehaviour
{
    private static T _instance;
    private static readonly object _lock = new object();
    private static bool _isQuitting = false;

    public static T Instance
    {
        get
        {
            if (_isQuitting)
            {
                Debug.LogWarning($"[Singleton] Instance '{typeof(T)}' already destroyed on application quit. Returning null.");
                return null;
            }

            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<T>();

                    if (_instance == null)
                    {
                        GameObject singletonObject = new GameObject(typeof(T).Name);
                        _instance = singletonObject.AddComponent<T>();
                    }
                }
                return _instance;
            }
        }
    }

    protected virtual void Awake()
    {
        if (_instance == null)
        {
            _instance = this as T;
            DontDestroyOnLoad(gameObject);
        }
        else if (_instance != this)
        {
            // Duplicate detected on scene reload -> destroy immediately
            Debug.LogWarning($"[Singleton] Duplicate '{typeof(T)}' detected on GameObject '{gameObject.name}'. Destroying duplicate.");
            Destroy(gameObject);
        }
    }

    protected virtual void OnApplicationQuit()
    {
        _isQuitting = true;
    }
}
```

---

## 🎬 4. Multi-Scene Additive Loading

### The Single-Scene Bottleneck
Placing everything (Persistent UI, Audio, Managers, Player, Environment) in one `GameScene.unity` causes constant merge conflicts when working in teams.

### The Modern Unity Multi-Scene Pattern
Split your game into layered scenes:
1. **`_PersistentCore`**: Persistent systems, AudioListener, Event Channel references. Loaded once and never unloaded.
2. **`Level_01`, `Level_02`**: Only environment art, enemies, platforms, and triggers.

```
Hierarchy Window:
  ▼ _PersistentCore (DontDestroyOnLoad or Root Scene)
      ├── Camera & AudioListener
      ├── Global Managers
      └── Canvas (HUD)
  ▼ Level_01 (Loaded Additively)
      ├── Tilemap & Platforms
      ├── Spawners
      └── Collectibles
```

### Loading Additively via Code:
```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneLoader : MonoBehaviour
{
    public static IEnumerator LoadLevelAdditive(string levelName)
    {
        // 1. Load the new level additively without destroying persistent core
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(levelName, LoadSceneMode.Additive);
        while (!asyncLoad.isDone)
        {
            yield return null;
        }

        // 2. Set the newly loaded scene as the active scene so new Instantiates spawn into it
        Scene newlyLoadedScene = SceneManager.GetSceneByName(levelName);
        if (newlyLoadedScene.IsValid())
        {
            SceneManager.SetActiveScene(newlyLoadedScene);
        }
    }

    public static IEnumerator UnloadLevel(string levelName)
    {
        AsyncOperation asyncUnload = SceneManager.UnloadSceneAsync(levelName);
        while (!asyncUnload.isDone)
        {
            yield return null;
        }
    }
}
```

> **Unity 6 Rule:** Only **one** `AudioListener` can be active at any time. Keep the `AudioListener` on the Camera inside `_PersistentCore`, and remove the `AudioListener` component from any camera inside individual level scenes!

---

## 📝 Assignment

Apply these architectural practices to your mobile game project.

### Milestone 1: Prefab Black Box Refactor
1. Choose an interactive game object (e.g. `Player`, `Enemy`, or `Chest`).
2. Verify that child components (`SpriteRenderer`, `Collider2D`, `Animator`, `AudioSource`) are **not** accessed directly by external scripts.
3. Refactor all interactions into clean, intention-revealing public methods on the root script (`TakeDamage()`, `Interact()`, `ResetState()`).
4. Add `[SelectionBase]` to the root script.

### Milestone 2: ScriptableObject Event Channels
1. In `Assets/Scripts/Events/`, create `VoidEventChannelSO.cs` and `IntEventChannelSO.cs`.
2. In your Project view, right-click and create two channel assets:
   - `Assets/Events/OnPlayerHealthChanged.asset`
   - `Assets/Events/OnScoreChanged.asset`
3. Have your `Player` raise `OnPlayerHealthChanged` when damaged.

### Milestone 3: Decoupled UI and SFX Listeners
1. Create a `HealthBarListener.cs` on your UI Canvas that updates your slider on event raise.
2. Create a `SoundEventListener.cs` that plays a hurt sound effect on event raise.
3. Verify that your `Player` script compiles and runs in a blank test scene with **zero errors**, even when no UI or audio listeners exist!

### Milestone 4: Additive Scene Architecture
1. Create a scene `_PersistentCore.unity` containing your Camera, Canvas, and persistent event systems.
2. Create a scene `Level_01.unity` containing only level geometry and player start.
3. Use `SceneManager.LoadSceneAsync("Level_01", LoadSceneMode.Additive)` to launch your gameplay cleanly.

---

## ⚡ 10-Minute Classroom Coding Challenge

### Challenge:
Write a `ScoreListener` script that subscribes to an `IntEventChannelSO` and updates a TextMeshProUGUI text component without ever calling `Find`, `FindObjectOfType`, or storing a direct reference to the player.

<details>
<summary><b>Click to reveal solution</b></summary>

```csharp
using TMPro;
using UnityEngine;

public class ScoreListener : MonoBehaviour
{
    [SerializeField] private IntEventChannelSO onScoreChangedChannel;
    [SerializeField] private TextMeshProUGUI scoreText;

    private void OnEnable()
    {
        if (onScoreChangedChannel != null)
        {
            onScoreChangedChannel.RegisterListener(UpdateScoreDisplay);
        }
    }

    private void OnDisable()
    {
        if (onScoreChangedChannel != null)
        {
            onScoreChangedChannel.UnregisterListener(UpdateScoreDisplay);
        }
    }

    private void UpdateScoreDisplay(int newScore)
    {
        if (scoreText != null)
        {
            scoreText.text = $"Score: {newScore:N0}";
        }
    }
}
```
</details>
