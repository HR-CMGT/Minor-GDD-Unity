import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'exported_slides');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const possibleBrowsers = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = possibleBrowsers.find(p => fs.existsSync(p));
if (!executablePath) {
    console.error('No Chrome/Edge executable found.');
    process.exit(1);
}

const htmlUrl = `file:///${path.join(projectRoot, 'docs', 'presentation_basics1', 'index_comparison.html').replace(/\\/g, '/')}`;

async function run() {
    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        defaultViewport: {
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.goto(htmlUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const slideCount = await page.evaluate(() => window.slideIds ? window.slideIds.length : 21);
    console.log(`Exporting ${slideCount} slides in Lecture Core and Expert Lab modes...\n`);

    for (let i = 0; i < slideCount; i++) {
        const slideNum = String(i + 1).padStart(2, '0');

        // 1. Lecture Core Mode
        await page.evaluate((idx) => {
            setViewMode('projector');
            setTierFilter('core');
            goToSlide(idx);
        }, i);
        await new Promise(r => setTimeout(r, 150));

        const coreOverflows = await page.evaluate(() => {
            const issues = [];
            const area = document.getElementById("slideContentArea");
            if (area && area.scrollHeight > area.clientHeight + 1) {
                issues.push(`slideContentArea (+${(area.scrollHeight - area.clientHeight).toFixed(1)}px)`);
            }
            document.querySelectorAll('.content-card').forEach((c, idx) => {
                if (c.scrollHeight > c.clientHeight + 1) {
                    issues.push(`card[${idx}] (+${(c.scrollHeight - c.clientHeight).toFixed(1)}px)`);
                }
            });
            document.querySelectorAll('table.dense-table').forEach((t, idx) => {
                if (t.scrollHeight > t.clientHeight + 1) {
                    issues.push(`table[${idx}] (+${(t.scrollHeight - t.clientHeight).toFixed(1)}px)`);
                }
            });
            return issues;
        });

        const viewportEl = await page.$('#viewport') || await page.$('.slide-viewport');
        if (viewportEl) {
            await viewportEl.screenshot({
                path: path.join(outDir, `slide_${slideNum}_lecture_core.png`)
            });
        }

        // 2. Expert Lab Mode (Expand accordions)
        await page.evaluate((idx) => {
            setViewMode('lab');
            setTierFilter('all');
            goToSlide(idx);
            document.querySelectorAll('details.tier-accordion').forEach(d => d.open = true);
            if (typeof syncAccordionState === 'function') syncAccordionState();
        }, i);
        await new Promise(r => setTimeout(r, 150));

        const labOverflows = await page.evaluate(() => {
            const issues = [];
            const area = document.getElementById("slideContentArea");
            if (area && area.scrollHeight > area.clientHeight + 1) {
                issues.push(`slideContentArea (+${(area.scrollHeight - area.clientHeight).toFixed(1)}px)`);
            }
            document.querySelectorAll('.content-card').forEach((c, idx) => {
                if (c.scrollHeight > c.clientHeight + 1) {
                    issues.push(`card[${idx}] (+${(c.scrollHeight - c.clientHeight).toFixed(1)}px)`);
                }
            });
            document.querySelectorAll('table.dense-table').forEach((t, idx) => {
                if (t.scrollHeight > t.clientHeight + 1) {
                    issues.push(`table[${idx}] (+${(t.scrollHeight - t.clientHeight).toFixed(1)}px)`);
                }
            });
            return issues;
        });

        if (viewportEl) {
            await viewportEl.screenshot({
                path: path.join(outDir, `slide_${slideNum}_expert_lab.png`)
            });
        }

        let status = `[OK] Slide ${slideNum}/${slideCount}`;
        if (coreOverflows.length > 0) status += ` [OVERFLOW Core: ${coreOverflows.join(', ')}]`;
        if (labOverflows.length > 0) status += ` [OVERFLOW Lab: ${labOverflows.join(', ')}]`;
        console.log(status);
    }

    await browser.close();
    console.log(`\nDONE! All ${slideCount * 2} slides saved to:\n${outDir}`);
}

run().catch(err => {
    console.error('Export error:', err);
    process.exit(1);
});
