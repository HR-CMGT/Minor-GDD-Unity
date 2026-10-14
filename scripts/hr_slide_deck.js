/**
 * HR & GLR Unified Slide Deck Engine (SlideDeck v2.0)
 * Reusable core library powering all presentation slide decks across:
 * - Hogeschool Rotterdam (HR / CMGT)
 * - Grafisch Lyceum Rotterdam (GLR / IX & Immersive Design)
 * 
 * Features:
 * - Unified Declarative Engine (HTML only holds pure slide data & images)
 * - Strict 16:9 Viewport Containment in Lecture / Hoorcollege Mode
 * - Practicum / Lab Mode with 5-part Deepdive Study Panels
 * - Authentic JetBrains Rider / Unity C# Syntax Highlighting
 * - Full Integration with DeckEditor (Drag, Snap, macOS Cmd+Z Undo, Disk Sync)
 * - Zero Emoji, High-Contrast Academic Design System
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        factory(exports);
    } else {
        factory((root.SlideDeck = {}));
    }
}(typeof self !== 'undefined' ? self : this, function (exports) {
    'use strict';

    // State
    const state = {
        theme: 'glr',
        trackTitle: '',
        lessonNumber: 1,
        lessonTitle: '',
        prevLessonUrl: null,
        nextLessonUrl: null,
        overviewUrl: 'index.html',
        slides: [],
        currentSlide: 0,
        viewMode: 'lab', // 'lab' or 'projector'
        fontScale: 100,
        isNotesOpen: false,
        isHelpOpen: false,
        timerSeconds: 0,
        timerRunning: false,
        timerInterval: null
    };

    // Safe LocalStorage helpers
    function safeGet(key, fallback) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const val = localStorage.getItem(key);
                return val !== null ? val : fallback;
            }
        } catch (e) {}
        return fallback;
    }

    function safeSet(key, val) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(key, val);
            }
        } catch (e) {}
    }

    // ========================================================================
    // 1. Core JetBrains Rider / Unity C# Syntax Highlighting Helper
    // ========================================================================
    function highlightCSharpCode(code) {
        if (!code || typeof code !== 'string') return '';

        // If DeckEditor is loaded, leverage its full tokenization engine
        if (typeof window !== 'undefined' && window.DeckEditor && typeof window.DeckEditor.highlightCSharp === 'function') {
            return window.DeckEditor.highlightCSharp(code);
        }

        const keywords = new Set([
            'using', 'namespace', 'public', 'private', 'protected', 'internal',
            'static', 'readonly', 'const', 'class', 'struct', 'interface', 'enum',
            'void', 'int', 'float', 'double', 'bool', 'string', 'char', 'byte',
            'long', 'short', 'object', 'var', 'new', 'return', 'if', 'else',
            'switch', 'case', 'default', 'for', 'foreach', 'in', 'while', 'do',
            'break', 'continue', 'goto', 'try', 'catch', 'finally', 'throw',
            'true', 'false', 'null', 'this', 'base', 'typeof', 'sizeof', 'is',
            'as', 'override', 'virtual', 'abstract', 'async', 'await'
        ]);

        const unityTypes = new Set([
            'MonoBehaviour', 'ScriptableObject', 'GameObject', 'Transform',
            'Component', 'Vector2', 'Vector3', 'Vector4', 'Quaternion', 'Matrix4x4',
            'Color', 'Color32', 'Mathf', 'Time', 'Input', 'Camera', 'Light',
            'Rigidbody', 'Rigidbody2D', 'Collider', 'Collider2D', 'BoxCollider',
            'SphereCollider', 'CapsuleCollider', 'MeshCollider', 'CharacterController',
            'NavMeshAgent', 'NavMeshSurface', 'NavMeshObstacle', 'RaycastHit',
            'AudioSource', 'AudioClip', 'Canvas', 'UnityEvent', 'InputValue'
        ]);

        let result = '';
        let i = 0;
        const len = code.length;

        while (i < len) {
            // Comments
            if (code[i] === '/' && code[i + 1] === '/') {
                let end = code.indexOf('\n', i);
                if (end === -1) end = len;
                const comment = code.slice(i, end).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                result += '<span class="jb-comment">' + comment + '</span>';
                i = end;
                continue;
            }

            // Strings
            if (code[i] === '"') {
                let end = i + 1;
                while (end < len && code[end] !== '"') {
                    if (code[end] === '\\') end++;
                    end++;
                }
                if (end < len) end++;
                const str = code.slice(i, end).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                result += '<span class="jb-string">' + str + '</span>';
                i = end;
                continue;
            }

            // Attributes: [SerializeField]
            if (code[i] === '[') {
                let end = code.indexOf(']', i);
                if (end !== -1 && !code.slice(i, end).includes('\n')) {
                    const attr = code.slice(i, end + 1).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    result += '<span class="jb-attr">' + attr + '</span>';
                    i = end + 1;
                    continue;
                }
            }

            // Identifiers / Words
            if (/[a-zA-Z_]/.test(code[i])) {
                let start = i;
                while (i < len && /[a-zA-Z0-9_]/.test(code[i])) i++;
                const word = code.slice(start, i);

                // Check if followed by '(' -> Method
                let nextIdx = i;
                while (nextIdx < len && (code[nextIdx] === ' ' || code[nextIdx] === '\t')) nextIdx++;
                const isMethod = code[nextIdx] === '(' && !keywords.has(word);

                if (keywords.has(word)) {
                    result += '<span class="jb-keyword">' + word + '</span>';
                } else if (unityTypes.has(word)) {
                    result += '<span class="jb-type">' + word + '</span>';
                } else if (isMethod) {
                    result += '<span class="jb-method">' + word + '</span>';
                } else {
                    result += word;
                }
                continue;
            }

            // Numbers
            if (/[0-9]/.test(code[i])) {
                let start = i;
                while (i < len && /[0-9\.fFmMlL]/.test(code[i])) i++;
                result += '<span class="jb-number">' + code.slice(start, i) + '</span>';
                continue;
            }

            // HTML escape special characters
            if (code[i] === '<') result += '&lt;';
            else if (code[i] === '>') result += '&gt;';
            else if (code[i] === '&') result += '&amp;';
            else result += code[i];
            i++;
        }

        return result;
    }

    // ========================================================================
    // 2. DOM Injection & Shell Setup
    // ========================================================================
    function buildDomShell() {
        if (typeof document === 'undefined') return;

        // Apply theme attribute to body
        document.body.setAttribute('data-theme', state.theme);
        if (state.theme === 'glr') {
            document.body.classList.add('theme-glr');
            document.body.classList.remove('theme-hr');
        } else {
            document.body.classList.add('theme-hr');
            document.body.classList.remove('theme-glr');
        }

        // Apply viewmode class
        if (state.viewMode === 'projector') {
            document.body.classList.add('projector-mode', 'lecture-mode');
            document.body.classList.remove('lab-mode');
        } else {
            document.body.classList.add('lab-mode');
            document.body.classList.remove('projector-mode', 'lecture-mode');
        }

        // If stage area already exists, skip creating the shell
        if (document.getElementById('viewInteractive')) return;

        // Brand logo markup
        const logoMarkup = state.theme === 'glr' ? `
            <div class="glr-logo">
                <div>GRAFISCH<br>LYCEUM</div>
                <div class="glr-logo-green-bar"></div>
                <div>ROTTERDAM</div>
            </div>
        ` : `
            <div class="hr-logo">
                <span class="hr-logo-badge">HR</span>
                <span>Hogeschool Rotterdam</span>
            </div>
        `;

        document.body.innerHTML = `
            <!-- Top Bar (52px) -->
            <header class="top-bar">
                <div class="brand-cluster">
                    ${logoMarkup}
                    <div class="brand-text">
                        <h1 id="deckTrackTitle">${escapeHtml(state.trackTitle)}</h1>
                        <p id="deckLessonSubtitle">Les ${state.lessonNumber}: ${escapeHtml(state.lessonTitle)}</p>
                    </div>
                </div>

                <div class="top-right-actions">
                    <button class="action-pill" id="btnEditToggle" title="Bewerken Modus [E]">
                        Bewerken <kbd>[E]</kbd>
                    </button>
                    <button class="action-pill" id="btnHelpToggle" title="Sneltoetsen [?]">
                        Help <kbd>[?]</kbd>
                    </button>
                    <a href="${state.overviewUrl}" class="action-pill" title="Terug naar overzicht">
                        Overzicht
                    </a>
                </div>
            </header>

            <!-- Main Workspace: Drawer on Left + 16:9 Stage Area on Right -->
            <main class="main-workspace">
                <!-- Slide Thumbnails Drawer (Left) -->
                <aside class="slide-drawer" id="slideDrawer" aria-label="Slide miniaturen"></aside>

                <!-- Stage Area (Right) -->
                <div class="stage-area">
                    <div class="slide-viewport" id="slideViewport">
                        <!-- Top Line Progress Bar -->
                        <div class="deck-progress-bar" id="deckProgressBar"></div>

                        <!-- View Interactive Container -->
                        <div class="view-interactive" id="viewInteractive"></div>
                    </div>
                </div>
            </main>

            <!-- Bottom Navigation Bar (48px) -->
            <footer class="bottom-nav">
                <div class="nav-cluster-left">
                    <button class="nav-btn" id="btnPrevSlide" title="Vorige slide [← / PageUp]">
                        <span>&larr;</span> Vorige
                    </button>
                    <button class="nav-btn" id="btnNextSlide" title="Volgende slide [→ / Spatie / PageDown]">
                        Volgende <span>&rarr;</span>
                    </button>
                    <div class="slide-counter" id="slideCounter">Slide 01 / 01</div>
                </div>

                <div class="nav-cluster-center">
                    <div class="viewmode-toggle">
                        <button class="viewmode-btn ${state.viewMode === 'projector' ? 'active' : ''}" id="btnModeLecture" title="Hoorcollege Modus [L]">
                            Hoorcollege
                        </button>
                        <button class="viewmode-btn ${state.viewMode === 'lab' ? 'active' : ''}" id="btnModeLab" title="Practicum Modus [P]">
                            Practicum
                        </button>
                    </div>
                </div>

                <div class="nav-cluster-right">
                    <button class="nav-btn" id="btnNotesToggle" title="Docent Notities [N]">
                        Notities <kbd>[N]</kbd>
                    </button>
                    <div class="lecture-scale-wrap" title="Presentatie Timer [Klik om te pauzeren]">
                        <span class="lecture-scale-label">Timer</span>
                        <span class="lecture-scale-val" id="deckTimerVal" style="cursor: pointer;">00:00</span>
                    </div>
                    <div class="lecture-scale-wrap">
                        <span class="lecture-scale-label">Tekst</span>
                        <input type="range" class="lecture-scale-slider" id="lectureFontSlider" min="80" max="180" value="${state.fontScale}" step="5">
                        <span class="lecture-scale-val" id="lectureScaleVal">${state.fontScale}%</span>
                    </div>
                    <button class="nav-btn" id="btnFullscreen" title="Volledig scherm [F]">
                        Fullscreen <kbd>[F]</kbd>
                    </button>
                </div>
            </footer>

            <!-- Help Modal -->
            <div class="modal-overlay" id="deckHelpModal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Sneltoetsen Overzicht</h3>
                        <button class="modal-close" id="btnHelpClose">&times;</button>
                    </div>
                    <div class="modal-content">
                        <table class="shortcuts-table">
                            <tr><td><kbd>&rarr;</kbd> / <kbd>Spatie</kbd> / <kbd>PageDown</kbd></td><td>Volgende slide</td></tr>
                            <tr><td><kbd>&larr;</kbd> / <kbd>Backspace</kbd> / <kbd>PageUp</kbd></td><td>Vorige slide</td></tr>
                            <tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>Eerste / Laatste slide</td></tr>
                            <tr><td><kbd>L</kbd></td><td>Wissel naar Hoorcollege (Lecture) modus</td></tr>
                            <tr><td><kbd>P</kbd></td><td>Wissel naar Practicum (Lab) modus</td></tr>
                            <tr><td><kbd>F</kbd></td><td>Volledig scherm in- / uitschakelen</td></tr>
                            <tr><td><kbd>N</kbd></td><td>Docent notities openen / sluiten</td></tr>
                            <tr><td><kbd>E</kbd></td><td>Bewerken Modus in- / uitschakelen</td></tr>
                            <tr><td><kbd>Cmd + Z</kbd> / <kbd>Ctrl + Z</kbd></td><td>Bewerking ongedaan maken (Undo)</td></tr>
                            <tr><td><kbd>Cmd + Shift + Z</kbd> / <kbd>Cmd + Y</kbd></td><td>Bewerking opnieuw uitvoeren (Redo)</td></tr>
                            <tr><td><kbd>S</kbd> (in bewerkmodus)</td><td>Magnetisch uitlijnen aan / uit</td></tr>
                            <tr><td><kbd>?</kbd></td><td>Dit helpvenster tonen</td></tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Notes Modal -->
            <div class="modal-overlay" id="deckNotesModal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 id="notesModalTitle">Docent Notities</h3>
                        <button class="modal-close" id="btnNotesClose">&times;</button>
                    </div>
                    <div class="modal-content" id="notesModalContent">
                        Geen notities beschikbaar voor deze slide.
                    </div>
                </div>
            </div>

            <!-- Toast Container -->
            <div class="glr-toast" id="deckToast"></div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ========================================================================
    // 3. Slide Content & Deepdive Rendering
    // ========================================================================
    function renderDeepdiveHtml(deepdive) {
        if (!deepdive) return '';
        if (typeof deepdive === 'string') return deepdive;

        let out = '<div class="glr-deepdive">';
        out += '<div class="glr-deepdive-header">';
        out += '<span class="glr-deepdive-title">Deepdive</span>';
        out += '<span class="glr-deepdive-badge">Practicum &amp; Onderzoek</span>';
        out += '</div>';

        if (deepdive.analogy) {
            out += '<div class="glr-deepdive-analogy">';
            out += '<div style="font-weight: 800; color: #10b981; margin-bottom: 2px;">Mentaal Model</div>';
            out += '<div>' + deepdive.analogy + '</div>';
            out += '</div>';
        }

        out += '<div class="glr-deepdive-grid">';
        if (deepdive.whatIsWhat) {
            out += '<div class="glr-deepdive-box">';
            out += '<div style="font-weight: 800; color: #38bdf8; margin-bottom: 2px;">Wat is Wat</div>';
            out += '<div>' + deepdive.whatIsWhat + '</div>';
            out += '</div>';
        }
        if (deepdive.differences) {
            out += '<div class="glr-deepdive-box">';
            out += '<div style="font-weight: 800; color: #facc15; margin-bottom: 2px;">Belangrijkste Verschillen</div>';
            out += '<div>' + deepdive.differences + '</div>';
            out += '</div>';
        }
        out += '</div>';

        if (deepdive.trap) {
            out += '<div class="glr-deepdive-trap">';
            out += '<div style="font-weight: 800; color: #ef4444; margin-bottom: 2px;">Valkuil &amp; Waarom het Fout Gaat</div>';
            out += '<div>' + deepdive.trap + '</div>';
            out += '</div>';
        }

        if (deepdive.rule) {
            out += '<div class="glr-deepdive-rule">';
            out += '<div style="font-weight: 800; color: #22c55e; margin-bottom: 2px;">Gouden Regel voor je Project</div>';
            out += '<div>' + deepdive.rule + '</div>';
            out += '</div>';
        }

        out += '</div>';
        return out;
    }

    function renderSlide(slideIdx) {
        if (typeof document === 'undefined') return;
        if (!state.slides || state.slides.length === 0) return;

        if (slideIdx < 0) slideIdx = 0;
        if (slideIdx >= state.slides.length) slideIdx = state.slides.length - 1;
        state.currentSlide = slideIdx;

        const slide = state.slides[slideIdx];
        const container = document.getElementById('viewInteractive');
        if (!container) return;

        // Reset scroll position
        container.scrollTop = 0;

        let html = '';

        if (slide.isHero) {
            const badgeText = state.theme === 'glr' ?
                'Grafisch Lyceum Rotterdam • MBO Game Dev' :
                'Hogeschool Rotterdam • CMGT';

            let topicsHtml = '';
            if (Array.isArray(slide.topics)) {
                topicsHtml = slide.topics.map(t => `<div class="hero-topic-card">${t}</div>`).join('');
            }

            html = `
                <div class="hero-layout" id="heroLayout">
                    <div class="hero-badge">${badgeText}</div>
                    <h2 class="hero-title">${slide.title || ''}</h2>
                    ${slide.subtitle ? `<div class="hero-subtitle">${slide.subtitle}</div>` : ''}
                    ${topicsHtml ? `<div class="hero-topics-grid">${topicsHtml}</div>` : ''}
                </div>
            `;
        } else {
            const categoryHtml = slide.category ? `<div class="slide-category">${escapeHtml(slide.category)}</div>` : '';
            const deepdiveHtml = renderDeepdiveHtml(slide.deepdive);

            html = `
                <div class="standard-layout">
                    <div class="slide-header">
                        ${categoryHtml}
                        <h2 class="slide-title">${slide.title || ''}</h2>
                    </div>
                    <div class="slide-content-area">
                        ${slide.contentHtml || slide.content || ''}
                    </div>
                    ${deepdiveHtml}
                </div>
            `;
        }

        container.innerHTML = html;

        // Auto-detect multi-column slides and ensure .has-columns class is present
        const contentArea = container.querySelector('.slide-content-area');
        if (contentArea && contentArea.querySelector('.content-col')) {
            contentArea.classList.add('has-columns');
        }

        // Apply slide-level relative font scale if configured or persisted
        const slideScale = slide.fontScale || slide['data-slide-font-scale'] ||
            (container.firstElementChild && (container.firstElementChild.getAttribute('data-slide-font-scale') || container.firstElementChild.style.getPropertyValue('--slide-font-scale')));
        if (slideScale) {
            container.style.setProperty('--slide-font-scale', slideScale);
            container.setAttribute('data-slide-font-scale', slideScale);
        } else {
            container.style.removeProperty('--slide-font-scale');
            container.removeAttribute('data-slide-font-scale');
        }

        // Auto-highlight C# code blocks with JetBrains Rider theme
        tokenizeCodeBlocks(container);

        // Update Drawer active thumbnail
        updateDrawerActiveState(slideIdx);

        // Update Slide Counter
        const counterEl = document.getElementById('slideCounter');
        if (counterEl) {
            const currentStr = String(slideIdx + 1).padStart(2, '0');
            const totalStr = String(state.slides.length).padStart(2, '0');
            counterEl.textContent = `Slide ${currentStr} / ${totalStr}`;
        }

        // Update Progress Bar
        const progressEl = document.getElementById('deckProgressBar');
        if (progressEl) {
            const pct = ((slideIdx + 1) / state.slides.length) * 100;
            progressEl.style.width = pct + '%';
        }

        // Update Nav Buttons
        const btnPrev = document.getElementById('btnPrevSlide');
        const btnNext = document.getElementById('btnNextSlide');
        if (btnPrev) btnPrev.disabled = (slideIdx === 0);
        if (btnNext) btnNext.disabled = (slideIdx === state.slides.length - 1);

        // Update URL hash
        if (typeof window !== 'undefined' && window.location) {
            try {
                if (window.location.protocol === 'file:') {
                    window.location.hash = `slide-${slideIdx + 1}`;
                } else if (typeof history !== 'undefined' && history.replaceState) {
                    history.replaceState(null, '', `#slide-${slideIdx + 1}`);
                }
            } catch (e) {}
        }

        // Inform DeckEditor if active
        if (typeof window !== 'undefined' && window.DeckEditor && typeof window.DeckEditor.applyEditMode === 'function') {
            if (window.DeckEditor.state && window.DeckEditor.state.isEditMode) {
                window.DeckEditor.applyEditMode();
            }
        }
    }

    // Auto-detect and tokenize all code blocks into JetBrains Rider C# styling
    function tokenizeCodeBlocks(container) {
        if (!container) return;

        const codeBoxes = container.querySelectorAll('.code-box, .code-container');
        codeBoxes.forEach(box => {
            const pre = box.querySelector('pre');
            if (pre && !pre.querySelector('.jb-keyword') && !pre.querySelector('.jb-type')) {
                const raw = pre.textContent;
                const highlighted = highlightCSharpCode(raw);
                pre.innerHTML = `<code>${highlighted}</code>`;
            }

            // Ensure JetBrains Header tab is present
            if (!box.querySelector('.jb-header-tab')) {
                const tab = document.createElement('div');
                tab.className = 'jb-header-tab';
                
                // Try guessing filename
                let filename = 'Script.cs';
                const text = box.textContent || '';
                const classMatch = text.match(/class\s+([A-Za-z0-9_]+)/);
                if (classMatch) {
                    filename = classMatch[1] + '.cs';
                }

                tab.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">${filename}</span>
                    </div>
                    <button class="code-copy-btn" onclick="SlideDeck.copyCode(this)" title="Kopieer code">Kopieer</button>
                `;
                box.insertBefore(tab, box.firstChild);
            }
        });

        // Also check any standalone pre > code
        const loosePres = container.querySelectorAll('pre:not(.code-box pre):not(.code-container pre)');
        loosePres.forEach(pre => {
            if (!pre.querySelector('.jb-keyword') && !pre.querySelector('.jb-type')) {
                const raw = pre.textContent;
                const highlighted = highlightCSharpCode(raw);
                pre.innerHTML = `<code>${highlighted}</code>`;
            }
        });
    }

    // ========================================================================
    // 4. Slide Drawer Thumbnails
    // ========================================================================
    function renderDrawer() {
        if (typeof document === 'undefined') return;
        const drawer = document.getElementById('slideDrawer');
        if (!drawer) return;

        drawer.innerHTML = '';

        state.slides.forEach((s, idx) => {
            const item = document.createElement('div');
            item.className = 'drawer-item' + (idx === state.currentSlide ? ' active' : '');
            item.id = 'drawer-' + idx;

            const categoryText = s.isHero ? 'Introductie' : (s.category || 'Lesstof');
            const numText = String(idx + 1).padStart(2, '0');

            item.innerHTML = `
                <div class="drawer-badge-row">
                    <span class="drawer-num">${numText}</span>
                    <span class="drawer-category">${escapeHtml(categoryText)}</span>
                </div>
                <div class="drawer-title" title="${escapeHtml(s.title || '')}">${escapeHtml(s.title || 'Slide')}</div>
            `;

            item.addEventListener('click', () => {
                renderSlide(idx);
            });

            drawer.appendChild(item);
        });
    }

    function updateDrawerActiveState(slideIdx) {
        if (typeof document === 'undefined') return;
        const items = document.querySelectorAll('.drawer-item');
        items.forEach((item, idx) => {
            if (idx === slideIdx) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ========================================================================
    // 5. Mode Switching & Controls
    // ========================================================================
    function setViewMode(mode) {
        state.viewMode = mode;
        safeSet('glr_vr_viewmode', mode);

        const btnLab = document.getElementById('btnModeLab');
        const btnLec = document.getElementById('btnModeLecture');

        if (mode === 'projector') {
            document.body.classList.add('projector-mode', 'lecture-mode');
            document.body.classList.remove('lab-mode');
            if (btnLec) btnLec.classList.add('active');
            if (btnLab) btnLab.classList.remove('active');
            showToast('Hoorcollege Modus [L] (Schoon scherm)');
        } else {
            document.body.classList.remove('projector-mode', 'lecture-mode');
            document.body.classList.add('lab-mode');
            if (btnLab) btnLab.classList.add('active');
            if (btnLec) btnLec.classList.remove('active');
            showToast('Practicum Modus [P] (Deepdives actief)');
        }
    }

    function setFontScale(val) {
        state.fontScale = val;
        safeSet('glr_vr_fontscale', val);
        const factor = (parseInt(val, 10) / 100).toFixed(2);
        document.documentElement.style.setProperty('--lecture-font-scale', factor);

        const valEl = document.getElementById('lectureScaleVal');
        if (valEl) valEl.textContent = val + '%';

        const slider = document.getElementById('lectureFontSlider');
        if (slider && slider.value !== String(val)) slider.value = val;
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            document.body.classList.add('is-fullscreen');
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            document.body.classList.remove('is-fullscreen');
        }
    }

    function toggleNotes() {
        const modal = document.getElementById('deckNotesModal');
        if (!modal) return;
        state.isNotesOpen = !state.isNotesOpen;

        if (state.isNotesOpen) {
            const slide = state.slides[state.currentSlide];
            const titleEl = document.getElementById('notesModalTitle');
            const contentEl = document.getElementById('notesModalContent');

            if (titleEl) titleEl.textContent = `Docent Notities: Slide ${state.currentSlide + 1}`;
            if (contentEl) {
                contentEl.innerHTML = slide && slide.notes ?
                    `<p style="font-size:0.95rem; line-height:1.6;">${escapeHtml(slide.notes)}</p>` :
                    '<p style="color:#94a3b8; font-style:italic;">Geen docent notities gedefinieerd voor deze slide.</p>';
            }
            modal.style.display = 'flex';
        } else {
            modal.style.display = 'none';
        }
    }

    function toggleHelp() {
        const modal = document.getElementById('deckHelpModal');
        if (!modal) return;
        state.isHelpOpen = !state.isHelpOpen;
        modal.style.display = state.isHelpOpen ? 'flex' : 'none';
    }

    function showToast(msg, duration = 2200) {
        const toast = document.getElementById('deckToast');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toast.__timer);
        toast.__timer = setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }

    // Presentation Timer
    function startTimer() {
        if (state.timerRunning) {
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            showToast('Timer gepauzeerd');
            return;
        }
        state.timerRunning = true;
        showToast('Timer gestart');
        state.timerInterval = setInterval(() => {
            state.timerSeconds++;
            const mins = String(Math.floor(state.timerSeconds / 60)).padStart(2, '0');
            const secs = String(state.timerSeconds % 60).padStart(2, '0');
            const el = document.getElementById('deckTimerVal');
            if (el) el.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    // ========================================================================
    // 6. Keyboard & Event Navigation
    // ========================================================================
    function setupEventListeners() {
        if (typeof document === 'undefined') return;

        // Button clicks
        const btnPrev = document.getElementById('btnPrevSlide');
        const btnNext = document.getElementById('btnNextSlide');
        if (btnPrev) btnPrev.addEventListener('click', () => renderSlide(state.currentSlide - 1));
        if (btnNext) btnNext.addEventListener('click', () => renderSlide(state.currentSlide + 1));

        const btnLec = document.getElementById('btnModeLecture');
        const btnLab = document.getElementById('btnModeLab');
        if (btnLec) btnLec.addEventListener('click', () => setViewMode('projector'));
        if (btnLab) btnLab.addEventListener('click', () => setViewMode('lab'));

        const btnFullscreen = document.getElementById('btnFullscreen');
        if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

        const btnNotes = document.getElementById('btnNotesToggle');
        if (btnNotes) btnNotes.addEventListener('click', toggleNotes);
        const btnNotesClose = document.getElementById('btnNotesClose');
        if (btnNotesClose) btnNotesClose.addEventListener('click', toggleNotes);

        const btnHelp = document.getElementById('btnHelpToggle');
        if (btnHelp) btnHelp.addEventListener('click', toggleHelp);
        const btnHelpClose = document.getElementById('btnHelpClose');
        if (btnHelpClose) btnHelpClose.addEventListener('click', toggleHelp);

        const timerEl = document.getElementById('deckTimerVal');
        if (timerEl) timerEl.addEventListener('click', startTimer);

        const slider = document.getElementById('lectureFontSlider');
        if (slider) {
            slider.addEventListener('input', (e) => setFontScale(e.target.value));
        }

        // Edit button toggle
        const btnEdit = document.getElementById('btnEditToggle');
        if (btnEdit) {
            btnEdit.addEventListener('click', () => {
                if (typeof window !== 'undefined' && window.DeckEditor) {
                    window.DeckEditor.toggle();
                } else {
                    showToast('Bewerken engine wordt geladen...');
                }
            });
        }

        // Global Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            const target = e.target;
            const isTyping = target && (
                target.isContentEditable ||
                (target.closest && target.closest('[contenteditable="true"]')) ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA'
            );

            // If user is editing text in Edit Mode, let typing occur seamlessly
            if (isTyping) return;

            // Navigation
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                renderSlide(state.currentSlide + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
                e.preventDefault();
                renderSlide(state.currentSlide - 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                renderSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                renderSlide(state.slides.length - 1);
            } else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setViewMode('projector');
            } else if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setViewMode('lab');
            } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleFullscreen();
            } else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                toggleNotes();
            } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                toggleHelp();
            }
        });

        // Hash change navigation (#slide-3)
        window.addEventListener('hashchange', () => {
            const match = window.location.hash.match(/#slide-(\d+)/i) || window.location.hash.match(/#(\d+)/);
            if (match) {
                const idx = parseInt(match[1], 10) - 1;
                if (!isNaN(idx) && idx >= 0 && idx < state.slides.length && idx !== state.currentSlide) {
                    renderSlide(idx);
                }
            }
        });
    }

    // ========================================================================
    // 7. Public API & Initialization
    // ========================================================================
    function init(options) {
        options = options || {};

        if (options.theme) state.theme = options.theme;
        if (options.trackTitle) state.trackTitle = options.trackTitle;
        if (options.lessonNumber) state.lessonNumber = options.lessonNumber;
        if (options.lessonTitle) state.lessonTitle = options.lessonTitle;
        if (options.prevLessonUrl) state.prevLessonUrl = options.prevLessonUrl;
        if (options.nextLessonUrl) state.nextLessonUrl = options.nextLessonUrl;
        if (options.overviewUrl) state.overviewUrl = options.overviewUrl;
        if (Array.isArray(options.slides)) state.slides = options.slides;

        // Auto-detect start slide from URL hash (#slide-4)
        if (typeof window !== 'undefined' && window.location && window.location.hash) {
            const match = window.location.hash.match(/#slide-(\d+)/i) || window.location.hash.match(/#(\d+)/);
            if (match) {
                const idx = parseInt(match[1], 10) - 1;
                if (!isNaN(idx) && idx >= 0 && idx < state.slides.length) {
                    state.currentSlide = idx;
                }
            }
        }

        // Restore saved view mode & font scale
        state.viewMode = safeGet('glr_vr_viewmode', 'lab');
        state.fontScale = parseInt(safeGet('glr_vr_fontscale', '100'), 10) || 100;

        // Expose slides to window for DeckEditor integration
        if (typeof window !== 'undefined') {
            window.slides = state.slides;
            window.slidesData = state.slides;
            window.currentSlide = state.currentSlide;
            window.__DECK_NAME__ = `presentation_les${state.lessonNumber}`;
        }

        buildDomShell();
        renderDrawer();
        setFontScale(state.fontScale);
        setViewMode(state.viewMode);
        renderSlide(state.currentSlide);
        setupEventListeners();

        // Initialize DeckEditor if present
        if (typeof window !== 'undefined' && window.DeckEditor && typeof window.DeckEditor.init === 'function') {
            window.DeckEditor.init({
                theme: state.theme,
                autoAttach: true
            });
        }

        return exports;
    }

    function copyCode(btn) {
        if (!btn) return;
        const box = btn.closest('.code-box, .code-container');
        if (!box) return;
        const pre = box.querySelector('pre');
        if (!pre) return;
        const text = pre.textContent;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Gekopieerd!';
                setTimeout(() => { btn.textContent = orig; }, 1800);
            }).catch(() => fallbackCopy(text, btn));
        } else {
            fallbackCopy(text, btn);
        }
    }

    function fallbackCopy(text, btn) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            const orig = btn.textContent;
            btn.textContent = 'Gekopieerd!';
            setTimeout(() => { btn.textContent = orig; }, 1800);
        } catch (e) {}
    }

    // Exports
    exports.version = '2.0.0';
    exports.state = state;
    exports.init = init;
    exports.renderSlide = renderSlide;
    exports.setViewMode = setViewMode;
    exports.setFontScale = setFontScale;
    exports.toggleFullscreen = toggleFullscreen;
    exports.toggleNotes = toggleNotes;
    exports.toggleHelp = toggleHelp;
    exports.showToast = showToast;
    exports.copyCode = copyCode;
    exports.highlightCSharpCode = highlightCSharpCode;
}));
