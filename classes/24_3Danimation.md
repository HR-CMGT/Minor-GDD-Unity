# Lesson 2.4: 3D Character Animation, Rigging & State Machines

In this lesson, you learn how to bring 3D characters to life using the **Unity Mecanim Animator**, **BlendTrees**, **Mixamo mocap animations**, and **Animation Events**.

---

## 🎯 Learning Objectives
1. Import and configure 3D models using the **Humanoid Rig** system.
2. Build smooth locomotion systems with **1D and 2D BlendTrees**.
3. Configure Animator Transitions with **Zero Input Lag**.
4. Trigger code precisely on animation keyframes via **Animation Events** (footstep audio, attack hitboxes).

---

## 🦴 1. The Mixamo & Humanoid Import Workflow

1. Visit [Mixamo.com](https://www.mixamo.com/) and choose a character model.
2. Download the model as **FBX for Unity** (*With Skin*).
3. Download animations (*Idle*, *Walk*, *Run*, *Jump*):
   - **CRITICAL:** For locomotion clips, always check **"In Place"**! (Your C# script drives translation via `CharacterController`, not the animation file).
4. **Importing into Unity:**
   - Select the FBX file in Project View.
   - Under the **Rig** tab, set *Animation Type* to **Humanoid** and click **Apply**.
   - Under the **Animation** tab, check **Loop Time** for looping clips, then click **Apply**.

---

## 🌳 2. BlendTrees for Locomotion

Instead of brittle state transitions between *Idle $\rightarrow$ Walk $\rightarrow$ Run*, merge them into a single **BlendTree**:

```
[BlendTree: Locomotion] (Driven by Float Parameter: 'Speed')
  ├── Threshold 0.0 -> Idle Clip
  ├── Threshold 2.0 -> Walk Clip
  └── Threshold 6.0 -> Run Clip
```

### BlendTree Setup:
1. Open the Animator window (`Window > Animation > Animator`).
2. Right-click: `Create State > From New Blend Tree`.
3. Double-click the state and add a Float parameter: `Speed`.
4. Add 3 Motion fields and assign your *Idle*, *Walk*, and *Run* clips.

---

## ⚡ 3. Responsive Transitions (Zero Input Lag)

A common mistake is having jump or attack animations trigger with a 0.5s delay.

### Responsive Transition Settings:
- **Has Exit Time:** **UNCHECK (Disabled)**! If enabled, Unity waits for the active animation loop to finish before transitioning.
- **Transition Duration:** Set to a fast blend like `0.1s` or `0.05s` instead of the default `0.25s`.
- **Can Transition To Self:** **UNCHECK** (prevents continuous restarting of the animation if the button is held down).

---

## 👟 4. Animation Events (Audio & Hitbox Synchronization)

Animation Events trigger C# functions exactly when a foot touches the floor or a weapon reaches apex:

```
[Animation Window Timeline]
0:00 ────────── 0:15 [Event: OnFootstep()] ────────── 0:30 [Event: OnFootstep()]
```

### Event Receiver Script:
Attach this script to the GameObject containing the `Animator`:

```csharp
using UnityEngine;

public class CharacterAnimationEvents : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;
    [SerializeField] private AudioClip[] footstepClips;
    [SerializeField] private ParticleSystem footstepDust;

    // Called directly from the animation timeline!
    public void OnFootstep()
    {
        if (footstepClips.Length > 0 && audioSource != null)
        {
            AudioClip clip = footstepClips[Random.Range(0, footstepClips.Length)];
            audioSource.pitch = Random.Range(0.9f, 1.1f);
            audioSource.PlayOneShot(clip);
        }

        if (footstepDust != null)
        {
            footstepDust.Play();
        }
    }
}
```

---

## 💻 5. Driving Animator with Hashed Parameter IDs

Never pass raw strings like `animator.SetFloat("Speed", 5f)` in `Update()`. Cache parameter names to **Hash IDs**:

```csharp
using UnityEngine;

public class PlayerAnimationController : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private CharacterController controller;

    // Cache parameter hashes for maximum performance
    private static readonly int SpeedHash = Animator.StringToHash("Speed");
    private static readonly int JumpHash = Animator.StringToHash("Jump");

    private void Update()
    {
        // 1. Calculate horizontal velocity
        Vector3 horizontalVelocity = new Vector3(controller.velocity.x, 0, controller.velocity.z);
        float currentSpeed = horizontalVelocity.magnitude;

        // 2. Feed velocity into the BlendTree
        animator.SetFloat(SpeedHash, currentSpeed);
    }

    public void TriggerJumpAnimation()
    {
        animator.SetTrigger(JumpHash);
    }
}
```

---

## 🛠️ Hands-on Assignment (30 minutes)

1. Download a character with *Idle*, *Walk*, and *Run* animations from Mixamo.
2. Build an Animator Controller with a `Locomotion` BlendTree driven by `Speed`.
3. Connect your controller script so locomotion blends smoothly from stationary to sprinting.
4. Add an **Animation Event** to the walk clip to play footstep audio on every step.