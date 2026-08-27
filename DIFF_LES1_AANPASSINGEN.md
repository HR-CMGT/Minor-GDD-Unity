# Visual Change & Improvement Analysis: Lesson 1.1

This document demonstrates exactly what was in the original Lesson 1 file (~~struck through with strikethrough~~) and what has been fixed or newly added (<u>underlined with underline</u>).

---

## 1. Title & Introduction

| Original vs New |
| :--- |
| ~~# Basics 1~~<br><u># Lesson 1.1: Introduction to Unity 2D (Platformer Workshop)</u> |
| ~~*(No learning objectives or context in original)*~~<br><u>## 🎯 Learning Objectives<br>1. Understand how GameObjects, Components, and Prefabs work together.<br>2. Correctly apply the script lifecycle (Awake, Start, Update, FixedUpdate).<br>3. Control a 2D character with Rigidbody2D, Collider2D, and the new Unity Input System.<br>4. Configure a dynamic follow camera using Cinemachine 2D.</u> |

---

## 2. Project Setup & Architecture

### Original instructions:
> ~~1. Download and open Unity~~<br>
> ~~2. Create a new 2D project~~<br>
> ~~3. From Window->Package Manager, install **Input System** and **Cinemachine** (click "*Packages: In Project*" and change it to "*Packages: Unity Registry*")~~<br>
> ~~*(Problem: Triggers Unity restart popup for Input System and creates beginner confusion)*~~

### New structured setup:
> <u>## 🏗️ Project Architecture & Setup</u><br>
> <u>### 1. Requirements:</u><br>
> <u>- Unity Editor 2022.3 LTS or Unity 6 with 2D URP Template (packages pre-configured).</u><br>
> <u>- Starter package: [`basics1.unitypackage`](../projectfiles/basics1.unitypackage).</u><br>
> <br>
> <u>### 2. Scene Hierarchy Standard (Separation of Concerns):</u><br>
> <u>Always structure the player object with dedicated roles:</u><br>
> <u>- **[Player] (Root Object):** Contains Rigidbody2D, BoxCollider2D, PlayerController2D, PlayerInput.</u><br>
> <u>- **[Graphics] (Child Object):** Contains SpriteRenderer, Animator.</u><br>
> <u>- **[GroundCheck] (Child Object):** Empty GameObject positioned at foot level for reliable ground detection.</u>

---

## 3. C# Scripting & Controller Code

