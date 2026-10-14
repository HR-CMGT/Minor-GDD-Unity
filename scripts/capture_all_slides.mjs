import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'file:///Users/hichambendriss/Desktop/CMGT/presentation_blockprototyping/index.html';
const OUTPUT_DIR = '/Users/hichambendriss/.gemini/antigravity/brain/e7392cfd-2a9b-422f-83bc-0ab716dd6c98';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAllSlides() {
  console.log('=== Launching Chrome to capture and analyze all 21 slides ===');
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

    console.log(`Loading URL: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });

    // Wait for slide deck init
    await page.waitForFunction(() => typeof window.selectSlide === 'function' && Array.isArray(window.slidesData));

    const totalSlides = await page.evaluate(() => window.slidesData ? window.slidesData.length : 0);
    console.log(`Found ${totalSlides} slides in window.slidesData.`);

    const slideReports = [];
    const contentHashes = new Map();

    for (let i = 0; i < totalSlides; i++) {
      const slideNum = i + 1;
      const paddedNum = String(slideNum).padStart(2, '0');
      const screenshotPath = path.join(OUTPUT_DIR, `slide_${paddedNum}.png`);

      // Switch to slide
      await page.evaluate((idx) => {
        window.selectSlide(idx);
      }, i);

      // Give transitions and layout a moment to settle
      await new Promise(r => setTimeout(r, 250));

      // Inspect slide DOM and layout
      const analysis = await page.evaluate((idx) => {
        const area = document.getElementById('slideContentArea');
        const container = document.getElementById('interactiveSlide');
        const header = document.getElementById('slideHeader');
        const titleEl = document.getElementById('slideTitle');
        const sData = window.slidesData[idx] || {};

        let displayedTitle = '';
        if (sData.isHero) {
          const heroH1 = container ? container.querySelector('h1') : null;
          displayedTitle = heroH1 ? heroH1.innerText.trim() : sData.title;
        } else if (sData.isInverted) {
          const invH1 = container ? container.querySelector('h1') : null;
          displayedTitle = invH1 ? invH1.innerText.trim() : sData.title;
        } else {
          displayedTitle = titleEl ? titleEl.innerText.trim() : sData.title;
        }

        const cards = Array.from(document.querySelectorAll('.content-card, .probuilder-card, .code-container, .hero-wrapper, .practice-box'));
        const cardCount = cards.length;

        const textContent = area ? area.innerText.replace(/\s+/g, ' ').trim() : '';
        const rawHtml = area ? area.innerHTML.trim() : '';

        // Check overflows
        const overflows = [];

        // Check interactive container scroll
        if (container && container.scrollHeight > container.clientHeight + 4) {
          overflows.push({
            element: '#interactiveSlide',
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            diff: container.scrollHeight - container.clientHeight
          });
        }

        // Check content area scroll
        if (area && area.scrollHeight > area.clientHeight + 4) {
          overflows.push({
            element: '#slideContentArea',
            scrollHeight: area.scrollHeight,
            clientHeight: area.clientHeight,
            diff: area.scrollHeight - area.clientHeight
          });
        }

        // Check columns
        const cols = document.querySelectorAll('.left-column, .right-column, .split-layout > div, .split-media-layout > div');
        cols.forEach((col, cIdx) => {
          if (col.scrollHeight > col.clientHeight + 4) {
            overflows.push({
              element: `Column ${cIdx} (${col.className})`,
              scrollHeight: col.scrollHeight,
              clientHeight: col.clientHeight,
              diff: col.scrollHeight - col.clientHeight
            });
          }
        });

        // Check pre code blocks
        const pres = document.querySelectorAll('pre');
        pres.forEach((pre, pIdx) => {
          if (pre.scrollHeight > pre.clientHeight + 4) {
            overflows.push({
              element: `pre[${pIdx}]`,
              scrollHeight: pre.scrollHeight,
              clientHeight: pre.clientHeight,
              diff: pre.scrollHeight - pre.clientHeight
            });
          }
        });

        // Check cards
        cards.forEach((card, cdIdx) => {
          if (card.scrollHeight > card.clientHeight + 8) {
            overflows.push({
              element: `Card[${cdIdx}] (${card.className.split(' ').slice(0, 2).join('.')})`,
              scrollHeight: card.scrollHeight,
              clientHeight: card.clientHeight,
              diff: card.scrollHeight - card.clientHeight
            });
          }
        });

        return {
          index: idx,
          slideNum: idx + 1,
          title: displayedTitle,
          isHero: !!sData.isHero,
          isInverted: !!sData.isInverted,
          cardCount,
          textPreview: textContent.substring(0, 140),
          htmlLength: rawHtml.length,
          rawHtml,
          overflows
        };
      }, i);

      // Compute hash of content to check for duplicates
      const hash = crypto.createHash('md5').update(analysis.rawHtml || analysis.title).digest('hex');
      analysis.hash = hash;
      analysis.screenshotPath = screenshotPath;

      if (!contentHashes.has(hash)) {
        contentHashes.set(hash, []);
      }
      contentHashes.get(hash).push(slideNum);

      // Take screenshot
      await page.screenshot({
        path: screenshotPath,
        fullPage: false
      });

      console.log(`[Slide ${paddedNum}/21] Title: "${analysis.title}" | Cards: ${analysis.cardCount} | Overflows: ${analysis.overflows.length} | Screenshot: ${path.basename(screenshotPath)}`);
      if (analysis.overflows.length > 0) {
        analysis.overflows.forEach(o => {
          console.log(`   ⚠️ OVERFLOW in ${o.element}: scrollHeight ${o.scrollHeight} > clientHeight ${o.clientHeight} (diff: +${o.diff}px)`);
        });
      }

      slideReports.push(analysis);
    }

    console.log('\n=== Content Hash & Duplicate Check ===');
    let duplicateGroupsFound = 0;
    for (const [h, slideNums] of contentHashes.entries()) {
      if (slideNums.length > 1) {
        duplicateGroupsFound++;
        console.log(`⚠️ DUPLICATE DETECTED! Hash ${h} is shared by slides: ${slideNums.join(', ')}`);
        const matchingTitles = slideNums.map(n => `Slide ${n}: "${slideReports[n-1].title}"`);
        console.log(`   Titles: ${matchingTitles.join(' vs ')}`);
      }
    }
    if (duplicateGroupsFound === 0) {
      console.log('✅ In clean template mode, NO slides have identical content hashes! All 21 slides have distinct content.');
    }

    // Write diagnostic json report
    const reportPath = path.join(OUTPUT_DIR, 'diagnostic_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalSlides,
      duplicateGroupsFound,
      slides: slideReports
    }, null, 2));

    console.log(`\nDetailed report written to: ${reportPath}`);

  } finally {
    await browser.close();
  }
}

captureAllSlides().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
