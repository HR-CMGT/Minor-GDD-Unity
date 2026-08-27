# Lesson 1.5: Rapid Prototyping & Game Feel (Juice)

In this lesson, you learn how to rapidly build prototypes that feel satisfying to play ("game feel" or "juice") by using tweening, screenshake, freeze frames, and fast debugging workflows.

---

## 🎯 Learning Objectives
1. Understand how **Juice** (visual and physical feedback) transforms the player experience.
2. Program smooth animations and tweens using **DOTween**.
3. Implement **Screenshake**, **Hitstop (Freeze Frames)**, and **Material Flashes**.
4. Fast debug and export to **WebGL for Itch.io**.

---

## 🧃 1. What is Game Feel ("Juice")?

Juice is non-functional sensory feedback that makes actions satisfying:
- **Player jumps:** Not just moving upward, but initiating with a brief squash and stretching upward before settling.
- **Bullet hits enemy:** Screenshake, white material flash, particle sparks, and a 0.05s freeze frame (hitstop).

---

## ⚡ 2. DOTween Masterclass

Install DOTween via the Unity Asset Store or Package Manager.

### Core DOTween Syntax:

```csharp
using UnityEngine;
using DG.Tweening;

public class TweenExamples : MonoBehaviour
{
    private void Start()
    {
        // 1. Move to position (X=5, Y=0, Z=0) in 1.5 seconds with overshoot easing
        transform.DOMove(new Vector3(5, 0, 0), 1.5f).SetEase(Ease.OutBack);

        // 2. Punch scale for impacts
        transform.DOPunchScale(new Vector3(0.3f, 0.3f, 0.3f), duration: 0.4f, vibrato: 5);

        // 3. UI fade-in via CanvasGroup
        CanvasGroup canvasGroup = GetComponent<CanvasGroup>();
        if (canvasGroup != null)
        {
            canvasGroup.alpha = 0f;
            canvasGroup.DOFade(1f, 0.8f);
        }
    }
}
```

---

## 💥 3. Juice Controller: Screenshake, Hitstop & Flash

Here is a complete juice controller for weapons, impacts, and explosions:

```csharp
using System.Collections;
using UnityEngine;
using DG.Tweening;

public class FeedbackJuice : MonoBehaviour
{
    [Header("Visual Targets")]
    [SerializeField] private Transform visualTransform;
    [SerializeField] private SpriteRenderer spriteRenderer;

    [Header("Settings")]
    [SerializeField] private Color flashColor = Color.white;
    [SerializeField] private float flashDuration = 0.1f;

    private Color originalColor;
    private Coroutine flashCoroutine;

    private void Awake()
    {
        if (spriteRenderer != null)
        {
            originalColor = spriteRenderer.color;
        }
    }

    // 1. Squash and Stretch effect
    public void PlaySquashAndStretch()
    {
        if (visualTransform == null) return;

        visualTransform.DOKill();
        visualTransform.localScale = Vector3.one;

        // Compress first, then rebound
        visualTransform.DOScale(new Vector3(1.4f, 0.6f, 1f), 0.08f)
            .OnComplete(() => visualTransform.DOScale(Vector3.one, 0.15f).SetEase(Ease.OutBack));
    }

    // 2. Hitstop (micro time freeze for impact weight)
    public void TriggerHitstop(float duration = 0.06f)
    {
        StartCoroutine(HitstopRoutine(duration));
    }

    private IEnumerator HitstopRoutine(float duration)
    {
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(duration); // Must use Realtime because timeScale is 0
        Time.timeScale = 1f;
    }

    // 3. Material / Sprite Flash
    public void TriggerFlash()
    {
        if (spriteRenderer == null) return;

        if (flashCoroutine != null) StopCoroutine(flashCoroutine);
        flashCoroutine = StartCoroutine(FlashRoutine());
    }

    private IEnumerator FlashRoutine()
    {
        spriteRenderer.color = flashColor;
        yield return new WaitForSeconds(flashDuration);
        spriteRenderer.color = originalColor;
    }

    // Fast test via Inspector context menu
    [ContextMenu("Test All Juice")]
    public void TestAll()
    {
        PlaySquashAndStretch();
        TriggerFlash();
        TriggerHitstop();
    }
}
```

---

## 🌐 4. WebGL Export & Itch.io Deployment

Checklist for a smooth WebGL build on Itch.io:

1. **Build Settings:**
   - Open `File > Build Settings...`
   - Select **WebGL** and click `Switch Platform`.
2. **Player Settings:**
   - Navigate to `Edit > Project Settings > Player > WebGL Tab`.
   - **Publishing Settings:**
     - Set **Compression Format** to `Disabled` (prevents decompression errors on Itch.io).
     - Enable **Data Caching**.
3. **Packaging & Upload:**
   - Click `Build` and choose an empty directory (e.g., `Build_WebGL`).
   - Select all files in that directory (`index.html`, `Build/`, `TemplateData/`) and compress them into a single `.zip` file.
   - Upload the `.zip` to Itch.io and check: *"This file will be played in the browser"*.

---

## 🛠️ Hands-on Assignment (20 minutes)

1. Add DOTween to your project.
2. Attach `FeedbackJuice.cs` to a target dummy GameObject.
3. On mouse click or bullet collision, trigger squash, white flash, and hitstop simultaneously.
4. Experience how much heavier and more responsive impacts feel instantly!
