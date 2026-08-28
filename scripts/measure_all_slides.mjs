import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const projectRoot = path.resolve(__dirname, '..');
const HTML_URL = `file:///${path.join(projectRoot, 'docs', 'presentation_basics1', 'index_comparison.html').replace(/\\/g, '/')}`;

const VIEWPORTS = [
    { name: "1080p Desktop", width: 1920, height: 1080 },
    { name: "1440x900 Laptop", width: 1440, height: 900 },
    { name: "1366x768 Standard Laptop", width: 1366, height: 768 },
    { name: "1280x720 Small", width: 1280, height: 720 },
    { name: "Compact Window (800h)", width: 1200, height: 800 }
];

async function runAudit() {
    console.log("=== STARTING COMPREHENSIVE OVERFLOW & CUTOFF AUDIT ===\n");
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    let totalFailures = 0;
    const failures = [];

    for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
        await page.goto(HTML_URL, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 300));

        const slideCount = await page.evaluate(() => window.slideIds ? window.slideIds.length : 21);
        console.log(`\n--- Auditing ${vp.name} (${vp.width}x${vp.height}) across ${slideCount} slides ---`);

        for (let i = 0; i < slideCount; i++) {
            const slideNum = i + 1;
            const testModes = [
                { name: "Lecture Core", view: "projector", tier: "core", openAcc: false },
                { name: "Lab Closed", view: "lab", tier: "all", openAcc: false },
                { name: "Lab Opened", view: "lab", tier: "all", openAcc: true }
            ];

            for (const tm of testModes) {
                await page.evaluate((idx, viewMode, tierFilter, openAccordions) => {
                    setViewMode(viewMode);
                    setTierFilter(tierFilter);
                    goToSlide(idx);
                    document.querySelectorAll('details.tier-accordion').forEach(d => d.open = openAccordions);
                    if (typeof syncAccordionState === 'function') syncAccordionState();
                    if (typeof autoFitSlideElements === 'function') autoFitSlideElements();
                }, i, tm.view, tm.tier, tm.openAcc);

                await new Promise(r => setTimeout(r, 40));

                const report = await page.evaluate((sNum, vpName, modeName) => {
                    const issues = [];
                    const area = document.getElementById("slideContentArea");
                    if (!area) return issues;

                    // 1. Check slide content area
                    if (area.scrollHeight > area.clientHeight + 1) {
                        issues.push({
                            slide: sNum, viewport: vpName, mode: modeName,
                            target: ".slide-content-area",
                            overflow: area.scrollHeight - area.clientHeight,
                            details: `scrollHeight (${area.scrollHeight}px) > clientHeight (${area.clientHeight}px)`
                        });
                    }

                    // 2. Check all cards
                    const cards = area.querySelectorAll('.content-card');
                    cards.forEach((card, cIdx) => {
                        const title = card.querySelector('.card-title')?.textContent?.trim() || `Card ${cIdx+1}`;
                        if (card.scrollHeight > card.clientHeight + 1) {
                            issues.push({
                                slide: sNum, viewport: vpName, mode: modeName,
                                target: `.content-card [${title}]`,
                                overflow: card.scrollHeight - card.clientHeight,
                                details: `card scrollHeight (${card.scrollHeight}px) > clientHeight (${card.clientHeight}px)`
                            });
                        }
                    });

                    // 3. Check all pre code blocks
                    const pres = area.querySelectorAll('pre');
                    pres.forEach((p, pIdx) => {
                        const details = p.closest('details');
                        if (details && !details.open) return;
                        if (p.offsetParent === null || p.clientHeight === 0) return;

                        const parentCard = p.closest('.content-card') || area;
                        const pRect = p.getBoundingClientRect();
                        const cardRect = parentCard.getBoundingClientRect();
                        if (p.scrollHeight > p.clientHeight + 1) {
                            issues.push({
                                slide: sNum, viewport: vpName, mode: modeName,
                                target: `pre[${pIdx}] scroll`,
                                overflow: p.scrollHeight - p.clientHeight,
                                details: `pre scrollHeight (${p.scrollHeight}px) > clientHeight (${p.clientHeight}px)`
                            });
                        }
                        if (pRect.bottom > cardRect.bottom + 2) {
                            issues.push({
                                slide: sNum, viewport: vpName, mode: modeName,
                                target: `pre[${pIdx}] bounding bottom`,
                                overflow: pRect.bottom - cardRect.bottom,
                                details: `pre bottom (${pRect.bottom.toFixed(1)}px) exceeds card bottom (${cardRect.bottom.toFixed(1)}px)`
                            });
                        }
                    });

                    // 4. Check all tables
                    const tables = area.querySelectorAll('table.dense-table');
                    tables.forEach((t, tIdx) => {
                        const details = t.closest('details');
                        if (details && !details.open) return;
                        if (t.offsetParent === null || t.clientHeight === 0) return;

                        const parent = t.closest('.content-card') || area;
                        const tRect = t.getBoundingClientRect();
                        const pRect = parent.getBoundingClientRect();
                        if (tRect.bottom > pRect.bottom + 2) {
                            issues.push({
                                slide: sNum, viewport: vpName, mode: modeName,
                                target: `table[${tIdx}]`,
                                overflow: tRect.bottom - pRect.bottom,
                                details: `table bottom (${tRect.bottom.toFixed(1)}px) exceeds parent bottom (${pRect.bottom.toFixed(1)}px)`
                            });
                        }
                    });

                    return issues;
                }, slideNum, vp.name, tm.name);

                if (report.length > 0) {
                    totalFailures += report.length;
                    failures.push(...report);
                    console.log(`  [FLAG] Slide ${slideNum} (${tm.name}): ${report.length} cutoffs/overflows detected`);
                    report.forEach(r => console.log(`     -> ${r.target}: +${r.overflow.toFixed(1)}px overflow (${r.details})`));
                }
            }
        }
    }

    await browser.close();
    console.log("\n========================================");
    console.log(`AUDIT COMPLETE: ${totalFailures} total overflow/cutoff issues flagged.`);
    console.log("========================================\n");
    return failures;
}

runAudit().catch(console.error);
