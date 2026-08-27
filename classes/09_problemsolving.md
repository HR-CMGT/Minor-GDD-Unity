# Lesson 1.9: Problem Solving, Debugging & Profiling

In this lesson, you learn how to troubleshoot errors like a professional game engineer, diagnose runtime crashes with IDE debuggers, and track down frame drops and memory spikes with the **Unity Profiler**.

---

## 🎯 Learning Objectives
1. Accurately decipher **Stacktraces** and Console errors back to the root cause in code.
2. Utilize the **Visual Studio / Rider Debugger** with **Breakpoints**, stepping tools, and variable inspection.
3. Systematically eliminate **NullReferenceExceptions**.
4. Use the **Unity Profiler** to identify CPU bottlenecks and **Garbage Collection (GC)** spikes.

---

## 🔍 1. Anatomical Breakdown of a Stacktrace

When Unity displays an error in the Console, it prints an execution **Call Stack**:

```
NullReferenceException: Object reference not set to an instance of an object
PlayerHealth.TakeDamage (System.Int32 amount) (at Assets/Scripts/PlayerHealth.cs:42)
EnemyController.Attack () (at Assets/Scripts/EnemyController.cs:88)
EnemyController.Update () (at Assets/Scripts/EnemyController.cs:35)
```

### How to Read It:
1. **Top line (`at Assets/Scripts/PlayerHealth.cs:42`):** The exact file and line number where execution failed.
2. **Subsequent lines:** The call chain (`EnemyController.Update` called `Attack`, which called `TakeDamage`).
3. **Action:** Double-click the Console entry to jump directly to line 42 in your IDE!

---

## 🛑 2. Structured Debugging with Breakpoints

Stop writing 50x `Debug.Log("Here 1")` statements! Use the IDE debugger:

### Step-by-Step Debugging in Visual Studio:
1. Click the left margin next to the line number in your script to place a **red breakpoint**.
2. Click **"Attach to Unity"** in the top toolbar.
3. Switch to Unity and enter **Play Mode**.
4. When execution reaches that line, game execution pauses and your IDE highlights the current statement.
5. **Navigation:**
   - **F10 (Step Over):** Execute current line and advance to the next.
   - **F11 (Step Into):** Step into internal method calls.
   - **Mouse Hover:** Hover over variables to inspect their live values in memory.
   - **F5 (Continue):** Resume game execution until the next breakpoint.

---

## 🛡️ 3. NullReferenceException Checklist

A `NullReferenceException` means: *"You tried to invoke a method or access a field on a variable pointing to `null`."*

### Follow this 4-Step Checklist:
1. **Is the field unassigned in the Inspector?**
   - Did you forget to drag a Prefab, AudioSource, or Transform into a `[SerializeField]` slot?
2. **Was the object already destroyed?**
   - Did a previous method call `Destroy(target)` earlier in the frame?
3. **Did `GetComponent` fail?**
   - Use `TryGetComponent` to handle missing components safely:
   ```csharp
   if (TryGetComponent<Rigidbody>(out var rb))
   {
       rb.AddForce(Vector3.up * 5f, ForceMode.Impulse);
   }
   else
   {
       Debug.LogWarning($"No Rigidbody found on {gameObject.name}!");
   }
   ```
4. **Is an Event invoked without null protection?**
   - Always invoke using null-conditional syntax: `onDeath?.Invoke();` instead of `onDeath.Invoke();`.

---

## 📊 4. The Unity Profiler (Locating Lag & GC Allocations)

Open the Profiler: `Window > Analysis > Profiler` (Shortcut: `Ctrl + 7`).

```
┌────────────────────────────────────────────────────────────────────────┐
│ CPU USAGE PROFILER                                                     │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Spikes in timeline = Stutter / Frame drops]                       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ Overview Tab: Sort by "GC Alloc"                                       │
│ Function Name         │ Total % │ Time ms │ GC Alloc (Memory Allocation)│
│ ──────────────────────┼─────────┼─────────┼──────────────────────────── │
│ Player.Update()       │ 12.4%   │ 2.1ms   │ 2.4 KB (WARNING: ALLOCATING)│
│ Physics.Simulate()    │ 8.1%    │ 1.4ms   │ 0 B (Clean)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Profiling Golden Rule:
- **GC Alloc in `Update()` and `FixedUpdate()` should always be 0 B!**
- If GC Alloc > 0 B per frame, check for:
  - `new List<T>()` or `new Vector3[]` inside `Update()`.
  - String concatenation (`"Score: " + score`).
  - LINQ queries (`.Where()`, `.FirstOrDefault()`).

---

## 🛠️ Hands-on Assignment (20 minutes)

1. Open a script from your active project that handles movement or damage.
2. Attach Visual Studio with **Attach to Unity** and set a breakpoint in `TakeDamage` or `OnCollisionEnter`.
3. Trigger the condition in Play Mode and inspect variable values using **F10**.
4. Open the **Profiler** (`Ctrl + 7`), record 100 gameplay frames, and check for any methods allocating memory (**GC Alloc > 0 B**).