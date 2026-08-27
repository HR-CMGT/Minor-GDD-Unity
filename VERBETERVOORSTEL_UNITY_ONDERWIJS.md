# Curriculum Improvement Plan & Critical Analysis: Minor GDD Unity

## 1. Executive Summary & Verdict

This repository serves as course material for the **Minor Game Design & Development (HR-CMGT)**. 
A thorough audit revealed the original repository was **approximately 65-70% unfinished**. Only Weeks 1.1 and 1.2 contained working `.unitypackage` starter projects. From Week 1.3 onwards, most lessons consisted of empty headers, placeholder memes ("whoosh", "stahp"), truncated sentences, dead links, and fatal C# compilation errors.

---

## 2. Critical Technical Errors in Original Code

1. **Typo in C# type `RigidBody` (`00_unity.md` lines 328, 335):**
   ```csharp
   // ERROR (causes compiler error):
   public RigidBody rb;

   // FIXED:
   public Rigidbody rb;   // 3D
   public Rigidbody2D rb; // 2D
   ```
2. **Invalid type `Vector` (`00_unity.md` line 433):**
   ```csharp
   // ERROR:
   moveInput = new Vector(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));

   // FIXED:
   moveInput = new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));
   ```
3. **Broken Image Link in `classes/26_VFX.md`:**
   Path `../img/vfx/img/vfx/spritesheetParticles.gif` had a duplicate directory prefix.
4. **Cinemachine & Input System Inconsistencies:**
   Missing Unity LTS / URP target specifications.

---

## 3. Core Additions (No-Bloat Standard)

1. **Unity Version & Pipeline Standardization:** Unity 2022.3/6 LTS with Universal Render Pipeline (URP).
2. **Git & Team Collaboration Guide:** Git LFS (`.gitattributes`), `.gitignore`, and prefab-based scene workflows.
3. **Finite State Machine (FSM) Pattern:** Generic C# state machine framework for game flow and AI.
4. **Concrete 15–30 Minute Assignments:** Every lesson now has a focused, verifiable hands-on task.
