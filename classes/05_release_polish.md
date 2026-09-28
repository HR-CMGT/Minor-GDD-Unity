# Basics 5: The Release Candidate – Polish, Lifecycle, Leaderboards & Telemetry

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics5) -
[Project Files](../projectfiles/readme.md) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
[Assignment](#assignment)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics5)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- [Basics 5 Code Snippets](00_codesnippets.md) for quick reference on ScreenFader, Lifecycle, Leaderboards, and Telemetry
- Unity Manual: [Application.OnApplicationPause](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnApplicationPause.html)
- Unity Manual: [UnityWebRequest Class](https://docs.unity3d.com/ScriptReference/Networking.UnityWebRequest.html)
- Free Global Leaderboard API: [Dreamlo Leaderboard Service](http://dreamlo.com/)

---

## Project Files & Setup
> **Note:** There is **no starter template package to download** for this class. You will apply these release-candidate systems directly inside your team's ongoing **mobile game project**. All patterns use native C# features, standard Unity 6 APIs, and zero external paid assets.

---

## [Learning Objectives]
By the end of this class, you will be able to:
1. Engineer a smooth, race-condition-free **Screen Transition System** that eliminates jarring cuts and double-click bugs.
2. Bulletproof your game against mobile OS interruptions using **`OnApplicationPause`** and **`OnApplicationFocus`** (auto-saving, audio muting, safe state resumption).
3. Elevate game feel across **any game genre** using procedural **UI micro-animations** (`AnimationCurve` easing) and **pitch-randomized audio feedback**.
4. Deploy an online **Global Leaderboard** using lightweight HTTP requests with offline local fallback.
5. Build a zero-cost, zero-server **Playtesting Telemetry Pipeline** using Google Forms and Google Sheets to collect quantitative player data during your final two weeks.

---

## 1. First-Run Onboarding & Screen Fading

### First-Run Detection Pattern
First-time players must be introduced to your mechanics progressively. Returning players should jump straight into action:

```csharp
using UnityEngine;

public class OnboardingManager : MonoBehaviour
{
    private const string ONBOARDING_KEY = "HasCompletedOnboarding_v1";

    public static bool IsFirstTimePlayer()
    {
        return !PlayerPrefs.HasKey(ONBOARDING_KEY);
    }

    public static void MarkOnboardingComplete()
    {
        PlayerPrefs.SetInt(ONBOARDING_KEY, 1);
        PlayerPrefs.Save();
    }
}
```

### Screen Fader (Smooth Transitions Without Hard Cuts)
Create a persistent UI overlay Canvas with a single `CanvasGroup` across your multi-scene setup:

```csharp
using System;
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class ScreenFader : MonoBehaviour
{
    public static ScreenFader Instance { get; private set; }

    [SerializeField] private CanvasGroup canvasGroup;
    [SerializeField] private float fadeDuration = 0.35f;
    [SerializeField] private AnimationCurve fadeCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);

    private bool _isTransitioning = false;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        canvasGroup.alpha = 0f;
        canvasGroup.blocksRaycasts = false;
        canvasGroup.interactable = false;
    }

    public void TransitionToScene(string sceneName, Action onSceneLoaded = null)
    {
        if (_isTransitioning) return; // Prevent double-clicks!
        StartCoroutine(TransitionRoutine(sceneName, onSceneLoaded));
    }

    private IEnumerator TransitionRoutine(string sceneName, Action onSceneLoaded)
    {
        _isTransitioning = true;
        canvasGroup.blocksRaycasts = true; // Lock all UI input during transition!

        // Fade to Black
        float timer = 0f;
        while (timer < fadeDuration)
        {
            timer += Time.unscaledDeltaTime;
            canvasGroup.alpha = fadeCurve.Evaluate(timer / fadeDuration);
            yield return null;
        }
        canvasGroup.alpha = 1f;

        // Load Target Scene
        AsyncOperation op = SceneManager.LoadSceneAsync(sceneName);
        while (!op.isDone)
        {
            yield return null;
        }

        onSceneLoaded?.Invoke();

        // Fade Back In
        timer = 0f;
        while (timer < fadeDuration)
        {
            timer += Time.unscaledDeltaTime;
            canvasGroup.alpha = 1f - fadeCurve.Evaluate(timer / fadeDuration);
            yield return null;
        }
        canvasGroup.alpha = 0f;
        canvasGroup.blocksRaycasts = false;
        _isTransitioning = false;
    }
}
```

---

## 2. Mobile App Lifecycle: Surviving Phone Calls & Minimizing

On mobile devices, an incoming phone call, notification shade pull-down, or home-swipe triggers backgrounding. If your game fails to pause or auto-save, player progress is lost and user trust is damaged.

### Production App Lifecycle Manager
```csharp
using UnityEngine;

public class AppLifecycleManager : MonoBehaviour
{
    [SerializeField] private GameObject pauseMenuUI;

    private void OnApplicationPause(bool isPaused)
    {
        if (isPaused)
        {
            // App sent to background (phone call, lock screen, home swipe)
            SaveSystem.SaveAllData();
            AudioListener.pause = true; // Mute background audio
            Time.timeScale = 0f;       // Freeze game time
        }
        else
        {
            // App restored to foreground
            AudioListener.pause = false;

            // Display pause menu so the player is not blindsided upon returning!
            if (pauseMenuUI != null)
            {
                pauseMenuUI.SetActive(true);
            }
        }
    }

    private void OnApplicationFocus(bool hasFocus)
    {
        if (!hasFocus)
        {
            SaveSystem.SaveAllData();
        }
    }
}
```

### In-Game State Reset for QA
Always provide a clean slate toggle inside your Settings menu for QA testers and playtesters:

```csharp
public void ResetAllProgress()
{
    PlayerPrefs.DeleteAll();
    PlayerPrefs.Save();
    
    // If using JSON save files:
    string path = System.IO.Path.Combine(Application.persistentDataPath, "savegame.json");
    if (System.IO.File.Exists(path))
    {
        System.IO.File.Delete(path);
    }

    Debug.Log("[QA] All saved progress wiped clean. Reloading initial scene...");
    ScreenFader.Instance.TransitionToScene("MainMenu");
}
```

---

## 3. Universal Game Feel: Procedural Micro-Animations & Audio Polish

### Procedural Scale Bounce (No Animator Bloat)
Avoid creating heavy Animator state machines for simple UI dialog popups. Use an `AnimationCurve` in code for snappy, zero-allocation micro-animations:

```csharp
using System.Collections;
using UnityEngine;

public class UIMicroBounce : MonoBehaviour
{
    [SerializeField] private AnimationCurve popCurve = new AnimationCurve(
        new Keyframe(0f, 0f),
        new Keyframe(0.7f, 1.15f), // Elastic overshoot
        new Keyframe(1f, 1f)
    );
    [SerializeField] private float duration = 0.25f;

    private Coroutine _popRoutine;

    public void PlayPop()
    {
        if (_popRoutine != null) StopCoroutine(_popRoutine);
        _popRoutine = StartCoroutine(PopRoutine());
    }

    private IEnumerator PopRoutine()
    {
        float timer = 0f;
        transform.localScale = Vector3.zero;

        while (timer < duration)
        {
            timer += Time.unscaledDeltaTime;
            float scale = popCurve.Evaluate(timer / duration);
            transform.localScale = Vector3.one * scale;
            yield return null;
        }

        transform.localScale = Vector3.one;
    }
}
```

### Tactile Button Press Behavior
Attach this to any UI Button to deliver physical tactile depression:

```csharp
using UnityEngine;
using UnityEngine.EventSystems;

public class TactileButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
{
    private Vector3 _originalScale;

    private void Awake() => _originalScale = transform.localScale;

    public void OnPointerDown(PointerEventData eventData)
    {
        transform.localScale = _originalScale * 0.92f; // Physical press down
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        transform.localScale = _originalScale; // Snap back
    }
}
```

### Universal Audio Feedback with Pitch Randomization
Repetitive clicks and chimes cause auditory fatigue. Subtle pitch variation makes sounds natural:

```csharp
using UnityEngine;

public class UniversalAudioFeedback : MonoBehaviour
{
    public static UniversalAudioFeedback Instance { get; private set; }

    [SerializeField] private AudioSource sfxSource;
    [SerializeField] private AudioClip successChime;
    [SerializeField] private AudioClip invalidMoveThud;
    [SerializeField] private AudioClip buttonClickTick;

    private void Awake() => Instance = this;

    public void PlaySuccess() => PlayWithRandomPitch(successChime, 0.96f, 1.04f);
    public void PlayInvalid() => PlayWithRandomPitch(invalidMoveThud, 0.90f, 1.00f);
    public void PlayClick()   => PlayWithRandomPitch(buttonClickTick, 0.94f, 1.06f);

    private void PlayWithRandomPitch(AudioClip clip, float minPitch, float maxPitch)
    {
        if (clip == null || sfxSource == null) return;
        sfxSource.pitch = UnityEngine.Random.Range(minPitch, maxPitch);
        sfxSource.PlayOneShot(clip);
    }
}
```

---

## 4. Cross-Platform Online Leaderboards: Zero Backend Setup

You do not need a paid database or backend server to host global high scores. Using a free service like **Dreamlo**, any mobile game can send and retrieve high scores with basic HTTP requests:

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class OnlineLeaderboard : MonoBehaviour
{
    // Sign up free at dreamlo.com to get your keys!
    private const string PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
    private const string PUBLIC_KEY  = "YOUR_PUBLIC_KEY_HERE";
    private const string BASE_URL    = "http://dreamlo.com/lb/";

    [System.Serializable]
    public struct LeaderboardEntry
    {
        public string playerName;
        public int score;
    }

    public void SubmitScore(string playerName, int score, Action<bool> onComplete = null)
    {
        StartCoroutine(SubmitScoreRoutine(playerName, score, onComplete));
    }

    private IEnumerator SubmitScoreRoutine(string name, int score, Action<bool> onComplete)
    {
        string cleanName = UnityWebRequest.EscapeURL(name);
        string url = BASE_URL + PRIVATE_KEY + "/add/" + cleanName + "/" + score;

        using (UnityWebRequest www = UnityWebRequest.Get(url))
        {
            yield return www.SendWebRequest();
            bool success = www.result == UnityWebRequest.Result.Success;
            onComplete?.Invoke(success);
        }
    }

    public void FetchTopScores(int maxResults, Action<List<LeaderboardEntry>> onComplete)
    {
        StartCoroutine(FetchScoresRoutine(maxResults, onComplete));
    }

    private IEnumerator FetchScoresRoutine(int maxResults, Action<List<LeaderboardEntry>> onComplete)
    {
        string url = BASE_URL + PUBLIC_KEY + "/pipe/" + maxResults;

        using (UnityWebRequest www = UnityWebRequest.Get(url))
        {
            yield return www.SendWebRequest();

            List<LeaderboardEntry> results = new List<LeaderboardEntry>();

            if (www.result == UnityWebRequest.Result.Success && !string.IsNullOrEmpty(www.downloadHandler.text))
            {
                string[] lines = www.downloadHandler.text.Split('\n');
                foreach (string line in lines)
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    string[] parts = line.Split('|');
                    if (parts.Length >= 2)
                    {
                        results.Add(new LeaderboardEntry
                        {
                            playerName = parts[0],
                            score = int.TryParse(parts[1], out int s) ? s : 0
                        });
                    }
                }
            }

            onComplete?.Invoke(results);
        }
    }
}
```

---

## 5. Playtest Telemetry: Google Forms & Sheets Pipeline

Friends often tell you your game is great even if they struggled on Level 2. Quantitative telemetry gives you the unfiltered truth: where players fail, how long levels take, and where they quit.

### Pipeline Architecture (Serverless & Free):
1. Create a Google Form with input questions:
   - `SessionID` (Short answer)
   - `LevelReached` (Short answer)
   - `TimePlayedSeconds` (Short answer)
   - `FailCount` (Short answer)
   - `FeedbackNotes` (Paragraph)

### How to Find Your Own Form Entry IDs:
Those numbers (`entry.XXXXXXXXX`) are unique numerical IDs assigned by Google to each specific input field on your form. Your C# script mimics a user submitting the form by mapping each variable to its matching field:
- `form.AddField("entry.102938475", sessionId);` -> Puts the session string into Question 1.
- `form.AddField("entry.564738291", level.ToString());` -> Puts the level integer into Question 2.

**Step-by-Step Procedure to Extract Your IDs:**
1. Open your live Google Form in a desktop browser.
2. Click the three vertical dots (overflow menu) in the top-right corner and select **Get pre-filled link**.
3. Type distinct dummy values into each answer box (e.g., `111` for Session ID, `222` for Level, `333` for Time, `444` for Fails) and click **Get link**.
4. Paste that link into a text editor or browser address bar. You will see URL query parameters formatted like:
   `https://docs.google.com/forms/d/e/.../viewform?entry.102938475=111&entry.564738291=222&entry.984736251=333...`
5. Copy those exact `entry.XXXXXX` keys into your C# script constants.
6. Replace `/viewform` at the end of your form URL with `/formResponse`. If you post to `viewform`, Google returns an HTML webpage and your spreadsheet will remain empty.

### Dispatching Telemetry from Unity:

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class PlaytestTelemetry : MonoBehaviour
{
    private const string FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";

    // Replace with your form's actual entry IDs:
    private const string ENTRY_SESSION_ID = "entry.102938475";
    private const string ENTRY_LEVEL      = "entry.564738291";
    private const string ENTRY_TIME_SEC   = "entry.984736251";
    private const string ENTRY_FAILS      = "entry.192837465";
    private const string ENTRY_NOTES      = "entry.657483920";

    public static void SendTelemetry(string sessionId, int level, int timeSeconds, int fails, string notes = "")
    {
        if (Application.isPlaying)
        {
            GameObject runner = new GameObject("[TelemetryDispatcher]");
            DontDestroyOnLoad(runner);
            runner.AddComponent<MonoBehaviourRunner>().StartCoroutine(PostRoutine(sessionId, level, timeSeconds, fails, notes, runner));
        }
    }

    private static IEnumerator PostRoutine(string sessionId, int level, int timeSeconds, int fails, string notes, GameObject runner)
    {
        WWWForm form = new WWWForm();
        form.AddField(ENTRY_SESSION_ID, sessionId);
        form.AddField(ENTRY_LEVEL, level.ToString());
        form.AddField(ENTRY_TIME_SEC, timeSeconds.ToString());
        form.AddField(ENTRY_FAILS, fails.ToString());
        form.AddField(ENTRY_NOTES, notes);

        using (UnityWebRequest www = UnityWebRequest.Post(FORM_URL, form))
        {
            yield return www.SendWebRequest();
            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("[Telemetry] Successfully dispatched playtest session to Google Sheet!");
            }
        }

        Destroy(runner);
    }
}

public class MonoBehaviourRunner : MonoBehaviour { }
```

---

## Assignment & Two-Week Deadline Checklist

Your game is already live and downloadable on itch.io or Google Play. Complete the 4 update milestones below and publish your final polished update patch before the deadline:

### Milestone 1: Screen Fader & Onboarding Detection
- Implement the `ScreenFader` overlay in your persistent core scene.
- Ensure transitioning between menus and gameplay uses a smooth fade, and verify that button mashing cannot spawn duplicate scenes.
- Detect first-time players and display an introductory visual guide.

### Milestone 2: App Lifecycle & Backgrounding Survival
- Implement `OnApplicationPause` to auto-save game progress and mute audio when minimized.
- Test by pressing Home on your mobile device (or minimizing the simulator) and reopening: verify zero data loss and clean pause menu resumption.
- Add a "Reset All Progress" button in Settings for QA and playtesters.

### Milestone 3: Universal Game Feel Pass
- Add procedural `AnimationCurve` scale bounces to all victory popups and dialogs.
- Add `TactileButton` depression scale to main UI buttons.
- Add randomized pitch variation (`0.94f - 1.06f`) to repetitive audio triggers.

### Milestone 4: Leaderboard & Telemetry Setup
- Implement global high score submission and retrieval using the Dreamlo REST service (or equivalent).
- Connect the Google Sheets telemetry dispatcher to log completion time and failure count at the end of each play session.
