# Strict Pedagogical & Technical Audit: What Still Needs Improvement

A rigorous, no-nonsense evaluation of the current **Basics 2 (Class 2)** presentation deck. This document details concrete flaws, missing pedagogical bridges, visual shortcomings, and actionable upgrades to transform this deck into a world-class university lecture experience.

---

## Executive Critique: The Harsh Truth

While the modern deck is demonstrably superior to the static 2018 Keynote, **it is still not perfect**. A strict audit reveals four main weaknesses:

1. **Visual Inconsistency in Later Slides**: Slides 4, 6, 7, 10, 11, and 13 received heavy interactive and visual love, but **Slides 12 (Dictionaries), 17 (InvokeRepeating), 20 (C# Actions), and 22 (Production Checklist)** are still mostly text-and-bullet cards.
2. **Missing "UnityEvent vs C# Action" Decision Matrix**: We solved the collection confusion with Slide 14's matrix, but students struggle equally with choosing between UnityEvent and C# Action.
3. **Outdated Google Play 2024-2026 Requirements (Slide 23)**: The slide mentions Keystores and AABs, but fails to warn students about the mandatory 20-tester closed test rule and Google Play Console API 34+ target enforcement.
4. **Lack of Presenter Tools**: A teacher standing in front of 40 students with a clicker needs pacing indicators, presenter notes, and interactive live scratchpads.

---

## Slide-by-Slide Critical Audit & Upgrade Opportunities

### 1. Slide 2: Course Roadmap
- **Current Flaw**: It's a static set of 5 cards. Students see it once and forget where they are as the class progresses.
- **Strict Improvement**:
  - Add a **Dynamic Roadmap Progress Indicator** in the header or drawer that highlights which milestone is currently active as the teacher advances through the deck.
  - Add estimated time budgets (e.g., *Milestone 1: 30 min | Milestone 2: 45 min | Break: 15 min | Milestone 3: 40 min | Milestone 4: 30 min | Lab: 20 min*).

### 2. Slide 8: GameObject.Find Anti-Pattern
- **Current Flaw**: The speech bubble next to Goomba is a flat rectangular div with a gray border. It doesn't look like a real comic speech bubble.
- **Strict Improvement**:
  - Implement an authentic SVG comic speech bubble tail pointing directly at Goomba's mouth.
  - Add a live interactive search cost counter: clicking *"Search Scene (1,000 Objects)"* simulates the CPU scanning 1,000 names sequentially vs instant 0ms Inspector direct reference.

### 3. Slide 12: Dictionaries
- **Current Flaw**: Uses a static image from the original Keynote (`slide_12_img_01.png`) with old formatting. No interactive component.
- **Strict Improvement**:
  - Replace static image with real JetBrains Rider C# code showing `Dictionary<string, ItemData>`.
  - Add an **Interactive Phone Book Simulator**:
    - Let the user click `"Search: HealthPotion"` vs `"Search: Excalibur"`.
    - Show an instant O(1) hash lookup counter (1 step) compared to a List looping through 500 items (500 steps).

### 4. Slide 14: Collections Matrix (Recent Addition)
- **Current Flaw**: Good matrix, but could be even punchier visually.
- **Strict Improvement**:
  - Add visual icons representing the metaphors (Locker icon for Array, Backpack icon for List, Phonebook for Dictionary, Brain for ScriptableObject).
  - Add an interactive selector: clicking a data structure highlights its corresponding C# code and Inspector view.

### 5. Slide 16: Timers in Update
- **Current Flaw**: Teaches `Time.deltaTime`, but completely ignores the #1 student bug: **Pause Menus**.
- **Strict Improvement**:
  - Add a callout for `Time.unscaledDeltaTime`.
  - Explain what happens when `Time.timeScale = 0f;` (game pause) and why pause menu animations freeze unless using unscaled time.

### 6. Slide 17: Coroutines
- **Current Flaw**: Warns about infinite while loops, but students still do it and crash their Unity editors.
- **Strict Improvement**:
  - Add a visual interactive demo showing what the `yield return` keyword actually does: it passes execution back to Unity's main engine loop for 1 frame, then resumes.
  - Include the **Garbage Collection Pro Tip**: Cache `WaitForSeconds`:
    ```csharp
    // BAD: Allocates 20 bytes on heap every call
    yield return new WaitForSeconds(1.0f);

    // GOOD: Zero allocation cached instance
    private readonly WaitForSeconds _waitOneSec = new(1.0f);
    yield return _waitOneSec;
    ```

### 7. Slide 18: InvokeRepeating
- **Current Flaw**: Treats InvokeRepeating as a simple alternative, but doesn't clearly explain why professional studios ban it.
- **Strict Improvement**:
  - Add clear warning badges:
    - **String-based method invocation** breaks silently if a programmer refactors the method name.
    - Cannot pass typed parameters or return values.
    - Hard to unit test.
  - Give the verdict: *Fine for game jam prototypes; avoid in production architectures.*

### 8. NEW Slide 21 Proposal: "UnityEvent vs C# Action" Matrix
- **Critical Missing Slide**: After teaching UnityEvent (Slide 19) and C# Actions (Slide 20), students need a direct comparison table!
- **Strict Improvement**:
  - Insert a side-by-side comparison matrix:
    | Feature | UnityEvent | C# System.Action |
    | :--- | :--- | :--- |
    | **Target Audience** | Designers & Level Builders | Programmers & Core Systems |
    | **Setup Location** | Inspector Drag & Drop | C# Code (`+=` / `-=`) |
    | **Performance** | Slower (uses reflection & GC) | Instant (direct delegate invocation) |
    | **Unsubscribing** | Handled by Unity engine | **MANDATORY** in `OnDisable()` |
    | **Best For** | Audio, Particles, UI HUD | 60 FPS physics loops, gameplay state |

### 9. Slide 22: Production Checklist
- **Current Flaw**: Three text cards without visual demonstration of *why* non-uniform scale breaks physics.
- **Strict Improvement**:
  - Add a side-by-side visual diagram showing:
    - **Uniform Scale (1, 1, 1)**: Circle collider is a perfect round circle; bounces predictably.
    - **Skewed Scale (2, 0.5, 1)**: Physics engine struggles with deformed box/circle approximations, causing tunneling through floors and erratic collision normals!

### 10. Slide 23: Google Play Pipeline
- **Current Flaw**: Shows outdated 2018 Google Play Console screenshots.
- **Strict Improvement**:
  - Update with current 2024-2026 Google Play developer policies:
    - **Target API 34+ (Android 14)** mandatory requirement.
    - **20-Tester Closed Beta Rule**: Personal developer accounts must run a 14-day test with at least 20 testers before production access is unlocked.
    - **Privacy Policy URL & Data Safety declarations**.

---

## Presenter & Classroom Experience Upgrades

| Feature | Current State | Proposed Upgrade | Teaching Impact |
| :--- | :--- | :--- | :--- |
| **Speaker Notes Mode** | None | Press <kbd>N</kbd> to toggle a discrete slide-out drawer with teacher talking points, common student traps, and time estimates. | Allows guest lecturers or substitute teachers to deliver the class flawlessly. |
| **Classroom Glare Toggle** | Dark stage only | High-contrast projector toggle for bright rooms with washed-out projectors. | Solves visibility issues in poorly dimmed classrooms. |
| **Student Cheatsheet Export** | Multi-slide web page | One-click button to download/print a clean 2-page PDF summary cheatsheet covering all 5 milestones. | Gives students a permanent reference card for their minor exam and game project. |

---

## Priority Action Plan: Top 5 Immediate Wins

1. **Add UnityEvent vs C# Action Comparison Matrix** (New slide between Events and Best Practices).
2. **Build Interactive Dictionary Lookup Sandbox** on Slide 12 (Phone book search vs 500-item loop).
3. **Add SVG Comic Speech Bubble Tail** to Goomba on Slide 8.
4. **Add Physics Scale Warping Diagram** to Slide 22 (Scale 1,1,1 vs Skewed scale physics glitch).
5. **Update Google Play Requirements** to modern 2024-2026 Android developer reality on Slide 23.
