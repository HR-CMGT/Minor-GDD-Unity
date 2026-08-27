# Lesson 1.2: Object Communication, Events & Data

In this lesson, you learn how distinct scripts and objects communicate without turning your codebase into an unmanageable 'spaghetti' architecture. We cover C# Events, UnityEvents, Collections, and ScriptableObjects.

---

## 🎯 Learning Objectives
1. Know how and when to decouple scripts using **Events** (`System.Action` and `UnityEvent`).
2. Store and share game data using **ScriptableObjects**.
3. Work with dynamic lists (`List<T>`) and Dictionaries.
4. Write clean timers and repetitive routines with **Coroutines**.

---

## 🧭 Decision Tree: How Should Scripts Talk?

```
Question: Which script needs to send information to another script?

├── 1. Exclusive direct relationship (Character owns 1 specific Weapon)?
│   └── SOLUTION: Direct Reference -> [SerializeField] private Weapon currentWeapon;
│
├── 2. One event triggers multiple independent systems (Player dies -> UI, Audio, Spawner)?
│   └── SOLUTION: C# Event / UnityEvent -> public event Action OnPlayerDied;
│
└── 3. Data needs to persist or be shared across prefabs/scenes (Enemy stats, Item definitions)?
    └── SOLUTION: ScriptableObject -> [CreateAssetMenu] public class EnemyStatsSO : ScriptableObject
```

---

## 📦 1. Data Decoupling with ScriptableObjects

A `ScriptableObject` stores configuration data on disk as an asset, avoiding duplicate inspector parameters across 50 enemy prefabs.

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "NewEnemyStats", menuName = "GDD/Enemy Stats")]
public class EnemyStatsSO : ScriptableObject
{
    [Header("Base Properties")]
    public string enemyName = "Goomba";
    public int maxHealth = 30;
    public float movementSpeed = 3.5f;
    public int damageOnTouch = 10;
    public GameObject deathVfxPrefab;
}
```

---

## 🔄 2. Coroutines: Dynamic Enemy Spawner

Create a spawner that spawns enemies periodically from a prefab list:

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class EnemySpawner : MonoBehaviour
{
    [Header("Configuration")]
    [SerializeField] private List<GameObject> enemyPrefabs;
    [SerializeField] private Transform[] spawnPoints;
    [SerializeField] private float spawnInterval = 2.5f;
    [SerializeField] private int maxActiveEnemies = 10;

    [Header("Events")]
    [SerializeField] private UnityEvent<int> onEnemyCountChanged;

    private readonly List<GameObject> activeEnemies = new();
    private Coroutine spawnLoopCoroutine;

    private void Start()
    {
        spawnLoopCoroutine = StartCoroutine(SpawnRoutine());
    }

    private IEnumerator SpawnRoutine()
    {
        while (true)
        {
            yield return new WaitForSeconds(spawnInterval);

            // Clean up destroyed enemies from the list
            activeEnemies.RemoveAll(enemy => enemy == null);

            if (activeEnemies.Count < maxActiveEnemies && enemyPrefabs.Count > 0 && spawnPoints.Length > 0)
            {
                SpawnRandomEnemy();
            }
        }
    }

    private void SpawnRandomEnemy()
    {
        // 1. Pick random prefab and spawn point
        GameObject randomPrefab = enemyPrefabs[Random.Range(0, enemyPrefabs.Count)];
        Transform randomPoint = spawnPoints[Random.Range(0, spawnPoints.Length)];

        // 2. Instantiate enemy
        GameObject newEnemy = Instantiate(randomPrefab, randomPoint.position, Quaternion.identity);
        activeEnemies.Add(newEnemy);

        // 3. Fire count update event
        onEnemyCountChanged?.Invoke(activeEnemies.Count);
    }

    public void StopSpawning()
    {
        if (spawnLoopCoroutine != null)
        {
            StopCoroutine(spawnLoopCoroutine);
            spawnLoopCoroutine = null;
        }
    }
}
```

---

## 🛠️ Step-by-Step Assignment

### Step 1: Open Package & Start Scene
1. Download and import [`basics2.unitypackage`](../projectfiles/basics2.unitypackage).
2. Open `Class2/0_STARTSCENE/0_startscene.unity`.

### Step 2: Create ScriptableObject Assets
1. Right-click in Project View: `Create > GDD > Enemy Stats`.
2. Create 2 assets: `Stats_FastGoomba` (Speed: 6, Health: 15) and `Stats_TankGoomba` (Speed: 2, Health: 100).
3. Assign the stat assets to the corresponding enemy prefabs.

### Step 3: Complete Enemy Spawner
1. Open `EnemySpawner_Start.cs` and implement the `SpawnRoutine` coroutine.
2. Add a UI Text element in the Canvas and hook it up to the `onEnemyCountChanged` event via Inspector.

---

## 🔍 Troubleshooting Checklist
- **NullReferenceException when invoking Event:** Always use the null-conditional operator `?.Invoke()`.
- **Coroutines freeze Unity:** Ensure there is a `yield return` statement inside your `while` loop, otherwise execution will block indefinitely.