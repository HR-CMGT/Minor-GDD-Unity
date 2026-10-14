// HR Presentation Suite - Universal Multi-Deck Persistence Server
// Provides static file serving, multi-deck discovery, and direct-to-disk atomic persistence API.
// Supports ANY presentation in CMGT (/Users/hichambendriss/Desktop/CMGT/) AND GLR (/Users/hichambendriss/Desktop/GLR/).
// Zero external dependencies, pure Node.js.
// Strictly local-only development tool.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const child_process = require('child_process');

// Determine port from CLI flags, env, or default 3333
let PORT = 3333;
process.argv.forEach(arg => {
    if (arg.startsWith('--port=')) {
        const p = parseInt(arg.replace('--port=', ''), 10);
        if (!isNaN(p)) PORT = p;
    }
});
if (process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) PORT = p;
}

// Canonical Root Directories
const CMGT_ROOT = path.resolve(__dirname, '..');
const GLR_ROOT = (function() {
    // Check standard desktop location, sibling directory, or env
    const candidates = [
        process.env.GLR_ROOT,
        path.resolve(CMGT_ROOT, '../GLR'),
        '/Users/hichambendriss/Desktop/GLR'
    ].filter(Boolean);
    for (const c of candidates) {
        if (fs.existsSync(c)) return path.resolve(c);
    }
    return path.resolve(CMGT_ROOT, '../GLR');
})();

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.md': 'text/markdown; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

// ============================================================================
// 1. Balanced-Bracket Slide Array Parser (Zero Regex Backreference Bugs)
// ============================================================================
function findSlidesBounds(code) {
    if (!code || typeof code !== 'string') return null;
    const varRegex = /(?:let|const|var)\s+(slidesData|slides)\s*=\s*(\[)/g;
    let match = varRegex.exec(code);
    if (!match) return null;

    const startIndex = match.index + match[0].length - 1; // index of '['
    let depth = 0;
    let inString = null;
    let inComment = null;
    let i = startIndex;

    while (i < code.length) {
        const ch = code[i];
        const next = code[i + 1];

        if (inComment === '//') {
            if (ch === '\n') inComment = null;
            i++;
            continue;
        }
        if (inComment === '/*') {
            if (ch === '*' && next === '/') {
                inComment = null;
                i += 2;
                continue;
            }
            i++;
            continue;
        }

        if (inString) {
            if (ch === '\\') {
                i += 2;
                continue;
            }
            if (ch === inString) {
                inString = null;
            }
            i++;
            continue;
        }

        // Check comment entry
        if (ch === '/' && next === '/') {
            inComment = '//';
            i += 2;
            continue;
        }
        if (ch === '/' && next === '*') {
            inComment = '/*';
            i += 2;
            continue;
        }
        // Check string entry
        if (ch === '"' || ch === "'" || ch === '`') {
            inString = ch;
            i++;
            continue;
        }

        // Bracket counting
        if (ch === '[') {
            depth++;
        } else if (ch === ']') {
            depth--;
            if (depth === 0) {
                // Found matching closing bracket
                return {
                    varName: match[1],
                    declarationStart: match.index,
                    arrayStart: startIndex,
                    arrayEnd: i + 1,
                    rawArray: code.slice(startIndex, i + 1)
                };
            }
        }
        i++;
    }
    return null;
}

// ============================================================================
// 2. Atomic Synchronous File Writer (Guarantees Zero Corruption on Interruption)
// ============================================================================
function atomicWriteFileSync(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tempPath, content, 'utf8');
    fs.renameSync(tempPath, filePath);
}

