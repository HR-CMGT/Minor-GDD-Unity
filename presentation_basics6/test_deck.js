const fs = require('fs');
const path = require('path');

console.log('--- RUNNING CLASS 6 VALIDATION TEST ---');

const htmlPath = path.resolve('presentation_basics6/presentation_unity6_basics6.html');
const indexPath = path.resolve('presentation_basics6/index.html');
const docsHtmlPath = path.resolve('docs/presentation_basics6/presentation_unity6_basics6.html');
const docsIndexPath = path.resolve('docs/presentation_basics6/index.html');

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
assert(fs.existsSync(htmlPath), 'presentation_unity6_basics6.html exists');
assert(fs.existsSync(indexPath), 'presentation_basics6/index.html exists');
assert(fs.existsSync(docsHtmlPath), 'docs/presentation_basics6/presentation_unity6_basics6.html exists');
assert(fs.existsSync(docsIndexPath), 'docs/presentation_basics6/index.html exists');

const html = fs.readFileSync(htmlPath, 'utf8');

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

// 4. Check Teacher Mode, Shortcuts & Presenter Notes
assert(html.includes('TEACHER_PIN = "7331"'), 'Teacher PIN 7331 configured');
assert(html.includes('toggleSpeakerNotes'), 'toggleSpeakerNotes present');
assert(html.includes('toggleTeacherPinModal'), 'toggleTeacherPinModal present');
assert(html.includes("e.key === 't' || e.key === 'T'"), 'Teacher mode shortcut [T] registered');
assert(html.includes("e.key === 'n' || e.key === 'N'"), 'Presenter notes shortcut [N] registered');
assert(html.includes("e.key === 'l' || e.key === 'L'"), 'Lecture/Lab shortcut [L] registered');
assert(html.includes("e.key === 'f' || e.key === 'F'"), 'Fullscreen shortcut [F] registered');

// 5. Check Interactive Simulators (3D Left-Hand Coordinate Inspector & 3D Camera-Relative Vector Math)
assert(html.includes('function initHandCoordInspector('), 'initHandCoordInspector() function present');
assert(html.includes('function setHandCoordSystem('), 'setHandCoordSystem() function present');
assert(html.includes('function highlightHandAxis('), 'highlightHandAxis() function present');
assert(html.includes('function initCamVecInspector('), 'initCamVecInspector() function present');
assert(html.includes('function setCamYawSlider('), 'setCamYawSlider() function present');
assert(html.includes('function setRawInput('), 'setRawInput() function present');

// 6. Check Challenge Timers & Solution Lock
assert(html.includes('function startChallengeTimer('), 'startChallengeTimer() present');
assert(html.includes('function resetChallengeTimer('), 'resetChallengeTimer() present');
assert(html.includes('function unlockSolution('), 'unlockSolution() present');

// 7. Check Zero Emoji Rule across Presentation, Handbook & Readme
const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/;
assert(!emojiRegex.test(html), 'Absolute Zero-Emoji compliance in presentation HTML');

const mdPath = path.resolve('classes/06_block_prototyping.md');
assert(fs.existsSync(mdPath), 'classes/06_block_prototyping.md exists');
const mdContent = fs.readFileSync(mdPath, 'utf8');
assert(!emojiRegex.test(mdContent), 'Absolute Zero-Emoji compliance in handbook');

// 8. Check Core 3D Concepts in Presentation and Handbook
assert(html.includes('CharacterController'), 'CharacterController present in presentation');
assert(html.includes('PlayerController3D'), 'PlayerController3D present in presentation');
assert(html.includes('NavMeshSurface'), 'NavMeshSurface present in presentation');
assert(html.includes('EnemyAIController') || html.includes('EnemyNavMeshAI'), 'Enemy AI present in presentation');
assert(html.includes('CinemachineCamera') || html.includes('Cinemachine'), 'Cinemachine present in presentation');
assert(html.includes('ProBuilder'), 'ProBuilder present in presentation');

assert(mdContent.includes('CharacterController'), 'CharacterController present in handbook');
assert(mdContent.includes('PlayerController3D'), 'PlayerController3D present in handbook');
assert(mdContent.includes('NavMeshSurface'), 'NavMeshSurface present in handbook');
assert(mdContent.includes('EnemyNavMeshAI'), 'EnemyNavMeshAI present in handbook');
assert(mdContent.includes('Cinemachine'), 'Cinemachine present in handbook');
assert(mdContent.includes('ProBuilder'), 'ProBuilder present in handbook');

// 9. Check Portal & Navigation Links
const rootIndex = fs.readFileSync(path.resolve('index.html'), 'utf8');
const docsIndex = fs.readFileSync(path.resolve('docs/index.html'), 'utf8');
const readme = fs.readFileSync(path.resolve('README.md'), 'utf8');

assert(rootIndex.includes('presentation_basics6/presentation_unity6_basics6.html'), 'Root index.html links to Lesson 06');
assert(docsIndex.includes('presentation_basics6/presentation_unity6_basics6.html'), 'Docs index.html links to Lesson 06');
assert(readme.includes('06_block_prototyping.md'), 'README.md links to Lesson 06 handbook');
assert(readme.includes('presentation_basics6/index.html'), 'README.md links to Lesson 06 deck');

// 10. Check Clean Studio Language & Banned Slop Words
const forbiddenWords = ['duik in', 'ontgrendel', 'naadloos', 'landschap', 'game-changer', 'testament', 'synergie', 'robuust', 'meesterwerk', 'transformeer', 'level-up'];
let slopFound = 0;
forbiddenWords.forEach(w => {
    if (html.toLowerCase().includes(w) || mdContent.toLowerCase().includes(w)) {
        console.error(' [FAIL] Slop word found: ' + w);
        slopFound++;
    }
});
assert(slopFound === 0, 'Zero AI slop buzzwords across presentation and handbook');

console.log('\nValidation Summary: ' + (failures === 0 ? 'ALL TESTS PASSED!' : failures + ' TESTS FAILED'));
process.exit(failures === 0 ? 0 : 1);
