# Basics 2: Object Communication & Data Containers

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics2) -
[Project Files](../projectfiles/basics2.unitypackage) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
[Assignment](#assignment)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics2)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- [Basics 2 Code Snippets](00_codesnippets.md) for quick reference on TryGetComponent, Coroutines, and ScriptableObjects

---

## Assignment
1. Open your Unity 6 (6000.3+) project from Class 1 (or create a new 2D project).
2. Download [basics2.unitypackage](../projectfiles/basics2.unitypackage).
3. With Unity open, double-click or drag **basics2.unitypackage** into Unity, and click **Import All**.
4. In Project view, navigate to `Assets/Class2/1_ENDSCENE/Class2_endscene.unity`. Press **Play** to see the target completed game in action.
5. In Project view, open `Assets/Class2/0_STARTSCENE/Class2_startscene.unity`.
6. Complete the 4 Milestones below to bring the starter project to full completion!

---

### Milestone 1: Fixed Spawn Points Array
- Open `Assets/Class2/Scripts/Project_Start/EnemySpawner_Start.cs`.
- Declare a public Transform array for spawn locations:
  ```csharp
  public Transform[] SpawnPoints;
  ```
- In the Unity Inspector on the `EnemySpawner` GameObject, set array size to `3` and drag your 3 spawn point markers into the array slots.
- Pick a random spawn point when instantiating:
  ```csharp
  Transform spawnPoint = SpawnPoints[Random.Range(0, SpawnPoints.Length)];
  GameObject newEnemy = Instantiate(EnemyPrefab, spawnPoint.position, spawnPoint.rotation);
  ```

---

### Milestone 2: Shared Brain ScriptableObject
- Create the data container script `Assets/Class2/Scripts/EnemyStatsSO.cs`:
  ```csharp
  using UnityEngine;

  [CreateAssetMenu(fileName = "EnemyStats", menuName = "Class2/EnemyStats")]
  public class EnemyStatsSO : ScriptableObject
  {
      public float enemySpeed = 2f;
      public float enemyJumpVelocity = 6f;
  }
  ```
- In Project view, right-click -> **Create -> Class2 -> EnemyStats**. Create two presets: `SlowWalkHighJump.asset` and `FastWalkLowJump.asset`.
- In `Enemy_Start.cs`, read stats in `OnEnable()`:
  ```csharp
  Speed = -enemyStatsScriptableObject.enemySpeed;
  JumpVelocity = enemyStatsScriptableObject.enemyJumpVelocity;
  ```
- Drag the `.asset` file into the `EnemyStatsScriptableObject` slot on your Goomba prefabs.

---

### Milestone 3: Wave Spawner Coroutine
- In `EnemySpawner_Start.cs`, replace frame-polling or repeating invokes with a clean coroutine:
  ```csharp
  private Coroutine _spawnRoutine;

  void Start()
  {
      _spawnRoutine = StartCoroutine(SpawnWaveRoutine());
  }

  IEnumerator SpawnWaveRoutine()
  {
      while (true)
      {
          SpawnEnemy();
          yield return new WaitForSeconds(spawnInterval);
      }
  }

  void OnDisable()
  {
      if (_spawnRoutine != null)
      {
          StopCoroutine(_spawnRoutine);
      }
  }
  ```

---

### Milestone 4: Decoupled Death Event
- In `Enemy_Start.cs`, declare a UnityEvent for enemy death:
  ```csharp
  public UnityEngine.Events.UnityEvent GoombaGotHitEvent;
  ```
- In `KillEnemy()`, invoke the event before destroying:
  ```csharp
  public void KillEnemy()
  {
      GoombaGotHitEvent?.Invoke();
      _enemySpawner.DestroyEnemy(this);
  }
  ```
- In the Goomba prefab Inspector, click **+** on `GoombaGotHitEvent` and wire it to play a squish sound or update the score counter without hardcoding dependencies!

---

### Unity 6 Golden Rules for Class 2:
1. **CompareTag**: Always write `other.gameObject.CompareTag("Enemy")` (0 bytes GC) instead of `other.tag == "Enemy"`.
2. **TryGetComponent**: Always write `other.gameObject.TryGetComponent(out Enemy enemy)` for safe, null-crash-proof component access.
3. **linearVelocity**: In Unity 6, `Rigidbody2D.velocity` is deprecated. Always use `_rb.linearVelocity`.
4. **Clean Ground Check**: In `Enemy.cs`, check `normal.y > 0.5f` on collision to prevent Goombas jumping in mid-air.
