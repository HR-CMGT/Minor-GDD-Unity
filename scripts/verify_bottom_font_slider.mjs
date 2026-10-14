/**
 * ============================================================================
 * AUTOMATED VERIFICATION SUITE: BOTTOM FONT SLIDER & SYNCHRONIZATION ENGINE
 * File: scripts/verify_bottom_font_slider.mjs
 *
 * Verifies:
 * 1. Bottom font slider correctly scales slide typography:
 *    - .card-body, .card-title, p, li, pre, etc.
 * 2. Injected high-specificity styles in hr_deck_editor.js do not block scaling
 *    (both --font-scale and --lecture-font-scale are synchronized).
 * 3. Scaling up to 140% increases computed font-size by ~1.4x (within tolerance).
 * 4. Scaling down to 70% decreases computed font-size by ~0.7x (within tolerance).
 * 5. LocalStorage synchronization: 'gdd_font_scale' persists across page reloads.
 * 6. Dual-way sync: setFontScale(val) updates slider position, badge, CSS vars,
 *    and localStorage.
 * ============================================================================
 */

import puppeteer from 'puppeteer-core';
import assert from 'assert';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'file:///Users/hichambendriss/Desktop/CMGT/presentation_blockprototyping/index.html';

console.log('================================================================');
console.log('RUNNING BOTTOM FONT SLIDER & SYNCHRONIZATION VERIFICATION SUITE');
console.log('================================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runAsyncTest(description, asyncFn) {
    totalTests++;
    try {
        await asyncFn();
        console.log(`  [PASS] ${description}`);
        passedTests++;
    } catch (err) {
        console.error(`  [FAIL] ${description}`);
        console.error(`         ${err.message}`);
        failedTests++;
    }
}

