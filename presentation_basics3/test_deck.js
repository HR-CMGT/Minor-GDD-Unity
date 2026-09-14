const fs = require('fs');
const path = require('path');

console.log('--- RUNNING CLASS 3 VALIDATION TEST ---');

const htmlPath = path.resolve('presentation_basics3/presentation_unity6_basics3.html');
const indexPath = path.resolve('presentation_basics3/index.html');
const rootIndexPath = path.resolve('index.html');
const docsIndexPath = path.resolve('docs/index.html');
const lessonDocPath = path.resolve('classes/03_UI.md');

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
assert(fs.existsSync(htmlPath), 'presentation_unity6_basics3.html exists');
assert(fs.existsSync(indexPath), 'presentation_basics3/index.html exists');
assert(fs.existsSync(lessonDocPath), 'classes/03_UI.md exists');

const html = fs.readFileSync(htmlPath, 'utf8');

// 2. Check Comparison Mode elements are permanently removed
assert(!html.includes('id="viewOriginal"'), 'Comparison Mode #viewOriginal container removed');
assert(!html.includes('id="originalSlideImg"'), 'Comparison Mode #originalSlideImg element removed');
assert(!html.includes('id="modeSwitch"'), 'Comparison Mode #modeSwitch toggle removed');
assert(!html.includes("e.key === 'c' || e.key === 'C'"), 'Comparison shortcut [C] removed from keydown');
assert(html.includes('function toggleMode()'), 'toggleMode() stub defined');
assert(html.includes('function updateModeDisplay()'), 'updateModeDisplay() stub defined');

// 3. Extract slidesData and check original slide images
const match = html.match(/let slidesData = (\[[\s\S]*?\]);\s*let currentSlide/);
assert(match !== null, 'slidesData array extracted successfully');

if (match) {
    const slides = JSON.parse(match[1]);
    assert(slides.length === 21, 'slidesData has 21 comprehensive slides (found ' + slides.length + ')');
    
    let allImgsExist = true;
    slides.forEach((s, i) => {
        if (!s.origImg) {
            console.error('Slide ' + (i+1) + ' missing origImg');
            allImgsExist = false;
        } else {
            const imgFile = path.resolve('presentation_basics3', s.origImg);
            if (!fs.existsSync(imgFile)) {
                console.error('Slide ' + (i+1) + ' origImg does not exist: ' + imgFile);
                allImgsExist = false;
            }
        }
    });
    assert(allImgsExist, 'All 21 slides have valid existing original slide PNG images');
}

// 4. Check Lecture vs Lab mode
assert(html.includes('id="btnViewLecture"'), 'btnViewLecture button present');
assert(html.includes('id="btnViewLab"'), 'btnViewLab button present');
assert(html.includes('function setViewMode('), 'setViewMode() function defined');
assert(html.includes("e.key === 'l' || e.key === 'L'"), 'Lecture/Lab shortcut [L] registered');

// 5. Check Tiers
assert(html.includes('id="btnTierAll"'), 'Tier buttons present');
assert(html.includes('function setTier('), 'setTier() function defined');

// 6. Check Teacher Mode & PIN
assert(html.includes('id="teacherPinModal"'), 'Teacher PIN modal present');
assert(html.includes('TEACHER_PIN = "7331"'), 'Teacher PIN configured');
assert(html.includes('id="notesModal"'), 'Teacher notes modal present');
assert(html.includes("e.key === 't' || e.key === 'T'"), 'Teacher mode shortcut [T] registered');
assert(html.includes("e.key === 'n' || e.key === 'N'"), 'Speaker notes shortcut [N] registered');

// 7. Check Challenge Timers & Strict 1-Minute Solution Lock
assert(html.includes('cTimer1'), 'Challenge Timer 1 present');
assert(html.includes('cTimer2'), 'Challenge Timer 2 present');
assert(html.includes('solBox1'), 'Solution Box 1 present');
assert(html.includes('solBox2'), 'Solution Box 2 present');
assert(html.includes('btnSol_solBox1'), 'Solution Lock Button 1 present');
assert(html.includes('btnSol_solBox2'), 'Solution Lock Button 2 present');
assert(html.includes('updateSolutionLockState'), '1-minute solution lock logic present');

