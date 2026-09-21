const fs = require('fs');
const path = require('path');

console.log('--- RUNNING CLASS 4 VALIDATION TEST ---');

const htmlPath = path.resolve('presentation_basics4/presentation_unity6_basics4.html');
const indexPath = path.resolve('presentation_basics4/index.html');
const docsHtmlPath = path.resolve('docs/presentation_basics4/presentation_unity6_basics4.html');
const docsIndexPath = path.resolve('docs/presentation_basics4/index.html');
const rootIndexPath = path.resolve('index.html');
const docsRootIndexPath = path.resolve('docs/index.html');
const lessonDocPath = path.resolve('classes/04_architecture.md');

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
assert(fs.existsSync(htmlPath), 'presentation_unity6_basics4.html exists');
assert(fs.existsSync(indexPath), 'presentation_basics4/index.html exists');
assert(fs.existsSync(docsHtmlPath), 'docs/presentation_basics4/presentation_unity6_basics4.html exists');
assert(fs.existsSync(docsIndexPath), 'docs/presentation_basics4/index.html exists');
assert(fs.existsSync(lessonDocPath), 'classes/04_architecture.md exists');

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
assert(html.includes("if (window.location.protocol !== 'file:')"), 'file:// guard for window.location.hash present (prevents iframe security error)');

// 4. Check Teacher Mode, Shortcuts & Presenter Notes
assert(html.includes('TEACHER_PIN = "7331"'), 'Teacher PIN 7331 configured');
assert(html.includes('toggleSpeakerNotes'), 'toggleSpeakerNotes present');
assert(html.includes('toggleTeacherPinModal'), 'toggleTeacherPinModal present');
assert(html.includes("e.key === 't' || e.key === 'T'"), 'Teacher mode shortcut [T] registered');
assert(html.includes("e.key === 'n' || e.key === 'N'"), 'Presenter notes shortcut [N] registered');
assert(html.includes("e.key === 'l' || e.key === 'L'"), 'Lecture/Lab shortcut [L] registered');
assert(html.includes("e.key === 'f' || e.key === 'F'"), 'Fullscreen shortcut [F] registered');

// 5. Check Interactive Simulators
assert(html.includes('function inspectPattern('), 'inspectPattern() Prefab Encapsulation inspector present');
assert(html.includes('function simDamage('), 'simDamage() SO Event Channel function present');
assert(html.includes('function simHeal('), 'simHeal() SO Event Channel function present');
assert(html.includes('function simCollectCoin('), 'simCollectCoin() SO Event Channel function present');
assert(html.includes('function updateSubs()'), 'updateSubs() subscription updater present');
assert(html.includes('busHealth'), 'busHealth visual bus element present');
assert(html.includes('busCoin'), 'busCoin visual bus element present');
assert(html.includes('chkHealthUI'), 'chkHealthUI decoupled listener checkbox present');

// 6. Check 10-Minute Challenge & Solution Lock
assert(html.includes('challengeTimer'), 'challengeTimer DOM element present');
assert(html.includes('10:00'), 'Initial 10:00 timer display present');
assert(html.includes('startChallengeTimer()'), 'startChallengeTimer() function present');
assert(html.includes('unlockSolution()'), 'unlockSolution() function present');
assert(html.includes('solutionLockBanner'), 'solutionLockBanner element present');
assert(html.includes('solutionDetails'), 'solutionDetails accordion present');

// 7. Check Core Architecture C# Concepts in Presentation and Handbook
assert(html.includes('GoblinController'), 'GoblinController Prefab API example in presentation');
assert(lessonDoc.includes('GoblinController'), 'GoblinController Prefab API example in handbook');
assert(html.includes('IntEventChannelSO'), 'IntEventChannelSO present in presentation');
assert(lessonDoc.includes('IntEventChannelSO'), 'IntEventChannelSO present in handbook');
assert(html.includes('VoidEventChannelSO'), 'VoidEventChannelSO present in presentation');
assert(lessonDoc.includes('VoidEventChannelSO'), 'VoidEventChannelSO present in handbook');
assert(html.includes('PersistentSingleton'), 'PersistentSingleton generic template present in presentation');
assert(lessonDoc.includes('PersistentSingleton'), 'PersistentSingleton generic template present in handbook');
assert(html.includes('LoadSceneMode.Additive'), 'LoadSceneMode.Additive present in presentation');
assert(lessonDoc.includes('LoadSceneMode.Additive'), 'LoadSceneMode.Additive present in handbook');
assert(html.includes('SelectionBase'), '[SelectionBase] attribute present in presentation');
assert(lessonDoc.includes('SelectionBase'), '[SelectionBase] attribute present in handbook');

// 8. Check Portals Link to Lesson 04
assert(rootIndexHtml.includes('presentation_basics4/presentation_unity6_basics4.html'), 'Root index.html links to presentation_basics4');
assert(rootIndexHtml.includes('Basics 4: Game Architecture 1'), 'Root index.html contains Lesson 04 title');
assert(docsRootIndexHtml.includes('presentation_basics4/presentation_unity6_basics4.html'), 'docs/index.html links to presentation_basics4');
assert(docsRootIndexHtml.includes('Basics 4: Game Architecture 1'), 'docs/index.html contains Lesson 04 title');

// 9. Check No Package Requirement Note
assert(html.includes('No Package Required'), 'Presentation explicitly indicates no package required');
assert(lessonDoc.includes('no starter template package to download'), 'Handbook explicitly states no package required');

console.log('--- TEST SUMMARY: ' + (failures === 0 ? 'ALL PASSED!' : failures + ' FAILED') + ' ---');
process.exit(failures === 0 ? 0 : 1);
