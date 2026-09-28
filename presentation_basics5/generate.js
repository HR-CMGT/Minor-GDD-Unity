
const fs = require('fs');
const path = require('path');

// Read presentation 4 as template
const p4Content = fs.readFileSync('presentation_basics4/presentation_unity6_basics4.html', 'utf8');

// Extract CSS and UI Chrome (before script)
const beforeScript = p4Content.substring(0, p4Content.indexOf('<script>'));

// Customise title and header in HTML
let customBeforeScript = beforeScript
    .replace(
        '<title>Dev - Basics 4: Game Architecture 1 – Decoupling &amp; ScriptableObject Architecture</title>',
        '<title>Dev - Basics 5: The Release Candidate – Polish, Lifecycle, Leaderboards &amp; Telemetry</title>'
    )
    .replace(
        '<span>Lesson 04: Game Architecture 1 &bull; <strong>Modern Unity 6</strong></span>',
        '<span>Lesson 05: The Release Candidate &bull; <strong>Modern Unity 6</strong></span>\n            <a href="../index.html" class="portal-nav-btn" style="color: #94a3b8; text-decoration: none; font-size: 0.78rem; font-weight: 700; background: #14141e; border: 1px solid #28283c; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s ease; margin-left: 10px;">&larr; Course Portal</a>'
    )
    .replace(
        '<form id="teacherPinForm" onsubmit="handleTeacherPinSubmit(event)"',
        '<form id="teacherPinForm" action="javascript:void(0);" onsubmit="handleTeacherPinSubmit(event)"'
    )
    .replace(
        'scroll-behavior: smooth;',
        'scroll-behavior: auto !important;\n            overscroll-behavior-y: contain;'
    )
    .replace(
        'title="Student flags: click to clear"',
        'title="Pace flags: click to clear"'
    )
    .replace(
        '</style>',
        `        /* Universal Button Scaling & Overflow Prevention across all viewports and font sizes */
        button, .sim-action-btn, .nav-btn, .portal-nav-btn, .interactive-action-btn {
            box-sizing: border-box !important;
            height: auto !important;
            min-height: fit-content !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
        }

        .sim-action-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            width: 100% !important;
            box-sizing: border-box !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
            font-size: 0.74rem;
            font-weight: 700 !important;
            padding: 0.55em 0.85em !important;
            min-height: 2.2em !important;
            height: auto !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
        }
        .sim-action-btn:hover:not(:disabled) {
            filter: brightness(1.15) !important;
            transform: translateY(-1px) !important;
        }
        .sim-action-btn:active:not(:disabled) {
            transform: translateY(1px) scale(0.98) !important;
        }

        .portal-nav-btn {
            box-sizing: border-box !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
            height: auto !important;
            min-height: 2.2em !important;
            padding: 0.55em 0.9em !important;
        }
    </style>`
    );

// Extract clean engine code (excluding Class 4 simulators and ending script/body tags)
const engineStart = p4Content.indexOf('let currentSlide = 0;');
const simIdx = p4Content.indexOf('// CLASS 4 INTERACTIVE SIMULATORS');
if (engineStart === -1 || simIdx === -1) {
    throw new Error('Could not extract engineCode from presentation 4');
}
const bannerStart = p4Content.lastIndexOf('// ==========================================', simIdx);
let engineCode = p4Content.substring(engineStart, bannerStart > -1 ? bannerStart : simIdx).trim();

// Harden engineCode against file:/// and cross-frame security origin exceptions
engineCode = engineCode.replace(
    "try { if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) { if (window.self === window.top) { window.location.hash = '#slide-' + (currentSlide + 1); } } } catch(e) {}",
    "try { if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) { let isTop = false; try { isTop = (window.self === window.top); } catch (err) { isTop = false; } if (isTop) { window.location.hash = '#slide-' + (currentSlide + 1); } } } catch(e) {}"
);