### Original:
> ~~- **Programming the Player**: Open PlayerStart.cs and code:~~<br>
> ~~  - The Jump function~~<br>
> ~~  - The Move function~~<br>
> ~~  - The ResetPlayer function~~<br>
> ~~  - The OnCollisionEnter2D function~~<br>
> ~~  - The CollectCoin function~~<br>
> ~~*(Problem: Zero code examples in documentation; students searched blindly in a half-finished C# file without standards)*~~

### Newly Added C# Production Code:
> <u>## 💻 Complete C# Code: PlayerController2D.cs</u><br>
> <u>The code below demonstrates modern Input System usage and clean separation between Update and FixedUpdate:</u>

```csharp
<u>using UnityEngine;</u>
<u>using UnityEngine.InputSystem;</u>

<u>[RequireComponent(typeof(Rigidbody2D))]</u>
<u>[RequireComponent(typeof(Collider2D))]</u>
<u>public class PlayerController2D : MonoBehaviour</u>
<u>{</u>
    <u>[Header("Movement Settings")]</u>
    <u>[SerializeField] private float moveSpeed = 8.5f;</u>
    <u>[SerializeField] private float jumpForce = 13f;</u>

    <u>[Header("Ground Detection")]</u>
    <u>[SerializeField] private Transform groundCheckPoint;</u>
    <u>[SerializeField] private float groundCheckRadius = 0.25f;</u>
    <u>[SerializeField] private LayerMask groundLayer;</u>

    <u>[Header("Visual Reference")]</u>
    <u>[SerializeField] private SpriteRenderer spriteRenderer;</u>

    <u>private Rigidbody2D rb;</u>
    <u>private Vector2 moveInput;</u>
    <u>private bool isGrounded;</u>
    <u>private bool jumpRequested;</u>

    <u>private void Awake()</u>
    <u>{</u>
        <u>rb = GetComponent<Rigidbody2D>();</u>
        <u>rb.freezeRotation = true; // Prevent character from tipping over</u>
    <u>}</u>

    <u>// Input System Callback</u>
    <u>public void OnMove(InputValue value)</u>
    <u>{</u>
        <u>moveInput = value.Get<Vector2>();</u>
        <u>if (spriteRenderer != null && moveInput.x != 0)</u>
        <u>{</u>
            <u>spriteRenderer.flipX = moveInput.x < 0;</u>
        <u>}</u>
    <u>}</u>

    <u>public void OnJump(InputValue value)</u>
    <u>{</u>
        <u>if (value.isPressed && isGrounded)</u>
        <u>{</u>
            <u>jumpRequested = true;</u>
        <u>}</u>
    <u>}</u>

    <u>private void Update()</u>
    <u>{</u>
        <u>// 1. Ground detection in Update for instant response</u>
        <u>if (groundCheckPoint != null)</u>
        <u>{</u>
            <u>isGrounded = Physics2D.OverlapCircle(groundCheckPoint.position, groundCheckRadius, groundLayer);</u>
        <u>}</u>
    <u>}</u>

    <u>private void FixedUpdate()</u>
    <u>{</u>
        <u>// 2. Apply horizontal velocity in physics loop</u>
        <u>rb.velocity = new Vector2(moveInput.x * moveSpeed, rb.velocity.y);</u>

        <u>// 3. Execute jump</u>
        <u>if (jumpRequested)</u>
        <u>{</u>
            <u>rb.velocity = new Vector2(rb.velocity.x, jumpForce);</u>
            <u>jumpRequested = false;</u>
        <u>}</u>
    <u>}</u>

    <u>private void OnDrawGizmosSelected()</u>
    <u>{</u>
        <u>// Visual circle in Scene View to preview ground detection live</u>
        <u>if (groundCheckPoint != null)</u>
        <u>{</u>
            <u>Gizmos.color = isGrounded ? Color.green : Color.red;</u>
            <u>Gizmos.DrawWireSphere(groundCheckPoint.position, groundCheckRadius);</u>
        <u>}</u>
    <u>}</u>
<u>}</u>
```

---

## 4. Assignment & Workflow

### Original:
> ~~6. In the folder Class1/1_ENDSCENE, open the 1_endscene.unity scene file and press play~~<br>
> ~~7. In the folder Class1/0_STARTSCENE, open the 0_startscene.unity scene file~~<br>
> ~~8. Drag the prefabs from the folder Class1/Prefabs/Project_Start into the Scene view~~<br>
> ~~9. Finish the game! Use the Presentation, Unity Tips and Tutorials to help you on your way.~~<br>
> ~~- **Play Around**: make your own level! Place a few new floors... create some 2D objects with RigidBodies and connect them with 2D Joints... Sprite Shape... Tilemaps.~~<br>
> ~~*(Problem: Very vague instructions; asks week 1 students to figure out 5 complex unrelated systems like 2D Joints and Tilemaps simultaneously)*~~

### New Structured 4-Step Assignment:
> <u>## 🛠️ Step-by-Step Assignment (Focused 4-Step Workflow)</u><br>
> <u>- **Step 1: Import Package & Open Start Scene** (`Assets/Class1/0_STARTSCENE/0_startscene.unity`).</u><br>
> <u>- **Step 2: Configure Player Object** (Attach `PlayerController2D`, `PlayerInput`, child `GroundCheck`, and configure LayerMask).</u><br>
> <u>- **Step 3: Cinemachine 2D Camera Follow** (Assign player to the `Follow` target on the Cinemachine camera).</u><br>
> <u>- **Step 4: Coins & Collectibles** (Implement `OnTriggerEnter2D` with `CompareTag("Player")`).</u>

---

## 5. Troubleshooting & Debugging

### Original:
> ~~*(Completely missing in the original document; students were stuck on falling characters with zero guidance)*~~

### Newly Added:
> <u>## 🔍 Troubleshooting Checklist</u><br>
> <u>- **Character falls through floor:** Ensure the ground has a `BoxCollider2D` and verify `groundLayer` matches the Layer of the floor.</u><br>
> <u>- **Character flips/tips over when walking:** Check `Constraints > Freeze Rotation Z` on the `Rigidbody2D`.</u><br>
> <u>- **Input keys don't respond:** Verify `PlayerInput` component is present and set to `Behavior: Send Messages`.</u>

---

## 📄 Related Files
- 📖 View the full revised lesson in: [`classes/01_basics1.md`](file:///c:/Users/hicha/Documents/HR/classes/01_basics1.md)
- 📦 Starter package: [`projectfiles/basics1.unitypackage`](file:///c:/Users/hicha/Documents/HR/projectfiles/basics1.unitypackage)
