/**
 * ============================================================================
 * AUTOMATED VERIFICATION SUITE: MAC COMMAND+Z / UNDO & REDO ENGINE
 * File: scripts/verify_undo_redo.js
 *
 * Verifies:
 * 1. macOS Command+Z (metaKey + 'z') triggers Undo reliably.
 * 2. macOS Command+Shift+Z and Command+Y trigger Redo reliably.
 * 3. Windows/Linux Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y trigger Undo/Redo.
 * 4. History stack transitions (past / future push/pop/clear/max-limit).
 * 5. Typing vs Card Undo interaction (native execCommand fallback to card undo).
 * 6. UI toasts and button titles reflect [Cmd+Z / Ctrl+Z] and [Cmd+Shift+Z / Cmd+Y].
 * ============================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('RUNNING MAC COMMAND+Z / UNDO & REDO VERIFICATION SUITE');
console.log('================================================================');

// 1. Require DeckEditor
const DeckEditor = require('./hr_deck_editor.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  [PASS] ${description}`);
        passedTests++;
    } catch (err) {
        console.error(`  [FAIL] ${description}`);
        console.error(`         ${err.message}`);
        failedTests++;
    }
}

// ============================================================================
// SUITE 1: KEYBOARD SHORTCUT DETECTION (isUndoKey & isRedoKey)
// ============================================================================
console.log('\n--- 1. Testing Keyboard Shortcut Key Detection ---');

const history = DeckEditor.history;
assert(history, 'DeckEditor.history must be exported');
assert(typeof history.isUndoKey === 'function', 'history.isUndoKey must be a function');
assert(typeof history.isRedoKey === 'function', 'history.isRedoKey must be a function');

test('macOS: metaKey + "z" is identified as Undo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: false, key: 'z' };
    assert.strictEqual(history.isUndoKey(e), true);
});

test('macOS: metaKey + "Z" (uppercase/caps) is identified as Undo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: false, key: 'Z' };
    assert.strictEqual(history.isUndoKey(e), true);
});

test('macOS: metaKey + code "KeyZ" is identified as Undo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: false, code: 'KeyZ' };
    assert.strictEqual(history.isUndoKey(e), true);
});

test('Windows/Linux: ctrlKey + "z" is identified as Undo', () => {
    const e = { metaKey: false, ctrlKey: true, shiftKey: false, key: 'z' };
    assert.strictEqual(history.isUndoKey(e), true);
});

test('Windows/Linux: ctrlKey + "Z" is identified as Undo', () => {
    const e = { metaKey: false, ctrlKey: true, shiftKey: false, key: 'Z' };
    assert.strictEqual(history.isUndoKey(e), true);
});

test('Shift modifier rejects Undo: metaKey + shiftKey + "z" is NOT Undo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: true, key: 'z' };
    assert.strictEqual(history.isUndoKey(e), false);
});

test('Plain "z" without modifier is NOT Undo', () => {
    const e = { metaKey: false, ctrlKey: false, shiftKey: false, key: 'z' };
    assert.strictEqual(history.isUndoKey(e), false);
});

test('macOS: metaKey + shiftKey + "z" is identified as Redo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: true, key: 'z' };
    assert.strictEqual(history.isRedoKey(e), true);
});

test('macOS: metaKey + "y" is identified as Redo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: false, key: 'y' };
    assert.strictEqual(history.isRedoKey(e), true);
});

test('macOS: metaKey + "Y" (uppercase) is identified as Redo', () => {
    const e = { metaKey: true, ctrlKey: false, shiftKey: false, key: 'Y' };
    assert.strictEqual(history.isRedoKey(e), true);
});

test('Windows: ctrlKey + shiftKey + "z" is identified as Redo', () => {
    const e = { metaKey: false, ctrlKey: true, shiftKey: true, key: 'z' };
    assert.strictEqual(history.isRedoKey(e), true);
});

test('Windows: ctrlKey + "y" is identified as Redo', () => {
    const e = { metaKey: false, ctrlKey: true, shiftKey: false, key: 'y' };
    assert.strictEqual(history.isRedoKey(e), true);
});

test('Plain "y" without modifier is NOT Redo', () => {
    const e = { metaKey: false, ctrlKey: false, shiftKey: false, key: 'y' };
    assert.strictEqual(history.isRedoKey(e), false);
});

// ============================================================================
// SUITE 2: HISTORY STACK PAST / FUTURE STATE ENGINE
// ============================================================================
console.log('\n--- 2. Testing History Stack Transitions & State Engine ---');

test('history._stacks stores separate stacks per slide index', () => {
    history._stacks = {};
    const slide0 = 0;
    const slide1 = 1;

    DeckEditor.state.isEditMode = true;
    history.recordState(slide0, { html: '<div>Slide 0 - State A</div>', title: 'Slide 0' });
    history.recordState(slide1, { html: '<div>Slide 1 - State A</div>', title: 'Slide 1' });

    assert(history._stacks[slide0], 'Stack for slide 0 should exist');
    assert(history._stacks[slide1], 'Stack for slide 1 should exist');
    assert.strictEqual(history._stacks[slide0].past.length, 1);
    assert.strictEqual(history._stacks[slide1].past.length, 1);
});

test('recordBaseline captures initial state without clearing future stack', () => {
    const slideIdx = 99;
    history._stacks[slideIdx] = { past: [], future: [{ html: '<div>Redo Future</div>', title: 'Future' }] };

    // Fake DOM snapshot getter
    const originalGetClean = history.getCleanSlideSnapshot;
    history.getCleanSlideSnapshot = () => ({ html: '<div>Baseline HTML</div>', title: 'Baseline Title' });

    history.recordBaseline(slideIdx);

    assert.strictEqual(history._stacks[slideIdx].past.length, 1, 'Past should contain baseline');
    assert.strictEqual(history._stacks[slideIdx].past[0].html, '<div>Baseline HTML</div>');
    assert.strictEqual(history._stacks[slideIdx].future.length, 1, 'Future should NOT be cleared by baseline');

    // Duplicate baseline call should NOT push duplicate
    history.recordBaseline(slideIdx);
    assert.strictEqual(history._stacks[slideIdx].past.length, 1, 'Duplicate baseline should be ignored');

    history.getCleanSlideSnapshot = originalGetClean;
});

test('recordState pushes new snapshot and clears future redo stack', () => {
    const slideIdx = 98;
    history._stacks[slideIdx] = {
        past: [{ html: '<div>State 0</div>', title: 'T0' }],
        future: [{ html: '<div>Redo Stale</div>', title: 'TS' }]
    };

    history.recordState(slideIdx, { html: '<div>State 1</div>', title: 'T1' });

    assert.strictEqual(history._stacks[slideIdx].past.length, 2);
    assert.strictEqual(history._stacks[slideIdx].past[1].html, '<div>State 1</div>');
    assert.strictEqual(history._stacks[slideIdx].future.length, 0, 'Future stack must be cleared on new action');
});

test('Duplicate states are ignored by recordState', () => {
    const slideIdx = 97;
    history._stacks[slideIdx] = { past: [], future: [] };

    history.recordState(slideIdx, { html: '<div>Same</div>', title: 'Same' });
    history.recordState(slideIdx, { html: '<div>Same</div>', title: 'Same' });

    assert.strictEqual(history._stacks[slideIdx].past.length, 1);
});

test('History stack honors maxHistorySnapshots ceiling', () => {
    const slideIdx = 96;
    history._stacks[slideIdx] = { past: [], future: [] };
    const max = DeckEditor.config.maxHistorySnapshots || 50;

    for (let i = 0; i < max + 15; i++) {
        history.recordState(slideIdx, { html: `<div>State ${i}</div>`, title: `T${i}` });
    }

    assert.strictEqual(history._stacks[slideIdx].past.length, max, `Past stack must not exceed ${max}`);
    assert.strictEqual(history._stacks[slideIdx].past[max - 1].html, `<div>State ${max + 14}</div>`);
});

test('Undo transitions: pops past, pushes current to future, restores previous state', () => {
    const slideIdx = 95;
    let restoredHtml = '';
    let restoredTitle = '';

    // Mock DOM container
    DeckEditor.dom.getCurrentSlideIndex = () => slideIdx;
    DeckEditor.dom.getSlideContainer = () => ({
        get innerHTML() { return restoredHtml; },
        set innerHTML(val) { restoredHtml = val; }
    });
    DeckEditor.dom.getSlideTitleElement = () => ({
        get textContent() { return restoredTitle; },
        set textContent(val) { restoredTitle = val; }
    });

    let currentDomState = { html: '<div>State 2 (Current)</div>', title: 'Title 2' };
    history.getCleanSlideSnapshot = () => currentDomState;

    history._stacks[slideIdx] = {
        past: [
            { html: '<div>State 0 (Initial)</div>', title: 'Title 0' },
            { html: '<div>State 1 (Middle)</div>', title: 'Title 1' }
        ],
        future: []
    };

    // First Undo: S2 -> S1
    const undoRes1 = history.undo(slideIdx);
    assert.strictEqual(undoRes1, true, 'First undo must succeed');
    assert.strictEqual(restoredHtml, '<div>State 1 (Middle)</div>', 'Must restore S1');
    assert.strictEqual(history._stacks[slideIdx].future.length, 1, 'Future must hold S2');
    assert.strictEqual(history._stacks[slideIdx].future[0].html, '<div>State 2 (Current)</div>');

    // Update current DOM state to S1
    currentDomState = { html: '<div>State 1 (Middle)</div>', title: 'Title 1' };

    // Second Undo: S1 -> S0
    const undoRes2 = history.undo(slideIdx);
    assert.strictEqual(undoRes2, true, 'Second undo must succeed');
    assert.strictEqual(restoredHtml, '<div>State 0 (Initial)</div>', 'Must restore S0');
    assert.strictEqual(history._stacks[slideIdx].future.length, 2, 'Future must hold S2 and S1');

    // Update current DOM state to S0
    currentDomState = { html: '<div>State 0 (Initial)</div>', title: 'Title 0' };

    // Third Undo: Empty past stack
    let toastMessage = '';
    DeckEditor.toolbar.showToast = (msg) => { toastMessage = msg; };
    const undoRes3 = history.undo(slideIdx);
    assert.strictEqual(undoRes3, false, 'Undo on empty stack must return false');
    assert.strictEqual(toastMessage, 'Niets om ongedaan te maken');
});

test('Redo transitions: pops future, pushes current to past, restores next state', () => {
    const slideIdx = 94;
    let restoredHtml = '<div>State 0</div>';
    let restoredTitle = 'Title 0';

    DeckEditor.dom.getCurrentSlideIndex = () => slideIdx;
    DeckEditor.dom.getSlideContainer = () => ({
        get innerHTML() { return restoredHtml; },
        set innerHTML(val) { restoredHtml = val; }
    });
    DeckEditor.dom.getSlideTitleElement = () => ({
        get textContent() { return restoredTitle; },
        set textContent(val) { restoredTitle = val; }
    });

    let currentDomState = { html: '<div>State 0</div>', title: 'Title 0' };
    history.getCleanSlideSnapshot = () => currentDomState;

    history._stacks[slideIdx] = {
        past: [],
        future: [
            { html: '<div>State 2</div>', title: 'Title 2' },
            { html: '<div>State 1</div>', title: 'Title 1' }
        ]
    };

    // First Redo: S0 -> S1
    const redoRes1 = history.redo(slideIdx);
    assert.strictEqual(redoRes1, true, 'First redo must succeed');
    assert.strictEqual(restoredHtml, '<div>State 1</div>');
    assert.strictEqual(history._stacks[slideIdx].past.length, 1);
    assert.strictEqual(history._stacks[slideIdx].past[0].html, '<div>State 0</div>');

    // Update current DOM state to S1
    currentDomState = { html: '<div>State 1</div>', title: 'Title 1' };

    // Second Redo: S1 -> S2
    const redoRes2 = history.redo(slideIdx);
    assert.strictEqual(redoRes2, true, 'Second redo must succeed');
    assert.strictEqual(restoredHtml, '<div>State 2</div>');

    // Third Redo: Empty future stack
    let toastMsg = '';
    DeckEditor.toolbar.showToast = (msg) => { toastMsg = msg; };
    const redoRes3 = history.redo(slideIdx);
    assert.strictEqual(redoRes3, false, 'Redo on empty stack must return false');
    assert.strictEqual(toastMsg, 'Niets om opnieuw uit te voeren');
});

test('Undo skips snapshots that are identical to current DOM state', () => {
    const slideIdx = 93;
    let restoredHtml = '';

    DeckEditor.dom.getCurrentSlideIndex = () => slideIdx;
    DeckEditor.dom.getSlideContainer = () => ({
        get innerHTML() { return restoredHtml; },
        set innerHTML(val) { restoredHtml = val; }
    });

    // Current state is S_curr
    history.getCleanSlideSnapshot = () => ({ html: '<div>S_curr</div>', title: 'T' });

    // Past contains real previous S_prev AND a redundant duplicate S_curr
    history._stacks[slideIdx] = {
        past: [
            { html: '<div>S_prev</div>', title: 'T' },
            { html: '<div>S_curr</div>', title: 'T' }
        ],
        future: []
    };

    const res = history.undo(slideIdx);
    assert.strictEqual(res, true);
    assert.strictEqual(restoredHtml, '<div>S_prev</div>', 'Undo must skip duplicate S_curr and restore S_prev directly');
});

// ============================================================================
// SUITE 3: TYPING VS CARD UNDO INTERACTION & KEYDOWN ROUTING
// ============================================================================
console.log('\n--- 3. Testing Typing vs Card Undo Interaction in Keydown ---');

test('Non-typing element: MetaKey + "z" triggers history.undo with preventDefault', () => {
    let preventDefaultCalled = false;
    let undoCalled = false;

    history.undo = () => { undoCalled = true; return true; };

    const event = {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        key: 'z',
        target: { tagName: 'DIV', isContentEditable: false },
        preventDefault: () => { preventDefaultCalled = true; }
    };

    // Invoke keydown handler
    DeckEditor.handleKeyDown(event);

    assert.strictEqual(preventDefaultCalled, true, 'preventDefault must be called');
    assert.strictEqual(undoCalled, true, 'history.undo must be called directly when not typing');
});

test('Non-typing element: CtrlKey + "z" triggers history.undo with preventDefault', () => {
    let preventDefaultCalled = false;
    let undoCalled = false;

    history.undo = () => { undoCalled = true; return true; };

    const event = {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        key: 'z',
        target: { tagName: 'DIV', isContentEditable: false },
        preventDefault: () => { preventDefaultCalled = true; }
    };

    DeckEditor.handleKeyDown(event);

    assert.strictEqual(preventDefaultCalled, true);
    assert.strictEqual(undoCalled, true);
});

test('Non-typing element: MetaKey + Shift + "z" triggers history.redo with preventDefault', () => {
    let preventDefaultCalled = false;
    let redoCalled = false;

    history.redo = () => { redoCalled = true; return true; };

    const event = {
        metaKey: true,
        ctrlKey: false,
        shiftKey: true,
        key: 'z',
        target: { tagName: 'DIV', isContentEditable: false },
        preventDefault: () => { preventDefaultCalled = true; }
    };

    DeckEditor.handleKeyDown(event);

    assert.strictEqual(preventDefaultCalled, true);
    assert.strictEqual(redoCalled, true);
});

test('Typing in contenteditable: when browser native undo succeeds, history.undo is NOT called', () => {
    let preventDefaultCalled = false;
    let undoCalled = false;
    let nativeUndoCalled = false;

    history.undo = () => { undoCalled = true; return true; };

    // Mock global document.queryCommandEnabled & execCommand
    global.document = {
        queryCommandEnabled: (cmd) => cmd === 'undo',
        execCommand: (cmd) => {
            if (cmd === 'undo') {
                nativeUndoCalled = true;
                return true; // Native undo handled it!
            }
            return false;
        }
    };

    const event = {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        key: 'z',
        target: { tagName: 'DIV', isContentEditable: true },
        preventDefault: () => { preventDefaultCalled = true; }
    };

    DeckEditor.handleKeyDown(event);

    assert.strictEqual(nativeUndoCalled, true, 'Native execCommand("undo") must be executed');
    assert.strictEqual(preventDefaultCalled, true, 'preventDefault must be called to avoid double undo');
    assert.strictEqual(undoCalled, false, 'history.undo must NOT be called when native undo succeeds');
});

test('Typing in contenteditable: when native undo is exhausted, falls back to history.undo', () => {
    let preventDefaultCalled = false;
    let undoCalled = false;
    let nativeUndoChecked = false;

    history.undo = () => { undoCalled = true; return true; };

    // Mock document with exhausted native undo
    global.document = {
        queryCommandEnabled: (cmd) => {
            nativeUndoChecked = true;
            return false; // Native undo exhausted / at baseline
        },
        execCommand: () => false
    };

    const event = {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        key: 'z',
        target: { tagName: 'DIV', isContentEditable: true },
        preventDefault: () => { preventDefaultCalled = true; }
    };

    DeckEditor.handleKeyDown(event);

    assert.strictEqual(nativeUndoChecked, true, 'queryCommandEnabled was checked');
    assert.strictEqual(preventDefaultCalled, true, 'preventDefault was called');
    assert.strictEqual(undoCalled, true, 'history.undo was called as seamless fallback');
});

test('Typing in contenteditable: when native redo is exhausted, falls back to history.redo', () => {
    let preventDefaultCalled = false;
    let redoCalled = false;

    history.redo = () => { redoCalled = true; return true; };

    global.document = {
        queryCommandEnabled: () => false,
        execCommand: () => false
    };

    const event = {
        metaKey: true,
        ctrlKey: false,
        shiftKey: true,
        key: 'z',
        target: { tagName: 'P', isContentEditable: true },
        preventDefault: () => { preventDefaultCalled = true; }
    };

    DeckEditor.handleKeyDown(event);

    assert.strictEqual(preventDefaultCalled, true);
    assert.strictEqual(redoCalled, true, 'history.redo was called as fallback');
});

// ============================================================================
// SUITE 4: TOAST MESSAGES & UI LABELS
// ============================================================================
console.log('\n--- 4. Testing Toast Messages and Toolbar Button Labels ---');

const editorScriptContent = fs.readFileSync(path.join(__dirname, 'hr_deck_editor.js'), 'utf8');

test('Toast notification for undo matches "Ongedaan gemaakt [Cmd+Z / Ctrl+Z]"', () => {
    assert(
        editorScriptContent.includes("'Ongedaan gemaakt [Cmd+Z / Ctrl+Z]'"),
        'Undo toast must state [Cmd+Z / Ctrl+Z]'
    );
});

test('Toast notification for redo matches "Opnieuw uitgevoerd [Cmd+Y]"', () => {
    assert(
        editorScriptContent.includes("'Opnieuw uitgevoerd [Cmd+Y]'"),
        'Redo toast must state [Cmd+Y]'
    );
});

test('Undo toolbar button title reflects [Cmd+Z / Ctrl+Z]', () => {
    assert(
        editorScriptContent.includes('title="Ongedaan maken [Cmd+Z / Ctrl+Z]"'),
        'btnDeckUndo title must reflect [Cmd+Z / Ctrl+Z]'
    );
});

test('Redo toolbar button title reflects [Cmd+Shift+Z / Cmd+Y]', () => {
    assert(
        editorScriptContent.includes('title="Opnieuw uitvoeren [Cmd+Shift+Z / Cmd+Y]"'),
        'btnDeckRedo title must reflect [Cmd+Shift+Z / Cmd+Y]'
    );
});

test('Focusin listener records baseline snapshot for contenteditable', () => {
    assert(
        editorScriptContent.includes("document.addEventListener('focusin'") &&
        editorScriptContent.includes('history.recordBaseline'),
        'focusin event listener must record baseline history'
    );
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL ${totalTests})`);
console.log('================================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