// ============================================================================
// 3. Multi-Deck Resolver (CMGT & GLR)
// ============================================================================
function resolveDeck(rawDeckName, projectHint) {
    if (!rawDeckName || typeof rawDeckName !== 'string') return null;

    let deck = rawDeckName.trim().replace(/^[\/\\]+/, '').replace(/[\/\\]+$/, '');
    let project = (projectHint || '').toUpperCase();

    // Check explicit project prefixes in deck name
    if (deck.startsWith('CMGT/')) {
        project = 'CMGT';
        deck = deck.substring(5);
    } else if (deck.startsWith('GLR/')) {
        project = 'GLR';
        deck = deck.substring(4);
    }

    // Try resolving in CMGT
    if (!project || project === 'CMGT') {
        const candidateDir = path.join(CMGT_ROOT, deck);
        if (fs.existsSync(candidateDir) && fs.statSync(candidateDir).isDirectory()) {
            return collectDeckDetails(CMGT_ROOT, 'CMGT', deck, candidateDir);
        }
        // Try stripping .html if a file was passed
        const cleaned = deck.replace(/\.html$/i, '');
        const candidateDir2 = path.join(CMGT_ROOT, cleaned);
        if (fs.existsSync(candidateDir2) && fs.statSync(candidateDir2).isDirectory()) {
            return collectDeckDetails(CMGT_ROOT, 'CMGT', cleaned, candidateDir2);
        }
    }

    // Try resolving in GLR
    if (!project || project === 'GLR') {
        if (fs.existsSync(GLR_ROOT)) {
            // Check direct track folder (e.g. IX, Immersive design)
            const parts = deck.split(/[\/\\]/);
            const trackFolder = parts[0];
            const candidateDir = path.join(GLR_ROOT, trackFolder);
            if (fs.existsSync(candidateDir) && fs.statSync(candidateDir).isDirectory()) {
                const specificFile = parts[1] ? (parts[1].endsWith('.html') ? parts[1] : parts[1] + '.html') : null;
                return collectGlrDeckDetails(GLR_ROOT, trackFolder, specificFile);
            }
        }
    }

    // Fuzzy matching: search in both roots for any matching directory or presentation file
    if (fs.existsSync(CMGT_ROOT)) {
        const cmgtEntries = fs.readdirSync(CMGT_ROOT);
        for (const e of cmgtEntries) {
            if (e.toLowerCase().includes(deck.toLowerCase()) && fs.statSync(path.join(CMGT_ROOT, e)).isDirectory()) {
                return collectDeckDetails(CMGT_ROOT, 'CMGT', e, path.join(CMGT_ROOT, e));
            }
        }
    }

    if (fs.existsSync(GLR_ROOT)) {
        const glrEntries = fs.readdirSync(GLR_ROOT);
        for (const e of glrEntries) {
            const p = path.join(GLR_ROOT, e);
            if (!e.startsWith('.') && fs.statSync(p).isDirectory()) {
                if (e.toLowerCase() === deck.toLowerCase()) {
                    return collectGlrDeckDetails(GLR_ROOT, e, null);
                }
            }
        }
    }

    return null;
}

function collectDeckDetails(root, projectName, deckName, deckDir) {
    const targetFiles = [];
    const indexHtml = path.join(deckDir, 'index.html');
    if (fs.existsSync(indexHtml)) targetFiles.push(indexHtml);

    // Collect presentation_*.html files
    const entries = fs.readdirSync(deckDir);
    entries.forEach(f => {
        if (f.startsWith('presentation_') && f.endsWith('.html')) {
            const p = path.join(deckDir, f);
            if (!targetFiles.includes(p)) targetFiles.push(p);
        }
    });

    // Check docs/ counterparts in CMGT
    if (projectName === 'CMGT') {
        const docsDeckDir = path.join(root, 'docs', deckName);
        if (fs.existsSync(docsDeckDir)) {
            const docsIndex = path.join(docsDeckDir, 'index.html');
            if (fs.existsSync(docsIndex) && !targetFiles.includes(docsIndex)) targetFiles.push(docsIndex);

            const docsEntries = fs.readdirSync(docsDeckDir);
            docsEntries.forEach(f => {
                if (f.startsWith('presentation_') && f.endsWith('.html')) {
                    const p = path.join(docsDeckDir, f);
                    if (!targetFiles.includes(p)) targetFiles.push(p);
                }
            });
        }
    }

    const generatorPath = path.join(deckDir, 'generate.js');
    const hasGenerator = fs.existsSync(generatorPath);

    const backupDir = path.join(root, '.deck_backups', deckName);

    return {
        found: true,
        project: projectName,
        deckId: deckName,
        deckDir: deckDir,
        targetFiles: targetFiles,
        generatorPath: hasGenerator ? generatorPath : null,
        backupDir: backupDir
    };
}

