const http = require('http');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3555;
console.log('================================================================');
console.log(`RUNNING FULL END-TO-END VERIFICATION ON PORT ${PORT}`);
console.log('================================================================');

const CMGT_ROOT = path.resolve(__dirname, '..');
const GLR_ROOT = path.resolve(CMGT_ROOT, '../GLR');

const serverProc = child_process.spawn(process.execPath, [
    path.join(__dirname, 'edit_server.js'),
    `--port=${PORT}`
], {
    cwd: CMGT_ROOT,
    stdio: 'inherit'
});

function apiRequest(method, pathname, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: '127.0.0.1',
            port: PORT,
            path: pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        }, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testAll() {
    await new Promise(r => setTimeout(r, 1200));

    let passedCount = 0;
    let failedCount = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  [PASS] ${message}`);
            passedCount++;
        } else {
            console.error(`  [FAIL] ${message}`);
            failedCount++;
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    try {
        // -------------------------------------------------------------
        // Step 1: GET /api/status
        // -------------------------------------------------------------
        console.log('\n--- 1. Testing GET /api/status ---');
        const statusRes = await apiRequest('GET', '/api/status');
        assert(statusRes.status === 200, 'Status code is 200');
        assert(statusRes.data.status === 'ok', 'Status is "ok"');
        assert(statusRes.data.version === '2.1.0', 'Version is 2.1.0');
        assert(statusRes.data.roots.CMGT === CMGT_ROOT, 'CMGT root correctly identified');
        assert(Array.isArray(statusRes.data.decks) && statusRes.data.decks.length > 0, 'Decks scanned and listed');

        const hasBlockProto = statusRes.data.decks.some(d => d.id === 'presentation_blockprototyping' && d.hasGenerator === true);
        const hasBasics1 = statusRes.data.decks.some(d => d.id === 'presentation_basics1');
        const hasGlrIx = statusRes.data.decks.some(d => d.project === 'GLR' && d.id.includes('IX'));

        assert(hasBlockProto, 'presentation_blockprototyping detected with generator');
        assert(hasBasics1, 'presentation_basics1 detected');
        assert(hasGlrIx, 'GLR IX deck detected');

        // -------------------------------------------------------------
        // Step 2: CMGT presentation_blockprototyping (has generate.js)
        // -------------------------------------------------------------
        console.log('\n--- 2. Testing CMGT presentation_blockprototyping ---');
        const bpGenPath = path.join(CMGT_ROOT, 'presentation_blockprototyping/generate.js');
        const bpGenOriginal = fs.readFileSync(bpGenPath, 'utf8');

        // Capture original title of slide 0
        const bpMatch = bpGenOriginal.match(/(?:let|const|var)\s+slidesData\s*=\s*(\[[\s\S]*?\n\s*\];)/);
        const bpOriginalSlides = Function('return ' + bpMatch[1].replace(/;$/, ''))();
        const bpOriginalTitle = bpOriginalSlides[0].title;

        const testTitleBp = 'Dev - Lesson 07: 3D Block Prototyping (E2E TEST VERIFIED)';
        const testContentBp = '<div class="e2e-test">Atomic Disk Persistence Test Content</div>';

        const bpSaveRes = await apiRequest('POST', '/api/save-slide', {
            deck: 'presentation_blockprototyping',
            slideIndex: 0,
            title: testTitleBp,
            contentHtml: testContentBp
        });

        assert(bpSaveRes.status === 200, 'Save response 200 OK');
        assert(bpSaveRes.data.success === true, 'Save success is true');
        assert(bpSaveRes.data.updatedFiles.length >= 4, `Updated at least 4 files (got ${bpSaveRes.data.updatedFiles.length})`);
        assert(Boolean(bpSaveRes.data.backup), `Backup timestamp returned: ${bpSaveRes.data.backup}`);

        // Verify that backup exists on disk with manifest
        const bpBackupDir = path.join(CMGT_ROOT, '.deck_backups/presentation_blockprototyping', bpSaveRes.data.backup);
        assert(fs.existsSync(bpBackupDir), 'Backup directory exists on disk');
        assert(fs.existsSync(path.join(bpBackupDir, 'manifest.json')), 'manifest.json exists in backup');
        assert(fs.existsSync(path.join(bpBackupDir, 'generate.js')), 'generate.js backed up');

        // Verify that generate.js was updated without regex bug
        const bpGenUpdated = fs.readFileSync(bpGenPath, 'utf8');
        assert(bpGenUpdated.includes(testTitleBp), 'Updated title present in generate.js');
        assert(bpGenUpdated.includes('Atomic Disk Persistence Test Content'), 'Updated contentHtml present in generate.js');

        // Verify target HTML files were updated by generator
        const bpHtmlPath = path.join(CMGT_ROOT, 'presentation_blockprototyping/index.html');
        const bpHtml = fs.readFileSync(bpHtmlPath, 'utf8');
        assert(bpHtml.includes(testTitleBp), 'Updated title present in presentation_blockprototyping/index.html');

        // Reset slide 0
        console.log('Restoring presentation_blockprototyping slide 0...');
        const bpResetRes = await apiRequest('POST', '/api/reset-slide', {
            deck: 'presentation_blockprototyping',
            slideIndex: 0
        });

        assert(bpResetRes.status === 200, 'Reset response 200 OK');
        assert(bpResetRes.data.restoredSlide && bpResetRes.data.restoredSlide.title === bpOriginalTitle, 'Original slide title restored');

        const bpGenRestored = fs.readFileSync(bpGenPath, 'utf8');
        assert(bpGenRestored.includes(bpOriginalTitle), 'Original title restored in generate.js');

        // -------------------------------------------------------------
        // Step 3: CMGT presentation_basics1 (no generate.js, direct HTML)
        // -------------------------------------------------------------
        console.log('\n--- 3. Testing CMGT presentation_basics1 ---');
        const b1HtmlPath = path.join(CMGT_ROOT, 'presentation_basics1/index.html');
        const b1Original = fs.readFileSync(b1HtmlPath, 'utf8');
        const b1Match = b1Original.match(/(?:let|const|var)\s+slidesData\s*=\s*(\[[\s\S]*?\n\s*\];)/);
        const b1OriginalSlides = Function('return ' + b1Match[1].replace(/;$/, ''))();
        const b1OriginalTitle = b1OriginalSlides[1].title; // Slide 2 title

        const testTitleB1 = 'E2E Verified Basics 1 Slide Title';
        const testContentB1 = '<div class="b1-test">Basics 1 Atomic Disk Write</div>';

        const b1SaveRes = await apiRequest('POST', '/api/save-slide', {
            deck: 'presentation_basics1',
            slideIndex: 1,
            title: testTitleB1,
            contentHtml: testContentB1
        });

        assert(b1SaveRes.status === 200, 'Basics 1 save response 200 OK');
        assert(b1SaveRes.data.success === true, 'Basics 1 save success');
        assert(b1SaveRes.data.updatedFiles.includes('presentation_basics1/index.html'), 'presentation_basics1/index.html in updatedFiles');

        // Verify HTML file was updated
        const b1UpdatedHtml = fs.readFileSync(b1HtmlPath, 'utf8');
        assert(b1UpdatedHtml.includes(testTitleB1), 'Updated title present in presentation_basics1/index.html');

        // Reset slide 1
        console.log('Restoring presentation_basics1 slide 1...');
        const b1ResetRes = await apiRequest('POST', '/api/reset-slide', {
            deck: 'presentation_basics1',
            slideIndex: 1
        });

        assert(b1ResetRes.status === 200, 'Basics 1 reset response 200 OK');
        const b1RestoredHtml = fs.readFileSync(b1HtmlPath, 'utf8');
        assert(b1RestoredHtml.includes(b1OriginalTitle), 'Original title restored in presentation_basics1/index.html');

        // -------------------------------------------------------------
        // Step 4: GLR Deck (IX/presentation_les1)
        // -------------------------------------------------------------
        console.log('\n--- 4. Testing GLR IX/presentation_les1 ---');
        const glrFilePath = path.join(GLR_ROOT, 'IX/presentation_les1.html');
        if (fs.existsSync(glrFilePath)) {
            const glrOriginal = fs.readFileSync(glrFilePath, 'utf8');
            const glrMatch = glrOriginal.match(/(?:let|const|var)\s+slides\s*=\s*(\[[\s\S]*?\];)/);
            const glrOriginalSlides = Function('return ' + glrMatch[1].replace(/;$/, ''))();
            const glrOriginalTitle = glrOriginalSlides[1].title;

            const testTitleGlr = 'GLR E2E Verified Slide Title';
            const testContentGlr = '<div class="glr-e2e">GLR Slide Content Verified</div>';

            const glrSaveRes = await apiRequest('POST', '/api/save-slide', {
                deck: 'IX/presentation_les1',
                project: 'GLR',
                slideIndex: 1,
                title: testTitleGlr,
                contentHtml: testContentGlr
            });

            assert(glrSaveRes.status === 200, 'GLR save response 200 OK');
            assert(glrSaveRes.data.success === true, 'GLR save success');

            const glrUpdated = fs.readFileSync(glrFilePath, 'utf8');
            assert(glrUpdated.includes(testTitleGlr), 'Updated title present in GLR HTML file');

            // Reset GLR slide
            console.log('Restoring GLR slide 1...');
            const glrResetRes = await apiRequest('POST', '/api/reset-slide', {
                deck: 'IX/presentation_les1',
                project: 'GLR',
                slideIndex: 1
            });
            assert(glrResetRes.status === 200, 'GLR reset response 200 OK');

            const glrRestored = fs.readFileSync(glrFilePath, 'utf8');
            assert(glrRestored.includes(glrOriginalTitle), 'Original GLR title restored');
        } else {
            console.log('  [SKIP] GLR directory not present at expected path.');
        }

        console.log('\n================================================================');
        console.log(`E2E VERIFICATION COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
        console.log('================================================================\n');
    } catch (e) {
        console.error('\nE2E VERIFICATION ENCOUNTERED AN ERROR:\n', e);
    } finally {
        serverProc.kill();
    }
}

testAll();