async function main() {
    console.log(`Launching Chrome from ${CHROME_PATH}...`);
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--allow-file-access-from-files'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Step 0: Initial load & clean state
        console.log(`Loading URL: ${TARGET_URL}`);
        await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => typeof window.selectSlide === 'function' && Array.isArray(window.slidesData));

        // Ensure clean localStorage for reproducible baseline
        await page.evaluate(() => {
            try { localStorage.removeItem('gdd_font_scale'); } catch (e) {}
            if (typeof window.setFontScale === 'function') window.setFontScale(100);
            if (typeof window.selectSlide === 'function') window.selectSlide(1); // Slide 2 has multiple rich cards
        });
        await new Promise(r => setTimeout(r, 300));

        // Verify injected editor stylesheet is present
        await runAsyncTest('Editor high-specificity styles (#hr-deck-editor-styles) are injected', async () => {
            const hasInjectedStyles = await page.evaluate(() => {
                const styleEl = document.getElementById('hr-deck-editor-styles');
                return !!styleEl && styleEl.textContent.includes('--font-scale');
            });
            assert.strictEqual(hasInjectedStyles, true, 'Expected #hr-deck-editor-styles to be injected');
        });

        // Test 1: Baseline at 100%
        let baseline = null;
        await runAsyncTest('Baseline font metrics at slider value 100', async () => {
            baseline = await page.evaluate(() => {
                const slider = document.getElementById('fontScaleSlider');
                const badge = document.getElementById('fontScaleValue');
                const cardBody = document.querySelector('.card-body');
                const cardTitle = document.querySelector('.card-title');
                const textEl = document.querySelector('.card-body strong') || document.querySelector('.card-body p') || document.querySelector('.card-body');

                const rootStyles = window.getComputedStyle(document.documentElement);
                const fontScaleVar = rootStyles.getPropertyValue('--font-scale').trim();
                const lectureScaleVar = rootStyles.getPropertyValue('--lecture-font-scale').trim();

                return {
                    hasSlider: !!slider,
                    sliderVal: slider ? slider.value : null,
                    hasBadge: !!badge,
                    badgeText: badge ? badge.textContent.trim() : null,
                    hasCardBody: !!cardBody,
                    hasCardTitle: !!cardTitle,
                    fontScaleVar,
                    lectureScaleVar,
                    bodyFs: cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0,
                    titleFs: cardTitle ? parseFloat(window.getComputedStyle(cardTitle).fontSize) : 0,
                    textFs: textEl ? parseFloat(window.getComputedStyle(textEl).fontSize) : 0
                };
            });

            assert.ok(baseline.hasSlider, 'fontScaleSlider must exist');
            assert.ok(baseline.hasBadge, 'fontScaleValue badge must exist');
            assert.ok(baseline.hasCardBody, 'card-body must exist on slide');
            assert.ok(baseline.hasCardTitle, 'card-title must exist on slide');
            assert.strictEqual(baseline.sliderVal, '100');
            assert.strictEqual(baseline.badgeText, '100%');
            assert.ok(baseline.bodyFs > 0, 'Body font-size must be > 0');
            assert.ok(baseline.titleFs > 0, 'Title font-size must be > 0');
            assert.ok(baseline.textFs > 0, 'Child text font-size must be > 0');
            console.log(`    Baseline computed px: body=${baseline.bodyFs}px, title=${baseline.titleFs}px, text=${baseline.textFs}px`);
        });

        // Test 2: Scale up to 140
        await runAsyncTest('Setting slider to 140 scales typography up by ~1.4x (within tolerance) and syncs state', async () => {
            const metrics140 = await page.evaluate(() => {
                const slider = document.getElementById('fontScaleSlider');
                slider.value = '140';
                slider.dispatchEvent(new Event('input', { bubbles: true }));

                const badge = document.getElementById('fontScaleValue');
                const cardBody = document.querySelector('.card-body');
                const cardTitle = document.querySelector('.card-title');
                const textEl = document.querySelector('.card-body strong') || document.querySelector('.card-body p') || document.querySelector('.card-body');

                const rootStyles = window.getComputedStyle(document.documentElement);
                const savedStorage = localStorage.getItem('gdd_font_scale');

                return {
                    sliderVal: slider.value,
                    badgeText: badge ? badge.textContent.trim() : '',
                    fontScaleVar: rootStyles.getPropertyValue('--font-scale').trim(),
                    lectureScaleVar: rootStyles.getPropertyValue('--lecture-font-scale').trim(),
                    savedStorage,
                    bodyFs: cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0,
                    titleFs: cardTitle ? parseFloat(window.getComputedStyle(cardTitle).fontSize) : 0,
                    textFs: textEl ? parseFloat(window.getComputedStyle(textEl).fontSize) : 0
                };
            });

            assert.strictEqual(metrics140.sliderVal, '140');
            assert.strictEqual(metrics140.badgeText, '140%');
            assert.strictEqual(metrics140.savedStorage, '140', 'localStorage gdd_font_scale should equal 140');
            assert.strictEqual(metrics140.fontScaleVar, '1.4', '--font-scale must be 1.4');
            assert.strictEqual(metrics140.lectureScaleVar, '1.4', '--lecture-font-scale must be 1.4');

            const bodyRatio = metrics140.bodyFs / baseline.bodyFs;
            const titleRatio = metrics140.titleFs / baseline.titleFs;
            const textRatio = metrics140.textFs / baseline.textFs;

            console.log(`    Scale 140 metrics: body=${metrics140.bodyFs}px (ratio: ${bodyRatio.toFixed(4)}), title=${metrics140.titleFs}px (ratio: ${titleRatio.toFixed(4)}), text=${metrics140.textFs}px (ratio: ${textRatio.toFixed(4)})`);

            assert.ok(Math.abs(bodyRatio - 1.4) < 0.05, `Body font scaling ratio ${bodyRatio.toFixed(4)} should be ~1.4x`);
            assert.ok(Math.abs(titleRatio - 1.4) < 0.05, `Title font scaling ratio ${titleRatio.toFixed(4)} should be ~1.4x`);
            assert.ok(Math.abs(textRatio - 1.4) < 0.05, `Child text font scaling ratio ${textRatio.toFixed(4)} should be ~1.4x`);
        });

        // Test 3: Scale down to 70
        await runAsyncTest('Setting slider to 70 scales typography down by ~0.7x (within tolerance) and syncs state', async () => {
            const metrics70 = await page.evaluate(() => {
                const slider = document.getElementById('fontScaleSlider');
                slider.value = '70';
                slider.dispatchEvent(new Event('input', { bubbles: true }));

                const badge = document.getElementById('fontScaleValue');
                const cardBody = document.querySelector('.card-body');
                const cardTitle = document.querySelector('.card-title');
                const textEl = document.querySelector('.card-body strong') || document.querySelector('.card-body p') || document.querySelector('.card-body');

                const rootStyles = window.getComputedStyle(document.documentElement);
                const savedStorage = localStorage.getItem('gdd_font_scale');

                return {
                    sliderVal: slider.value,
                    badgeText: badge ? badge.textContent.trim() : '',
                    fontScaleVar: rootStyles.getPropertyValue('--font-scale').trim(),
                    lectureScaleVar: rootStyles.getPropertyValue('--lecture-font-scale').trim(),
                    savedStorage,
                    bodyFs: cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0,
                    titleFs: cardTitle ? parseFloat(window.getComputedStyle(cardTitle).fontSize) : 0,
                    textFs: textEl ? parseFloat(window.getComputedStyle(textEl).fontSize) : 0
                };
            });

            assert.strictEqual(metrics70.sliderVal, '70');
            assert.strictEqual(metrics70.badgeText, '70%');
            assert.strictEqual(metrics70.savedStorage, '70', 'localStorage gdd_font_scale should equal 70');
            assert.strictEqual(metrics70.fontScaleVar, '0.7', '--font-scale must be 0.7');
            assert.strictEqual(metrics70.lectureScaleVar, '0.7', '--lecture-font-scale must be 0.7');

            const bodyRatio = metrics70.bodyFs / baseline.bodyFs;
            const titleRatio = metrics70.titleFs / baseline.titleFs;
            const textRatio = metrics70.textFs / baseline.textFs;

            console.log(`    Scale 70 metrics: body=${metrics70.bodyFs}px (ratio: ${bodyRatio.toFixed(4)}), title=${metrics70.titleFs}px (ratio: ${titleRatio.toFixed(4)}), text=${metrics70.textFs}px (ratio: ${textRatio.toFixed(4)})`);

            assert.ok(Math.abs(bodyRatio - 0.7) < 0.05, `Body font scaling ratio ${bodyRatio.toFixed(4)} should be ~0.7x`);
            assert.ok(Math.abs(titleRatio - 0.7) < 0.05, `Title font scaling ratio ${titleRatio.toFixed(4)} should be ~0.7x`);
            assert.ok(Math.abs(textRatio - 0.7) < 0.05, `Child text font scaling ratio ${textRatio.toFixed(4)} should be ~0.7x`);
        });

        // Test 4: Persistence across page reload
        await runAsyncTest('Page reload restores saved scale (70%) and applies immediately on startup', async () => {
            console.log('    Reloading page...');
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForFunction(() => typeof window.selectSlide === 'function' && Array.isArray(window.slidesData));
            await page.evaluate(() => window.selectSlide(1));
            await new Promise(r => setTimeout(r, 200));

            const reloaded = await page.evaluate(() => {
                const slider = document.getElementById('fontScaleSlider');
                const badge = document.getElementById('fontScaleValue');
                const cardBody = document.querySelector('.card-body');
                const cardTitle = document.querySelector('.card-title');

                const rootStyles = window.getComputedStyle(document.documentElement);
                const savedStorage = localStorage.getItem('gdd_font_scale');

                return {
                    sliderVal: slider ? slider.value : null,
                    badgeText: badge ? badge.textContent.trim() : null,
                    savedStorage,
                    fontScaleVar: rootStyles.getPropertyValue('--font-scale').trim(),
                    lectureScaleVar: rootStyles.getPropertyValue('--lecture-font-scale').trim(),
                    bodyFs: cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0,
                    titleFs: cardTitle ? parseFloat(window.getComputedStyle(cardTitle).fontSize) : 0
                };
            });

            assert.strictEqual(reloaded.savedStorage, '70', 'Saved storage must be 70 after reload');
            assert.strictEqual(reloaded.sliderVal, '70', 'Slider position must be restored to 70');
            assert.strictEqual(reloaded.badgeText, '70%', 'Badge text must be restored to 70%');
            assert.strictEqual(reloaded.fontScaleVar, '0.7', '--font-scale must be 0.7');

            const bodyRatio = reloaded.bodyFs / baseline.bodyFs;
            const titleRatio = reloaded.titleFs / baseline.titleFs;
            console.log(`    Reload metrics: body=${reloaded.bodyFs}px (ratio: ${bodyRatio.toFixed(4)}), title=${reloaded.titleFs}px (ratio: ${titleRatio.toFixed(4)})`);
            assert.ok(Math.abs(bodyRatio - 0.7) < 0.05, `Reload body font ratio ${bodyRatio.toFixed(4)} should be ~0.7x`);
            assert.ok(Math.abs(titleRatio - 0.7) < 0.05, `Reload title font ratio ${titleRatio.toFixed(4)} should be ~0.7x`);
        });

        // Test 5: Programmatic setFontScale(val) synchronization
        await runAsyncTest('Programmatic setFontScale(115) synchronizes slider, badge, variables and storage', async () => {
            const result = await page.evaluate(() => {
                window.setFontScale(115);
                const slider = document.getElementById('fontScaleSlider');
                const badge = document.getElementById('fontScaleValue');
                const cardBody = document.querySelector('.card-body');
                const bodyFs = cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0;
                const savedStorage = localStorage.getItem('gdd_font_scale');
                const rootStyles = window.getComputedStyle(document.documentElement);

                return {
                    sliderVal: slider ? slider.value : null,
                    badgeText: badge ? badge.textContent.trim() : null,
                    savedStorage,
                    fontScaleVar: rootStyles.getPropertyValue('--font-scale').trim(),
                    lectureScaleVar: rootStyles.getPropertyValue('--lecture-font-scale').trim(),
                    bodyFs
                };
            });

            assert.strictEqual(result.sliderVal, '115');
            assert.strictEqual(result.badgeText, '115%');
            assert.strictEqual(result.savedStorage, '115');
            assert.strictEqual(result.fontScaleVar, '1.15');
            assert.strictEqual(result.lectureScaleVar, '1.15');

            const bodyRatio = result.bodyFs / baseline.bodyFs;
            console.log(`    setFontScale(115) metrics: body=${result.bodyFs}px (ratio: ${bodyRatio.toFixed(4)})`);
            assert.ok(Math.abs(bodyRatio - 1.15) < 0.05, `Body ratio ${bodyRatio.toFixed(4)} should be ~1.15x`);
        });

        // Test 6: Cross-slide navigation maintains font scale
        await runAsyncTest('Font scaling applies seamlessly across slide navigation', async () => {
            const navResult = await page.evaluate(() => {
                // Navigate to slide 5 (index 4)
                window.selectSlide(4);
                const cardBody = document.querySelector('.card-body');
                const bodyFs = cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0;

                // Change scale to 125
                window.setFontScale(125);
                const scaledFs = cardBody ? parseFloat(window.getComputedStyle(cardBody).fontSize) : 0;

                return {
                    bodyFs,
                    scaledFs,
                    ratio: scaledFs / bodyFs
                };
            });

            const expectedRatio = 125 / 115;
            console.log(`    Cross-slide ratio: ${navResult.ratio.toFixed(4)} (expected: ${expectedRatio.toFixed(4)})`);
            assert.ok(Math.abs(navResult.ratio - expectedRatio) < 0.05, 'Font scaling should match linear ratio');
        });

        // Clean up environment
        await page.evaluate(() => {
            window.setFontScale(100);
            try { localStorage.removeItem('gdd_font_scale'); } catch (e) {}
        });

    } finally {
        await browser.close();
    }

    console.log('================================================================');
    console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
    console.log('================================================================');

    if (failedTests > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error during verification:', err);
    process.exit(1);
});