function collectGlrDeckDetails(root, trackFolder, specificFile) {
    const trackDir = path.join(root, trackFolder);
    const targetFiles = [];

    if (specificFile) {
        const target = path.join(trackDir, specificFile);
        if (fs.existsSync(target)) targetFiles.push(target);
    } else {
        const entries = fs.readdirSync(trackDir);
        entries.forEach(f => {
            if (f.startsWith('presentation_') && f.endsWith('.html')) {
                targetFiles.push(path.join(trackDir, f));
            }
        });
        if (targetFiles.length === 0) {
            const indexHtml = path.join(trackDir, 'index.html');
            if (fs.existsSync(indexHtml)) targetFiles.push(indexHtml);
        }
    }

    const canonicalId = specificFile ? `${trackFolder}/${specificFile.replace(/\.html$/i, '')}` : trackFolder;
    const backupDir = path.join(root, '.deck_backups', trackFolder);

    return {
        found: true,
        project: 'GLR',
        deckId: canonicalId,
        deckDir: trackDir,
        targetFiles: targetFiles,
        generatorPath: null,
        backupDir: backupDir
    };
}

// ============================================================================
// 4. Timestamped Backup Engine
// ============================================================================
function createBackup(deckInfo, action, slideIndex, metadata = {}) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupSnapshotDir = path.join(deckInfo.backupDir, timestamp);
        fs.mkdirSync(backupSnapshotDir, { recursive: true });

        const backedUpFiles = [];

        // Backup generator if present
        if (deckInfo.generatorPath && fs.existsSync(deckInfo.generatorPath)) {
            const dest = path.join(backupSnapshotDir, 'generate.js');
            fs.copyFileSync(deckInfo.generatorPath, dest);
            backedUpFiles.push('generate.js');
        }

        // Backup all target HTML files
        deckInfo.targetFiles.forEach(srcPath => {
            if (fs.existsSync(srcPath)) {
                const relName = path.relative(deckInfo.deckDir, srcPath).replace(/[\/\\]/g, '_');
                const dest = path.join(backupSnapshotDir, relName);
                fs.copyFileSync(srcPath, dest);
                backedUpFiles.push(relName);
            }
        });

        const manifest = {
            timestamp: timestamp,
            isoTime: new Date().toISOString(),
            action: action,
            deckId: deckInfo.deckId,
            project: deckInfo.project,
            slideIndex: typeof slideIndex === 'number' ? slideIndex : null,
            backedUpFiles: backedUpFiles,
            metadata: metadata
        };

        fs.writeFileSync(path.join(backupSnapshotDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
        return {
            backupDir: backupSnapshotDir,
            timestamp: timestamp,
            files: backedUpFiles
        };
    } catch (err) {
        console.error('[BACKUP ERROR] Failed to create backup:', err.message);
        return null;
    }
}

// ============================================================================
// 5. Deck Scanning & Status Engine
// ============================================================================
function scanAllDecks() {
    const decks = [];

    // 1. Scan CMGT
    if (fs.existsSync(CMGT_ROOT)) {
        try {
            const entries = fs.readdirSync(CMGT_ROOT, { withFileTypes: true });
            for (const e of entries) {
                if (e.isDirectory() && (e.name.startsWith('presentation_') || e.name === 'presentations')) {
                    const deckDir = path.join(CMGT_ROOT, e.name);
                    const hasGen = fs.existsSync(path.join(deckDir, 'generate.js'));
                    const htmlFiles = fs.readdirSync(deckDir).filter(f => f.endsWith('.html'));

                    let title = e.name;
                    let slideCount = 0;

                    // Extract title and slide count from index.html or generate.js
                    const sampleFile = hasGen ? path.join(deckDir, 'generate.js') : (htmlFiles.length > 0 ? path.join(deckDir, htmlFiles[0]) : null);
                    if (sampleFile && fs.existsSync(sampleFile)) {
                        try {
                            const content = fs.readFileSync(sampleFile, 'utf8');
                            const bounds = findSlidesBounds(content);
                            if (bounds) {
                                const arr = Function('return ' + bounds.rawArray)();
                                slideCount = arr.length;
                                if (arr[0] && arr[0].title) title = arr[0].title;
                            }
                        } catch (ex) {}
                    }

                    decks.push({
                        id: e.name,
                        project: 'CMGT',
                        title: title,
                        slideCount: slideCount,
                        hasGenerator: hasGen,
                        htmlFiles: htmlFiles,
                        relativeDir: e.name
                    });
                }
            }
        } catch (ex) {
            console.error('[SCAN ERROR CMGT]', ex.message);
        }
    }

    // 2. Scan GLR
    if (fs.existsSync(GLR_ROOT)) {
        try {
            const entries = fs.readdirSync(GLR_ROOT, { withFileTypes: true });
            for (const e of entries) {
                if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'scripts') {
                    const trackDir = path.join(GLR_ROOT, e.name);
                    const htmlFiles = fs.readdirSync(trackDir).filter(f => f.startsWith('presentation_') && f.endsWith('.html'));
                    htmlFiles.forEach(f => {
                        const filePath = path.join(trackDir, f);
                        let title = `${e.name} • ${f.replace('.html', '')}`;
                        let slideCount = 0;
                        try {
                            const content = fs.readFileSync(filePath, 'utf8');
                            const bounds = findSlidesBounds(content);
                            if (bounds) {
                                const arr = Function('return ' + bounds.rawArray)();
                                slideCount = arr.length;
                                if (arr[0] && arr[0].title) title = arr[0].title;
                            }
                        } catch (ex) {}

                        decks.push({
                            id: `${e.name}/${f.replace('.html', '')}`,
                            file: `${e.name}/${f}`,
                            project: 'GLR',
                            title: title,
                            slideCount: slideCount,
                            hasGenerator: false,
                            htmlFiles: [f],
                            relativeDir: e.name
                        });
                    });
                }
            }
        } catch (ex) {
            console.error('[SCAN ERROR GLR]', ex.message);
        }
    }

    return decks;
}