// 19 Detailed Slides
const slides = [
  // Slide 1: Hero
  {
    isHero: true,
    title: "Dev - Basics 5: The Release Candidate – Polish, Lifecycle, Leaderboards & Telemetry",
    subtitle: "Minor Game Design & Development - Hogeschool Rotterdam (2 Weeks to Deadline)",
    topics: [
      "1. First-Run Onboarding & Screen Transitions",
      "2. Race Condition Hardening: Debouncing Rapid Taps",
      "3. Mobile OS Lifecycle: Handling Phone Calls, Backgrounding & Safe Auto-Save",
      "4. Universal Game Feel: Procedural Micro-Animations & Pitch-Varied Audio",
      "5. Zero-Backend Online Leaderboards: Dreamlo REST Integration",
      "6. In-Game Playtest Telemetry: Google Forms & Sheets Pipeline"
    ],
    labDeepDive: `<div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">
                BREAKDOWN
            </span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">
                Mental Model:
            </div>
            Imagine buying a brand-new car with a powerful engine, but the doors don't lock, the radio blasts at 100% volume with no knob, and if the engine stalls at a red light, the car catches fire. That is what a game without a release shell feels like. In Class 5, you will build the protective shell, the buttery smooth tactile feedback, and the telemetry black-box recorder that turns your prototype into a shippable commercial product.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">
                    What is What:
                </div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>Prototype Phase:</strong> Building mechanics, physics, and gameplay rules in isolated gym scenes.<br><strong>Release Candidate (RC):</strong> The complete, hardened package that handles app minimizing, screen transitions, tactile feedback, and quantitative playtest logging.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">
                    Key Differences (X vs Y):
                </div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>Tech Demo:</strong> Abrupt scene cuts, crashes on spam clicks, loses save on phone call.<br><strong>Release Candidate:</strong> Smooth screen fader, input lockouts, background auto-save, pitch-randomized audio, online leaderboards.
                </div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">
                Common Trap and Why It Breaks:
            </div>
            Assuming that because gameplay works in the Editor, the game is release-ready. Real playtests expose edge cases: minimizing the app, spamming buttons during transitions, and jarring audio volume spikes.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> An ambitious game with rough edges leaves a poor impression; a focused game that feels buttery smooth from the moment you launch it delivers a commercial experience.
        </div>
    </div>`,
    notes: "Welcome to Class 05: The Release Candidate & Polish Sprint. Your games are already downloadable on itch.io and the store. With two weeks left before the final deadline, today is about pushing the definitive update: screen transitions, lifecycle safety, tactile game feel, online competition, and live playtest telemetry."
  },

  // Slide 2: The Two-Week Finish Line
  {
    title: "Two-Week Sprint Focus: Polish, Lifecycle & Telemetry",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #ef4444;">
                <div class="card-title core" style="color: #b91c1c;">Unaddressed Edge Cases on Real Hardware</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Core mechanics, spawners, and UI work in the Unity Editor. But when launched on actual mobile hardware:
                    </p>
                    <ul style="font-size: 0.82rem; color: #991b1b; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Abrupt Cuts:</strong> Scenes switch instantaneously, causing visual popping and hitching.</li>
                        <li><strong>Button Mashing:</strong> Tapping 'Play' 3 times rapidly spawns 3 duplicate scenes.</li>
                        <li><strong>Phone Call Disaster:</strong> Minimizing the app loses unsaved scores or kills the player.</li>
                        <li><strong>No Retention:</strong> Zero online leaderboards to compete with friends.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Production Polish Targets</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        What transforms a raw game prototype into an award-winning submission:
                    </p>
                    <ul style="font-size: 0.82rem; color: #065f46; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Cinematic Screen Fader:</strong> Fade-to-black with input lockout.</li>
                        <li><strong>Lifecycle Safety:</strong> Auto-saving on <code>OnApplicationPause</code>.</li>
                        <li><strong>Juicy Micro-Interactions:</strong> Elastic button pops and pitch-varied SFX.</li>
                        <li><strong>Live Telemetry:</strong> An automated Google Sheet tracking level completion and deaths.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Evaluation Criteria] First 60 Seconds of Gameplay</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Players and reviewers do not judge games purely on code complexity. They evaluate the immediate feel: Does the game launch cleanly? Can you learn the controls without reading a manual? Does pressing buttons feel tactile and satisfying? Does it survive phone interruptions?
        </div>
    </details>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            A working engine without a chassis is a go-kart; add suspension, windshield, dashboard dials, and headlights, and you have a finished car. Today is all about building the chassis.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Release Candidate:</strong> A build ready for final submission unless high-severity bugs are uncovered.<br><strong>Polish Layer:</strong> Sound variance, tactile UI bounce, and seamless scene transitions.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Prototype:</strong> Focuses on whether an idea is fun.<br><strong>Release Candidate:</strong> Focuses on whether the game is unbreakable and complete.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Adding new gameplay mechanics during the final two weeks instead of polishing existing systems. New mechanics introduce fresh bugs right before the deadline.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Feature freeze now. Spend the final two weeks on polish, bug hardening, and playtesting telemetry.
        </div>
    </div>`,
    notes: "The final two weeks are about updating your live game. Do not introduce risky new mechanics that could destabilize your build. Feature freeze, lock the scope, fix edge cases, and push a polished update patch to itch.io or Google Play."
  },

  // Slide 3: First-Run Onboarding
  {
    title: "First-Time User Experience (FTUE) & Progressive Onboarding",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">OnboardingManager.cs</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using UnityEngine;

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
}</code></pre>
                    </div>
                    <p style="font-size: 0.84rem; color: #475569; margin-top: 6px;">
                        Check this in your title screen: if first run, show the tutorial overlay; if returning, jump straight into gameplay!
                    </p>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Progressive Disclosure vs Wall of Text</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Players never read multi-page popups. Design your first 60 seconds using <strong>Progressive Disclosure</strong>:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Step 1:</strong> Display only the primary interaction (e.g. 'Tap to Jump' or 'Swipe to Move').</li>
                        <li><strong>Step 2:</strong> Withhold secondary mechanics (spells, shields, combos) until Level 2.</li>
                        <li><strong>Step 3:</strong> Use animated finger/ghost pointers rather than written paragraphs.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When you buy a smartphone, it doesn't hand you a 400-page paper manual; it shows 3 swipe prompts on screen and lets you start using it immediately. Treat your players the same way.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>FTUE:</strong> First-Time User Experience.<br><strong>PlayerPrefs Key:</strong> Storing a boolean flag like 'HasCompletedOnboarding_v1' so tutorial prompts never nag returning players.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Text Tutorial:</strong> Player taps 'Skip' without reading and doesn't know how to play.<br><strong>Contextual Affordance:</strong> Bouncing button or glowing lane that naturally pulls the player's touch.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to save PlayerPrefs. Always call <code>PlayerPrefs.Save()</code> immediately after setting keys so phone crashes don't wipe onboarding states.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Version your onboarding keys (e.g. <code>_v1</code>, <code>_v2</code>) so you can easily force a re-tutorial when mechanics change.
        </div>
    </div>`,
    notes: "Emphasize progressive disclosure. Mobile players form their impression in the first 10 seconds. If controls are unclear immediately, retention drops to zero."
  },

  // Slide 4: Screen Fader Architecture
  {
    title: "Screen Fader Architecture: Smooth Scene Transitions",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">ScreenFader.cs &bull; CanvasGroup Fader</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class ScreenFader : MonoBehaviour
{
    public static ScreenFader Instance { get; private set; }
    [SerializeField] private CanvasGroup canvasGroup;
    [SerializeField] private float fadeDuration = 0.35f;

    private void Awake() {
        if (Instance == null) { Instance = this; DontDestroyOnLoad(gameObject); }
        else { Destroy(gameObject); }
    }

    public void FadeToScene(string sceneName) {
        StartCoroutine(FadeRoutine(sceneName));
    }

    private IEnumerator FadeRoutine(string sceneName) {
        canvasGroup.blocksRaycasts = true; // Lock input!
        float t = 0f;
        while (t < fadeDuration) {
            t += Time.unscaledDeltaTime;
            canvasGroup.alpha = t / fadeDuration;
            yield return null;
        }
        SceneManager.LoadScene(sceneName);
        t = 0f;
        while (t < fadeDuration) {
            t += Time.unscaledDeltaTime;
            canvasGroup.alpha = 1f - (t / fadeDuration);
            yield return null;
        }
        canvasGroup.blocksRaycasts = false; // Unlock input
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Visual Impact of Abrupt Scene Cuts</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Calling <code>SceneManager.LoadScene()</code> directly without a screen fader causes:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Asset Popping:</strong> The camera renders empty skybox for 1 frame before tilemaps/sprites finish loading.</li>
                        <li><strong>Frame Hitching:</strong> Garbage collection and texture decompression stutter on mobile.</li>
                        <li><strong>Jarring Flash:</strong> Sudden light-to-dark flashes strain player eyes.</li>
                    </ul>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 12px; margin-top: 10px; font-size: 0.82rem; color: #1e40af;">
                        <strong>Key Benefit:</strong> Fading to black completely masks mobile asset loading hitches!
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            In a theatre, the stage crew doesn't move tables and trees in broad daylight while the audience watches; they close the curtain, change the set in the dark, and open the curtain again. A Screen Fader is your game's theatre curtain.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>CanvasGroup.alpha:</strong> A single float (0 to 1) controlling the transparency of the entire overlay image.<br><strong>CanvasGroup.blocksRaycasts:</strong> When set to true, clicks and touches cannot pass through the curtain!</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Time.deltaTime:</strong> Pauses if Time.timeScale is 0 (freezing the fader!).<br><strong>Time.unscaledDeltaTime:</strong> Always runs reliably even when the game is paused.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Using <code>Time.deltaTime</code> inside your screen fader coroutine. If you pause the game (<code>Time.timeScale = 0f</code>) and click 'Quit to Main Menu', the fader hangs forever because deltaTime is 0!
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always use <code>Time.unscaledDeltaTime</code> for UI animations and screen faders so pause menus never freeze them.
        </div>
    </div>`,
    notes: "Highlight the use of Time.unscaledDeltaTime. A classic bug occurs when setting Time.timeScale = 0 in a pause menu, followed by a scene transition where deltaTime stops advancing and freezes on black!"
  },

  // Slide 5: Interactive Screen Fader Simulator
  {
    title: "Live Interactive Tool: Screen Fader & Scene Transition Simulator",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Screen Fader &amp; Double-Click Protection Simulator</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Click buttons below to test smooth scene fading and spam lockout</div>
        </div>

        <!-- 4-Phase Transition Stepper -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px;">
            <div id="simStep1" style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; text-align: center; font-size: 0.72rem; color: #94a3b8; transition: all 0.25s ease;">
                <span style="display: block; font-weight: 800; font-size: 0.65rem; color: #64748b;">PHASE 1</span>
                Lock Input
            </div>
            <div id="simStep2" style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; text-align: center; font-size: 0.72rem; color: #94a3b8; transition: all 0.25s ease;">
                <span style="display: block; font-weight: 800; font-size: 0.65rem; color: #64748b;">PHASE 2</span>
                Fade to Black
            </div>
            <div id="simStep3" style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; text-align: center; font-size: 0.72rem; color: #94a3b8; transition: all 0.25s ease;">
                <span style="display: block; font-weight: 800; font-size: 0.65rem; color: #64748b;">PHASE 3</span>
                Async Load (Darkness)
            </div>
            <div id="simStep4" style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; text-align: center; font-size: 0.72rem; color: #94a3b8; transition: all 0.25s ease;">
                <span style="display: block; font-weight: 800; font-size: 0.65rem; color: #64748b;">PHASE 4</span>
                Fade In &amp; Unlock
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))) 1fr 1.25fr; gap: 12px; align-items: stretch;">
            <!-- Left: Transition Controls -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem; margin-bottom: 2px;">SCENE CONTROLS</div>
                <button id="btnFaderLvl1" class="sim-action-btn" style="font-size: 0.74rem; background: #0369a1 !important; border: 1px solid #38bdf8 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simTransitionScene('Level_01')">
                    Fade to 'Level_01'
                </button>
                <button id="btnFaderLvl2" class="sim-action-btn" style="font-size: 0.74rem; background: #065f46 !important; border: 1px solid #10b981 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simTransitionScene('Level_02')">
                    Fade to 'Level_02'
                </button>
                <button id="btnFaderMenu" class="sim-action-btn" style="font-size: 0.74rem; background: #475569 !important; border: 1px solid #94a3b8 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simTransitionScene('MainMenu')">
                    Fade to 'MainMenu'
                </button>
                <button id="btnFaderSpam" class="sim-action-btn" style="font-size: 0.74rem; background: #991b1b !important; border: 1px solid #ef4444 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simSpamClick()">
                    Spam Double-Click Test
                </button>

                <!-- Speed / Duration Slider (1s to 10s) -->
                <div style="margin-top: 6px; padding-top: 8px; border-top: 1px solid #1f2937;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 0.68rem; font-weight: 800; color: #94a3b8;">FADE DURATION:</span>
                        <span id="simSpeedVal" style="font-size: 0.72rem; font-weight: 900; color: #38bdf8; font-family: monospace;">3.5s</span>
                    </div>
                    <input type="range" id="simFaderSpeedSlider" min="1" max="10" step="0.5" value="3.5" style="width: 100%; accent-color: #38bdf8; cursor: pointer;" oninput="simOnSpeedSliderChange(this.value)">
                    <div style="display: flex; justify-content: space-between; font-size: 0.62rem; color: #64748b; margin-top: 2px;">
                        <span>1s (Fast)</span>
                        <span>5.5s</span>
                        <span>10s (Ultra Slow)</span>
                    </div>
                </div>

                <!-- Blocked Clicks Counter Badge -->
                <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 8px; margin-top: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem;">
                    <span style="color: #94a3b8;">Spam Rejected:</span>
                    <span id="simSpamCounterBadge" style="background: #7f1d1d; color: #fecaca; font-weight: 800; padding: 2px 8px; border-radius: 10px; font-size: 0.70rem;">0</span>
                </div>
            </div>

            <!-- Center: Virtual Screen Viewport with Black Curtain Overlay -->
            <div style="background: #0b1120; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem;">
                    <span style="font-weight: 800; color: #f59e0b;">VIRTUAL SCREEN VIEWPORT</span>
                    <span id="simLockoutBadge" style="font-size: 0.68rem; background: #1e293b; color: #94a3b8; padding: 2px 8px; border-radius: 4px;">
                        Raycasts: Active (Input Unlocked)
                    </span>
                </div>

                <!-- Virtual Game Display Box -->
                <div style="position: relative; overflow: hidden; background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%); border: 1px solid #334155; border-radius: 6px; height: 110px; margin: 8px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                    <div style="font-size: 0.72rem; color: #64748b; font-weight: 700; letter-spacing: 0.05em;">CURRENT SCENE GRAPH</div>
                    <div id="simSceneName" style="font-size: 1.35rem; font-weight: 900; color: #4ade80; margin-top: 2px;">MainMenu</div>
                    <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 4px;">Rendering Active Assets...</div>
                    
                    <!-- Black Curtain Overlay (Affects only game screen) -->
                    <div id="simBlackCurtain" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000000; opacity: 0; pointer-events: none;"></div>
                </div>

                <!-- Viewport Telemetry -->
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 6px;">
                    <span>Fader Alpha: <strong id="simAlphaText" style="color: #38bdf8;">0.00</strong></span>
                    <span id="simSpamStatus" style="color: #4ade80; font-weight: 700;">Ready</span>
                </div>
            </div>

            <!-- Right: Real-Time C# Execution Trace -->
            <div style="background: #030712; border: 1.5px solid #1e293b; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                <div style="background: #0b1120; border-bottom: 1px solid #1e293b; padding: 6px 8px; font-size: 0.70rem; font-weight: 800; color: #38bdf8; display: flex; justify-content: space-between; align-items: center;">
                    <span>LIVE C# EXECUTION INSPECTOR</span>
                    <span style="color: #64748b; font-family: monospace;">ScreenFader.cs</span>
                </div>
                
                <!-- Real-Time Spam Alert Banner -->
                <div id="simSpamAlertBanner" style="display: none; background: #7f1d1d; border-bottom: 1px solid #ef4444; color: #fee2e2; padding: 6px 10px; font-size: 0.70rem; line-height: 1.35;"></div>

                <div class="code-box" style="margin: 0; padding: 10px; background: #070a12; flex: 1;">
                    <pre id="simFaderCode" style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.68rem; line-height: 1.45; color: #d4d4d4; white-space: pre-wrap; word-break: break-word;"><code>// Ready. Click any button on the left to execute transition coroutine.</code></pre>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Click 'Spam Double-Click Test'. Notice how the first click locks the system (<code>blocksRaycasts = true</code>). The second rapid click is intercepted and safely discarded by <code>if (_isTransitioning) return;</code>!
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>blocksRaycasts:</strong> Prevents any touches or mouse clicks from registering on UI beneath the curtain.<br><strong>_isTransitioning:</strong> A boolean guard preventing coroutines from being invoked multiple times concurrently.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Unguarded Scene Loading:</strong> User taps 3 times, Unity fires 3 parallel LoadScene operations (crashes game).<br><strong>Guarded Fader:</strong> First click triggers fade and blocks all subsequent touches until complete.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Relying only on disabling the Button component. If players touch another button on screen, they trigger a different scene transition while the first is halfway through.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Lock input globally at the ScreenFader level using <code>canvasGroup.blocksRaycasts = true;</code> rather than disabling individual buttons.
        </div>
    </div>`,
    notes: "Demonstrate live on screen: Click 'Spam Double-Click Test'. Point out the inspector showing 'SPAM INTERCEPTED AND BLOCKED'. Explain how this single boolean prevents race condition crashes."
  },

  // Slide 6: Race Conditions & Double-Tap Hardening
  {
    title: "Race Conditions: Double-Tap & Button Mashing Hardening",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Duplicate Callbacks from Rapid Taps</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Players—especially on touch screens—frequently double-tap or mash buttons when excited or frustrated:
                    </p>
                    <div class="code-box" style="margin: 8px 0;">
                        <pre><code>// [X] UNGUARDED UI CALLBACK
public void OnPlayButtonClicked() {
    // If player taps twice within 100ms:
    SceneManager.LoadSceneAsync("Level_01"); // Spawns duplicate scene!
}</code></pre>
                    </div>
                    <p style="font-size: 0.82rem; color: #dc2626; font-weight: 700;">
                        Result: Two copies of the level load simultaneously, audio plays twice, and event channels crash!
                    </p>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">State Guards for UI Events</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Always wrap transition triggers in a state guard:
                    </p>
                    <div class="code-box" style="margin: 8px 0;">
                        <pre><code>// [OK] HARDENED TRANSITION GUARD
private bool _isActionLocked = false;

public void OnPlayButtonClicked() {
    if (_isActionLocked) return; // Block all spam!
    _isActionLocked = true;

    // Lock all UI Canvas interaction immediately:
    faderCanvasGroup.blocksRaycasts = true;
    faderCanvasGroup.interactable = false;

    ScreenFader.Instance.FadeToScene("Level_01");
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Think of an elevator call button: once pressed, the light turns on and subsequent presses do nothing until the elevator arrives. If your buttons don't lock, players summon five elevators at once!
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Race Condition:</strong> A bug where software behavior depends on the uncontrollable timing or sequence of events.<br><strong>Debounce:</strong> Discarding inputs that occur within a small time window after the first input.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Client Click:</strong> Instant user trigger.<br><strong>Async Operation:</strong> Multi-frame operation. Input MUST be blocked between trigger and completion.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Assuming players only tap once. On touchscreens, sweaty fingers, lag spikes, or nervousness cause accidental double-taps constantly.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Set a boolean guard the very first millisecond an action starts, and reset it only after the entire async operation finishes.
        </div>
    </div>`,
    notes: "Explain that QA testers and players deliberately mash buttons on menus to test error handling. Unprotected transitions that crash on double-clicks break player trust."
  },

  // Slide 7: Mobile App Interruptions
  {
    title: "Mobile App Interruptions: Surviving Phone Calls & Minimizing",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Mobile OS Backgrounding Behavior</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Unlike PC games where the window stays open, mobile games are constantly interrupted by the OS:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Incoming Phone Calls / Alarms:</strong> Steals audio and focus immediately.</li>
                        <li><strong>Notification Shade:</strong> Pulling down the top bar pauses rendering.</li>
                        <li><strong>Home Swipe:</strong> User minimizes the app to respond to a text message.</li>
                    </ul>
                    <p style="font-size: 0.82rem; color: #dc2626; font-weight: 700; margin-top: 8px;">
                        If your game keeps running in the background: audio keeps playing, battery drains, and the player dies!
                    </p>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Unity's Lifecycle Callbacks</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Unity provides two deterministic callbacks for mobile state changes:
                    </p>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-top: 8px; font-size: 0.80rem;">
                        <strong style="color: #0284c7;">OnApplicationPause(bool isPaused):</strong> Called when the game is minimized or restored on mobile OS (Android & iOS).
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-top: 6px; font-size: 0.80rem;">
                        <strong style="color: #059669;">OnApplicationFocus(bool hasFocus):</strong> Called when window focus is gained or lost (e.g. system dialogues or WebGL browser tabs).
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When you read a book and your phone rings, you place a bookmark in the page before answering. OnApplicationPause is your automatic bookmark: it saves the game and pauses time before the phone takes over.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>OnApplicationPause(true):</strong> Device is putting app to sleep.<br><strong>OnApplicationPause(false):</strong> User has reopened app.<br><strong>Time.timeScale = 0:</strong> Freezes physics, spawners, and timers.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Unpaused Return:</strong> Player opens app and immediately dies because action continued while away.<br><strong>Pause Menu Return:</strong> Player opens app and sees a clean 'Game Paused' menu with a 'Resume' button.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to mute AudioListener on background. The app is minimized, but the background music keeps blaring out of the phone speaker!
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Whenever <code>OnApplicationPause(true)</code> fires, execute an instant auto-save and set <code>AudioListener.pause = true</code>.
        </div>
    </div>`,
    notes: "Stress the difference between PC and Mobile. On PC, games run in the background unless told otherwise. On mobile, the OS will brutally kill your process if you hog resources while minimized."
  },

  // Slide 8: Safe Auto-Save & Audio Muting
  {
    title: "Safe Auto-Save & Audio Muting on Backgrounding",
    content: `<div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">AppLifecycleManager.cs &bull; Production Implementation</div>
            <div class="card-body">
                <div class="code-box">
                    <pre><code>using UnityEngine;

public class AppLifecycleManager : MonoBehaviour
{
    [SerializeField] private GameObject pauseMenuUI;

    private void OnApplicationPause(bool isPaused)
    {
        if (isPaused)
        {
            // App sent to background (phone call, lock screen, home swipe)
            SaveSystem.SaveAllData();      // Auto-save immediately!
            AudioListener.pause = true;    // Mute all audio
            Time.timeScale = 0f;           // Freeze gameplay
        }
        else
        {
            // App restored to foreground
            AudioListener.pause = false;

            // Open pause menu so player can get their bearings!
            if (pauseMenuUI != null) pauseMenuUI.SetActive(true);
        }
    }
}</code></pre>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            If you pause a movie to get a drink, you don't want the movie to unpause itself the moment you walk back into the room; you want the pause screen to wait for you to press Play.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>AudioListener.pause:</strong> Mutes all sounds routed through Unity's audio engine in one single call.<br><strong>SaveAllData:</strong> Writes current player state (inventory, health, score) to persistent storage.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Saving on Quit only:</strong> Fails on mobile because the OS often kills backgrounded apps without firing OnApplicationQuit!<br><strong>Saving on Pause:</strong> 100% reliable data persistence.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Relying on <code>OnApplicationQuit</code> to save game state on mobile. When Android or iOS needs RAM, it terminates background apps instantly without calling OnApplicationQuit!
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> On mobile, treat <code>OnApplicationPause(true)</code> as your final chance to save. Never defer saving until Quit.
        </div>
    </div>`,
    notes: "Emphasize: On mobile, OnApplicationQuit is never guaranteed to run! Mobile operating systems kill background processes aggressively. OnApplicationPause is your only guaranteed save hook."
  },

  // Slide 9: The Reset All Data Switch
  {
    title: "In-Game State Reset for QA & Playtesting",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Wiping State in Code</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using UnityEngine;
using System.IO;

public class QADebugManager : MonoBehaviour
{
    public void ResetAllGameData()
    {
        // 1. Wipe PlayerPrefs
        PlayerPrefs.DeleteAll();
        PlayerPrefs.Save();

        // 2. Wipe JSON save files
        string path = Path.Combine(Application.persistentDataPath, "savegame.json");
        if (File.Exists(path)) {
            File.Delete(path);
        }

        Debug.Log("[QA] State wiped. Reloading MainMenu...");
        ScreenFader.Instance.FadeToScene("MainMenu");
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Testing Clean Installs via In-Game Reset</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        When QA testers or fresh players test your mobile game:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li>They want to experience Level 1 onboarding again.</li>
                        <li>If your game permanently remembers that Level 3 is unlocked, they are locked out of testing the clean new-player experience unless they delete the app!</li>
                        <li><strong>Standard Requirement:</strong> Place a clean 'Reset Progress' button in your Settings menu with a simple confirmation prompt.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            A good board game comes in a box where you can pack all the pieces back into their starting slots. A 'Reset Progress' button is packing the board game back into its starting state.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>PlayerPrefs.DeleteAll():</strong> Wipes all key-value pairs stored in the registry or app preferences.<br><strong>File.Delete:</strong> Removes disk JSON save files.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Dirty Save:</strong> Testing with leftover coins or unlocked levels skewing feedback.<br><strong>Clean Wipe:</strong> Verifying true balance from zero.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to delete JSON files when only calling <code>PlayerPrefs.DeleteAll()</code>. If your high score is in JSON, deleting PlayerPrefs leaves the score intact!
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Provide a clean-slate button so QA and playtesters can test your first-run onboarding in one click.
        </div>
    </div>`,
    notes: "Include a 'Reset Progress' button in the Settings menu. Anyone testing the game can reset state instantly to evaluate the first-run experience from scratch."
  },

  // Slide 10: Universal Game Feel & Micro-Animations
  {
    title: "Procedural UI Micro-Animations with AnimationCurve",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">UIMicroBounce.cs &bull; Procedural Easing</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using System.Collections;
using UnityEngine;

public class UIMicroBounce : MonoBehaviour
{
    // Elastic overshoot curve (EaseOutBack)
    [SerializeField] private AnimationCurve popCurve = new AnimationCurve(
        new Keyframe(0f, 0f),
        new Keyframe(0.7f, 1.15f), // 15% overshoot bounce
        new Keyframe(1f, 1f)
    );
    [SerializeField] private float duration = 0.25f;

    public void PlayBounce() {
        StopAllCoroutines();
        StartCoroutine(BounceRoutine());
    }

    private IEnumerator BounceRoutine() {
        float t = 0f;
        while (t < duration) {
            t += Time.unscaledDeltaTime;
            transform.localScale = Vector3.one * popCurve.Evaluate(t / duration);
            yield return null;
        }
        transform.localScale = Vector3.one;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Code Easing vs Animator Controller Overhead</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Creating Unity Animator components for simple UI popups has major drawbacks:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Performance Overhead:</strong> Each active Animator evaluates curves every frame on the CPU, even when idle.</li>
                        <li><strong>State Latency:</strong> Waiting for Animator transitions causes input lag on buttons.</li>
                        <li><strong>Clean C# Solution:</strong> A 15-line coroutine using <code>AnimationCurve</code> evaluates in 0.25 seconds and costs zero CPU when finished!</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When you open a box in real life, the lid doesn't teleport into place instantly—it springs open with physical weight and settles. A 0.25s overshoot curve gives digital menus physical presence.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>EaseOutBack:</strong> An easing equation where the value exceeds 1.0 before settling back to 1.0.<br><strong>AnimationCurve:</strong> Unity's visual Bezier curve editor in the Inspector.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Linear Scale:</strong> Stiff, robotic animation.<br><strong>Elastic Curve:</strong> Playful, satisfying, and responsive feel.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Making animations too long. A popup animation should never exceed 0.25 to 0.35 seconds. Anything longer feels sluggish and annoys mobile players.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Keep UI micro-animations snappy (under 300ms) with a slight overshoot for maximum responsiveness.
        </div>
    </div>`,
    notes: "Show how fast AnimationCurve.Evaluate is compared to setting up Animator states. It's clean, light, and customizable in the Inspector."
  },

  // Slide 11: Button Tactility & Visual Polish
  {
    title: "Button Tactility: Physical Press Depression",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">TactileButton.cs &bull; Touch Response</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using UnityEngine;
using UnityEngine.EventSystems;

public class TactileButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
{
    private Vector3 _baseScale;

    private void Awake() => _baseScale = transform.localScale;

    public void OnPointerDown(PointerEventData eventData)
    {
        // Compress scale by 8% on press down
        transform.localScale = _baseScale * 0.92f;
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        // Snap back to normal scale on release
        transform.localScale = _baseScale;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Canvas Flash Feedback for Milestones</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Touchscreens lack physical tactile click switches. Visual depression gives fingers instant confirmation:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>0.92x Scale Compression:</strong> Signals that the screen registered the player's touch.</li>
                        <li><strong>Screen Flash on Milestone:</strong> A brief 60ms white canvas pulse when completing a level or beating a high score.</li>
                        <li><strong>Zero Cost:</strong> Works across all genres—puzzles, runners, cards, and arcade games!</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When you press a physical key on a piano, the key moves down under your finger. Flat touchscreen glass doesn't move, so shrinking the button 8% visually tricks the player's brain into feeling a physical click.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>IPointerDownHandler:</strong> Unity EventSystem interface triggered the instant a finger touches the collider/rect.<br><strong>IPointerUpHandler:</strong> Triggered when the finger lifts off.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Color Tint only:</strong> Hard to see on bright screens or outdoor sunlight.<br><strong>Scale Depression:</strong> Instantly visible and tactile under the user's thumb.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Hardcoding <code>Vector3.one * 0.92f</code>. If a button's original scale was <code>(2.0, 2.0, 2.0)</code>, it shrinks to half size! Always multiply by <code>_baseScale</code>.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Save the base scale in <code>Awake()</code> and scale relative to it on press.
        </div>
    </div>`,
    notes: "Demonstrate on your phone or in the Editor. The difference between a button that just tints gray vs one that physically dips down is immense."
  },

  // Slide 12: Universal Audio Feedback
  {
    title: "Audio Feedback: Pitch Randomization & Core Cues",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">UniversalAudioFeedback.cs</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using UnityEngine;

public class UniversalAudioFeedback : MonoBehaviour
{
    public static UniversalAudioFeedback Instance { get; private set; }
    [SerializeField] private AudioSource sfxSource;
    [SerializeField] private AudioClip chimeSuccess;
    [SerializeField] private AudioClip thudInvalid;
    [SerializeField] private AudioClip tickClick;

    private void Awake() => Instance = this;

    public void PlaySuccess() => PlayPitched(chimeSuccess, 0.96f, 1.04f);
    public void PlayInvalid() => PlayPitched(thudInvalid, 0.90f, 1.00f);
    public void PlayClick()   => PlayPitched(tickClick, 0.94f, 1.06f);

    private void PlayPitched(AudioClip clip, float minP, float maxP) {
        if (!clip || !sfxSource) return;
        sfxSource.pitch = Random.Range(minP, maxP);
        sfxSource.PlayOneShot(clip);
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Core Audio Feedback Categories</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Regardless of genre, every mobile interaction falls into 3 auditory buckets:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>1. Positive Chime:</strong> Milestone achieved, coin collected, level passed, correct move.</li>
                        <li><strong>2. Negative Thud / Buzz:</strong> Blocked move, cannot afford item, invalid placement, timer warning.</li>
                        <li><strong>3. Subtle Click / Tick:</strong> UI tab switched, toggle flipped, menu opened.</li>
                    </ul>
                    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 8px 12px; margin-top: 10px; font-size: 0.80rem; color: #166534;">
                        <strong>Pitch Variance Rule:</strong> Subtle pitch modulation (+/- 4%) prevents repetitive tap ear fatigue.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When you type on a real mechanical keyboard, each keypress sounds slightly different because of tiny variations in angle and force. Pitch randomization mimics that natural analog variation.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Audio Fatigue:</strong> Annoyance caused by hearing the exact same static WAV file repeated 50 times.<br><strong>PlayOneShot:</strong> Fires an audio clip on an independent channel without interrupting active sounds.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Static Pitch:</strong> Robotic and fatiguing.<br><strong>Random Pitch (+/- 5%):</strong> Organic, pleasant, and tactile.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Varying pitch too much (e.g. 0.5 to 1.5). That sounds goofy and cartoonish. Keep pitch variation subtle: between 0.94f and 1.06f.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Apply subtle pitch variation to all repetitive sounds (clicks, taps, footfalls, coin pickups).
        </div>
    </div>`,
    notes: "Explain audio fatigue. Developers often test with sound muted, unaware that a coin pickup or button click sound creates fatigue when played at identical pitch dozens of times in a row."
  },

  // Slide 13: Interactive Game Feel Playground
  {
    title: "Live Interactive Tool: Game Feel & Audio Feedback Playground",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Universal Game Feel &amp; Micro-Interactions Playground</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Test button tactility, modal bounce easing, pitch variance, and screen flash</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))) 1fr 1.2fr; gap: 12px; align-items: stretch;">
            <!-- Left: Controls -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem; margin-bottom: 4px;">INTERACTION TRIGGERS</div>
                <button id="btnTactileTest" class="sim-action-btn" style="font-size: 0.74rem; background: #0369a1 !important; border: 1px solid #38bdf8 !important; color: #fff !important; padding: 0.55em 0.85em; cursor: pointer; transition: transform 0.1s ease;" onmousedown="simTactilePress(true)" onmouseup="simTactilePress(false)">
                    Press Tactile Button
                </button>
                <button id="btnPopupTest" class="sim-action-btn" style="font-size: 0.74rem; background: #065f46 !important; border: 1px solid #10b981 !important; color: #fff !important; padding: 0.55em 0.85em; cursor: pointer;" onclick="simTriggerPopup()">
                    Trigger Victory Popup
                </button>
                <button id="btnAudioChime" class="sim-action-btn" style="font-size: 0.74rem; background: #78350f !important; border: 1px solid #f59e0b !important; color: #fff !important; padding: 0.55em 0.85em; cursor: pointer;" onclick="simPlayAudio('chime')">
                    Play Success Chime
                </button>
                <button id="btnFlashTest" class="sim-action-btn" style="font-size: 0.74rem; background: #4c1d95 !important; border: 1px solid #a855f7 !important; color: #fff !important; padding: 0.55em 0.85em; cursor: pointer;" onclick="simScreenFlash()">
                    Canvas Screen Flash
                </button>
            </div>

            <!-- Center: Visual Preview Box -->
            <div style="background: #0b1120; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; overflow: hidden; min-height: 180px;">
                <!-- Simulated Popup Modal -->
                <div id="simModalPopup" style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 8px; padding: 12px 18px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.5); transform: scale(0); transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 2;">
                    <div style="color: #fbbf24; font-weight: 900; font-size: 0.92rem;">VICTORY ACHIEVED!</div>
                    <div style="color: #94a3b8; font-size: 0.74rem; margin-top: 4px;">Score: 1,450 pts (New High!)</div>
                </div>

                <!-- Tactile scale readout -->
                <div id="simTactileFeedback" style="position: absolute; bottom: 8px; left: 8px; font-size: 0.70rem; color: #94a3b8;">
                    Button Scale: <strong id="simButtonScaleText" style="color: #38bdf8;">1.00x</strong>
                </div>
                <!-- Audio Pitch readout -->
                <div id="simAudioFeedback" style="position: absolute; bottom: 8px; right: 8px; font-size: 0.70rem; color: #94a3b8;">
                    Audio Pitch: <strong id="simPitchText" style="color: #4ade80;">1.00x</strong>
                </div>

                <!-- Flash Overlay -->
                <div id="simFlashOverlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; opacity: 0; pointer-events: none; transition: opacity 0.08s ease-out;"></div>
            </div>

            <!-- Right: Real-time C# Inspector -->
            <div style="background: #030712; border: 1.5px solid #1e293b; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                <div style="background: #0b1120; border-bottom: 1px solid #1e293b; padding: 4px 8px; font-size: 0.70rem; font-weight: 800; color: #38bdf8; display: flex; justify-content: space-between;">
                    <span>LIVE C# EXECUTION INSPECTOR</span>
                    <span id="simFeelFileTag" style="color: #64748b; font-family: monospace;">GameFeel.cs</span>
                </div>
                <div class="code-box" style="margin: 0; padding: 8px; background: #070a12; flex: 1;">
                    <pre id="simFeelCode" style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.68rem; line-height: 1.45; color: #d4d4d4; white-space: pre-wrap; word-break: break-word;"><code>// Click any trigger to view C# execution and visual feedback.</code></pre>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Click 'Play Success Chime' multiple times. Notice how the pitch randomly varies between 0.96x and 1.04x each time. It sounds fresh and natural instead of machine-like!
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Overshoot Curve:</strong> Scaling to 1.15 before resting at 1.00 gives menus bouncy weight.<br><strong>Scale Depression:</strong> Shrinking to 0.92x on pointer-down confirms touch registration.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Static UI:</strong> Cold and unresponsive.<br><strong>Juicy UI:</strong> Tactile, playful, and responsive.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to reset pitch back to 1.0f on the AudioSource when playing background music. If BGM shares the same AudioSource, the music pitch wobbles! Always use a dedicated SFX AudioSource.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Keep music on a dedicated <code>bgmSource</code> and SFX on a separate <code>sfxSource</code> so pitch changes never corrupt music.
        </div>
    </div>`,
    notes: "Demonstrate live: Click Trigger Victory Popup and show the overshoot bounce. Click Play Success Chime repeatedly and point out the live pitch readout changing."
  },

  // Slide 14: Cross-Platform Leaderboards Architecture
  {
    title: "Cross-Platform Online Leaderboards: Architecture",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Client-Server REST Architecture</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        You do not need a paid database or custom Node.js server to add global competition to your mobile game:
                    </p>
                    <div style="background: #0f172a; border-radius: 8px; padding: 12px; text-align: center; color: #f8fafc; font-size: 0.80rem; margin: 10px 0;">
                        <div style="color: #38bdf8; font-weight: 900;">Mobile Game Client (Unity)</div>
                        <div style="color: #94a3b8; font-size: 0.72rem; margin: 4px 0;">HTTP GET / POST over UnityWebRequest</div>
                        <div style="color: #4ade80; font-weight: 900;">Free REST Leaderboard (Dreamlo)</div>
                    </div>
                    <ul style="font-size: 0.82rem; color: #475569; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Submit Score:</strong> HTTP GET with player name and score.</li>
                        <li><strong>Fetch Top 10:</strong> Returns clean pipe-delimited text list.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Trade-offs: Heavy Backend SDKs vs Lightweight REST</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Installing heavy services (like Firebase or AWS GameLift) during the final sprint often causes:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Gradle &amp; Podfile Conflicts:</strong> Native Android/iOS dependency build failures.</li>
                        <li><strong>Account Setup Friction:</strong> Requires billing cards and complex authentication flows.</li>
                        <li><strong>Lightweight Alternative:</strong> Standard HTTP web requests use native Unity networking with zero external packages!</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Instead of building your own post office, you write an address on a postcard and drop it in the mailbox. A REST API is a public mailbox: you send a URL and get a text reply back.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>UnityWebRequest:</strong> Unity's native HTTP library that works across WebGL, Android, and iOS.<br><strong>Dreamlo:</strong> A free, no-login REST high score leaderboard service used in game jams and education worldwide.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Heavy SDK:</strong> Bloats build size by 50MB and breaks Gradle.<br><strong>Lightweight REST:</strong> 0 extra packages, 2 lines of C#.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Exposing your private key in client-side code where cheaters can wipe the board. For rapid game jam or playtest builds, Dreamlo is sufficient; for live production, use server-side validation.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Keep leaderboards simple and resilient with an offline fallback for when internet is unavailable.
        </div>
    </div>`,
    notes: "Caution against integrating heavy backend SDKs like Firebase in the final sprint. It adds unnecessary dependency overhead and Gradle configuration risks."
  },

  // Slide 15: Zero-Backend Leaderboards with Dreamlo
  {
    title: "Zero-Backend Leaderboards: Dreamlo REST Integration",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">OnlineLeaderboard.cs</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class OnlineLeaderboard : MonoBehaviour
{
    private const string PRIVATE_KEY = "YOUR_PRIVATE_KEY";
    private const string PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
    private const string BASE_URL    = "http://dreamlo.com/lb/";

    public IEnumerator SubmitScore(string name, int score) {
        string url = BASE_URL + PRIVATE_KEY + "/add/" + UnityWebRequest.EscapeURL(name) + "/" + score;
        using (UnityWebRequest www = UnityWebRequest.Get(url)) {
            yield return www.SendWebRequest();
        }
    }

    public IEnumerator FetchTopScores(int count, System.Action<string> onLoaded) {
        string url = BASE_URL + PUBLIC_KEY + "/pipe/" + count;
        using (UnityWebRequest www = UnityWebRequest.Get(url)) {
            yield return www.SendWebRequest();
            if (www.result == UnityWebRequest.Result.Success) {
                onLoaded?.Invoke(www.downloadHandler.text);
            }
        }
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Parsing Pipe-Delimited Results</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Dreamlo returns clean pipe-delimited text lines:
                    </p>
                    <div style="background: #0f172a; border-radius: 6px; padding: 8px 12px; font-family: monospace; font-size: 0.76rem; color: #4ade80; margin: 8px 0;">
                        Alex|1250|0|seconds<br>
                        Sam|980|0|seconds<br>
                        Taylor|740|0|seconds
                    </div>
                    <p style="font-size: 0.82rem; color: #475569; line-height: 1.4;">
                        Split each line by <code>'|'</code> to populate your leaderboard UI:
                        <code>string[] parts = line.Split('|');</code><br>
                        <code>entry.name = parts[0]; entry.score = int.Parse(parts[1]);</code>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            A pipe format is like a spreadsheet where columns are separated by vertical bars (|) instead of commas. It is light, fast, and takes 3 lines of C# to parse.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>UnityWebRequest.EscapeURL:</strong> Encodes spaces and symbols in player names (e.g. 'Alex 99' &rarr; 'Alex%2099').<br><strong>Offline Fallback:</strong> If www.result != Success, display local PlayerPrefs scores.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Crash on Disconnect:</strong> Bad game throws error.<br><strong>Graceful Fallback:</strong> Good game shows 'Offline - Showing Local Best'.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting <code>EscapeURL</code>. If a player enters 'Super Cool Guy', the URL breaks on the space and returns HTTP 400 Bad Request!
        </div>
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; color: #0f172a; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #0369a1; font-size: 0.95rem; margin-bottom: 8px;">Handling Duplicate Names &amp; Fetching Single Player Records:</div>
            
            <div style="margin-bottom: 10px;">
                <strong style="color: #0f172a; font-size: 0.88rem;">1. What Happens With Duplicate Names?</strong>
                <p style="margin: 4px 0 4px 0; color: #334155; font-size: 0.84rem;">
                    Dreamlo treats the <strong>name as the unique primary key</strong>. It <strong>overwrites</strong>: if "Alice" submits a score of 500, and later submits 800, Dreamlo updates the existing "Alice" record rather than creating a second entry.
                </p>
                <p style="margin: 0 0 6px 0; color: #991b1b; font-size: 0.82rem; font-weight: 600;">
                    The drawback: Any player who enters the exact same display name as another player can overwrite their score!
                </p>
                <div style="background: #f1f5f9; border-left: 3px solid #0284c7; padding: 6px 10px; font-size: 0.82rem; color: #1e293b;">
                    <strong>Standard Workaround:</strong> Don't use raw display names as the identifier. Combine a unique ID (like <code>SystemInfo.deviceUniqueIdentifier</code> or a generated <code>Guid</code>) with their name, or save the name into Dreamlo's extra text field.<br>
                    E.g., submit the unique ID as the name: <code>add/GUID_12345/500/0/Alice</code>
                </div>
            </div>

            <div>
                <strong style="color: #0f172a; font-size: 0.88rem;">2. Can You Fetch Just One Specific Player's Score?</strong>
                <p style="margin: 4px 0 4px 0; color: #334155; font-size: 0.84rem;">
                    Yes. Instead of downloading the full top list, Dreamlo allows fetching a single user's record:
                </p>
                <div style="background: #0f172a; color: #e2e8f0; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 0.78rem; line-height: 1.5; margin-bottom: 4px;">
                    Fetch Top 10: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;http://dreamlo.com/lb/PUBLIC_KEY/pipe/10<br>
                    Fetch Single Player: http://dreamlo.com/lb/PUBLIC_KEY/pipe-get/Alice
                </div>
                <p style="margin: 0; color: #475569; font-size: 0.82rem;">
                    Dreamlo will return only that specific player's single pipe-delimited line (or an empty string if they don't exist yet).
                </p>
            </div>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always wrap user-entered text with <code>UnityWebRequest.EscapeURL()</code> before appending it to web query strings.
        </div>
    </div>`,
    notes: "Walk through EscapeURL. Emphasize that dreamlo.com is completely free and requires zero login or credit card. It takes 2 minutes to generate a key pair."
  },

  // Slide 16: Playtest Telemetry
  {
    title: "Playtest Telemetry: Quantitative Metrics vs Verbal Feedback",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #ef4444;">
                <div class="card-title core" style="color: #b91c1c;">Limitations of Verbal Feedback</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        When you hand your phone to friends or classmates and ask: <em>"What did you think?"</em>:
                    </p>
                    <ul style="font-size: 0.82rem; color: #991b1b; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li>They say: <em>"It was really cool! I liked it!"</em></li>
                        <li><strong>The Reality:</strong> They got stuck on Level 2, hated the jump physics, and quit after 90 seconds.</li>
                        <li>Human feedback is polite, subjective, and unreliable.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Key Quantitative Telemetry Metrics</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Objective in-game telemetry tells you the raw, unfiltered truth:
                    </p>
                    <ul style="font-size: 0.82rem; color: #065f46; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>1. Time-to-Beat Level:</strong> Is Level 2 taking 12 minutes while Level 1 takes 30 seconds?</li>
                        <li><strong>2. Fail / Death Count:</strong> Are 80% of all fails happening on one specific obstacle?</li>
                        <li><strong>3. Total Session Length:</strong> How long does a play session actually last?</li>
                        <li><strong>4. Drop-off Point:</strong> Exactly which scene did the player quit on?</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            A flight recorder (black box) records altitude, speed, and engine temperature. When a plane has trouble, engineers don't ask the passengers for their feelings; they look at the black box telemetry.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Telemetry:</strong> Automated collection and transmission of operational data from remote sources.<br><strong>Funnel Analysis:</strong> Measuring what percentage of players make it from Level 1 &rarr; Level 2 &rarr; Level 3.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Qualitative:</strong> What players say ('It felt a bit tricky').<br><strong>Quantitative:</strong> What players actually did (47 deaths on Level 2 spike trap).</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Logging too much personal data. Always use anonymous Session IDs (e.g. <code>SystemInfo.deviceUniqueIdentifier</code> or a random GUID) to comply with privacy rules.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Track where players die and how long levels take; balance your game using numbers, not guesswork.
        </div>
    </div>`,
    notes: "Explain the Politeness Bias. People naturally want to be nice to creators, so verbal feedback is biased. Quantitative telemetry gives you the truth."
  },

  // Slide 17: Google Forms & Sheets Telemetry Pipeline
  {
    title: "Google Forms & Sheets Telemetry Pipeline",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Serverless Pipeline Architecture</div>
                <div class="card-body">
                    <div class="hierarchy-box-tree" style="margin: 6px 0;">
                        <div class="hierarchy-node root-node">
                            <div class="hierarchy-node-title">1. Create Google Form</div>
                            <div class="hierarchy-node-desc">Fields: SessionID, Level, TimeSec, FailCount, Notes</div>
                        </div>
                        <div class="hierarchy-node child-node" style="margin-top: 4px;">
                            <div class="hierarchy-node-title">2. Get Pre-Filled Link</div>
                            <div class="hierarchy-node-desc">Extract entry IDs (e.g. <code>entry.123456789</code>)</div>
                        </div>
                        <div class="hierarchy-node child-node" style="margin-top: 4px; border-left-color: #10b981;">
                            <div class="hierarchy-node-title">3. Dispatch from Unity via WWWForm</div>
                            <div class="hierarchy-node-desc">POST directly to <code>formResponse</code> URL</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">PlaytestTelemetry.cs Implementation</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class PlaytestTelemetry : MonoBehaviour
{
    private const string FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";

    public static IEnumerator PostTelemetry(string session, int lvl, int time, int fails) {
        WWWForm form = new WWWForm();
        form.AddField("entry.102938475", session);
        form.AddField("entry.564738291", lvl.ToString());
        form.AddField("entry.984736251", time.ToString());
        form.AddField("entry.192837465", fails.ToString());

        using (UnityWebRequest www = UnityWebRequest.Post(FORM_URL, form)) {
            yield return www.SendWebRequest();
        }
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When you submit a survey on Google, your browser sends a web request. In Unity, we use code to simulate that exact same survey submission automatically whenever a player finishes a session.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>formResponse:</strong> The backend endpoint of any Google Form that accepts form data.<br><strong>entry.XXXXXXXXX:</strong> The exact numerical ID assigned by Google to each question in your form.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>viewform:</strong> URL meant for human browsers.<br><strong>formResponse:</strong> URL meant for receiving POST data.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Posting to <code>viewform</code> instead of <code>formResponse</code>. If you use <code>viewform</code>, Google returns an HTML webpage and your spreadsheet remains completely empty!
        </div>
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; color: #0f172a; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #0369a1; font-size: 0.95rem; margin-bottom: 6px;">How to Find Your Own Form Entry IDs:</div>
            <p style="margin: 0 0 8px 0; color: #334155; font-size: 0.84rem;">
                Those numbers (e.g. <code>entry.102938475</code>) are the unique IDs generated by Google for each specific input field on your Google Form. When you create questions like Session ID, Level, Time, and Fails, Google tags each input in the HTML with an ID formatted like <code>entry.XXXXXXXXX</code>. Your script mimics a user filling out the form by mapping each variable to its matching field:
            </p>
            <div style="background: #0f172a; color: #e2e8f0; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 0.80rem; margin-bottom: 10px; line-height: 1.5;">
                form.AddField("entry.102938475", session); &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Maps session string -&gt; Question 1 (Session ID)<br>
                form.AddField("entry.564738291", lvl.ToString()); &nbsp;&nbsp;&nbsp;&nbsp;// Maps level integer &nbsp;-&gt; Question 2 (Level)
            </div>
            <div style="font-weight: 700; color: #1e293b; font-size: 0.84rem; margin-bottom: 4px;">Step-by-Step Procedure to Find Your IDs:</div>
            <ol style="margin: 0; padding-left: 20px; color: #334155; font-size: 0.82rem; line-height: 1.6;">
                <li>Open your live Google Form in a desktop browser.</li>
                <li>Click the three vertical dots (overflow menu) in the top-right corner and select <strong>Get pre-filled link</strong>.</li>
                <li>Type distinct dummy values into each answer box (e.g., <code>111</code> for Session ID, <code>222</code> for Level, <code>333</code> for Time, <code>444</code> for Fails) and click <strong>Get link</strong>.</li>
                <li>Paste that link into a text editor or address bar. You will see URL query parameters formatted like:<br>
                    <code style="word-break: break-all; color: #0284c7; background: #f1f5f9; padding: 2px 5px; border-radius: 4px;">...?entry.102938475=111&amp;entry.564738291=222&amp;entry.984736251=333...</code>
                </li>
                <li>Copy those exact <code>entry.XXXXXX</code> keys directly into your C# script's <code>form.AddField()</code> statements.</li>
            </ol>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always change the end of the URL from <code>viewform</code> to <code>formResponse</code> so Google writes the entry to your Sheet.
        </div>
    </div>`,
    notes: "This pipeline takes 5 minutes to set up, requires zero backend servers, and populates a shared Google Sheet in real-time."
  },

  // Slide 18: Interactive Leaderboard & Telemetry Tool
  {
    title: "Live Interactive Tool: Leaderboard & Telemetry Dispatcher",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Leaderboard &amp; Google Sheets Telemetry Dispatcher</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Submit high scores and dispatch real-time playtest session data</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))) 1fr 1.2fr; gap: 12px; align-items: stretch;">
            <!-- Left: Inputs & Triggers -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem; margin-bottom: 4px;">TELEMETRY CONTROLS</div>
                <input id="inputPlayerName" type="text" value="Alex" placeholder="Player Name" style="background: #1e293b; border: 1px solid #475569; color: #fff; font-size: 0.76rem; padding: 0.5em 0.7em; border-radius: 4px; width: 100%; box-sizing: border-box;">
                <input id="inputPlayerScore" type="number" value="850" placeholder="Score" style="background: #1e293b; border: 1px solid #475569; color: #fff; font-size: 0.76rem; padding: 0.5em 0.7em; border-radius: 4px; width: 100%; box-sizing: border-box;">
                <button id="btnSubmitScore" class="sim-action-btn" style="font-size: 0.74rem; background: #0369a1 !important; border: 1px solid #38bdf8 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simSubmitLeaderboard()">
                    Submit to Leaderboard
                </button>
                <button id="btnDispatchTel" class="sim-action-btn" style="font-size: 0.74rem; background: #065f46 !important; border: 1px solid #10b981 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simDispatchTelemetry()">
                    Dispatch Session (Sheet)
                </button>
                <button id="btnToggleOffline" class="sim-action-btn" style="font-size: 0.74rem; background: #374151 !important; border: 1px solid #6b7280 !important; color: #fff !important; padding: 0.55em 0.85em;" onclick="simToggleOffline()">
                    Toggle Airplane Mode
                </button>
            </div>

            <!-- Center: Live Simulated Database & Google Sheet -->
            <div style="background: #0b1120; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <!-- Simulated Dreamlo Leaderboard -->
                <div style="background: #1e293b; border: 1px solid #475569; border-radius: 6px; padding: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-weight: 800; color: #38bdf8; margin-bottom: 4px;">
                        <span>GLOBAL LEADERBOARD (Dreamlo)</span>
                        <span id="simNetStatus" style="color: #4ade80; font-size: 0.68rem;">ONLINE</span>
                    </div>
                    <div id="simLeaderboardList" style="font-size: 0.70rem; color: #e2e8f0; line-height: 1.45; font-family: monospace;">
                        1. Jordan - 1,240 pts<br>
                        2. Sam - 980 pts<br>
                        3. Taylor - 740 pts
                    </div>
                </div>

                <!-- Simulated Google Sheet -->
                <div style="background: #1e293b; border: 1px solid #475569; border-radius: 6px; padding: 8px; flex: 1; display: flex; flex-direction: column;">
                    <div style="font-size: 0.76rem; font-weight: 800; color: #10b981; margin-bottom: 4px;">
                        LIVE GOOGLE SHEET (Telemetry)
                    </div>
                    <div id="simSheetRows" style="font-size: 0.68rem; color: #94a3b8; font-family: monospace; line-height: 1.4; overflow-y: auto; max-height: 70px;">
                        [10:14:02] Session #4812 | Lvl 2 | 84s | 1 Fail<br>
                        [10:18:29] Session #4819 | Lvl 3 | 142s | 3 Fails
                    </div>
                </div>
            </div>

            <!-- Right: Real-time C# Inspector -->
            <div style="background: #030712; border: 1.5px solid #1e293b; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
                <div style="background: #0b1120; border-bottom: 1px solid #1e293b; padding: 4px 8px; font-size: 0.70rem; font-weight: 800; color: #38bdf8; display: flex; justify-content: space-between;">
                    <span>LIVE C# WEB REQUEST INSPECTOR</span>
                    <span id="simWebFileTag" style="color: #64748b; font-family: monospace;">UnityWebRequest.cs</span>
                </div>
                <div class="code-box" style="margin: 0; padding: 8px; background: #070a12; flex: 1;">
                    <pre id="simWebCode" style="margin: 0; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.68rem; line-height: 1.45; color: #d4d4d4; white-space: pre-wrap; word-break: break-word;"><code>// Ready. Click Submit to send high score or dispatch telemetry session.</code></pre>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Click 'Toggle Airplane Mode' and try submitting a score. Notice how the inspector catches the offline state and cleanly switches to the local PlayerPrefs cache rather than crashing with a null exception.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>HTTP POST:</strong> Submitting form payload with session statistics.<br><strong>HTTP GET:</strong> Requesting top 10 score records.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Raw WebRequest:</strong> Requires error handling.<br><strong>Offline Cache:</strong> Seamless user experience regardless of internet availability.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to check <code>Application.internetReachability</code>. If a phone is on the subway, unhandled web requests can cause infinite yield hangs.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always write an offline fallback so your leaderboard displays local scores when internet drops.
        </div>
    </div>`,
    notes: "Demonstrate live: Enter a custom name, click Submit, and show the leaderboard update. Click Dispatch Session to show a new row appearing in the simulated Google Sheet."
  },

  // Slide 19: Summary & Final Update Checklist
  {
    title: "Summary & Final Update Checklist",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Core Update Milestones</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #334155; line-height: 1.45; padding-left: 16px;">
                        <li><strong>1. Fader &amp; First-Run:</strong> ScreenFader input lockout; Onboarding check for both fresh installs and updating players.</li>
                        <li><strong>2. Mobile Lifecycle:</strong> Auto-save on <code>OnApplicationPause</code>, audio muting, and clean pause menu resumption.</li>
                        <li><strong>3. Universal Game Feel:</strong> Procedural UI bounce easing, tactile button scale depression, and pitch-varied audio.</li>
                        <li><strong>4. Leaderboards &amp; Telemetry:</strong> Global Dreamlo high score competition and Google Sheets telemetry logging live playtest sessions.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Live Build Smoke Test Checklist</div>
                <div class="card-body">
                    <p style="font-size: 0.84rem; color: #475569; line-height: 1.4;">
                        Your game is already live on itch.io / Google Play. Before deploying your final update patch, test your live build on hardware:
                    </p>
                    <ol style="font-size: 0.80rem; color: #0f172a; line-height: 1.4; padding-left: 16px; margin-top: 6px;">
                        <li>Download the live updated build directly from your store page onto a real mobile device.</li>
                        <li>Save File Integrity: Does existing player progress carry over safely? Does 'Reset Progress' in Settings reset cleanly for new playtests?</li>
                        <li>Transition Stress Test: Spam the 'Start' and 'Restart' buttons 5 times. Does it transition smoothly without race condition freezes?</li>
                        <li>Lifecycle Interruption: Minimize the app mid-game (or simulate an incoming call). Does audio mute? Does reopening return to Pause?</li>
                        <li>Telemetry Dispatch: Complete a run. Does your score appear on Dreamlo? Does your Google Sheet record the session in real time?</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">BREAKDOWN</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Your game is already on the road and downloadable. Now it's time for the final factory tune-up: tightening the suspension, adding telemetry diagnostics, and verifying the update patch doesn't break player save files.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Live Update Patch:</strong> A new version build (v1.1+) pushed to an existing itch.io or Play Store listing.<br><strong>Update Smoke Test:</strong> A rapid verification test conducted on the downloaded live build to confirm the patch didn't introduce regressions.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Differences (X vs Y):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;"><strong>Updating Blindly:</strong> Pushing a new build without checking if existing player saves or store configurations survive.<br><strong>Verified Update:</strong> Downloading the live published build onto a clean phone to verify the complete player experience.</div>
            </div>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to increment your <code>Bundle Version Code</code> (Android) or version tag on itch.io. If you upload with the same version code, store distribution can reject the binary or fail to push the update to existing players.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Push your final update patch to itch.io / Google Play at least 24 hours before the deadline. Download the live release from your public link onto a real device to verify the patch runs cleanly.
        </div>
        <div style="margin-top: 14px; display: flex; flex-wrap: wrap; gap: 10px; width: 100%;">
            <a href="../index.html" class="portal-nav-btn" style="flex: 1 1 220px; text-align: center; text-decoration: none; font-size: 0.82rem; font-weight: 700; background: #0f172a; color: #94a3b8; border: 1px solid #334155; padding: 0.55em 0.9em; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: normal; line-height: 1.35; box-sizing: border-box; height: auto;">&larr; Return to Course Portal</a>
            <button onclick="selectSlide(0)" class="portal-nav-btn" style="flex: 1 1 220px; text-align: center; font-size: 0.82rem; font-weight: 700; background: #1e293b; color: #f8fafc; border: 1px solid #475569; padding: 0.55em 0.9em; border-radius: 6px; cursor: pointer; white-space: normal; line-height: 1.35; box-sizing: border-box; height: auto;">Restart Deck &uarr;</button>
        </div>
    </div>`,
    notes: "Wrap up: Remind everyone that their games are already downloadable. This final sprint is about publishing the definitive polish, game feel, and telemetry update patch to itch.io or Google Play before the deadline."
  }
];

// Custom Simulator JavaScript Functions for Class 5
const customSimPath = fs.existsSync(path.resolve(__dirname, 'custom_sim_5.js')) ? path.resolve(__dirname, 'custom_sim_5.js') : path.resolve('scratch/custom_sim_5.js');
const customSimJs = fs.readFileSync(customSimPath, 'utf8');

// Safe Storage and Session Shims with file:// safety
const safeStorageCode = `
        // Safe Storage Shim for file:/// and iframe security origins
        const safeStorage = {
            _data: {},
            getItem(k) {
                try {
                    if (window.location && window.location.protocol === 'file:') return this._data[k] || null;
                    return (typeof window.localStorage !== 'undefined') ? window.localStorage.getItem(k) : this._data[k];
                } catch (e) { return this._data[k] || null; }
            },
            setItem(k, v) {
                try {
                    this._data[k] = String(v);
                    if (window.location && window.location.protocol !== 'file:' && typeof window.localStorage !== 'undefined') {
                        window.localStorage.setItem(k, v);
                    }
                } catch (e) { this._data[k] = String(v); }
            }
        };
        const safeSession = {
            _data: {},
            getItem(k) {
                try {
                    if (window.location && window.location.protocol === 'file:') return this._data[k] || null;
                    return (typeof window.sessionStorage !== 'undefined') ? window.sessionStorage.getItem(k) : this._data[k];
                } catch (e) { return this._data[k] || null; }
            },
            setItem(k, v) {
                try {
                    this._data[k] = String(v);
                    if (window.location && window.location.protocol !== 'file:' && typeof window.sessionStorage !== 'undefined') {
                        window.sessionStorage.setItem(k, v);
                    }
                } catch (e) { this._data[k] = String(v); }
            }
        };`;

// Build final HTML
const slidesJson = JSON.stringify(slides, null, 2);
const finalHtml = customBeforeScript + '<script>\n' +
    safeStorageCode + '\n\n' +
    '        let slidesData = ' + slidesJson + ';\n\n' +
    engineCode + '\n\n' +
    customSimJs + '\n\n' +
    `        window.onload = init;
    </script>
</body>
</html>`;

// Target files
const filesToWrite = [
    'presentation_basics5/presentation_unity6_basics5.html',
    'presentation_basics5/index.html',
    'docs/presentation_basics5/presentation_unity6_basics5.html',
    'docs/presentation_basics5/index.html'
];

filesToWrite.forEach(f => {
    fs.writeFileSync(f, finalHtml, 'utf8');
    console.log('Successfully wrote: ' + f);
});

console.log('Class 5 Deck generated successfully!');
