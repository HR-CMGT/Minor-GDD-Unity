# Curriculum Deep Dive & Blueprint per Lesson: Minor GDD Unity

This document contains the complete, pedagogically structured blueprint for every lesson in the **Minor Game Design & Development (HR-CMGT)** Unity curriculum.

Every lesson includes strictly what is essential:
1. **Core Learning Objectives**
2. **Pedagogical & Technical Pitfalls**
3. **Essential Theory & Working C# Code (Modern LTS / URP Standards)**
4. **Hands-on Mini-Assignment (15–30 minutes, verifiable)**
5. **Project Setup & Asset Checklist**

---

# TABLE OF CONTENTS

- [BLOCK 1: 2D PROTOTYPING & CORE ARCHITECTURE](#block-1-2d-prototyping--core-architecture)
  - [Lesson 1.1: Introduction to Unity 2D, Components & Input](#lesson-11-introduction-to-unity-2d-components--input)
  - [Lesson 1.2: Object Communication, Events & Data](#lesson-12-object-communication-events--data)
  - [Lesson 1.3: UI Layouting & Data Persistence](#lesson-13-ui-layouting--data-persistence)
  - [Lesson 1.4: Game Architecture 1 – Decoupling & SO Architecture](#lesson-14-game-architecture-1--decoupling--so-architecture)
  - [Lesson 1.5: Rapid Game Prototyping & Game Feel (Juice)](#lesson-15-rapid-game-prototyping--game-feel-juice)
  - [Lesson 1.7: 3D Block Prototyping & Greyboxing](#lesson-17-3d-block-prototyping--greyboxing)
  - [Lesson 1.9: Problem Solving, Debugging & Profiling](#lesson-19-problem-solving-debugging--profiling)
  - [Lesson 1.10: Game Architecture 2 – Finite State Machines & Refactoring](#lesson-110-game-architecture-2--finite-state-machines--refactoring)
- [BLOCK 2: 3D PROJECT, GRAPHICS & POLISH](#block-2-3d-project-graphics--polish)
  - [Lesson 2.1 & 2.2: URP Materials & Shader Graph](#lesson-21--22-urp-materials--shader-graph)
  - [Lesson 2.4: 3D Character Animation & State Machines](#lesson-24-3d-character-animation--state-machines)
  - [Lesson 2.6: Visual Effects (VFX) & Post-Processing](#lesson-26-visual-effects-vfx--post-processing)
  - [Lesson 2.7: Audio Systems & Dynamic Sound](#lesson-27-audio-systems--dynamic-sound)
- [GENERAL MODULE: GIT & TEAM COLLABORATION](#general-module-git--team-collaboration)

---

# BLOCK 1: 2D PROTOTYPING & CORE ARCHITECTURE

---

## Lesson 1.1: Introduction to Unity 2D, Components & Input

### 1. Learning Objectives
- Understand the GameObject-Component model.
- Separate visuals (graphics), physics (`Rigidbody2D` / `Collider2D`), and logic (`MonoBehaviour`).
- Control a 2D character via `Rigidbody2D.velocity` or `MovePosition` using the new Input System.

### 2. Common Pitfalls
- **Pitfall 1:** Moving a Rigidbody via `transform.position` (breaks physics interpolation, causes wall tunneling).
- **Pitfall 2:** Polling input in `FixedUpdate` (misses keystrokes) or running physics in `Update` (framerate-dependent speed).
- **Pitfall 3:** Friction from manual package downloads during class. Use pre-configured templates.

### 3. Production Code

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController2D : MonoBehaviour
{
    [Header("Movement Settings")]
    [SerializeField] private float moveSpeed = 8f;
    [SerializeField] private float jumpForce = 12f;

    [Header("Ground Check")]
    [SerializeField] private Transform groundCheckPoint;
    [SerializeField] private float groundCheckRadius = 0.2f;
    [SerializeField] private LayerMask groundLayer;

    private Rigidbody2D rb;
    private Vector2 inputVector;
    private bool isGrounded;

    private void Awake() => rb = GetComponent<Rigidbody2D>();

    public void OnMove(InputValue value) => inputVector = value.Get<Vector2>();

    public void OnJump(InputValue value)
    {
        if (value.isPressed && isGrounded)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
        }
    }

    private void Update()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheckPoint.position, groundCheckRadius, groundLayer);
    }

    private void FixedUpdate()
    {
        rb.velocity = new Vector2(inputVector.x * moveSpeed, rb.velocity.y);
    }
}
```

---

## Lesson 1.2: Object Communication, Events & Data

### 1. Learning Objectives
- Decouple scripts using C# Actions and UnityEvents.
- Store configuration data using ScriptableObjects.
- Manage timed sequences cleanly with Coroutines.

### 2. Architecture Code: C# Event Notification

```csharp
using System;
using UnityEngine;

public class HealthComponent : MonoBehaviour
{
    [SerializeField] private int maxHealth = 100;
    public int CurrentHealth { get; private set; }

    public event Action<int, int> OnHealthChanged; // (current, max)
    public event Action OnDeath;

    private void Awake() => CurrentHealth = maxHealth;

    public void TakeDamage(int amount)
    {
        if (CurrentHealth <= 0) return;
        CurrentHealth = Mathf.Max(0, CurrentHealth - amount);
        OnHealthChanged?.Invoke(CurrentHealth, maxHealth);

        if (CurrentHealth == 0) OnDeath?.Invoke();
    }
}
```

---

## Lesson 1.3: UI Layouting & Data Persistence

### 1. Canvas Scaler Rules:
- Set **UI Scale Mode** to `Scale With Screen Size`.
- Set **Reference Resolution** to `1920 x 1080`, **Match** to `0.5`.

### 2. JSON Persistence Service:

```csharp
using System;
using System.IO;
using UnityEngine;

[Serializable]
public class SaveData
{
    public int highscore;
    public int unlockedLevel;
}

public static class SaveSystem
{
    private static string SavePath => Path.Combine(Application.persistentDataPath, "savedata.json");

    public static void Save(SaveData data)
    {
        string json = JsonUtility.ToJson(data, true);
        File.WriteAllText(SavePath, json);
    }

    public static SaveData Load()
    {
        if (!File.Exists(SavePath)) return new SaveData();
        return JsonUtility.FromJson<SaveData>(File.ReadAllText(SavePath));
    }
}
```