// ============================================================================
// 6. Direct-to-Disk Slide Saving Engine
// ============================================================================
function updateSlideInCode(code, slideIndex, updateData) {
    const bounds = findSlidesBounds(code);
    if (!bounds) return { success: false, reason: 'slides array declaration not found' };

    let slidesArray;
    try {
        slidesArray = Function('return ' + bounds.rawArray)();
    } catch (e) {
        return { success: false, reason: `failed to parse slides: ${e.message}` };
    }

    if (!Array.isArray(slidesArray)) {
        return { success: false, reason: 'parsed slides is not an array' };
    }

    if (slideIndex < 0 || slideIndex >= slidesArray.length) {
        return { success: false, reason: `slideIndex ${slideIndex} out of bounds (length: ${slidesArray.length})` };
    }

    const slide = slidesArray[slideIndex];
    if (updateData.contentHtml !== undefined) {
        if ('contentHtml' in slide) {
            slide.contentHtml = updateData.contentHtml;
        } else {
            slide.content = updateData.contentHtml;
        }
    }
    if (updateData.title !== undefined && updateData.title !== null) {
        slide.title = updateData.title;
    }
    if (updateData.notes !== undefined && updateData.notes !== null) {
        slide.notes = updateData.notes;
    }
    if (updateData.subtitle !== undefined && updateData.subtitle !== null) {
        slide.subtitle = updateData.subtitle;
    }

    // Replace array via safe string slicing (ZERO regex backreference bug)
    const newArrayString = JSON.stringify(slidesArray, null, 2);
    const updatedCode = code.slice(0, bounds.arrayStart) + newArrayString + code.slice(bounds.arrayEnd);

    return {
        success: true,
        updatedCode: updatedCode,
        slidesArray: slidesArray
    };
}

