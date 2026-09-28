const fs = require('fs');
const path = require('path');

console.log('--- RUNNING CLASS 5 VALIDATION TEST ---');

const htmlPath = path.resolve('presentation_basics5/presentation_unity6_basics5.html');
const indexPath = path.resolve('presentation_basics5/index.html');
const docsHtmlPath = path.resolve('docs/presentation_basics5/presentation_unity6_basics5.html');
const docsIndexPath = path.resolve('docs/presentation_basics5/index.html');
const rootIndexPath = path.resolve('index.html');
const docsRootIndexPath = path.resolve('docs/index.html');
const lessonDocPath = path.resolve('classes/05_release_polish.md');

let failures = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(' [PASS] ' + testName);
    } else {
        console.error(' [FAIL] ' + testName);
        failures++;
    }
}

// 1. Check file existence
assert(fs.existsSync(htmlPath), 'presentation_unity6_basics5.html exists');
assert(fs.existsSync(indexPath), 'presentation_basics5/index.html exists');
assert(fs.existsSync(docsHtmlPath), 'docs/presentation_basics5/presentation_unity6_basics5.html exists');
assert(fs.existsSync(docsIndexPath), 'docs/presentation_basics5/index.html exists');
assert(fs.existsSync(lessonDocPath), 'classes/05_release_polish.md exists');

const html = fs.readFileSync(htmlPath, 'utf8');
const lessonDoc = fs.readFileSync(lessonDocPath, 'utf8');
const rootIndexHtml = fs.readFileSync(rootIndexPath, 'utf8');
const docsRootIndexHtml = fs.readFileSync(docsRootIndexPath, 'utf8');

// 2. Extract slidesData and check slide count
const match = html.match(/let slidesData = ([\s\S]*?);\s*let currentSlide/);
assert(match !== null, 'slidesData array extracted successfully');

if (match) {
    try {
        const slides = Function("return " + match[1])();
        assert(slides.length === 19, 'slidesData has 19 comprehensive slides (found ' + slides.length + ')');
    } catch (e) {
        assert(false, 'Failed to parse slidesData: ' + e.message);
    }
}

// 3. Check Slide Engine & Security / file:// hardening
assert(html.includes('function renderSlide()'), 'renderSlide() slide rendering engine present');
assert(html.includes('function changeSlide('), 'changeSlide() slide navigation present');
assert(html.includes('function selectSlide('), 'selectSlide() drawer navigation present');
assert(html.includes('const safeStorage ='), 'safeStorage shim for iframe/file security present');
assert(html.includes('const safeSession ='), 'safeSession shim for iframe/file security present');
assert(html.includes("if (window.location.protocol !== 'file:')"), 'file:// guard for window.location.hash present');

// 4. Check Teacher Mode, Shortcuts & Presenter Notes
assert(html.includes('TEACHER_PIN = "7331"'), 'Teacher PIN 7331 configured');
assert(html.includes('toggleSpeakerNotes'), 'toggleSpeakerNotes present');
assert(html.includes('toggleTeacherPinModal'), 'toggleTeacherPinModal present');
assert(html.includes("e.key === 't' || e.key === 'T'"), 'Teacher mode shortcut [T] registered');
assert(html.includes("e.key === 'n' || e.key === 'N'"), 'Presenter notes shortcut [N] registered');
assert(html.includes("e.key === 'l' || e.key === 'L'"), 'Lecture/Lab shortcut [L] registered');
assert(html.includes("e.key === 'f' || e.key === 'F'"), 'Fullscreen shortcut [F] registered');

// 5. Check Interactive Simulators
assert(html.includes('function simTransitionScene('), 'simTransitionScene() screen fader function present');
assert(html.includes('function simSpamClick()'), 'simSpamClick() double-click protection function present');
assert(html.includes('function simTactilePress('), 'simTactilePress() tactile button function present');
assert(html.includes('function simTriggerPopup()'), 'simTriggerPopup() UI bounce function present');
assert(html.includes('function simPlayAudio('), 'simPlayAudio() pitch-varied audio function present');
assert(html.includes('function simScreenFlash()'), 'simScreenFlash() screen flash function present');
assert(html.includes('function simSubmitLeaderboard()'), 'simSubmitLeaderboard() leaderboard function present');
assert(html.includes('function simDispatchTelemetry()'), 'simDispatchTelemetry() Google Sheets telemetry function present');
assert(html.includes('function simToggleOffline()'), 'simToggleOffline() airplane mode function present');