// 8. Check Interactive Simulators
assert(html.includes('function runAnchorSimulator()'), 'runAnchorSimulator() simulator present');
assert(html.includes('function setCanvasMode('), 'setCanvasMode() visualizer present');
assert(html.includes('function simulateJsonSave()'), 'simulateJsonSave() simulator present');
assert(html.includes('function simulateJsonLoad()'), 'simulateJsonLoad() simulator present');
assert(html.includes('function simulateStorageBenchmark('), 'simulateStorageBenchmark() present');
assert(html.includes('function runScaleSimulator()'), 'runScaleSimulator() simulator present');

// 9. Check Syntax Highlighter & Glossary
assert(html.includes('function highlightCSharp('), 'JetBrains Rider C# syntax highlighter present');
assert(html.includes('function copyCode('), 'copyCode() clipboard function present');
assert(html.includes('const GLOSSARY_TERMS ='), 'Glossary dictionary defined');
assert(html.includes('function initGlossaryTooltips()'), 'Glossary tooltip manager initialized');

// 10. Check Font Slider & Pace Controls
assert(html.includes('id="fontScaleSlider"'), 'Font size slider present');
assert(html.includes('id="fontScaleValue"'), 'Font size value display present');
assert(html.includes('function setFontScale('), 'setFontScale() function defined');
assert(!html.includes('id="btnStudentTooFast"'), 'Too Fast button removed from bottom bar');
assert(html.includes('id="paceSpeedBubble"'), 'Teacher pace speed bubble present');

// 11. Check Portal links
const rootIndexHtml = fs.readFileSync(rootIndexPath, 'utf8');
const docsIndexHtml = fs.readFileSync(docsIndexPath, 'utf8');
const lessonDoc = fs.readFileSync(lessonDocPath, 'utf8');

assert(rootIndexHtml.includes('presentation_basics3/presentation_unity6_basics3.html'), 'Root index.html links to presentation_basics3');
assert(rootIndexHtml.includes('Basics 3: UI & Saving Systems'), 'Root index.html contains Lesson 03 title');
assert(!rootIndexHtml.includes('Lesson 03</span>\n                        <span class="deck-badge">In Development'), 'Lesson 03 is unlocked in root index.html');

assert(docsIndexHtml.includes('presentation_basics3/presentation_unity6_basics3.html'), 'docs/index.html links to presentation_basics3');
assert(!docsIndexHtml.includes('Lesson 03</span>\n                        <span class="deck-badge">In Development'), 'Lesson 03 is unlocked in docs/index.html');

// 12. Check Mobile Scalable UI & Package Removal
assert(!html.includes('basics3.unitypackage'), 'No basics3.unitypackage download link in presentation');
assert(!lessonDoc.includes('basics3.unitypackage'), 'No basics3.unitypackage in classes/03_UI.md');
assert(html.includes('SafeAreaFitter'), 'SafeAreaFitter script present in presentation');
assert(html.includes('Screen.safeArea'), 'Screen.safeArea referenced in presentation');
assert(html.includes('Device Simulator'), 'Unity Device Simulator referenced in presentation');
assert(html.includes('simSafeAreaCheck'), 'simSafeAreaCheck interactive toggle present');
assert(html.includes('simNotchOverlay'), 'simNotchOverlay notch simulator present');
assert(html.includes('Raycast Target'), 'Raycast Target mobile optimization present');
assert(lessonDoc.includes('SafeAreaFitter'), 'SafeAreaFitter component in classes/03_UI.md');
assert(lessonDoc.includes('Device Simulator'), 'Device Simulator in classes/03_UI.md');
assert(lessonDoc.includes('Match Height'), 'Landscape Match Height 1.0 rule in classes/03_UI.md');

// 13. Check Slide 21 Checklist Addition
assert(html.includes('Mobile Game Production Checklist'), 'Mobile Game Production Checklist present');

// 14. Check JSON Fetching and TextAsset
assert(html.includes('GameDataManager'), 'GameDataManager JSON consumer present in presentation');
assert(html.includes('TextAsset'), 'TextAsset JSON config fetching present in presentation');
assert(html.includes('Fetching & Consuming JSON'), 'Fetching & Consuming JSON slide title present');

// 15. Check Smart Relative Font Scaling Script & Title Exclusion
assert(html.includes('function isTitleElement('), 'Smart title detector function isTitleElement() defined');
assert(html.includes('BASE_BOOST = 1.22'), 'Base boost multiplier 1.22 applied for readable 100% baseline');
assert(html.includes("el.matches('.card-title"), 'Card titles excluded from relative font scaling');

console.log('--- TEST SUMMARY: ' + (failures === 0 ? 'ALL PASSED!' : failures + ' FAILED') + ' ---');
process.exit(failures === 0 ? 0 : 1);