function handleSaveSlide(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { deck, slideIndex, title, contentHtml, notes, subtitle, project } = data;

            if (!deck || typeof slideIndex !== 'number' || contentHtml === undefined) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing required parameters: deck, slideIndex, or contentHtml' }));
                return;
            }

            const deckInfo = resolveDeck(deck, project);
            if (!deckInfo) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Deck '${deck}' could not be resolved in CMGT or GLR` }));
                return;
            }

            console.log(`[SAVE] Incoming edit for Deck: ${deckInfo.deckId} (${deckInfo.project}), Slide: ${slideIndex + 1}`);

            // 1. Create Timestamped Backup Before Overwriting
            const backupResult = createBackup(deckInfo, 'save-slide', slideIndex, { title, slideIndex });

            const updatedPaths = [];
            let updatedCount = 0;

            // 2. If Deck has generate.js, update generate.js and run generator
            if (deckInfo.generatorPath && fs.existsSync(deckInfo.generatorPath)) {
                try {
                    const genContent = fs.readFileSync(deckInfo.generatorPath, 'utf8');
                    const genUpdate = updateSlideInCode(genContent, slideIndex, { title, contentHtml, notes, subtitle });

                    if (genUpdate.success) {
                        atomicWriteFileSync(deckInfo.generatorPath, genUpdate.updatedCode);
                        updatedCount++;
                        updatedPaths.push(path.relative(CMGT_ROOT, deckInfo.generatorPath));

                        // Execute generator to synchronously build and write all target HTML files
                        try {
                            console.log(`[GENERATOR] Running ${deckInfo.generatorPath}...`);
                            child_process.execFileSync(process.execPath, [deckInfo.generatorPath], {
                                cwd: deckInfo.project === 'GLR' ? GLR_ROOT : CMGT_ROOT,
                                stdio: 'pipe',
                                timeout: 15000
                            });
                            console.log(`[GENERATOR SUCCESS] Regenerated presentation HTML files.`);
                        } catch (genErr) {
                            console.error('[GENERATOR ERROR] Failed executing generate.js:', genErr.message);
                        }
                    } else {
                        console.warn(`[WARN] Failed updating generate.js: ${genUpdate.reason}`);
                    }
                } catch (genErr) {
                    console.error('[ERROR] Failed processing generate.js:', genErr.message);
                }
            }

            // 3. Atomically update target HTML files
            deckInfo.targetFiles.forEach(filePath => {
                if (!fs.existsSync(filePath)) return;
                try {
                    const htmlContent = fs.readFileSync(filePath, 'utf8');
                    const htmlUpdate = updateSlideInCode(htmlContent, slideIndex, { title, contentHtml, notes, subtitle });

                    if (htmlUpdate.success) {
                        atomicWriteFileSync(filePath, htmlUpdate.updatedCode);
                        updatedCount++;
                        const rel = path.relative(deckInfo.project === 'GLR' ? GLR_ROOT : CMGT_ROOT, filePath);
                        if (!updatedPaths.includes(rel)) updatedPaths.push(rel);
                    } else {
                        console.warn(`[WARN] Skipping ${filePath}: ${htmlUpdate.reason}`);
                    }
                } catch (err) {
                    console.error(`[ERROR] Failed updating ${filePath}:`, err.message);
                }
            });

            console.log(`[SUCCESS] Slide ${slideIndex + 1} written directly to ${updatedCount} files:`);
            updatedPaths.forEach(p => console.log(`  -> ${p}`));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: `Slide ${slideIndex + 1} opgeslagen in ${updatedCount} bestanden op schijf.`,
                deck: deckInfo.deckId,
                project: deckInfo.project,
                slideIndex: slideIndex,
                updatedFiles: updatedPaths,
                backup: backupResult ? backupResult.timestamp : null
            }));
        } catch (e) {
            console.error('[ERROR] Malformed JSON in save-slide:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
}

// ============================================================================
// 7. Complete Deck Saving Engine
// ============================================================================
function handleSaveDeck(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { deck, slides, project } = data;

            if (!deck || !Array.isArray(slides)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing deck or slides array' }));
                return;
            }

            const deckInfo = resolveDeck(deck, project);
            if (!deckInfo) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Deck '${deck}' could not be resolved` }));
                return;
            }

            // Create timestamped backup before bulk save
            const backupResult = createBackup(deckInfo, 'save-deck', null, { slideCount: slides.length });

            const updatedPaths = [];
            let updatedCount = 0;

            function replaceFullSlides(code) {
                const bounds = findSlidesBounds(code);
                if (!bounds) return null;
                const newArrayString = JSON.stringify(slides, null, 2);
                return code.slice(0, bounds.arrayStart) + newArrayString + code.slice(bounds.arrayEnd);
            }

            // Update generate.js if exists
            if (deckInfo.generatorPath && fs.existsSync(deckInfo.generatorPath)) {
                try {
                    const genContent = fs.readFileSync(deckInfo.generatorPath, 'utf8');
                    const updatedGen = replaceFullSlides(genContent);
                    if (updatedGen) {
                        atomicWriteFileSync(deckInfo.generatorPath, updatedGen);
                        updatedCount++;
                        updatedPaths.push(path.relative(CMGT_ROOT, deckInfo.generatorPath));

                        // Execute generator
                        try {
                            child_process.execFileSync(process.execPath, [deckInfo.generatorPath], {
                                cwd: deckInfo.project === 'GLR' ? GLR_ROOT : CMGT_ROOT,
                                stdio: 'pipe',
                                timeout: 15000
                            });
                        } catch (genErr) {
                            console.error('[GENERATOR ERROR]', genErr.message);
                        }
                    }
                } catch (e) {
                    console.error('[ERROR] Failed updating generate.js:', e.message);
                }
            }

            // Update HTML files directly
            deckInfo.targetFiles.forEach(filePath => {
                if (!fs.existsSync(filePath)) return;
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const updated = replaceFullSlides(content);
                    if (updated) {
                        atomicWriteFileSync(filePath, updated);
                        updatedCount++;
                        const rel = path.relative(deckInfo.project === 'GLR' ? GLR_ROOT : CMGT_ROOT, filePath);
                        if (!updatedPaths.includes(rel)) updatedPaths.push(rel);
                    }
                } catch (e) {
                    console.error(`[ERROR] Failed bulk update on ${filePath}:`, e.message);
                }
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: `Compleet deck '${deckInfo.deckId}' opgeslagen in ${updatedCount} bestanden.`,
                deck: deckInfo.deckId,
                updatedFiles: updatedPaths,
                backup: backupResult ? backupResult.timestamp : null
            }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
}