// 6. Check Core Concepts in Presentation and Handbook
assert(html.includes('ScreenFader'), 'ScreenFader present in presentation');
assert(lessonDoc.includes('ScreenFader'), 'ScreenFader present in handbook');
assert(html.includes('OnboardingManager'), 'OnboardingManager present in presentation');
assert(lessonDoc.includes('OnboardingManager'), 'OnboardingManager present in handbook');
assert(html.includes('AppLifecycleManager'), 'AppLifecycleManager present in presentation');
assert(lessonDoc.includes('AppLifecycleManager'), 'AppLifecycleManager present in handbook');
assert(html.includes('OnApplicationPause'), 'OnApplicationPause present in presentation');
assert(lessonDoc.includes('OnApplicationPause'), 'OnApplicationPause present in handbook');
assert(html.includes('UIMicroBounce'), 'UIMicroBounce present in presentation');
assert(lessonDoc.includes('UIMicroBounce'), 'UIMicroBounce present in handbook');
assert(html.includes('TactileButton'), 'TactileButton present in presentation');
assert(lessonDoc.includes('TactileButton'), 'TactileButton present in handbook');
assert(html.includes('UniversalAudioFeedback'), 'UniversalAudioFeedback present in presentation');
assert(lessonDoc.includes('UniversalAudioFeedback'), 'UniversalAudioFeedback present in handbook');
assert(html.includes('OnlineLeaderboard'), 'OnlineLeaderboard present in presentation');
assert(lessonDoc.includes('OnlineLeaderboard'), 'OnlineLeaderboard present in handbook');
assert(html.includes('PlaytestTelemetry'), 'PlaytestTelemetry present in presentation');
assert(lessonDoc.includes('PlaytestTelemetry'), 'PlaytestTelemetry present in handbook');
assert(html.includes('formResponse'), 'formResponse present in presentation');
assert(lessonDoc.includes('formResponse'), 'formResponse present in handbook');

// 7. Check Portals Link to Lesson 05
assert(rootIndexHtml.includes('presentation_basics5/presentation_unity6_basics5.html'), 'Root index.html links to presentation_basics5');
assert(rootIndexHtml.includes('Lesson 05'), 'Root index.html contains Lesson 05 title');
assert(docsRootIndexHtml.includes('presentation_basics5/presentation_unity6_basics5.html'), 'docs/index.html links to presentation_basics5');
assert(docsRootIndexHtml.includes('Lesson 05'), 'docs/index.html contains Lesson 05 title');

// 8. Check Header Title & Script Integrity
assert(html.includes('<span>Lesson 05: The Release Candidate &bull; <strong>Modern Unity 6</strong></span>'), 'Top header displays Lesson 05 title');
assert(!html.includes('Lesson 04: Game Architecture 1'), 'Lesson 04 title completely purged from Lesson 05');
try {
    const scriptContent = html.substring(html.lastIndexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));
    new Function(scriptContent);
    assert(true, 'Main JavaScript engine syntax is completely valid without parse errors');
} catch (e) {
    assert(false, 'Main JavaScript syntax error: ' + e.message);
}

// 9. Strict Zero Emoji Verification
const emojiRegex = /\p{Extended_Pictographic}/ug;
const filesToCheck = [htmlPath, indexPath, docsHtmlPath, docsIndexPath, lessonDocPath];
let emojiFound = false;
filesToCheck.forEach(filePath => {
    const text = fs.readFileSync(filePath, 'utf8');
    const matches = text.match(emojiRegex);
    if (matches && matches.length > 0) {
        emojiFound = true;
        console.error(' [FAIL] Emojis found in ' + path.basename(filePath) + ': ' + matches.join(', '));
    }
});
assert(!emojiFound, 'Zero emojis across all presentation and handbook files');

// 10. Lab Mode Scrolling Optimization Verification
assert(html.includes('scroll-behavior: auto !important;'), 'Lab Mode CSS uses instant hardware-accelerated scroll-behavior');
assert(html.includes('overscroll-behavior-y: contain;'), 'Lab Mode CSS contains vertical overscroll');
assert(!html.includes("addEventListener('wheel'"), 'Wheel event interceptor removed for glitch-free native 120fps scrolling');

