# Lesson 1.4: Game Architecture 1 – Decoupling & Prefab API

In this lesson, you learn how to apply software architecture patterns in Unity to prevent your codebase from turning into unmaintainable spaghetti as your project scales.

---

## 🎯 Learning Objectives
1. Master the **Prefab as an API** design pattern.
2. Fully decouple game systems using **ScriptableObject Event Channels**.
3. Understand the risks of the **Singleton** pattern and implement robust alternatives.
4. Utilize **Multi-Scene Additive Loading** for persistent architecture.

---

## 🧱 1. Prefab as an API

A common beginner mistake is writing code where spawners or managers search for child components or mutate internal fields directly.

### The Principle:
A Prefab should function as a **Black Box**. The root script forms the public interface (the API). External systems interact only with the root API, never directly with internal child components.

```
[Enemy_Goblin Prefab]
  ├── Root GameObject -> Contains: GoblinController.cs (THE API)
  │                      [Public methods: Initialize(), TakeDamage(), Die()]
  ├── Visuals (Child) -> MeshRenderer / SpriteRenderer, Animator
  ├── Hitboxes (Child) -> Colliders
  └── Audio (Child) -> AudioSource
```

### Production Example:
```csharp
using UnityEngine;

public class GoblinController : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private AudioSource audioSource;
    [SerializeField] private AudioClip hitSound;

    public int CurrentHealth { get; private set; } = 50;

    // THE PUBLIC API: External scripts call only this method
    public void TakeDamage(int damage)
    {
        CurrentHealth -= damage;
        animator.SetTrigger("Hit");
        audioSource.PlayOneShot(hitSound);

        if (CurrentHealth <= 0)
        {
            Die();
        }
    }

    private void Die()
    {
        animator.SetTrigger("Death");
        Destroy(gameObject, 1.5f);
    }
}
```

---

## 📡 2. ScriptableObject Event Channels (Complete Decoupling)

Instead of the Player maintaining direct references to the UI, Audio Manager, and Achievement Tracker, the Player broadcasts an event through a **ScriptableObject Event Channel**.

```
[Player Takes Damage] 
         │
         ▼
[ScriptableObject: OnPlayerHealthChanged] ─── (Event Channel Asset)
         ├───> [HealthBar UI Script] (Listens & updates slider)
         ├───> [AudioManager Script] (Listens & plays hurt audio)
         └───> [CameraShake Script]  (Listens & shakes camera)
```

### Event Channel Implementation:

```csharp
using System;
using UnityEngine;

[CreateAssetMenu(fileName = "HealthEventChannel", menuName = "Architecture/Events/Health Channel")]
public class HealthEventChannelSO : ScriptableObject
{
    private Action<int, int> onHealthChanged; // (currentHealth, maxHealth)

    public void RaiseEvent(int currentHealth, int maxHealth)
    {
        onHealthChanged?.Invoke(currentHealth, maxHealth);
    }

    public void RegisterListener(Action<int, int> listener) => onHealthChanged += listener;
    public void UnregisterListener(Action<int, int> listener) => onHealthChanged -= listener;
}
```

---

## ⚠️ 3. The Singleton Pattern: Tradeoffs & Clean Implementation

A Singleton ensures only one instance of a class exists with a global access point (`GameManager.Instance`).

### ❌ The Dangers of Singletons:
- **Tight Coupling:** Any script calling `GameManager.Instance` becomes hard-wired to that concrete class.
- **Scene Reload Issues:** Reloading scenes can cause duplicate `DontDestroyOnLoad` singletons or leave dead references.

### ✅ Clean Generic Singleton Implementation:

```csharp
using UnityEngine;

public abstract class PersistentSingleton<T> : MonoBehaviour where T : MonoBehaviour
{
    private static T instance;

    public static T Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<T>();
            }
            return instance;
        }
    }

    protected virtual void Awake()
    {
        if (instance == null)
        {
            instance = this as T;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            // Prevent duplicate managers on scene reload
            Destroy(gameObject);
        }
    }
}
```

---

## 🎬 4. Multi-Scene Additive Loading

Instead of placing all managers and level art in one giant scene, split your project into:
1. **Core Scene (`_PersistentCore`):** Contains persistent managers, event channels, and audio listeners.
2. **Level Scenes (`Level_01`, `Level_02`):** Contain only geometry, gameplay objects, and visuals.

```csharp
using UnityEngine.SceneManagement;

public static class SceneLoader
{
    public static void LoadLevelAdditive(string levelSceneName)
    {
        SceneManager.LoadSceneAsync(levelSceneName, LoadSceneMode.Additive);
    }
}
```

---

## 🛠️ Hands-on Assignment (25 minutes)

1. Create a `HealthEventChannelSO` ScriptableObject asset.
2. Create a `Player` script that takes damage on spacebar and raises the channel event.
3. Create two independent scripts in your scene: `SoundPlayer` and `ScreenFlasher`.
4. Have both scripts subscribe to `HealthEventChannelSO` in `OnEnable()` and unsubscribe in `OnDisable()`.
5. Verify sound and flash feedback without the `Player` script holding any reference to Audio or Graphics!