// ============================================================================
// 8. Slide Reset & Restoration Engine
// ============================================================================
function handleResetSlide(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { deck, slideIndex, project, backupTimestamp } = data;

            if (!deck || typeof slideIndex !== 'number') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing deck or slideIndex' }));
                return;
            }

            const deckInfo = resolveDeck(deck, project);
            if (!deckInfo) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Deck '${deck}' could not be resolved` }));
                return;
            }

            // Check backups directory
            if (!fs.existsSync(deckInfo.backupDir)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Geen backups gevonden voor deck '${deckInfo.deckId}'` }));
                return;
            }

            const backups = fs.readdirSync(deckInfo.backupDir)
                .filter(b => fs.statSync(path.join(deckInfo.backupDir, b)).isDirectory())
                .sort(); // Lexicographical sort (oldest to newest)

            if (backups.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Backup map is leeg' }));
                return;
            }

            // If backupTimestamp is specified, find it, otherwise pick the earliest (original baseline) or most recent
            let chosenBackup = backupTimestamp ? backups.find(b => b === backupTimestamp) : backups[0];
            if (!chosenBackup) chosenBackup = backups[0];

            const chosenBackupDir = path.join(deckInfo.backupDir, chosenBackup);
            console.log(`[RESET] Restoring slide ${slideIndex + 1} from backup snapshot: ${chosenBackup}`);

            // Find sample file in backup snapshot to extract original slide
            const backupFiles = fs.readdirSync(chosenBackupDir);
            let restoredSlide = null;

            for (const bf of backupFiles) {
                if (bf.endsWith('.html') || bf === 'generate.js') {
                    try {
                        const content = fs.readFileSync(path.join(chosenBackupDir, bf), 'utf8');
                        const bounds = findSlidesBounds(content);
                        if (bounds) {
                            const arr = Function('return ' + bounds.rawArray)();
                            if (arr && arr[slideIndex]) {
                                restoredSlide = arr[slideIndex];
                                break;
                            }
                        }
                    } catch (e) {}
                }
            }

            if (!restoredSlide) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Slide ${slideIndex + 1} niet gevonden in backup snapshot ${chosenBackup}` }));
                return;
            }

            // Save restored slide back to current deck files
            const contentHtml = restoredSlide.contentHtml !== undefined ? restoredSlide.contentHtml : (restoredSlide.content || '');
            const title = restoredSlide.title || '';
            const notes = restoredSlide.notes || '';

            // Create pre-reset backup
            createBackup(deckInfo, 'pre-reset-safety', slideIndex);

            // Update files
            const updatedPaths = [];
            let updatedCount = 0;

            if (deckInfo.generatorPath && fs.existsSync(deckInfo.generatorPath)) {
                try {
                    const genContent = fs.readFileSync(deckInfo.generatorPath, 'utf8');
                    const genUpdate = updateSlideInCode(genContent, slideIndex, { title, contentHtml, notes });
                    if (genUpdate.success) {
                        atomicWriteFileSync(deckInfo.generatorPath, genUpdate.updatedCode);
                        updatedCount++;
                        updatedPaths.push(path.relative(CMGT_ROOT, deckInfo.generatorPath));
                        child_process.execFileSync(process.execPath, [deckInfo.generatorPath], {
                            cwd: deckInfo.project === 'GLR' ? GLR_ROOT : CMGT_ROOT,
                            stdio: 'pipe',
                            timeout: 15000
                        });
                    }
                } catch (e) {}
            }

            deckInfo.targetFiles.forEach(filePath => {
                if (!fs.existsSync(filePath)) return;
                try {
                    const htmlContent = fs.readFileSync(filePath, 'utf8');
                    const htmlUpdate = updateSlideInCode(htmlContent, slideIndex, { title, contentHtml, notes });
                    if (htmlUpdate.success) {
                        atomicWriteFileSync(filePath, htmlUpdate.updatedCode);
                        updatedCount++;
                        const rel = path.relative(deckInfo.project === 'GLR' ? GLR_ROOT : CMGT_ROOT, filePath);
                        if (!updatedPaths.includes(rel)) updatedPaths.push(rel);
                    }
                } catch (e) {}
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: `Slide ${slideIndex + 1} succesvol hersteld vanuit backup snapshot ${chosenBackup}.`,
                restoredSlide: restoredSlide,
                updatedFiles: updatedPaths
            }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
}

// ============================================================================
// 9. HTTP Server & Static File Router
// ============================================================================
const server = http.createServer((req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const host = req.headers.host || `127.0.0.1:${PORT}`;
    const parsedUrl = new URL(req.url, `http://${host}`);
    const pathname = parsedUrl.pathname;

    // --- API Routes ---
    if (pathname === '/api/status' && (req.method === 'GET' || req.method === 'HEAD')) {
        const decks = scanAllDecks();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            server: 'Universal HR Slide Edit Server',
            version: '2.1.0',
            port: PORT,
            roots: {
                CMGT: CMGT_ROOT,
                GLR: GLR_ROOT
            },
            decks: decks
        }, null, 2));
        return;
    }

    if (pathname === '/api/save-slide' && req.method === 'POST') {
        handleSaveSlide(req, res);
        return;
    }

    if (pathname === '/api/save-deck' && req.method === 'POST') {
        handleSaveDeck(req, res);
        return;
    }

    if (pathname === '/api/reset-slide' && req.method === 'POST') {
        handleResetSlide(req, res);
        return;
    }

    // --- Static File Serving ---
    let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';

    let filePath;

    // Route /GLR/... requests directly to GLR_ROOT
    if (safePath.startsWith('/GLR/') || safePath === '/GLR') {
        const sub = safePath.replace(/^\/GLR\/?/, '');
        filePath = path.join(GLR_ROOT, sub || 'index.html');
    } else if (safePath.startsWith('/CMGT/') || safePath === '/CMGT') {
        const sub = safePath.replace(/^\/CMGT\/?/, '');
        filePath = path.join(CMGT_ROOT, sub || 'index.html');
    } else {
        // Default to CMGT_ROOT; if not found, check GLR_ROOT
        const cmgtPath = path.join(CMGT_ROOT, safePath);
        if (fs.existsSync(cmgtPath)) {
            filePath = cmgtPath;
        } else {
            const glrPath = path.join(GLR_ROOT, safePath);
            if (fs.existsSync(glrPath)) {
                filePath = glrPath;
            } else {
                filePath = cmgtPath;
            }
        }
    }

    // If directory, look for index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${pathname}`);
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log('===========================================================');
    console.log(`Universal HR Slide Edit Server active at: http://127.0.0.1:${PORT}/`);
    console.log(`CMGT Root: ${CMGT_ROOT}`);
    console.log(`GLR Root:  ${GLR_ROOT}`);
    console.log('API Endpoints:');
    console.log('  GET  /api/status');
    console.log('  POST /api/save-slide');
    console.log('  POST /api/save-deck');
    console.log('  POST /api/reset-slide');
    console.log('Atomic direct-to-disk persistence with .deck_backups/ enabled.');
    console.log('===========================================================');
});
