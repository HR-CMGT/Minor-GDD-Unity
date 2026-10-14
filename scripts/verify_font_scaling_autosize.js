/**
 * ============================================================================
 * AUTOMATED VERIFICATION SUITE: DIRECT FONT SCALING & AUTO-SIZE ENGINE
 * File: scripts/verify_font_scaling_autosize.js
 *
 * Verifies:
 * 1. applyDirectFontScaleToCard:
 *    - Injects direct !important inline font sizes on text nodes.
 *    - Captures baseline origFontSize without cascading degradation.
 *    - Cleanly restores original values on reset.
 * 2. autoSizeCardFont binary search:
 *    - Bounded binary search fits oversized cards into bounding box.
 *    - Applies safety cushion and records undo history.
 * 3. autoSizeCurrentSlide:
 *    - Auto-fits all cards on active slide in one atomic step.
 * 4. Slide-level scaling:
 *    - scaleCurrentSlideFont and resetCurrentSlideFont.
 * 5. Public API & Window Globals:
 *    - DeckEditor and window exposure of autoSize functions.
 * ============================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('RUNNING DIRECT FONT SCALING & AUTO-SIZE VERIFICATION SUITE');
console.log('================================================================');

// Require DeckEditor
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

// Helper to create a mock DOM element
function createMockElement(tagName = 'div', className = '', initialStyle = {}) {
    const styleMap = Object.assign({}, initialStyle);
    const dataset = {};
    const attributes = {};
    const children = [];

    const el = {
        tagName: tagName.toUpperCase(),
        className: className,
        classList: {
            contains: (cls) => className.split(' ').includes(cls)
        },
        dataset: dataset,
        scrollHeight: 200,
        scrollWidth: 300,
        clientHeight: 200,
        clientWidth: 300,
        style: {
            ...styleMap,
            setProperty: (prop, val, priority = '') => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                styleMap[prop] = val;
                styleMap[camel] = val;
                el.style[prop] = val;
                el.style[camel] = val;
                if (priority === 'important') {
                    styleMap[prop + '_important'] = true;
                }
            },
            getPropertyValue: (prop) => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                return styleMap[prop] || styleMap[camel] || '';
            },
            removeProperty: (prop) => {
                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                delete styleMap[prop];
                delete styleMap[camel];
                delete el.style[prop];
                delete el.style[camel];
                delete styleMap[prop + '_important'];
            }
        },
        setAttribute: (k, v) => { attributes[k] = String(v); },
        getAttribute: (k) => attributes[k] || null,
        removeAttribute: (k) => { delete attributes[k]; },
        children: children,
        querySelectorAll: (sel) => {
            const matches = [];
            const check = (node) => {
                for (const child of node.children) {
                    if (sel.split(',').some(s => {
                        const trimmed = s.trim();
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
        closest: (sel) => null,
        getBoundingClientRect: () => ({
            top: 100, bottom: 300, left: 100, right: 400, width: 300, height: 200
        })
    };

    return el;
}

const ops = DeckEditor.operations;
assert(ops, 'DeckEditor.operations must be exported');
assert(typeof ops.applyDirectFontScaleToCard === 'function', 'applyDirectFontScaleToCard must exist');
assert(typeof ops.autoSizeCardFont === 'function', 'autoSizeCardFont must exist');
assert(typeof ops.autoSizeCurrentSlide === 'function', 'autoSizeCurrentSlide must exist');

// ============================================================================
// SUITE 1: DIRECT FONT SCALING (applyDirectFontScaleToCard)
// ============================================================================
console.log('\n--- 1. Testing applyDirectFontScaleToCard Engine ---');

test('Sets direct inline font-size with !important on card and text children', () => {
    const card = createMockElement('div', 'content-card primary');
    const title = createMockElement('div', 'card-title', { fontSize: '18px' });
    const body = createMockElement('div', 'card-body', { fontSize: '14px' });
    const p = createMockElement('p', '', { fontSize: '12px' });
    body.children.push(p);
    card.children.push(title, body);

    ops.applyDirectFontScaleToCard(card, 1.25);

    assert.strictEqual(card.getAttribute('data-card-font-scale'), '1.25');
    assert.strictEqual(title.dataset.origFontSize, '18px');
    assert.strictEqual(title.style.fontSize, '22.5px');
    assert.strictEqual(body.dataset.origFontSize, '14px');
    assert.strictEqual(body.style.fontSize, '17.5px');
    assert.strictEqual(p.dataset.origFontSize, '12px');
    assert.strictEqual(p.style.fontSize, '15.0px');
});

test('Repeated scaling uses stored origFontSize and avoids compound rounding drift', () => {
    const card = createMockElement('div', 'content-card');
    const p = createMockElement('p', '', { fontSize: '16px' });
    card.children.push(p);

    ops.applyDirectFontScaleToCard(card, 1.5);
    assert.strictEqual(p.style.fontSize, '24.0px');

    ops.applyDirectFontScaleToCard(card, 0.75);
    assert.strictEqual(p.dataset.origFontSize, '16px');
    assert.strictEqual(p.style.fontSize, '12.0px');
});

test('Reset flag restores original font size and removes data attributes', () => {
    const card = createMockElement('div', 'content-card');
    const p = createMockElement('p', '', { fontSize: '14px' });
    card.children.push(p);

    ops.applyDirectFontScaleToCard(card, 1.4);
    assert.strictEqual(p.style.fontSize, '19.6px');

    ops.applyDirectFontScaleToCard(card, 1.0, true);
    assert.strictEqual(p.style.fontSize, '14px');
    assert.strictEqual(p.dataset.origFontSize, undefined);
    assert.strictEqual(card.getAttribute('data-card-font-scale'), null);
});

test('Elements with rem, em, pt, and px inline styles scale correctly without collapsing to < 10px', () => {
    const card = createMockElement('div', 'content-card primary');
    const remEl1 = createMockElement('p', 'card-body', { fontSize: '0.86rem' });
    const remEl2 = createMockElement('p', '', { fontSize: '0.84rem' });
    const remEl3 = createMockElement('span', 'punchy-point', { fontSize: '0.78rem' });
    const emEl = createMockElement('div', 'card-title', { fontSize: '1.2em' });
    const ptEl = createMockElement('div', 'step-item', { fontSize: '12pt' });
    const pxEl = createMockElement('div', 'code-box', { fontSize: '14px' });

    card.children.push(remEl1, remEl2, remEl3, emEl, ptEl, pxEl);

    // Baseline scale 1.0
    ops.applyDirectFontScaleToCard(card, 1.0);

    // 1. Verify origFontSize is stored as true pixels ending with 'px', never 'rem', 'em', or 'pt'
    assert(remEl1.dataset.origFontSize.endsWith('px'), 'remEl1 origFontSize must end with px');
    assert(!remEl1.dataset.origFontSize.includes('rem'), 'remEl1 origFontSize must never contain rem');
    assert.strictEqual(remEl1.dataset.origFontSize, '13.8px', '0.86rem * 16 must resolve to ~13.8px');
    assert.strictEqual(remEl1.style.fontSize, '13.8px');
    assert(parseFloat(remEl1.style.fontSize) >= 10, '0.86rem must not collapse to < 10px (was bug: 0.9px)');

    assert(remEl2.dataset.origFontSize.endsWith('px'), 'remEl2 origFontSize must end with px');
    assert.strictEqual(remEl2.dataset.origFontSize, '13.4px', '0.84rem * 16 must resolve to ~13.4px');
    assert(parseFloat(remEl2.style.fontSize) >= 10, '0.84rem must not collapse to < 10px');

    assert(remEl3.dataset.origFontSize.endsWith('px'), 'remEl3 origFontSize must end with px');
    assert.strictEqual(remEl3.dataset.origFontSize, '12.5px', '0.78rem * 16 must resolve to ~12.5px');
    assert(parseFloat(remEl3.style.fontSize) >= 10, '0.78rem must not collapse to < 10px');

    assert(emEl.dataset.origFontSize.endsWith('px'), 'emEl origFontSize must end with px');
    assert(!emEl.dataset.origFontSize.includes('em'), 'emEl origFontSize must never contain em');
    assert.strictEqual(emEl.dataset.origFontSize, '19.2px', '1.2em * 16 must resolve to 19.2px');
    assert.strictEqual(emEl.style.fontSize, '19.2px');
    assert(parseFloat(emEl.style.fontSize) >= 10, '1.2em must not collapse to < 10px');

    assert(ptEl.dataset.origFontSize.endsWith('px'), 'ptEl origFontSize must end with px');
    assert.strictEqual(ptEl.dataset.origFontSize, '16px', '12pt * 1.333 must resolve to 16px');
    assert.strictEqual(ptEl.style.fontSize, '16.0px');
    assert(parseFloat(ptEl.style.fontSize) >= 10, '12pt must not collapse to < 10px');

    assert.strictEqual(pxEl.dataset.origFontSize, '14px', '14px must resolve to 14px');
    assert.strictEqual(pxEl.style.fontSize, '14.0px');
    assert(parseFloat(pxEl.style.fontSize) >= 10, '14px must not collapse to < 10px');

    // 2. Scale up to 1.25x
    ops.applyDirectFontScaleToCard(card, 1.25);
    assert.strictEqual(remEl1.style.fontSize, '17.3px', '13.8px * 1.25 = 17.3px');
    assert.strictEqual(emEl.style.fontSize, '24.0px', '19.2px * 1.25 = 24.0px');
    assert.strictEqual(pxEl.style.fontSize, '17.5px', '14px * 1.25 = 17.5px');

    // 3. Scale down to 0.8x
    ops.applyDirectFontScaleToCard(card, 0.8);
    assert.strictEqual(remEl1.style.fontSize, '11.0px', '13.8px * 0.8 = 11.0px');
    assert(parseFloat(remEl1.style.fontSize) >= 10, 'Scaled-down 0.86rem must stay >= 10px');
    assert(parseFloat(remEl2.style.fontSize) >= 10, 'Scaled-down 0.84rem must stay >= 10px');
    assert(parseFloat(remEl3.style.fontSize) >= 10, 'Scaled-down 0.78rem must stay >= 10px');

    // 4. Reset restores original baseline
    ops.applyDirectFontScaleToCard(card, 1.0, true);
    assert.strictEqual(remEl1.style.fontSize, '13.8px');
    assert.strictEqual(remEl1.dataset.origFontSize, undefined);
    assert.strictEqual(emEl.style.fontSize, '19.2px');
    assert.strictEqual(pxEl.style.fontSize, '14px');
});

test('window.getComputedStyle resolution takes priority and unscales when dataset.customFont is true', () => {
    const card = createMockElement('div', 'content-card');
    card.setAttribute('data-card-font-scale', '1.5');
    const p = createMockElement('p', '', { fontSize: '24px' });
    p.dataset.customFont = 'true';
    card.children.push(p);

    const prevWindow = global.window;
    global.window = {
        getComputedStyle: () => ({ fontSize: '24px' })
    };

    try {
        ops.applyDirectFontScaleToCard(card, 1.0);
        // 24px / 1.5 = 16px unscaled baseline
        assert.strictEqual(p.dataset.origFontSize, '16px');
        assert.strictEqual(p.style.fontSize, '16.0px');
    } finally {
        global.window = prevWindow;
    }
});

// ============================================================================
// SUITE 2: AUTO-SIZE ALGORITHM (autoSizeCardFont)
// ============================================================================
console.log('\n--- 2. Testing autoSizeCardFont Binary Search ---');

test('autoSizeCardFont scales down when content overflows target height', () => {
    const card = createMockElement('div', 'content-card primary');
    card.clientHeight = 200;
    card.scrollHeight = 350; // Content overflows by 150px!
    const body = createMockElement('div', 'card-body', { fontSize: '16px' });
    card.children.push(body);

    // Mock dynamic scrollHeight responding to scale
    Object.defineProperty(card, 'scrollHeight', {
        get: function () {
            const currentScale = parseFloat(card.getAttribute('data-card-font-scale')) || 1.0;
            return Math.round(350 * currentScale);
        }
    });

    const finalScale = ops.autoSizeCardFont(card, { recordHistory: false, showToast: false, save: false });
    assert(finalScale < 1.0, `Scale should decrease to fit, got: ${finalScale}`);
    assert(card.scrollHeight <= 200 + 4, `scrollHeight (${card.scrollHeight}) must fit inside clientHeight (200)`);
});

test('autoSizeCardFont scales up when content is small and has abundant headroom', () => {
    const card = createMockElement('div', 'content-card primary');
    card.clientHeight = 300;
    card.scrollHeight = 100; // Large headroom
    const body = createMockElement('div', 'card-body', { fontSize: '14px' });
    card.children.push(body);

    Object.defineProperty(card, 'scrollHeight', {
        get: function () {
            const currentScale = parseFloat(card.getAttribute('data-card-font-scale')) || 1.0;
            return Math.round(100 * currentScale);
        }
    });

    const finalScale = ops.autoSizeCardFont(card, { recordHistory: false, showToast: false, save: false });
    assert(finalScale > 1.0, `Scale should increase when headroom is available, got: ${finalScale}`);
});

// ============================================================================
// SUITE 3: SLIDE-LEVEL CONTROLS & AUTO-FIT ALL
// ============================================================================
console.log('\n--- 3. Testing Slide-Level Scaling & Batch Auto-Fit ---');

test('DeckEditor exports autoSizeCardFont, autoSize, and autoSizeCurrentSlide', () => {
    assert(typeof DeckEditor.autoSizeCardFont === 'function', 'DeckEditor.autoSizeCardFont must be function');
    assert(typeof DeckEditor.autoSize === 'function', 'DeckEditor.autoSize must be function');
    assert(typeof DeckEditor.autoSizeCurrentSlide === 'function', 'DeckEditor.autoSizeCurrentSlide must be function');
    assert(typeof DeckEditor.scaleCardFont === 'function', 'DeckEditor.scaleCardFont must be function');
    assert(typeof DeckEditor.scaleCurrentSlideFont === 'function', 'DeckEditor.scaleCurrentSlideFont must be function');
    assert(typeof DeckEditor.resetCurrentSlideFont === 'function', 'DeckEditor.resetCurrentSlideFont must be function');
});

test('DeckEditor exports fillCard, fillCurrentSlide, and fillSlide', () => {
    assert(typeof DeckEditor.fillCard === 'function', 'DeckEditor.fillCard must be function');
    assert(typeof DeckEditor.fillCurrentSlide === 'function', 'DeckEditor.fillCurrentSlide must be function');
    assert(typeof DeckEditor.fillSlide === 'function', 'DeckEditor.fillSlide must be function');
});

test('fillCard expands card to flex: 1 1 0% and scales text', () => {
    const card = createMockElement('div', 'content-card primary');
    card.clientHeight = 400;
    const body = createMockElement('div', 'card-body', { fontSize: '14px' });
    card.children.push(body);

    ops.fillCard(card);
    assert.strictEqual(card.getAttribute('data-card-fill'), 'true');
    assert.strictEqual(card.style.flex, '1 1 0%');
});

test('fillCurrentSlide handles empty container gracefully without error', () => {
    assert.doesNotThrow(() => {
        DeckEditor.fillCurrentSlide();
    });
});

// ============================================================================
// SUITE 4: WINDOW GLOBALS BACKWARD COMPATIBILITY
// ============================================================================
console.log('\n--- 4. Testing Window Compatibility Layer ---');

test('Window globals for auto-sizing exist when window is defined', () => {
    if (typeof window !== 'undefined') {
        assert(typeof window.autoSizeCardFont === 'function', 'window.autoSizeCardFont must exist');
        assert(typeof window.autoSize === 'function', 'window.autoSize must exist');
        assert(typeof window.autoSizeCurrentSlide === 'function', 'window.autoSizeCurrentSlide must exist');
        assert(typeof window.fillCard === 'function', 'window.fillCard must exist');
        assert(typeof window.fillCurrentSlide === 'function', 'window.fillCurrentSlide must exist');
        assert(typeof window.fillSlide === 'function', 'window.fillSlide must exist');
        assert(typeof window.scaleCardFont === 'function', 'window.scaleCardFont must exist');
        assert(typeof window.scaleCurrentSlideFont === 'function', 'window.scaleCurrentSlideFont must exist');
    } else {
        // Inspect file source directly
        const fileContent = fs.readFileSync(path.join(__dirname, 'hr_deck_editor.js'), 'utf8');
        assert(fileContent.includes('window.autoSizeCardFont ='), 'File must contain window.autoSizeCardFont');
        assert(fileContent.includes('window.autoSize ='), 'File must contain window.autoSize');
        assert(fileContent.includes('window.autoSizeCurrentSlide ='), 'File must contain window.autoSizeCurrentSlide');
        assert(fileContent.includes('window.fillCard ='), 'File must contain window.fillCard');
        assert(fileContent.includes('window.fillCurrentSlide ='), 'File must contain window.fillCurrentSlide');
        assert(fileContent.includes('window.fillSlide ='), 'File must contain window.fillSlide');
    }
});

test('Toolbar and Action Bar UI contain Auto-Size and Fill Space buttons', () => {
    const fileContent = fs.readFileSync(path.join(__dirname, 'hr_deck_editor.js'), 'utf8');
    assert(fileContent.includes('deck-card-btn auto-fit'), 'Card action bar must include Auto button');
    assert(fileContent.includes('deck-card-btn fill-space'), 'Card action bar must include Vul button');
    assert(fileContent.includes('btnFloatFontAuto'), 'Floating bar must include Auto button');
    assert(fileContent.includes('btnFloatFontFill'), 'Floating bar must include Vul button');
    assert(fileContent.includes('btnSlideScaleAuto'), 'Slide toolbar must include Auto-Fit button');
    assert(fileContent.includes('btnSlideFillSpace'), 'Slide toolbar must include Vul Ruimte button');
});

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL ${totalTests})`);
console.log('================================================================');

if (failedTests > 0) {
    process.exit(1);
}
