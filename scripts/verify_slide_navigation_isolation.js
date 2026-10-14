/**
 * ============================================================================
 * AUTOMATED VERIFICATION SUITE: SLIDE NAVIGATION ISOLATION ENGINE
 * File: scripts/verify_slide_navigation_isolation.js
 *
 * Verifies:
 * 1. Slide Navigation Isolation in Edit Mode:
 *    - Setup mock DOM with 3 slides (slidesData[0], slidesData[1], slidesData[2]).
 *    - Entering edit mode on slide 0 does not taint slide 1 or slide 2.
 *    - Navigating to slide 1 (selectSlide(1)) and slide 2 (selectSlide(2)) preserves unique slide contents.
 *    - Exiting edit mode leaves all 3 slides intact.
 * 2. Targeted Autosave & Dirty Slide Scoping:
 *    - Modifying slide 0 marks only slide 0 dirty.
 *    - Navigating away saves slide 0 without altering or overwriting slide 1 or slide 2.
 *    - Slide 1 and slide 2 remain non-dirty and untouched.
 * 3. Edit Mode Slide Navigation Keyboard Controls:
 *    - ArrowRight / PageDown, ArrowLeft / PageUp, Home / End work seamlessly in edit mode.
 *    - Typing in input/textarea/contenteditable correctly bypasses navigation.
 * ============================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('RUNNING SLIDE NAVIGATION ISOLATION VERIFICATION SUITE');
console.log('================================================================');

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
        console.error(`         ${err.stack || err.message}`);
        failedTests++;
    }
}

// ----------------------------------------------------------------------------
// Mock DOM Factory
// ----------------------------------------------------------------------------
function createMockElement(tagName = 'div', className = '', initialStyle = {}) {
    const styleMap = Object.assign({}, initialStyle);
    const stylePriorities = {};
    const dataset = {};
    const attributes = {};
    const children = [];
    const eventListeners = {};

    const el = {
        _innerHTML: '',
        tagName: tagName.toUpperCase(),
        className: className,
        id: '',
        value: '',
        textContent: '',
        innerText: '',
        isContentEditable: false,
        classList: {
            contains: (cls) => (el.className || '').split(/\s+/).includes(cls),
            add: (...cls) => {
                const parts = new Set((el.className || '').split(/\s+/).filter(Boolean));
                cls.forEach(c => parts.add(c));
                el.className = Array.from(parts).join(' ');
            },
            remove: (...cls) => {
                const parts = new Set((el.className || '').split(/\s+/).filter(Boolean));
                cls.forEach(c => parts.delete(c));
                el.className = Array.from(parts).join(' ');
            }
        },
        dataset: dataset,
        parentElement: null,
        children: children,
        style: {
            ...styleMap,
            setProperty: (prop, val, priority = '') => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                styleMap[prop] = String(val);
                styleMap[camel] = String(val);
                el.style[prop] = String(val);
                el.style[camel] = String(val);
                stylePriorities[prop] = priority;
                stylePriorities[camel] = priority;
            },
            getPropertyValue: (prop) => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                return styleMap[prop] || styleMap[camel] || '';
            },
            getPropertyPriority: (prop) => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                return stylePriorities[prop] || stylePriorities[camel] || '';
            },
            removeProperty: (prop) => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                delete styleMap[prop];
                delete styleMap[camel];
                delete el.style[prop];
                delete el.style[camel];
                delete stylePriorities[prop];
                delete stylePriorities[camel];
            }
        },
        setAttribute: (k, v) => {
            attributes[k] = String(v);
            if (k === 'id') el.id = String(v);
            if (k === 'class') el.className = String(v);
            if (k === 'contenteditable') el.isContentEditable = (v === 'true' || v === true || v === '');
        },
        getAttribute: (k) => attributes[k] !== undefined ? attributes[k] : null,
        removeAttribute: (k) => {
            delete attributes[k];
            if (k === 'contenteditable') el.isContentEditable = false;
        },
        appendChild: (child) => {
            child.parentElement = el;
            children.push(child);
            return child;
        },
        insertBefore: (newNode, refNode) => {
            newNode.parentElement = el;
            const idx = children.indexOf(refNode);
            if (idx >= 0) {
                children.splice(idx, 0, newNode);
            } else {
                children.push(newNode);
            }
            return newNode;
        },
        removeChild: (child) => {
            const idx = children.indexOf(child);
            if (idx >= 0) {
                children.splice(idx, 1);
                child.parentElement = null;
            }
            return child;
        },
        remove: () => {
            if (el.parentElement) {
                el.parentElement.removeChild(el);
            }
        },
        querySelector: (sel) => {
            const matches = el.querySelectorAll(sel);
            return matches.length > 0 ? matches[0] : null;
        },
        querySelectorAll: (sel) => {
            const matches = [];
            const selectors = sel.split(',').map(s => s.trim());
            const check = (node) => {
                for (const child of node.children) {
                    const matched = selectors.some(s => {
                        if (s.startsWith('#')) return child.id === s.slice(1);
                        if (s.startsWith('.')) return child.classList.contains(s.slice(1));
                        if (s.startsWith('[') && s.endsWith(']')) {
                            const attrName = s.slice(1, -1).split('=')[0];
                            return child.getAttribute(attrName) !== null;
                        }
                        return child.tagName.toLowerCase() === s.toLowerCase();
                    });
                    if (matched) matches.push(child);
                    check(child);
                }
            };
            check(el);
            return matches;
        },
        closest: (sel) => {
            let cur = el;
            const selectors = sel.split(',').map(s => s.trim());
            while (cur) {
                const matched = selectors.some(s => {
                    if (s.startsWith('#')) return cur.id === s.slice(1);
                    if (s.startsWith('.')) return cur.classList && cur.classList.contains(s.slice(1));
                    return cur.tagName && cur.tagName.toLowerCase() === s.toLowerCase();
                });
                if (matched) return cur;
                cur = cur.parentElement;
            }
            return null;
        },
        cloneNode: (deep) => {
            const copy = createMockElement(el.tagName, el.className, el.style);
            copy.id = el.id;
            copy.textContent = el.textContent;
            copy.innerText = el.innerText;
            copy._innerHTML = el._innerHTML;
            copy.isContentEditable = el.isContentEditable;
            Object.assign(copy.dataset, el.dataset);
            for (const [k, v] of Object.entries(attributes)) {
                copy.setAttribute(k, v);
            }
            if (deep) {
                el.children.forEach(c => copy.appendChild(c.cloneNode(true)));
            }
            return copy;
        },
        addEventListener: (event, handler) => {
            eventListeners[event] = eventListeners[event] || [];
            eventListeners[event].push(handler);
        },
        removeEventListener: (event, handler) => {
            if (!eventListeners[event]) return;
            const idx = eventListeners[event].indexOf(handler);
            if (idx >= 0) eventListeners[event].splice(idx, 1);
        },
        triggerEvent: (event, evtData = {}) => {
            if (eventListeners[event]) {
                eventListeners[event].forEach(fn => fn(evtData));
            }
        },
        getBoundingClientRect: () => ({
            top: 0, bottom: 600, left: 0, right: 800, width: 800, height: 600
        }),
        blur: () => {}
    };

    Object.defineProperty(el, 'innerHTML', {
        get: () => {
            let res = el._innerHTML;
            if (res) {
                res = res.replace(/<div class="deck-card-action-bar"[\s\S]*?<\/div>/gi, '');
                res = res.replace(/\s*(glr-selected-element|deck-selected-element|card-swap-flash)/g, '');
                res = res.replace(/\s*contenteditable="[^"]*"/gi, '');
            }
            return res;
        },
        set: (html) => {
            el._innerHTML = html;
            children.length = 0;
            const tagRegex = /<([a-zA-Z0-9]+)\s*([^>]*)>/g;
            let match;
            while ((match = tagRegex.exec(html)) !== null) {
                const tag = match[1];
                const attrs = match[2];
                const idMatch = attrs.match(/id="([^"]+)"/i);
                const classMatch = attrs.match(/class="([^"]+)"/i);
                const valMatch = attrs.match(/value="([^"]+)"/i);

                const child = createMockElement(tag, classMatch ? classMatch[1] : '');
                if (idMatch) child.id = idMatch[1];
                if (valMatch) child.value = valMatch[1];
                el.appendChild(child);
            }
        }
    });

    return el;
}

// ----------------------------------------------------------------------------
// Environment Setup
// ----------------------------------------------------------------------------
const storageStore = {};
const mockLocalStorage = {
    getItem: (k) => storageStore[k] !== undefined ? storageStore[k] : null,
    setItem: (k, v) => { storageStore[k] = String(v); },
    removeItem: (k) => { delete storageStore[k]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

const mockBody = createMockElement('body');
const mockHead = createMockElement('head');
const slideContainer = createMockElement('div', 'slide-content-area');
slideContainer.id = 'slideContentArea';
mockBody.appendChild(slideContainer);

const mockDoc = {
    getElementById: (id) => {
        if (id === 'slideContentArea') return slideContainer;
        return mockBody.querySelector('#' + id);
    },
    createElement: (tag) => createMockElement(tag),
    querySelector: (sel) => mockBody.querySelector(sel),
    querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
    body: mockBody,
    head: mockHead,
    activeElement: mockBody,
    readyState: 'complete',
    addEventListener: (event, handler) => mockBody.addEventListener(event, handler),
    removeEventListener: (event, handler) => mockBody.removeEventListener(event, handler)
};

global.location = {
    hostname: 'localhost',
    protocol: 'http:',
    pathname: '/presentation_blockprototyping/index.html'
};
global.window = global;
global.window.location = global.location;
global.window.document = mockDoc;
global.document = mockDoc;
global.localStorage = mockLocalStorage;
global.MutationObserver = class {
    constructor(cb) { this.cb = cb; }
    observe() {}
    disconnect() {}
};

// ----------------------------------------------------------------------------
// Setup 3 Independent Slides in slidesData
// ----------------------------------------------------------------------------
const initialSlides = [
    {
        title: 'Slide 0 Introduction',
        content: '<div class="content-card"><div class="card-title">Slide 0 Title</div><div class="card-body">Slide 0 Content Original</div></div>'
    },
    {
        title: 'Slide 1 Architecture',
        content: '<div class="content-card"><div class="card-title">Slide 1 Architecture</div><div class="card-body">Slide 1 Unique Body Architecture Details</div></div>'
    },
    {
        title: 'Slide 2 Production',
        content: '<div class="content-card"><div class="card-title">Slide 2 Production</div><div class="card-body">Slide 2 Distinct Data Production Guidelines</div></div>'
    }
];

global.window.slidesData = JSON.parse(JSON.stringify(initialSlides));
global.window.currentSlide = 0;

// Universal presentation functions
global.window.renderSlide = function () {
    const idx = global.window.currentSlide;
    if (global.window.slidesData && global.window.slidesData[idx]) {
        slideContainer.innerHTML = global.window.slidesData[idx].content;
    }
};

global.window.selectSlide = function (idx) {
    if (idx < 0 || idx >= global.window.slidesData.length) return;
    global.window.currentSlide = idx;
    global.window.renderSlide();
};

global.window.changeSlide = function (delta) {
    global.window.selectSlide(global.window.currentSlide + delta);
};

// Initial slide render
global.window.renderSlide();

// Clear module cache to load a fresh instance with our mock environment
delete require.cache[require.resolve('./hr_deck_editor.js')];
const DeckEditor = require('./hr_deck_editor.js');
DeckEditor.init();

// ============================================================================
// TEST SUITE: 1. Navigation & Content Isolation Across Clean Slides
// ============================================================================
console.log('\n--- 1. Testing Slide Navigation Isolation in Edit Mode ---');

test('Initial state: slide 0 rendered, edit mode disabled, dirtySlides empty', () => {
    assert.strictEqual(global.window.currentSlide, 0);
    assert.strictEqual(DeckEditor.state.isEditMode, false);
    assert.strictEqual(DeckEditor.state.dirtySlides.size, 0);
    assert.strictEqual(slideContainer.innerHTML.includes('Slide 0 Content Original'), true);
});

test('Simulate entering edit mode on slide 0', () => {
    DeckEditor.enable();
    assert.strictEqual(DeckEditor.state.isEditMode, true);
    assert.strictEqual(mockBody.classList.contains('is-editing'), true);
    // Entering edit mode must NOT mark slide dirty or alter slidesData
    assert.strictEqual(DeckEditor.state.dirtySlides.has(0), false);
    assert.strictEqual(global.window.slidesData[0].content, initialSlides[0].content);
});

test('Navigate to slide 1 (selectSlide(1)) in edit mode without corrupting slide 1', () => {
    global.window.selectSlide(1);
    assert.strictEqual(global.window.currentSlide, 1);
    // Slide 1 must render its own unique content
    assert.strictEqual(slideContainer.innerHTML.includes('Slide 1 Unique Body Architecture Details'), true);
    // Slide 1 in slidesData must NOT be overwritten with Slide 0
    assert.strictEqual(global.window.slidesData[1].content.includes('Slide 1 Unique Body Architecture Details'), true);
    assert.strictEqual(global.window.slidesData[1].content.includes('Slide 0'), false);
    // Neither slide 0 nor slide 1 should be marked dirty
    assert.strictEqual(DeckEditor.state.dirtySlides.has(0), false);
    assert.strictEqual(DeckEditor.state.dirtySlides.has(1), false);
});

test('Navigate to slide 2 (selectSlide(2)) in edit mode without corrupting slide 2', () => {
    global.window.selectSlide(2);
    assert.strictEqual(global.window.currentSlide, 2);
    // Slide 2 must render its own distinct content
    assert.strictEqual(slideContainer.innerHTML.includes('Slide 2 Distinct Data Production Guidelines'), true);
    // Slide 2 in slidesData must NOT be overwritten with Slide 0 or Slide 1
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 2 Distinct Data Production Guidelines'), true);
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 0'), false);
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 1'), false);
    assert.strictEqual(DeckEditor.state.dirtySlides.size, 0);
});

test('Navigate back to slide 0 in edit mode leaves all slides intact', () => {
    global.window.selectSlide(0);
    assert.strictEqual(global.window.currentSlide, 0);
    assert.strictEqual(slideContainer.innerHTML.includes('Slide 0 Content Original'), true);
    assert.strictEqual(global.window.slidesData[0].content, initialSlides[0].content);
    assert.strictEqual(global.window.slidesData[1].content, initialSlides[1].content);
    assert.strictEqual(global.window.slidesData[2].content, initialSlides[2].content);
});

test('Exiting edit mode leaves all 3 slides completely intact', () => {
    DeckEditor.disable();
    assert.strictEqual(DeckEditor.state.isEditMode, false);
    assert.strictEqual(mockBody.classList.contains('is-editing'), false);
    assert.strictEqual(global.window.slidesData[0].content, initialSlides[0].content);
    assert.strictEqual(global.window.slidesData[1].content, initialSlides[1].content);
    assert.strictEqual(global.window.slidesData[2].content, initialSlides[2].content);
});

// ============================================================================
// TEST SUITE: 2. Targeted Autosave & Dirty Slide Scoping
// ============================================================================
console.log('\n--- 2. Testing Targeted Autosave & Dirty Slide Scoping ---');

test('Modifying slide 0 marks ONLY slide 0 dirty and leaves slide 1 & 2 clean', () => {
    global.window.selectSlide(0);
    DeckEditor.enable();

    // User edits content on slide 0
    const newContent0 = '<div class="content-card"><div class="card-title">Slide 0 Title</div><div class="card-body">Slide 0 Content EDITED By User</div></div>';
    slideContainer.innerHTML = newContent0;

    // Trigger autosave on slide 0
    DeckEditor.operations.triggerAutoSave(0);

    // Slide 0 must be marked dirty immediately
    assert.strictEqual(DeckEditor.state.dirtySlides.has(0), true);
    assert.strictEqual(DeckEditor.state.dirtySlides.has(1), false);
    assert.strictEqual(DeckEditor.state.dirtySlides.has(2), false);
});

test('Navigating from dirty slide 0 to slide 1 saves slide 0 without touching slide 1 or 2', () => {
    // Navigate to slide 1 while slide 0 is dirty
    global.window.selectSlide(1);

    assert.strictEqual(global.window.currentSlide, 1);
    // Slide 0 in slidesData must have been updated with edited content
    assert.strictEqual(global.window.slidesData[0].content.includes('Slide 0 Content EDITED By User'), true);
    // Slide 1 in slidesData must REMAIN its own unique content!
    assert.strictEqual(global.window.slidesData[1].content.includes('Slide 1 Unique Body Architecture Details'), true);
    assert.strictEqual(global.window.slidesData[1].content.includes('Slide 0'), false);
    // Slide 2 in slidesData must REMAIN its own distinct content!
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 2 Distinct Data Production Guidelines'), true);
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 0'), false);

    // Only slide 0 is in dirtySlides
    assert.strictEqual(DeckEditor.state.dirtySlides.has(0), true);
    assert.strictEqual(DeckEditor.state.dirtySlides.has(1), false);
    assert.strictEqual(DeckEditor.state.dirtySlides.has(2), false);
});

test('Navigating from slide 1 to slide 2 does NOT overwrite slide 2 with slide 0 or 1', () => {
    global.window.selectSlide(2);

    assert.strictEqual(global.window.currentSlide, 2);
    // Slide 2 must retain its own unique content
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 2 Distinct Data Production Guidelines'), true);
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 0'), false);
    assert.strictEqual(global.window.slidesData[2].content.includes('Slide 1'), false);

    // Slide 1 and slide 2 must remain non-dirty
    assert.strictEqual(DeckEditor.state.dirtySlides.has(1), false);
    assert.strictEqual(DeckEditor.state.dirtySlides.has(2), false);
});

test('Exiting edit mode preserves dirty slide 0 modifications while leaving slides 1 & 2 untouched', () => {
    DeckEditor.disable();
    assert.strictEqual(DeckEditor.state.isEditMode, false);

    assert.strictEqual(global.window.slidesData[0].content.includes('Slide 0 Content EDITED By User'), true);
    assert.strictEqual(global.window.slidesData[1].content, initialSlides[1].content);
    assert.strictEqual(global.window.slidesData[2].content, initialSlides[2].content);
});

// ============================================================================
// TEST SUITE: 3. Keyboard Navigation Handlers in Edit Mode
// ============================================================================
console.log('\n--- 3. Testing Keyboard Navigation in Edit Mode ---');

test('ArrowRight / PageDown navigates to next slide when not typing', () => {
    global.window.selectSlide(0);
    DeckEditor.enable();

    // Simulate keydown ArrowRight
    let defaultPrevented = false;
    const evtRight = {
        key: 'ArrowRight',
        target: mockBody,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtRight);

    assert.strictEqual(defaultPrevented, true);
    assert.strictEqual(global.window.currentSlide, 1);

    // Simulate keydown PageDown
    defaultPrevented = false;
    const evtPageDown = {
        key: 'PageDown',
        target: mockBody,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtPageDown);

    assert.strictEqual(defaultPrevented, true);
    assert.strictEqual(global.window.currentSlide, 2);
});

test('ArrowLeft / PageUp navigates to previous slide when not typing', () => {
    assert.strictEqual(global.window.currentSlide, 2);

    // Simulate keydown ArrowLeft
    let defaultPrevented = false;
    const evtLeft = {
        key: 'ArrowLeft',
        target: mockBody,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtLeft);

    assert.strictEqual(defaultPrevented, true);
    assert.strictEqual(global.window.currentSlide, 1);

    // Simulate keydown PageUp
    defaultPrevented = false;
    const evtPageUp = {
        key: 'PageUp',
        target: mockBody,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtPageUp);

    assert.strictEqual(defaultPrevented, true);
    assert.strictEqual(global.window.currentSlide, 0);
});

test('Home and End navigate to first and last slide', () => {
    // Simulate keydown End
    let defaultPrevented = false;
    const evtEnd = {
        key: 'End',
        target: mockBody,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtEnd);

    assert.strictEqual(defaultPrevented, true);
    assert.strictEqual(global.window.currentSlide, 2);

    // Simulate keydown Home
    defaultPrevented = false;
    const evtHome = {
        key: 'Home',
        target: mockBody,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtHome);

    assert.strictEqual(defaultPrevented, true);
    assert.strictEqual(global.window.currentSlide, 0);
});

test('Typing in contenteditable or input ignores slide navigation shortcuts', () => {
    const editableEl = createMockElement('div');
    editableEl.setAttribute('contenteditable', 'true');
    mockDoc.activeElement = editableEl;

    let defaultPrevented = false;
    const evtType = {
        key: 'ArrowRight',
        target: editableEl,
        preventDefault: () => { defaultPrevented = true; }
    };
    DeckEditor.handleKeyDown(evtType);

    // When typing, ArrowRight must NOT trigger slide navigation!
    assert.strictEqual(defaultPrevented, false);
    assert.strictEqual(global.window.currentSlide, 0);
});

// ============================================================================
// VERIFICATION SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`VERIFICATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
console.log('================================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
