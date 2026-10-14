/**
 * ============================================================================
 * AUTOMATED VERIFICATION SUITE: 3 CRITICAL ISSUES FIXES
 * File: scripts/verify_three_critical_fixes.js
 * ============================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('RUNNING 3 CRITICAL ISSUES AUTOMATED VERIFICATION SUITE');
console.log('================================================================');

// Helper to create a comprehensive mock DOM element
function createMockElement(tagName = 'div', className = '', initialStyle = {}) {
    const styleMap = Object.assign({}, initialStyle);
    const stylePriorities = {};
    const dataset = {};
    const attributes = {};
    const children = [];
    const eventListeners = {};

    let _innerHTML = '';

    const el = {
        tagName: tagName.toUpperCase(),
        className: className,
        id: '',
        value: '100',
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
        scrollHeight: 200,
        scrollWidth: 300,
        clientHeight: 200,
        clientWidth: 300,
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
        setAttribute: (k, v) => { attributes[k] = String(v); },
        getAttribute: (k) => attributes[k] !== undefined ? attributes[k] : null,
        removeAttribute: (k) => { delete attributes[k]; },
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
        querySelector: (sel) => {
            const matches = el.querySelectorAll(sel);
            return matches.length > 0 ? matches[0] : null;
        },
        querySelectorAll: (sel) => {
            const matches = [];
            const check = (node) => {
                for (const child of node.children) {
                    if (sel.split(',').some(s => {
                        const trimmed = s.trim();
                        if (trimmed.startsWith('#')) return child.id === trimmed.slice(1);
                        if (trimmed.startsWith('.')) return child.classList.contains(trimmed.slice(1));
                        return trimmed.toLowerCase() === child.tagName.toLowerCase();
                    })) {
                        matches.push(child);
                    }
                    check(child);
                }
            };
            check(el);
            return matches;
        },
        closest: (sel) => {
            let cur = el;
            while (cur) {
                if (sel.split(',').some(s => {
                    const trimmed = s.trim();
                    if (trimmed.startsWith('#')) return cur.id === trimmed.slice(1);
                    if (trimmed.startsWith('.')) return cur.classList.contains(trimmed.slice(1));
                    return trimmed.toLowerCase() === cur.tagName.toLowerCase();
                })) {
                    return cur;
                }
                cur = cur.parentElement;
            }
            return null;
        },
        cloneNode: (deep) => {
            const copy = createMockElement(el.tagName, el.className, el.style);
            copy.id = el.id;
            copy.dataset = Object.assign({}, el.dataset);
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
            top: 100, bottom: 100 + (el.clientHeight || 200), left: 100, right: 100 + (el.clientWidth || 300), width: el.clientWidth || 300, height: el.clientHeight || 200
        }),
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        remove: () => {
            if (el.parentElement && el.parentElement.children) {
                const idx = el.parentElement.children.indexOf(el);
                if (idx >= 0) {
                    el.parentElement.children.splice(idx, 1);
                }
                el.parentElement = null;
            }
        }
    };

    Object.defineProperty(el, 'innerHTML', {
        get: () => _innerHTML,
        set: (html) => {
            _innerHTML = html;
            // Parse elements with tags and IDs/classes
            const tagRegex = /<(input|button|span|div)\s*([^>]*)>/g;
            let match;
            while ((match = tagRegex.exec(html)) !== null) {
                const tag = match[1];
                const attrs = match[2];
                const idMatch = attrs.match(/id="([^"]+)"/);
                const classMatch = attrs.match(/class="([^"]+)"/);
                const valMatch = attrs.match(/value="([^"]+)"/);

                const child = createMockElement(tag, classMatch ? classMatch[1] : '');
                if (idMatch) child.id = idMatch[1];
                if (valMatch) child.value = valMatch[1];
                el.appendChild(child);
            }
        }
    });

    return el;
}

const mockBody = createMockElement('body');
const mockHead = createMockElement('head');
const mockDoc = {
    getElementById: (id) => {
        if (id === 'deckFloatingBar' || id === 'hrElementFloatingBar') {
            return mockBody.querySelector('#' + id);
        }
        return mockBody.querySelector('#' + id);
    },
    createElement: (tag) => createMockElement(tag),
    querySelector: (sel) => mockBody.querySelector(sel),
    querySelectorAll: (sel) => mockBody.querySelectorAll(sel),
    body: mockBody,
    head: mockHead,
    readyState: 'complete',
    addEventListener: () => {},
    removeEventListener: () => {}
};

global.location = { hostname: 'localhost', protocol: 'file:' };
global.document = mockDoc;
global.window = global;
global.window.location = global.location;
global.window.document = mockDoc;
global.window.slides = [{}];
global.MutationObserver = class {
    constructor(cb) { this.cb = cb; }
    observe() {}
    disconnect() {}
};

// Require DeckEditor
const DeckEditor = require('./hr_deck_editor.js');
const ops = DeckEditor.operations;
const tb = DeckEditor.toolbar;

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
// SUITE 1: CARD RESIZING ENGINE & !IMPORTANT INLINE STYLES
// ============================================================================
console.log('\n--- 1. Testing Card Resizing Engine & !important Priority ---');

test('setupCardResizeGrip sets height, max-height, min-height, flex and width with !important priority', () => {
    const container = createMockElement('div', 'slide-content-area');
    container.clientHeight = 700;
    container.clientWidth = 900;
    mockBody.appendChild(container);

    const parent = createMockElement('div', 'left-column');
    parent.clientWidth = 800;
    container.appendChild(parent);

    const card = createMockElement('div', 'content-card primary');
    card.clientWidth = 400;
    card.clientHeight = 250;
    parent.appendChild(card);

    ops.setupCardResizeGrip(card);
    const grip = card.querySelector('.glr-resize-grip');
    assert(grip, 'Resize grip must be created inside card');
    assert.strictEqual(typeof grip.onpointerdown, 'function', 'Grip must have onpointerdown handler');

    // Trigger pointerdown
    const downEvt = { clientX: 400, clientY: 250, pointerId: 1, preventDefault: () => {}, stopPropagation: () => {} };
    grip.onpointerdown(downEvt);

    // Simulate moving pointer +100px width, +80px height
    grip.triggerEvent('pointermove', { clientX: 500, clientY: 330 });

    assert.strictEqual(card.style.getPropertyValue('height'), '330px', 'Height should be 330px');
    assert.strictEqual(card.style.getPropertyPriority('height'), 'important', 'Height must have priority !important');
    assert.strictEqual(card.style.getPropertyValue('max-height'), 'none', 'max-height must be none');
    assert.strictEqual(card.style.getPropertyPriority('max-height'), 'important', 'max-height must have priority !important');
    assert.strictEqual(card.style.getPropertyValue('min-height'), '0', 'min-height must be 0');
    assert.strictEqual(card.style.getPropertyPriority('min-height'), 'important', 'min-height must have priority !important');
    assert.strictEqual(card.style.getPropertyValue('flex'), '0 0 330px', 'flex must be 0 0 330px');
    assert.strictEqual(card.style.getPropertyPriority('flex'), 'important', 'flex must have priority !important');
    assert.strictEqual(card.style.getPropertyValue('width'), '500px', 'width should be 500px');
    assert.strictEqual(card.style.getPropertyPriority('width'), 'important', 'width must have priority !important');
    assert.strictEqual(card.style.getPropertyValue('max-width'), '100%', 'max-width should be 100%');
    assert.strictEqual(card.style.getPropertyPriority('max-width'), 'important', 'max-width must have priority !important');
});

test('fitTextToCard refits multiple paragraphs, lists, and tables proportionally', () => {
    const card = createMockElement('div', 'content-card primary');
    card.clientHeight = 200;
    card.clientWidth = 350;

    const body = createMockElement('div', 'card-body', { fontSize: '16px' });
    const p1 = createMockElement('p', '', { fontSize: '15px' });
    const p2 = createMockElement('p', '', { fontSize: '15px' });
    const list = createMockElement('ul', '');
    const li = createMockElement('li', '', { fontSize: '14px' });
    list.appendChild(li);
    const table = createMockElement('table', 'dense-table');
    const th = createMockElement('th', '', { fontSize: '13px' });
    const td = createMockElement('td', '', { fontSize: '13px' });
    table.appendChild(th);
    table.appendChild(td);

    body.appendChild(p1);
    body.appendChild(p2);
    body.appendChild(list);
    body.appendChild(table);
    card.appendChild(body);

    // Dynamic scrollHeight simulation
    Object.defineProperty(card, 'scrollHeight', {
        get: function () {
            const currentScale = parseFloat(card.getAttribute('data-card-font-scale')) || 1.0;
            return Math.round(300 * currentScale);
        }
    });

    ops.fitTextToCard(card);

    const appliedScale = parseFloat(card.getAttribute('data-card-font-scale'));
    assert(appliedScale > 0.40 && appliedScale < 1.0, `Scale should be scaled down to fit, got: ${appliedScale}`);
    assert(p1.style.fontSize && p1.style.fontSize.endsWith('px'), 'p1 must have proportional font-size set');
    assert(p2.style.fontSize && p2.style.fontSize.endsWith('px'), 'p2 must have proportional font-size set');
    assert(th.style.fontSize && th.style.fontSize.endsWith('px'), 'th in table must be scaled');
    assert(td.style.fontSize && td.style.fontSize.endsWith('px'), 'td in table must be scaled');
    assert.strictEqual(th.style.fontSize, td.style.fontSize, 'th and td should maintain baseline proportions');
});

// ============================================================================
// SUITE 2: CARD FLOATING TOOLBAR FONT SLIDER
// ============================================================================
console.log('\n--- 2. Testing Card Floating Toolbar Font Slider Control ---');

test('createFloatingBar includes the font slider control with badge and limits', () => {
    const floatBar = tb.createFloatingBar();
    assert(floatBar, 'createFloatingBar must return a floating bar element');

    const slider = floatBar.querySelector('#cardFontScaleSlider');
    const badge = floatBar.querySelector('#cardFontScaleBadge');

    assert(slider, 'Slider #cardFontScaleSlider must exist inside floating bar');
    assert(badge, 'Badge #cardFontScaleBadge must exist inside floating bar');
    assert(slider.classList.contains('hr-card-font-slider'), 'Slider must have class hr-card-font-slider');
    assert(floatBar.innerHTML.includes('min="50"'), 'Slider min must be 50');
    assert(floatBar.innerHTML.includes('max="220"'), 'Slider max must be 220');
    assert(floatBar.innerHTML.includes('step="5"'), 'Slider step must be 5');
});

test('syncCardFontSlider synchronizes slider position and badge text to card font scale', () => {
    const card = createMockElement('div', 'content-card');
    card.setAttribute('data-card-font-scale', '1.35');

    const floatBar = tb.createFloatingBar();
    const slider = floatBar.querySelector('#cardFontScaleSlider');
    const badge = floatBar.querySelector('#cardFontScaleBadge');

    tb.syncCardFontSlider(card);

    assert.strictEqual(Number(slider.value), 135, 'Slider value must sync to 135');
    assert.strictEqual(badge.textContent, '135%', 'Badge text must sync to 135%');
});

// ============================================================================
// SUITE 3: TWO-PASS FONT SCALING ENGINE (NO COMPOUNDING BUG)
// ============================================================================
console.log('\n--- 3. Testing Non-Compounding Two-Pass Font Scaling Engine ---');

test('Nested elements (card -> body -> p -> span) avoid compound font explosion', () => {
    const card = createMockElement('div', 'content-card');
    const body = createMockElement('div', 'card-body', { fontSize: '18px' });
    const p = createMockElement('p', '', { fontSize: '18px' });
    const span = createMockElement('span', '', { fontSize: '18px' });

    p.appendChild(span);
    body.appendChild(p);
    card.appendChild(body);

    // Apply scale 1.5x
    ops.applyDirectFontScaleToCard(card, 1.5);

    // Check that baselines are captured cleanly without compounding
    assert.strictEqual(body.dataset.origFontSize, '18px');
    assert.strictEqual(p.dataset.origFontSize, '18px');
    assert.strictEqual(span.dataset.origFontSize, '18px');

    // Check applied sizes: each must be strictly 18 * 1.5 = 27.0px!
    assert.strictEqual(body.style.fontSize, '27.0px', 'Body must be exactly 27.0px (1.5x)');
    assert.strictEqual(p.style.fontSize, '27.0px', 'Paragraph must be exactly 27.0px (1.5x)');
    assert.strictEqual(span.style.fontSize, '27.0px', 'Span must be exactly 27.0px (1.5x), NO compounding');
});

test('Expanded text selectors: punchy-point, punchy-tag, lab-box, media-panel-card are scaled', () => {
    const card = createMockElement('div', 'content-card');
    const punchyPoint = createMockElement('div', 'punchy-point', { fontSize: '16px' });
    const punchyTag = createMockElement('span', 'punchy-tag', { fontSize: '12px' });
    const labBox = createMockElement('div', 'lab-box-neutral', { fontSize: '14px' });
    const mediaCard = createMockElement('div', 'media-panel-card', { fontSize: '15px' });

    card.appendChild(punchyPoint);
    card.appendChild(punchyTag);
    card.appendChild(labBox);
    card.appendChild(mediaCard);

    ops.applyDirectFontScaleToCard(card, 1.2);

    assert.strictEqual(punchyPoint.style.fontSize, '19.2px', 'punchy-point scaled by 1.2x');
    assert.strictEqual(punchyTag.style.fontSize, '14.4px', 'punchy-tag scaled by 1.2x');
    assert.strictEqual(labBox.style.fontSize, '16.8px', 'lab-box-neutral scaled by 1.2x');
    assert.strictEqual(mediaCard.style.fontSize, '18.0px', 'media-panel-card scaled by 1.2x');
});

test('Code blocks handled cleanly: syntax highlight spans inside <pre> inherit from <pre>', () => {
    const card = createMockElement('div', 'content-card');
    const pre = createMockElement('pre', '', { fontSize: '14px' });
    const code = createMockElement('code', '');
    const tokenSpan = createMockElement('span', 'token keyword');

    code.appendChild(tokenSpan);
    pre.appendChild(code);
    card.appendChild(pre);

    ops.applyDirectFontScaleToCard(card, 1.3);

    // pre must be scaled directly
    assert.strictEqual(pre.style.fontSize, '18.2px', 'pre element must be scaled');
    // code inside pre is skipped from duplicate inline override (inherits from pre)
    assert.strictEqual(code.style.getPropertyValue('font-size'), '', 'code inside pre must inherit from pre');
    // tokenSpan inside pre is skipped to prevent DOM clutter and compound styling
    assert.strictEqual(tokenSpan.style.getPropertyValue('font-size'), '', 'syntax token span inside pre must inherit');
});

// ============================================================================
// SUITE 4: VUL RUIMTE (FILL CARD & FILL CURRENT SLIDE) VERTICAL DISTRIBUTION
// ============================================================================
console.log('\n--- 4. Testing Vul Ruimte Vertical Distribution & Height Resets ---');

test('fillCard sets max-height: none !important and vertical distribution on body', () => {
    const slideArea = createMockElement('div', 'slide-content-area');
    slideArea.clientHeight = 700;
    slideArea.clientWidth = 900;
    const card = createMockElement('div', 'content-card primary');
    card.style.setProperty('max-height', '250px', 'important'); // Previous fixed height
    const body = createMockElement('div', 'card-body', { fontSize: '15px' });
    card.appendChild(body);
    slideArea.appendChild(card);
    mockBody.appendChild(slideArea);

    ops.fillCard(card);

    assert.strictEqual(card.style.getPropertyValue('flex'), '1 1 0%');
    assert.strictEqual(card.style.getPropertyPriority('flex'), 'important');
    assert.strictEqual(card.style.getPropertyValue('max-height'), 'none');
    assert.strictEqual(card.style.getPropertyPriority('max-height'), 'important');
    assert.strictEqual(card.style.getPropertyValue('justify-content'), 'space-between');
    assert.strictEqual(body.style.getPropertyValue('display'), 'flex');
    assert.strictEqual(body.style.getPropertyValue('justify-content'), 'space-between');
    assert.strictEqual(body.style.getPropertyValue('gap'), '10px');
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`VERIFICATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
console.log('================================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