// 11. Professional Studio Tone Verification (No student/examiner/teacher/grade terminology)
const forbiddenWords = ['student', 'examiner', 'teacher', 'grading'];
if (match) {
    const slides = Function("return " + match[1])();
    let forbiddenMatches = [];
    slides.forEach((s, idx) => {
        const text = ((s.title || '') + ' ' + (s.content || '') + ' ' + (s.notes || '')).toLowerCase();
        forbiddenWords.forEach(w => {
            const regex = new RegExp('\\b' + w + '(s)?\\b', 'i');
            if (regex.test(text)) {
                forbiddenMatches.push(`Slide ${idx + 1}: contains "${w}"`);
            }
        });
    });
    const handbookText = lessonDoc.toLowerCase();
    forbiddenWords.forEach(w => {
        const regex = new RegExp('\\b' + w + '(s)?\\b', 'i');
        if (regex.test(handbookText)) {
            forbiddenMatches.push(`Handbook: contains "${w}"`);
        }
    });
    if (forbiddenMatches.length > 0) {
        console.error(' [FAIL] Forbidden academic terms found:\n   ' + forbiddenMatches.join('\n   '));
    }
    assert(forbiddenMatches.length === 0, 'Clean studio language: 0 occurrences of student/examiner/teacher/grading in slides, notes & handbook');
}

// 12. Screen Fader Duration Slider Verification (1s to 10s)
assert(html.includes('simFaderSpeedSlider'), 'Speed slider simFaderSpeedSlider present in deck');
assert(html.includes('min=\\"1\\" max=\\"10\\"') || html.includes('min="1" max="10"'), 'Speed slider range configured strictly from 1 to 10 seconds');
assert(html.includes('function simOnSpeedSliderChange(') || html.includes('simOnSpeedSliderChange'), 'simOnSpeedSliderChange() handler present in script');

// 13. Course Portal Navigation Links
assert(html.includes('Course Portal') && html.includes('../index.html'), 'Top header and slide contain Course Portal navigation links');

// 14. Google Form Entry IDs Deep Dive Verification
assert(html.includes('How to Find Your Own Form Entry IDs'), 'Slide 17 contains entry IDs guide');
assert(html.includes('entry.102938475') && html.includes('Get pre-filled link'), 'Slide 17 explains pre-filled link extraction');
assert(lessonDoc.includes('How to Find Your Own Form Entry IDs'), 'Handbook contains entry IDs guide');
assert(lessonDoc.includes('Get pre-filled link'), 'Handbook explains pre-filled link extraction');

// 15. Repository Landing Page (README.md) Verification
const readmeText = fs.readFileSync(path.resolve('README.md'), 'utf8');
assert(readmeText.includes('presentation_basics5/index.html'), 'README.md links to Lesson 05 slide deck');
assert(readmeText.includes('classes/05_release_polish.md'), 'README.md links to Lesson 05 handbook');
assert(readmeText.includes('Interactive Course Presentations Portal'), 'README.md links to Course Presentations Portal');

// 16. Button Font Size Slider Overflow Hardening
assert(html.includes('.sim-action-btn'), 'Dedicated .sim-action-btn class present in CSS');
assert(html.includes('overflow-wrap: break-word'), 'Simulator buttons allow word wrapping so text never spills outside container');
assert(html.includes('minmax(calc(220px * var(--font-scale'), 'Simulator control columns dynamically grow with font scale slider');

// 17. Dreamlo Duplicate Names & Single Player Fetch Verification (Slide 15)
assert(html.includes('What Happens With Duplicate Names?') && html.includes('pipe-get/Alice'), 'Slide 15 contains duplicate names and single player fetch guide');
assert(lessonDoc.includes('What Happens With Duplicate Names?') && lessonDoc.includes('pipe-get/Alice'), 'Handbook contains duplicate names and single player fetch guide');

console.log('--- TEST SUMMARY: ' + (failures === 0 ? 'ALL PASSED!' : failures + ' FAILED!') + ' ---');
process.exit(failures > 0 ? 1 : 0);
