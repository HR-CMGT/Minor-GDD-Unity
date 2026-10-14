/**
 * ============================================================================
 * HR DECK EDITOR SUITE (hr_deck_editor.js)
 * The Ultimate Universal Slide Deck Edit Suite Library
 * Version: 2.0.0
 *
 * Self-contained, zero-dependency, professional slide deck editing suite.
 * Works seamlessly across CMGT presentations, GLR presentations, and arbitrary HTML decks.
 * Local-only execution policy. Clean, modern developer interface.
 * ============================================================================
 */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        const inst = factory();
        module.exports = inst;
        if (root) root.DeckEditor = inst;
    } else {
        root.DeckEditor = factory();
    }
})(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    // ========================================================================
    // 1. Strict Environment Guard: Local-Only Development Policy
    // ========================================================================
    const isLocalEnvironment = (function () {
        try {
            if (typeof window === 'undefined') return true; // Local Node.js test environment
            if (!window.location) return false;
            const h = window.location.hostname;
            const p = window.location.protocol;
            return p === 'file:' ||
                   h === 'localhost' ||
                   h === '127.0.0.1' ||
                   h === '0.0.0.0' ||
                   h.startsWith('192.168.') ||
                   h.startsWith('10.') ||
                   h.endsWith('.local');
        } catch (e) {
            return false;
        }
    })();

    if (!isLocalEnvironment) {
        // Zero footprint in production / GitHub Pages environments
        return {
            isSupported: false,
            init: function () { return this; }
        };
    }

    // Prevent duplicate library instantiation
    if (typeof window !== 'undefined' && window.DeckEditor && window.DeckEditor.__initialized) {
        return window.DeckEditor;
    }

    // ========================================================================
    // 2. Event Bus for Subagent & Modular Coordination
    // ========================================================================
    const eventBus = {
        _listeners: {},
        on: function (event, handler) {
            if (!this._listeners[event]) this._listeners[event] = [];
            this._listeners[event].push(handler);
            return this;
        },
        off: function (event, handler) {
            if (!this._listeners[event]) return this;
            this._listeners[event] = this._listeners[event].filter(fn => fn !== handler);
            return this;
        },
        emit: function (event, data) {
            const handlers = this._listeners[event];
            if (handlers && handlers.length) {
                handlers.forEach(fn => {
                    try { fn(data); } catch (err) { console.error('[DeckEditor Event Error]', event, err); }
                });
            }
            return this;
        }
    };

    // ========================================================================
    // 3. Configuration & State
    // ========================================================================
    const config = {
        serverCandidates: [
            (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:') && !window.location.protocol.startsWith('file:') ? window.location.origin : ''),
            'http://127.0.0.1:3333',
            'http://127.0.0.1:3555',
            'http://localhost:3333',
            'http://localhost:3555'
        ].filter(Boolean),
        statusEndpoint: '/api/status',
        saveSlideEndpoint: '/api/save-slide',
        saveDeckEndpoint: '/api/save-deck',
        resetSlideEndpoint: '/api/reset-slide',
        storagePrefix: 'hr_deck_v2_',
        legacyStoragePrefix: 'hr_edit_v1_',
        debounceAutosaveMs: 350,
        heartbeatIntervalMs: 12000,
        maxHistorySnapshots: 40
    };

    const state = {
        isEditMode: false,
        selectedElement: null,
        draggedItem: null,
        dropPlaceholder: null,
        isSwapMode: false,
        isMagneticSnap: true, // Magnetic snapping enabled by default
        snapGridSize: 20, // Default 20px magnetic grid (toggles 10px / 20px)
        autoSaveTimer: null,
        isFittingText: false,
        activeResizingCard: null,
        currentSlideIndex: 0,
        deckName: '',
        isInternalMutation: false,
        serverStatus: 'checking', // 'connected' | 'offline' | 'checking'
        activeServerUrl: null,
        serverDetails: null,
        dirtySlides: new Set(),
        heartbeatTimer: null
    };

    // ========================================================================
    // 4. Universal DOM Adaptor Engine
    // ========================================================================
    const dom = {
        // Editable card selectors across CMGT, GLR, and modern decks
        cardSelectors: [
            '.content-card',
            '.info-card',
            '.deep-dive-card',
            '.code-container',
            '.media-panel-card',
            '.steps-card',
            '.hero-topic-card',
            '.lab-deep-dive',
            '.lab-box-neutral',
            'details.tier-accordion',
            '.code-box',
            '.comparison-column',
            '.img-edit-card',
            '.media-canvas',
            '.topic-card',
            '.summary-card',
            '.concept-card',
            '.exercise-card',
            '.deck-accordion-card',
            '.card'
        ],

        // Detect current deck identifier
        getDeckName: function () {
            if (state.deckName) return state.deckName;
            if (typeof window !== 'undefined' && window.__DECK_NAME__) {
                state.deckName = window.__DECK_NAME__;
                return state.deckName;
            }

            const rawPath = (typeof window !== 'undefined' && window.location && typeof window.location.pathname === 'string') ? window.location.pathname : '';
            const path = rawPath.replace(/\\/g, '/');
            const segments = path.split('/').filter(Boolean);

            // 1. Check if within GLR track folder (IX, Immersive design)
            for (let i = 0; i < segments.length; i++) {
                const seg = decodeURIComponent(segments[i]);
                if (seg === 'IX' || seg === 'Immersive design') {
                    const next = segments[i + 1] || '';
                    if (next.startsWith('presentation_')) {
                        state.deckName = `${seg}/${next.replace(/\.html$/i, '')}`;
                        return state.deckName;
                    }
                    state.deckName = seg;
                    return state.deckName;
                }
            }

            // 2. Match presentation_* directory
            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                if (seg.startsWith('presentation_') && !seg.endsWith('.html')) {
                    state.deckName = seg;
                    return seg;
                }
            }

            // 3. Match presentation_unity6_<deck>.html or presentation_<deck>.html
            const fileMatch = path.match(/\/presentation_(?:unity6_)?([a-zA-Z0-9_]+)\.html/i);
            if (fileMatch) {
                state.deckName = 'presentation_' + fileMatch[1];
                return state.deckName;
            }

            // 4. Match any presentation_<name> in pathname
            const match = path.match(/(presentation_[a-zA-Z0-9_]+)/);
            if (match) {
                state.deckName = match[1].replace(/\.html$/i, '');
                return state.deckName;
            }

            // 5. Match document title
            if (typeof document !== 'undefined' && document.title) {
                const basicsMatch = document.title.match(/Basics\s*(\d+)/i);
                if (basicsMatch) {
                    state.deckName = 'presentation_basics' + basicsMatch[1];
                    return state.deckName;
                }
                const lesMatch = document.title.match(/Les\s*(\d+)/i);
                if (lesMatch) {
                    state.deckName = 'presentation_les' + lesMatch[1];
                    return state.deckName;
                }
                if (/block\s*prototyping/i.test(document.title)) {
                    state.deckName = 'presentation_blockprototyping';
                    return state.deckName;
                }
            }

            state.deckName = 'presentation_default';
            return state.deckName;
        },

        getProjectName: function () {
            const name = this.getDeckName();
            if (name.startsWith('IX') || name.startsWith('Immersive design') || (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/GLR/'))) {
                return 'GLR';
            }
            return 'CMGT';
        },

        // Universal current slide index detector
        getCurrentSlideIndex: function () {
            if (typeof window !== 'undefined') {
                if (typeof window.currentSlide === 'number') {
                    state.currentSlideIndex = window.currentSlide;
                    return window.currentSlide;
                }
                if (typeof window.currentIndex === 'number') {
                    state.currentSlideIndex = window.currentIndex;
                    return window.currentIndex;
                }
                if (typeof window.slideIndex === 'number') {
                    state.currentSlideIndex = window.slideIndex;
                    return window.slideIndex;
                }

                // Detect from URL hash: #slide-4 or #4
                if (window.location && window.location.hash) {
                    const hashMatch = window.location.hash.match(/#slide-(\d+)/i) || window.location.hash.match(/#(\d+)/);
                    if (hashMatch) {
                        const idx = parseInt(hashMatch[1], 10) - 1;
                        if (!isNaN(idx) && idx >= 0) {
                            state.currentSlideIndex = idx;
                            return idx;
                        }
                    }
                }
            }

            // Detect from slideCounter element: "Slide 03 / 24" or "Slide 3 / 19"
            if (typeof document !== 'undefined') {
                const counter = document.getElementById('slideCounter');
                if (counter && counter.textContent) {
                    const cMatch = counter.textContent.match(/Slide\s*(\d+)/i);
                    if (cMatch) {
                        const idx = parseInt(cMatch[1], 10) - 1;
                        if (!isNaN(idx) && idx >= 0) {
                            state.currentSlideIndex = idx;
                            return idx;
                        }
                    }
                }

                // Detect from active drawer item
                const activeDrawer = document.querySelector('.drawer-item.active');
                if (activeDrawer && activeDrawer.id) {
                    const dMatch = activeDrawer.id.match(/drawer-(\d+)/);
                    if (dMatch) {
                        const idx = parseInt(dMatch[1], 10);
                        if (!isNaN(idx)) {
                            state.currentSlideIndex = idx;
                            return idx;
                        }
                    }
                }
            }

            return state.currentSlideIndex || 0;
        },

        // Universal slide count detector
        getSlideCount: function () {
            if (typeof window !== 'undefined') {
                if (Array.isArray(window.slidesData) && window.slidesData.length > 0) {
                    return window.slidesData.length;
                }
                if (Array.isArray(window.slides) && window.slides.length > 0) {
                    return window.slides.length;
                }
                if (typeof window.totalSlides === 'number' && window.totalSlides > 0) {
                    return window.totalSlides;
                }
            }
            if (typeof document !== 'undefined') {
                const drawerItems = document.querySelectorAll('.drawer-item');
                if (drawerItems.length > 0) return drawerItems.length;

                const counter = document.getElementById('slideCounter');
                if (counter && counter.textContent) {
                    const cMatch = counter.textContent.match(/\/\s*(\d+)/);
                    if (cMatch) {
                        const total = parseInt(cMatch[1], 10);
                        if (!isNaN(total) && total > 0) return total;
                    }
                }

                const slides = document.querySelectorAll('.slide, .slide-viewport, [data-slide-index]');
                if (slides.length > 0) return slides.length;
            }
            return 0;
        },

        // Detect the active slide content container universally
        getSlideContainer: function () {
            if (typeof document === 'undefined') return null;
            // Check visible hero layout first
            const heroLayout = document.getElementById('heroLayout') || document.getElementById('heroContainer');
            if (heroLayout) {
                const style = typeof window !== 'undefined' && typeof window.getComputedStyle === 'function' ? window.getComputedStyle(heroLayout) : {};
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    return heroLayout;
                }
            }

            const heroWrapper = document.querySelector('.hero-wrapper');
            if (heroWrapper) {
                const style = typeof window !== 'undefined' && typeof window.getComputedStyle === 'function' ? window.getComputedStyle(heroWrapper) : {};
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    return heroWrapper;
                }
            }

            // Standard content containers
            const contentArea = document.getElementById('slideContentArea') || document.querySelector('.slide-content-area');
            if (contentArea) return contentArea;

            const slideBody = document.getElementById('slideBody') || document.querySelector('.slide-body');
            if (slideBody) return slideBody;

            const standardLayout = document.getElementById('standardLayout') || document.getElementById('standardContainer');
            if (standardLayout) {
                const style = typeof window !== 'undefined' && typeof window.getComputedStyle === 'function' ? window.getComputedStyle(standardLayout) : {};
                if (style.display !== 'none') return standardLayout;
            }

            const interactiveSlide = document.getElementById('interactiveSlide') || document.getElementById('viewInteractive');
            if (interactiveSlide) return interactiveSlide;

            // Slide show active element
            const activeSlide = document.querySelector('.slide.active, .slide-item.active, section.present, .swiper-slide-active');
            if (activeSlide) return activeSlide;

            const viewport = document.getElementById('viewport') || document.querySelector('.slide-viewport');
            if (viewport) return viewport;

            return document.querySelector('main') || document.body;
        },

        // Detect slide title element
        getSlideTitleElement: function () {
            if (typeof document === 'undefined') return null;
            const selectors = [
                '#slideTitle',
                '#slideHeading',
                '#heroTitle',
                '.slide-title-banner',
                '.slide-title',
                '.slide-heading',
                '.hero-title',
                'h1.slide-title',
                '#slideHeader h1',
                '.slide-header h1',
                'header h1'
            ];
            for (let i = 0; i < selectors.length; i++) {
                const el = document.querySelector(selectors[i]);
                if (el) return el;
            }
            const container = this.getSlideContainer();
            if (container) {
                const h1 = container.querySelector('h1, h2.title, h2');
                if (h1) return h1;
            }
            return document.querySelector('h1');
        },

        // Find all editable cards in container
        getEditableCards: function (container) {
            container = container || this.getSlideContainer();
            if (!container) return [];

            const selector = this.cardSelectors.join(', ');
            let cards = Array.from(container.querySelectorAll(selector));

            // Fallback: If no cards match specific classes, detect direct block children
            if (cards.length === 0) {
                const directBlocks = Array.from(container.children).filter(child => {
                    if (child.classList.contains('hr-element-floating-bar') ||
                        child.classList.contains('hr-toast') ||
                        child.classList.contains('glr-drop-placeholder') ||
                        child.tagName === 'SCRIPT' || child.tagName === 'STYLE') {
                        return false;
                    }
                    return true;
                });
                if (directBlocks.length > 0) {
                    cards = directBlocks;
                }
            }

            return cards;
        },

        isEditableCard: function (el) {
            if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
            const selector = this.cardSelectors.join(', ');
            return el.matches(selector);
        },

        getCardTypeTag: function (el) {
            if (!el) return 'KAART';
            if (el.classList.contains('code-box') || el.classList.contains('code-container')) return 'CODE';
            if (el.classList.contains('lab-deep-dive') || el.classList.contains('deep-dive-card')) return 'DEEPDIVE';
            if (el.classList.contains('img-edit-card') || el.classList.contains('media-panel-card')) return 'MEDIA';
            if (el.classList.contains('info-card') || el.classList.contains('lab-box-neutral')) return 'INFO';
            if (el.classList.contains('steps-card')) return 'STAPPEN';
            if (el.tagName === 'DETAILS' || el.classList.contains('tier-accordion')) return 'ACCORDION';
            if (el.classList.contains('hero-topic-card')) return 'HERO';
            return 'KAART';
        }
    };

    // ========================================================================
    // 5. Storage & Persistence Engine (Dual-Tier Architecture)
    // ========================================================================
    const storage = {
        _backends: [],
        _onSaveCallbacks: [],
        _onLoadCallbacks: [],

        safeGet: function (key, fallback = null) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const val = window.localStorage.getItem(key);
                    if (val !== null && val !== undefined) return val;
                }
            } catch (e) {}
            try {
                if (typeof safeStorage !== 'undefined' && safeStorage.getItem) {
                    const val = safeStorage.getItem(key);
                    if (val !== null && val !== undefined) return val;
                }
            } catch (e) {}
            return fallback;
        },

        safeSet: function (key, val) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(key, String(val));
                }
            } catch (e) {}
            try {
                if (typeof safeStorage !== 'undefined' && safeStorage.setItem) {
                    safeStorage.setItem(key, String(val));
                }
            } catch (e) {}
        },

        safeRemove: function (key) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.removeItem(key);
                }
            } catch (e) {}
            try {
                if (typeof safeStorage !== 'undefined' && safeStorage.removeItem) {
                    safeStorage.removeItem(key);
                }
            } catch (e) {}
        },

        getSlideKey: function (slideIdx) {
            return config.storagePrefix + dom.getDeckName() + '_s' + slideIdx;
        },

        getLegacySlideKey: function (slideIdx) {
            return config.legacyStoragePrefix + dom.getDeckName() + '_s' + slideIdx;
        },

        getTitleKey: function (slideIdx) {
            return config.storagePrefix + dom.getDeckName() + '_s' + slideIdx + '_title';
        },

        getLegacyTitleKey: function (slideIdx) {
            return config.legacyStoragePrefix + dom.getDeckName() + '_s' + slideIdx + '_title';
        },

        getNotesKey: function (slideIdx) {
            return config.storagePrefix + dom.getDeckName() + '_s' + slideIdx + '_notes';
        },

        getDirtyKey: function () {
            return config.storagePrefix + dom.getDeckName() + '_dirty';
        },

        // Dirty State Tracking (Persists across browser sessions)
        loadDirtyState: function () {
            try {
                const raw = this.safeGet(this.getDirtyKey(), '[]');
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    state.dirtySlides = new Set(arr);
                }
            } catch (e) {
                state.dirtySlides = new Set();
            }
            return state.dirtySlides;
        },

        persistDirtyState: function () {
            try {
                const arr = Array.from(state.dirtySlides);
                this.safeSet(this.getDirtyKey(), JSON.stringify(arr));
            } catch (e) {}
            eventBus.emit('dirtyStateChanged', { dirtySlides: Array.from(state.dirtySlides) });
        },

        markDirty: function (slideIdx) {
            state.dirtySlides.add(slideIdx);
            this.persistDirtyState();
        },

        markClean: function (slideIdx) {
            state.dirtySlides.delete(slideIdx);
            this.persistDirtyState();
        },

        isDirty: function (slideIdx) {
            return state.dirtySlides.has(slideIdx);
        },

        getDirtySlides: function () {
            return Array.from(state.dirtySlides);
        },

        hasUnsavedChanges: function () {
            return state.dirtySlides.size > 0;
        },

        registerBackend: function (backend) {
            if (backend && typeof backend.save === 'function') {
                this._backends.push(backend);
            }
            return this;
        },

        onSave: function (fn) {
            this._onSaveCallbacks.push(fn);
            return this;
        },

        onLoad: function (fn) {
            this._onLoadCallbacks.push(fn);
            return this;
        },

        // Save slide content to storage (local instant tier) and sync to server
        saveSlide: function (slideIdx, options = {}) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            const container = dom.getSlideContainer();
            if (!container) return;

            const silent = !!options.silent;
            const recordHistory = options.recordHistory === true;

            // Generate clean HTML snapshot without transient editor markup
            const clean = history.getCleanSlideSnapshot(container);
            if (!clean) return;

            if (recordHistory && state.isEditMode) {
                history.recordState(slideIdx, clean);
            }

            // TIER 1: Instant LocalStorage Save
            this.safeSet(this.getSlideKey(slideIdx), clean.html);
            this.safeSet(this.getLegacySlideKey(slideIdx), clean.html);

            if (clean.title) {
                this.safeSet(this.getTitleKey(slideIdx), clean.title);
                this.safeSet(this.getLegacyTitleKey(slideIdx), clean.title);
            }
            if (clean.notes) {
                this.safeSet(this.getNotesKey(slideIdx), clean.notes);
            }

            // Preserve slide font scale in storage and slide in-memory model
            const slideScale = (container && container.style && typeof container.style.getPropertyValue === 'function' ? container.style.getPropertyValue('--slide-font-scale') : (container && container.style ? container.style['--slide-font-scale'] : null)) ||
                               (container && typeof container.getAttribute === 'function' ? container.getAttribute('data-slide-font-scale') : null);
            if (slideScale) {
                this.safeSet(this.getSlideKey(slideIdx) + '_scale', slideScale);
            } else {
                this.safeRemove(this.getSlideKey(slideIdx) + '_scale');
            }

            // Mark slide dirty in local tier (cleared once server confirms disk persistence)
            this.markDirty(slideIdx);

            // Synchronize in-memory slidesData / slides array if present
            if (typeof window !== 'undefined') {
                if (typeof window.slidesData !== 'undefined' && window.slidesData[slideIdx]) {
                    window.slidesData[slideIdx].content = clean.html;
                    if (clean.title) window.slidesData[slideIdx].title = clean.title;
                    if (clean.notes) window.slidesData[slideIdx].notes = clean.notes;
                    if (slideScale) {
                        window.slidesData[slideIdx].fontScale = parseFloat(slideScale);
                        window.slidesData[slideIdx]['data-slide-font-scale'] = slideScale;
                    } else {
                        delete window.slidesData[slideIdx].fontScale;
                        delete window.slidesData[slideIdx]['data-slide-font-scale'];
                    }
                } else if (typeof window.slides !== 'undefined' && window.slides[slideIdx]) {
                    window.slides[slideIdx].contentHtml = clean.html;
                    window.slides[slideIdx].content = clean.html;
                    if (clean.title) window.slides[slideIdx].title = clean.title;
                    if (clean.notes) window.slides[slideIdx].notes = clean.notes;
                    if (slideScale) {
                        window.slides[slideIdx].fontScale = parseFloat(slideScale);
                        window.slides[slideIdx]['data-slide-font-scale'] = slideScale;
                    } else {
                        delete window.slides[slideIdx].fontScale;
                        delete window.slides[slideIdx]['data-slide-font-scale'];
                    }
                }
            }

            // Notify custom backends and event bus
            this._backends.forEach(backend => {
                try {
                    backend.save({
                        deck: dom.getDeckName(),
                        slideIndex: slideIdx,
                        title: clean.title,
                        contentHtml: clean.html,
                        notes: clean.notes,
                        fontScale: slideScale ? parseFloat(slideScale) : undefined
                    });
                } catch (e) {
                    console.error('[DeckEditor Backend Save Error]', e);
                }
            });

            this._onSaveCallbacks.forEach(cb => {
                try { cb({ slideIndex: slideIdx, title: clean.title, contentHtml: clean.html, notes: clean.notes, fontScale: slideScale ? parseFloat(slideScale) : undefined }); } catch (e) {}
            });

            eventBus.emit('slideSaved', { slideIndex: slideIdx, title: clean.title, contentHtml: clean.html, notes: clean.notes, fontScale: slideScale ? parseFloat(slideScale) : undefined });

            // TIER 2: Server Sync Push
            sync.pushSlide(slideIdx, clean.title, clean.html, clean.notes, { silent });
        },

        // Load and inject saved slide content from LocalStorage
        loadSlide: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            const container = dom.getSlideContainer();
            if (!container) return false;

            const savedHtml = this.safeGet(this.getSlideKey(slideIdx));
            const savedTitle = this.safeGet(this.getTitleKey(slideIdx));
            const savedNotes = this.safeGet(this.getNotesKey(slideIdx));
            const savedScale = this.safeGet(this.getSlideKey(slideIdx) + '_scale');

            let restored = false;

            if (savedHtml) {
                state.isInternalMutation = true;
                container.innerHTML = savedHtml;
                operations.syncSlideColumnStates(container);
                restored = true;
                state.isInternalMutation = false;
            }

            if (savedScale && container) {
                if (container.style && container.style.setProperty) {
                    container.style.setProperty('--slide-font-scale', savedScale);
                }
                if (container.setAttribute) {
                    container.setAttribute('data-slide-font-scale', savedScale);
                }
                const viewInteractive = typeof document !== 'undefined' ? document.getElementById('viewInteractive') : null;
                if (viewInteractive && viewInteractive !== container) {
                    if (viewInteractive.style && viewInteractive.style.setProperty) {
                        viewInteractive.style.setProperty('--slide-font-scale', savedScale);
                    }
                    if (viewInteractive.setAttribute) {
                        viewInteractive.setAttribute('data-slide-font-scale', savedScale);
                    }
                }
                if (toolbar && toolbar.updateSlideScaleBadge) {
                    toolbar.updateSlideScaleBadge(container);
                }
                restored = true;
            }

            if (savedTitle) {
                const titleEl = dom.getSlideTitleElement();
                if (titleEl) titleEl.textContent = savedTitle;
                if (typeof window.slidesData !== 'undefined' && window.slidesData[slideIdx]) {
                    window.slidesData[slideIdx].title = savedTitle;
                } else if (typeof window.slides !== 'undefined' && window.slides[slideIdx]) {
                    window.slides[slideIdx].title = savedTitle;
                }
            }

            if (savedNotes) {
                if (typeof window.slidesData !== 'undefined' && window.slidesData[slideIdx]) {
                    window.slidesData[slideIdx].notes = savedNotes;
                } else if (typeof window.slides !== 'undefined' && window.slides[slideIdx]) {
                    window.slides[slideIdx].notes = savedNotes;
                }
            }

            this._onLoadCallbacks.forEach(cb => {
                try { cb({ slideIndex: slideIdx, restored: restored }); } catch (e) {}
            });

            return restored;
        },

        // Reset slide to host deck template
        resetSlide: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            if (!confirm(`Weet u zeker dat u Slide ${slideIdx + 1} wilt resetten naar de originele template?`)) {
                return;
            }

            this.safeRemove(this.getSlideKey(slideIdx));
            this.safeRemove(this.getLegacySlideKey(slideIdx));
            this.safeRemove(this.getTitleKey(slideIdx));
            this.safeRemove(this.getLegacyTitleKey(slideIdx));
            this.safeRemove(this.getNotesKey(slideIdx));
            this.markClean(slideIdx);

            // If server is connected, trigger server reset
            if (state.serverStatus === 'connected' && state.activeServerUrl) {
                sync.resetSlideOnServer(slideIdx);
            }

            // Re-render via host deck function
            if (typeof window.renderSlide === 'function') {
                window.renderSlide();
            } else if (typeof window.renderCurrentSlide === 'function') {
                window.renderCurrentSlide();
            } else if (typeof window.showSlide === 'function') {
                window.showSlide(slideIdx);
            } else {
                window.location.reload();
            }

            if (state.isEditMode) {
                setTimeout(() => DeckEditor.applyEditMode(), 50);
            }

            toolbar.showToast(`Slide ${slideIdx + 1} hersteld naar origineel!`, 'info');
        },

        // Purge corrupted duplicate slides (checks if 3 or more slides share identical titles or content)
        purgeCorruptedDuplicates: function () {
            try {
                if (typeof window === 'undefined' || !window.localStorage) return false;
                const storageObj = window.localStorage;
                const deck = dom.getDeckName();
                const titleMap = new Map();
                const contentMap = new Map();
                let purgedCount = 0;

                // 1. Scan storage keys for duplicate titles or duplicate HTML content
                for (let i = 0; i < storageObj.length; i++) {
                    const k = storageObj.key(i);
                    if (!k) continue;

                    if (k.endsWith('_title')) {
                        const val = storageObj.getItem(k);
                        if (val && typeof val === 'string') {
                            const trimmed = val.trim();
                            if (trimmed.length > 0) {
                                if (!titleMap.has(trimmed)) titleMap.set(trimmed, []);
                                titleMap.get(trimmed).push(k);
                            }
                        }
                    } else if (/_s\d+$/.test(k)) {
                        const val = storageObj.getItem(k);
                        if (val && typeof val === 'string') {
                            const trimmed = val.trim();
                            if (trimmed.length > 20) {
                                if (!contentMap.has(trimmed)) contentMap.set(trimmed, []);
                                contentMap.get(trimmed).push(k);
                            }
                        }
                    }
                }

                // 2. Clear keys where 3 or more slides share identical titles
                for (const [title, keys] of titleMap.entries()) {
                    if (keys.length >= 3) {
                        console.warn(`[DeckEditor Storage] Purging corrupted duplicate slide titles: ${keys.length} slides share "${title}"`);
                        keys.forEach(k => {
                            storageObj.removeItem(k);
                            purgedCount++;
                            const baseKey = k.replace(/_title$/, '');
                            storageObj.removeItem(baseKey);
                            storageObj.removeItem(baseKey + '_notes');
                            storageObj.removeItem(baseKey + '_scale');
                        });
                    }
                }

                // 3. Clear keys where 3 or more slides share identical HTML content
                for (const [content, keys] of contentMap.entries()) {
                    if (keys.length >= 3) {
                        console.warn(`[DeckEditor Storage] Purging corrupted duplicate slide contents: ${keys.length} slides share identical content`);
                        keys.forEach(k => {
                            storageObj.removeItem(k);
                            purgedCount++;
                            storageObj.removeItem(k + '_title');
                            storageObj.removeItem(k + '_notes');
                            storageObj.removeItem(k + '_scale');
                        });
                    }
                }

                // 4. Always wipe legacy hr_edit_v1_ keys for this deck to eliminate past corruption
                for (let i = storageObj.length - 1; i >= 0; i--) {
                    const k = storageObj.key(i);
                    if (k && (k.startsWith(config.legacyStoragePrefix + deck) || (k.startsWith(config.legacyStoragePrefix) && k.includes(deck)))) {
                        storageObj.removeItem(k);
                        purgedCount++;
                    }
                }

                if (purgedCount > 0) {
                    state.dirtySlides.clear();
                    this.persistDirtyState();
                    console.log(`[DeckEditor Storage] Successfully purged ${purgedCount} corrupted storage keys.`);
                }
                return purgedCount > 0;
            } catch (e) {
                console.error('[DeckEditor Storage] Error in purgeCorruptedDuplicates:', e);
                return false;
            }
        },

        resetDeckToTemplate: function () {
            if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                if (!window.confirm('Weet u zeker dat u alle opgeslagen bewerkingen voor deze presentatie wilt wissen en resetten naar de originele template?')) {
                    return;
                }
            }
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const deck = dom.getDeckName();
                    const prefixV2 = config.storagePrefix + deck + '_';
                    const prefixV1 = config.legacyStoragePrefix + deck + '_';
                    for (let i = window.localStorage.length - 1; i >= 0; i--) {
                        const k = window.localStorage.key(i);
                        if (k && (k.startsWith(prefixV2) || k.startsWith(prefixV1) || k.includes(deck))) {
                            window.localStorage.removeItem(k);
                        }
                    }
                }
            } catch (e) {}
            state.dirtySlides.clear();
            this.persistDirtyState();
            if (typeof window !== 'undefined' && window.location) {
                window.location.reload();
            }
        },

        exportSlideHtml: function (slideIdx) {
            return sync.exportSlideHtml(slideIdx);
        },

        exportFullDeck: function () {
            return sync.exportFullDeck();
        }
    };

    // ========================================================================
    // 5b. Universal Client Sync & Export Engine
    // ========================================================================
    const sync = {
        init: function () {
            storage.loadDirtyState();
            this.checkServerStatus();
            this.startHeartbeat();
            return this;
        },

        startHeartbeat: function () {
            if (state.heartbeatTimer) clearInterval(state.heartbeatTimer);
            state.heartbeatTimer = setInterval(() => {
                // If offline and not in edit mode, poll every 4th cycle (approx every 48s) to avoid log spam
                if (state.serverStatus === 'offline' && !state.isEditMode) {
                    state._heartbeatSkipCount = (state._heartbeatSkipCount || 0) + 1;
                    if (state._heartbeatSkipCount % 4 !== 0) return;
                }
                this.checkServerStatus(false);
            }, config.heartbeatIntervalMs);
        },

        // Probe candidate server endpoints for /api/status
        checkServerStatus: async function (manual = false) {
            const candidates = config.serverCandidates;
            let connectedUrl = null;
            let details = null;

            for (const base of candidates) {
                if (!base || base.startsWith('file:') || base === 'null') continue;
                try {
                    const testUrl = (base.endsWith('/') ? base.slice(0, -1) : base) + config.statusEndpoint;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 800);

                    const res = await fetch(testUrl, {
                        method: 'GET',
                        cache: 'no-store',
                        signal: controller.signal
                    }).catch(() => null);
                    clearTimeout(timeoutId);

                    if (res && res.ok) {
                        const data = await res.json().catch(() => null);
                        if (data && data.status === 'ok') {
                            connectedUrl = base.endsWith('/') ? base.slice(0, -1) : base;
                            details = data;
                            break;
                        }
                    }
                } catch (e) {
                    // Try next candidate
                }
            }

            if (connectedUrl) {
                state.serverStatus = 'connected';
                state.activeServerUrl = connectedUrl;
                state.serverDetails = details;
                toolbar.updateSyncPill('connected', connectedUrl);
                if (manual) {
                    toolbar.showToast(`Verbonden met edit server (${connectedUrl})`, 'success');
                }
                eventBus.emit('serverConnected', { url: connectedUrl, details });
                return true;
            } else {
                state.serverStatus = 'offline';
                state.activeServerUrl = null;
                state.serverDetails = null;
                toolbar.updateSyncPill('offline', null);
                if (manual) {
                    toolbar.showToast('Geen actieve edit server gevonden. Lokaal opgeslagen.', 'warning');
                }
                eventBus.emit('serverOffline', {});
                return false;
            }
        },

        // Push slide to disk via server API
        pushSlide: async function (slideIdx, title, html, notes, options = {}) {
            const silent = !!options.silent;

            // Auto-check connection if offline
            if (state.serverStatus !== 'connected' || !state.activeServerUrl) {
                const online = await this.checkServerStatus(false);
                if (!online) {
                    toolbar.updateAutosaveBadge('Autosave: Opgeslagen (Browser)', 'saved');
                    if (!silent) toolbar.showToast(`Slide ${slideIdx + 1} opgeslagen in browser (Server offline)`, 'info');
                    return false;
                }
            }

            const container = dom.getSlideContainer();
            const slideScale = container ? ((container.style && typeof container.style.getPropertyValue === 'function' ? container.style.getPropertyValue('--slide-font-scale') : (container.style ? container.style['--slide-font-scale'] : null)) || (typeof container.getAttribute === 'function' ? container.getAttribute('data-slide-font-scale') : null)) : null;

            const payload = {
                deck: dom.getDeckName(),
                slideIndex: slideIdx,
                title: title,
                contentHtml: html,
                notes: notes,
                fontScale: slideScale ? parseFloat(slideScale) : undefined,
                project: dom.getProjectName()
            };

            const endpoint = `${state.activeServerUrl}${config.saveSlideEndpoint}`;

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    storage.markClean(slideIdx);
                    toolbar.updateAutosaveBadge('Autosave: Opgeslagen (Schijf)', 'saved');
                    if (!silent) {
                        toolbar.showToast(`Slide ${slideIdx + 1} opgeslagen op schijf!`, 'success');
                    }
                    eventBus.emit('slideSynced', { slideIndex: slideIdx, result: data });
                    return true;
                } else {
                    throw new Error(`Server returned status ${res.status}`);
                }
            } catch (err) {
                console.warn('[Sync Error]', err.message);
                state.serverStatus = 'offline';
                toolbar.updateSyncPill('offline', null);
                toolbar.updateAutosaveBadge('Autosave: Opgeslagen (Browser)', 'saved');
                if (!silent) {
                    toolbar.showToast(`Slide ${slideIdx + 1} opgeslagen in browser (Server fout)`, 'warning');
                }
                return false;
            }
        },

        // Save entire deck at once to server
        saveDeck: async function (options = {}) {
            if (!state.activeServerUrl) {
                const online = await this.checkServerStatus(false);
                if (!online) {
                    toolbar.showToast('Kan deck niet opslaan: server is offline', 'warning');
                    return false;
                }
            }

            let slidesArray = [];
            if (typeof window.slidesData !== 'undefined' && Array.isArray(window.slidesData)) {
                slidesArray = window.slidesData;
            } else if (typeof window.slides !== 'undefined' && Array.isArray(window.slides)) {
                slidesArray = window.slides;
            }

            try {
                const endpoint = `${state.activeServerUrl}${config.saveDeckEndpoint}`;
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deck: dom.getDeckName(),
                        slides: slidesArray,
                        project: dom.getProjectName()
                    })
                });

                if (res.ok) {
                    state.dirtySlides.clear();
                    storage.persistDirtyState();
                    toolbar.showToast('Volledig deck opgeslagen op schijf!', 'success');
                    return true;
                }
            } catch (err) {
                toolbar.showToast('Fout bij opslaan deck: ' + err.message, 'error');
            }
            return false;
        },

        // Reset slide on server
        resetSlideOnServer: async function (slideIdx) {
            if (!state.activeServerUrl) return;
            try {
                const endpoint = `${state.activeServerUrl}${config.resetSlideEndpoint}`;
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deck: dom.getDeckName(),
                        slideIndex: slideIdx,
                        project: dom.getProjectName()
                    })
                });
            } catch (e) {}
        },

        // Fallback Export 1: Download Modified Slide HTML
        exportSlideHtml: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            operations.deselectCurrentElement();
            const container = dom.getSlideContainer();
            if (!container) return;

            const clean = history.getCleanSlideSnapshot(container);
            const content = clean ? clean.html : container.innerHTML;

            const htmlDocument = `<!-- Exported Slide ${slideIdx + 1} from ${dom.getDeckName()} -->\n<!-- Title: ${clean ? clean.title : ''} -->\n<div class="slide-content-export">\n${content}\n</div>\n`;

            const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${dom.getDeckName()}_slide_${slideIdx + 1}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toolbar.showToast('Slide geëxporteerd als HTML bestand!', 'success');
        },

        // Fallback Export 2: Download Full Presentation HTML
        exportFullPresentationHtml: function () {
            operations.deselectCurrentElement();

            const clone = document.documentElement.cloneNode(true);

            // Remove editor artifacts
            const editorElements = clone.querySelectorAll(
                '#hrEditToolbar, #hrElementFloatingBar, #hrToast, #hrDeckStyles, .btn-edit-toggle, .hr-floating-edit-pill, .glr-resize-grip, .deck-export-menu'
            );
            editorElements.forEach(el => el.remove());

            clone.classList.remove('is-editing');
            const body = clone.querySelector('body');
            if (body) body.classList.remove('is-editing');
            clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            clone.querySelectorAll('.glr-selected-element, .deck-selected-element').forEach(el => {
                el.classList.remove('glr-selected-element', 'deck-selected-element');
            });

            const htmlString = '<!DOCTYPE html>\n' + clone.outerHTML;
            const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${dom.getDeckName()}_full_presentation.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toolbar.showToast('Volledige presentatie geëxporteerd als HTML!', 'success');
        },

        // Fallback Export 3: Copy Slide JSON
        copySlideJson: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            const container = dom.getSlideContainer();
            const clean = container ? history.getCleanSlideSnapshot(container) : null;

            const slideObj = {
                slideIndex: slideIdx,
                deck: dom.getDeckName(),
                title: clean ? clean.title : '',
                contentHtml: clean ? clean.html : '',
                notes: clean ? clean.notes : ''
            };

            const jsonStr = JSON.stringify(slideObj, null, 2);

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(jsonStr).then(() => {
                    toolbar.showToast(`Slide ${slideIdx + 1} JSON gekopieerd naar klembord!`, 'success');
                }).catch(() => {
                    this.fallbackCopyText(jsonStr);
                });
            } else {
                this.fallbackCopyText(jsonStr);
            }
        },

        // Fallback Export 4: Download Full Deck JSON
        exportFullDeck: function () {
            operations.deselectCurrentElement();
            let deckArray = [];
            if (typeof window.slidesData !== 'undefined' && Array.isArray(window.slidesData) && window.slidesData.length > 0) {
                deckArray = window.slidesData;
            } else if (typeof window.slides !== 'undefined' && Array.isArray(window.slides) && window.slides.length > 0) {
                deckArray = window.slides;
            } else {
                const total = (typeof dom.getTotalSlides === 'function') ? dom.getTotalSlides() : 30;
                for (let i = 0; i < total; i++) {
                    const html = storage.safeGet(storage.getSlideKey(i));
                    const title = storage.safeGet(storage.getTitleKey(i));
                    if (html || title) {
                        deckArray.push({ slideIndex: i, title: title || '', content: html || '' });
                    }
                }
            }

            const jsonStr = JSON.stringify(deckArray, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${dom.getDeckName()}_full_deck_backup.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toolbar.showToast('Volledig deck geëxporteerd als JSON!', 'success');
        },

        exportDeckJson: function () {
            return this.exportFullDeck();
        },

        fallbackCopyText: function (text) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            toolbar.showToast('JSON gekopieerd naar klembord!', 'success');
        }
    };

    // ========================================================================
    // 6. History Stack: Undo & Redo Engine
    // ========================================================================
    const history = {
        _stacks: {}, // { [slideIdx]: { past: [], future: [] } }

        getCleanSlideSnapshot: function (container) {
            container = container || dom.getSlideContainer();
            if (!container) return null;

            const titleEl = dom.getSlideTitleElement();
            const titleText = titleEl ? (titleEl.textContent || titleEl.innerText || '').trim() : '';

            const slideIdx = dom.getCurrentSlideIndex();
            let notesText = '';
            if (typeof window !== 'undefined') {
                if (window.slidesData && window.slidesData[slideIdx] && window.slidesData[slideIdx].notes) {
                    notesText = window.slidesData[slideIdx].notes;
                } else if (window.slides && window.slides[slideIdx] && window.slides[slideIdx].notes) {
                    notesText = window.slides[slideIdx].notes;
                }
            }

            const clone = container.cloneNode(true);
            clone.querySelectorAll('.deck-card-action-bar').forEach(el => el.remove());
            clone.querySelectorAll('.glr-selected-element, .deck-selected-element').forEach(el => {
                el.classList.remove('glr-selected-element', 'deck-selected-element');
            });
            clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
            clone.querySelectorAll('.glr-card-dragging, .deck-card-dragging').forEach(el => {
                el.classList.remove('glr-card-dragging', 'deck-card-dragging');
            });
            clone.querySelectorAll('.card-swap-flash').forEach(el => el.classList.remove('card-swap-flash'));
            clone.querySelectorAll('.glr-drop-placeholder, .deck-drop-placeholder').forEach(el => el.remove());
            clone.querySelectorAll('.glr-resize-grip').forEach(el => el.remove());
            clone.querySelectorAll('.glr-snap-guide-h, .glr-snap-guide-v, .deck-snap-guide-x, .deck-snap-guide-y').forEach(el => el.remove());

            const slideScale = (container.style && typeof container.style.getPropertyValue === 'function' ? container.style.getPropertyValue('--slide-font-scale') : (container.style ? container.style['--slide-font-scale'] : null)) ||
                               (typeof container.getAttribute === 'function' ? container.getAttribute('data-slide-font-scale') : null) || null;

            if (slideScale && clone.firstElementChild) {
                if (typeof clone.firstElementChild.setAttribute === 'function') {
                    clone.firstElementChild.setAttribute('data-slide-font-scale', slideScale);
                }
                if (clone.firstElementChild.style && typeof clone.firstElementChild.style.setProperty === 'function') {
                    clone.firstElementChild.style.setProperty('--slide-font-scale', slideScale);
                }
            }

            return {
                html: clone.innerHTML,
                title: titleText,
                notes: notesText,
                fontScale: slideScale
            };
        },

        recordBaseline: function (slideIdx) {
            if (!state.isEditMode) return;
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            if (!this._stacks[slideIdx]) {
                this._stacks[slideIdx] = { past: [], future: [] };
            }

            const snap = this.getCleanSlideSnapshot();
            if (!snap) return;

            const hist = this._stacks[slideIdx];
            const last = hist.past[hist.past.length - 1];
            if (last && last.html === snap.html && last.title === snap.title && last.fontScale === snap.fontScale) {
                return; // Baseline already captured
            }

            hist.past.push(snap);
            if (hist.past.length > config.maxHistorySnapshots) hist.past.shift();
            // Retain future stack so focusin does not wipe out redo availability
        },

        recordState: function (slideIdx, snap) {
            if (!state.isEditMode) return;
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            if (!this._stacks[slideIdx]) {
                this._stacks[slideIdx] = { past: [], future: [] };
            }

            snap = snap || this.getCleanSlideSnapshot();
            if (!snap) return;

            const hist = this._stacks[slideIdx];
            const last = hist.past[hist.past.length - 1];
            if (last && last.html === snap.html && last.title === snap.title && last.fontScale === snap.fontScale) {
                return; // Duplicate state
            }

            hist.past.push(snap);
            if (hist.past.length > config.maxHistorySnapshots) hist.past.shift();
            hist.future = []; // Clear redo stack on new action
        },

        undo: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            const hist = this._stacks[slideIdx];
            if (!hist || hist.past.length === 0) {
                toolbar.showToast('Niets om ongedaan te maken');
                return false;
            }

            const currentSnap = this.getCleanSlideSnapshot();
            let previousSnap = hist.past.pop();

            // Skip any snapshot that is identical to current DOM state
            while (previousSnap && currentSnap && previousSnap.html === currentSnap.html && previousSnap.title === currentSnap.title && previousSnap.fontScale === currentSnap.fontScale && hist.past.length > 0) {
                previousSnap = hist.past.pop();
            }

            if (!previousSnap || (currentSnap && previousSnap.html === currentSnap.html && previousSnap.title === currentSnap.title && previousSnap.fontScale === currentSnap.fontScale)) {
                toolbar.showToast('Niets om ongedaan te maken');
                return false;
            }

            if (currentSnap) {
                hist.future.push(currentSnap);
            }

            state.isInternalMutation = true;
            const container = dom.getSlideContainer();
            if (container) {
                container.innerHTML = previousSnap.html;
                if (container.style) {
                    if (previousSnap.fontScale) {
                        if (typeof container.style.setProperty === 'function') {
                            container.style.setProperty('--slide-font-scale', previousSnap.fontScale);
                        } else {
                            container.style['--slide-font-scale'] = previousSnap.fontScale;
                        }
                    } else {
                        if (typeof container.style.removeProperty === 'function') {
                            container.style.removeProperty('--slide-font-scale');
                        } else {
                            delete container.style['--slide-font-scale'];
                        }
                    }
                }
                if (container.setAttribute && typeof container.setAttribute === 'function') {
                    if (previousSnap.fontScale) {
                        container.setAttribute('data-slide-font-scale', previousSnap.fontScale);
                    } else if (typeof container.removeAttribute === 'function') {
                        container.removeAttribute('data-slide-font-scale');
                    }
                }
                const viewInteractive = typeof document !== 'undefined' ? document.getElementById('viewInteractive') : null;
                if (viewInteractive && viewInteractive !== container && viewInteractive.style) {
                    if (previousSnap.fontScale) {
                        if (typeof viewInteractive.style.setProperty === 'function') {
                            viewInteractive.style.setProperty('--slide-font-scale', previousSnap.fontScale);
                        } else {
                            viewInteractive.style['--slide-font-scale'] = previousSnap.fontScale;
                        }
                    } else {
                        if (typeof viewInteractive.style.removeProperty === 'function') {
                            viewInteractive.style.removeProperty('--slide-font-scale');
                        } else {
                            delete viewInteractive.style['--slide-font-scale'];
                        }
                    }
                    if (viewInteractive.setAttribute && typeof viewInteractive.setAttribute === 'function') {
                        if (previousSnap.fontScale) {
                            viewInteractive.setAttribute('data-slide-font-scale', previousSnap.fontScale);
                        } else if (typeof viewInteractive.removeAttribute === 'function') {
                            viewInteractive.removeAttribute('data-slide-font-scale');
                        }
                    }
                }
                if (typeof toolbar !== 'undefined' && toolbar.updateSlideScaleBadge) {
                    toolbar.updateSlideScaleBadge(container);
                }
            }

            const titleEl = dom.getSlideTitleElement();
            if (titleEl && previousSnap.title) titleEl.textContent = previousSnap.title;

            operations.deselectCurrentElement();
            DeckEditor.applyEditMode();
            storage.saveSlide(slideIdx, { silent: true, recordHistory: false });
            toolbar.showToast('Ongedaan gemaakt [Cmd+Z / Ctrl+Z]');
            state.isInternalMutation = false;
            return true;
        },

        redo: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            const hist = this._stacks[slideIdx];
            if (!hist || hist.future.length === 0) {
                toolbar.showToast('Niets om opnieuw uit te voeren');
                return false;
            }

            const currentSnap = this.getCleanSlideSnapshot();
            let nextSnap = hist.future.pop();

            // Skip any snapshot that is identical to current DOM state
            while (nextSnap && currentSnap && nextSnap.html === currentSnap.html && nextSnap.title === currentSnap.title && nextSnap.fontScale === currentSnap.fontScale && hist.future.length > 0) {
                nextSnap = hist.future.pop();
            }

            if (!nextSnap || (currentSnap && nextSnap.html === currentSnap.html && nextSnap.title === currentSnap.title && nextSnap.fontScale === currentSnap.fontScale)) {
                toolbar.showToast('Niets om opnieuw uit te voeren');
                return false;
            }

            if (currentSnap) {
                hist.past.push(currentSnap);
            }

            state.isInternalMutation = true;
            const container = dom.getSlideContainer();
            if (container) {
                container.innerHTML = nextSnap.html;
                if (container.style) {
                    if (nextSnap.fontScale) {
                        if (typeof container.style.setProperty === 'function') {
                            container.style.setProperty('--slide-font-scale', nextSnap.fontScale);
                        } else {
                            container.style['--slide-font-scale'] = nextSnap.fontScale;
                        }
                    } else {
                        if (typeof container.style.removeProperty === 'function') {
                            container.style.removeProperty('--slide-font-scale');
                        } else {
                            delete container.style['--slide-font-scale'];
                        }
                    }
                }
                if (container.setAttribute && typeof container.setAttribute === 'function') {
                    if (nextSnap.fontScale) {
                        container.setAttribute('data-slide-font-scale', nextSnap.fontScale);
                    } else if (typeof container.removeAttribute === 'function') {
                        container.removeAttribute('data-slide-font-scale');
                    }
                }
                const viewInteractive = typeof document !== 'undefined' ? document.getElementById('viewInteractive') : null;
                if (viewInteractive && viewInteractive !== container && viewInteractive.style) {
                    if (nextSnap.fontScale) {
                        if (typeof viewInteractive.style.setProperty === 'function') {
                            viewInteractive.style.setProperty('--slide-font-scale', nextSnap.fontScale);
                        } else {
                            viewInteractive.style['--slide-font-scale'] = nextSnap.fontScale;
                        }
                    } else {
                        if (typeof viewInteractive.style.removeProperty === 'function') {
                            viewInteractive.style.removeProperty('--slide-font-scale');
                        } else {
                            delete viewInteractive.style['--slide-font-scale'];
                        }
                    }
                    if (viewInteractive.setAttribute && typeof viewInteractive.setAttribute === 'function') {
                        if (nextSnap.fontScale) {
                            viewInteractive.setAttribute('data-slide-font-scale', nextSnap.fontScale);
                        } else if (typeof viewInteractive.removeAttribute === 'function') {
                            viewInteractive.removeAttribute('data-slide-font-scale');
                        }
                    }
                }
                if (typeof toolbar !== 'undefined' && toolbar.updateSlideScaleBadge) {
                    toolbar.updateSlideScaleBadge(container);
                }
            }

            const titleEl = dom.getSlideTitleElement();
            if (titleEl && nextSnap.title) titleEl.textContent = nextSnap.title;

            operations.deselectCurrentElement();
            DeckEditor.applyEditMode();
            storage.saveSlide(slideIdx, { silent: true, recordHistory: false });
            toolbar.showToast('Opnieuw uitgevoerd [Cmd+Y]');
            state.isInternalMutation = false;
            return true;
        },

        isUndoKey: function (e) {
            if (!e) return false;
            return (e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ') && !e.shiftKey;
        },

        isRedoKey: function (e) {
            if (!e) return false;
            return ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y' || e.code === 'KeyY')) ||
                   ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ'));
        }
    };

    // ========================================================================
    // 7. Styles & Visual Theme Engine
    // ========================================================================
    const styles = {
        inject: function () {
            if (document.getElementById('hr-deck-editor-styles')) return;

            const styleEl = document.createElement('style');
            styleEl.id = 'hr-deck-editor-styles';
            styleEl.textContent = `
                /* ==========================================================================
                   HR DECK EDITOR DESIGN SYSTEM - ZERO-EMOJI DARK THEME WITH HR ROTTERDAM RED
                   ========================================================================== */

                /* Top Bar Edit Toggle Button */
                .btn-edit-toggle,
                .btn-deck-edit-toggle {
                    background: #111827 !important;
                    border: 1px solid #1f293d !important;
                    color: #38bdf8 !important;
                    padding: 4px 10px !important;
                    border-radius: 6px !important;
                    font-size: 0.74rem !important;
                    font-weight: 800 !important;
                    cursor: pointer !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    transition: all 0.15s ease !important;
                    margin-left: 8px !important;
                    text-decoration: none !important;
                    user-select: none !important;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
                }
                .btn-edit-toggle:hover,
                .btn-deck-edit-toggle:hover {
                    background: #1e293b !important;
                    border-color: #e11d48 !important;
                    color: #ffffff !important;
                }
                .btn-edit-toggle.btn-edit-active,
                .btn-deck-edit-toggle.btn-edit-active {
                    background: #be123c !important;
                    border-color: #e11d48 !important;
                    color: #ffffff !important;
                    box-shadow: 0 0 14px rgba(225, 29, 72, 0.5) !important;
                }
                .btn-edit-toggle kbd,
                .btn-deck-edit-toggle kbd {
                    background: rgba(0, 0, 0, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    border-radius: 3px;
                    padding: 1px 4px;
                    font-size: 0.65rem;
                    font-family: monospace;
                }

                .hr-floating-edit-pill {
                    position: fixed !important;
                    top: 14px !important;
                    right: 14px !important;
                    z-index: 99999 !important;
                }

                /* Main Edit Suite Toolbar (#deckEditToolbar and .hr-edit-toolbar) */
                #deckEditToolbar,
                .hr-edit-toolbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 44px;
                    background: rgba(9, 13, 22, 0.96);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border-bottom: 1.5px solid #be123c;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.8), 0 0 14px rgba(225, 29, 72, 0.2);
                    display: none;
                    align-items: center;
                    padding: 0 14px;
                    gap: 6px;
                    z-index: 9999;
                    user-select: none;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    box-sizing: border-box;
                }

                body.is-editing #deckEditToolbar,
                body.is-editing .hr-edit-toolbar {
                    display: flex !important;
                }
                body.is-editing {
                    padding-top: 44px !important;
                    user-select: auto !important;
                }

                body.is-editing .top-bar {
                    border-bottom: 1.5px solid #be123c !important;
                }
                body.is-editing .tier-selector,
                body.is-editing .portal-nav-btn {
                    display: none !important;
                }

                /* Strict Viewport Containment & Anti-Overflow Protection */
                body.is-editing .slide-viewport,
                body.is-editing #interactiveSlide,
                body.is-editing .slide-content-area {
                    max-height: calc(100% - 64px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }

                body.is-editing .slide-viewport {
                    max-height: calc(100vh - 96px) !important;
                    overflow: hidden !important;
                    position: relative !important;
                    box-sizing: border-box !important;
                    outline: 2px dashed rgba(225, 29, 72, 0.4) !important;
                    outline-offset: -2px;
                }

                body.is-editing #interactiveSlide,
                body.is-editing .view-interactive {
                    height: 100% !important;
                    max-height: 100% !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                    position: relative !important;
                }

                body.is-editing .slide-content-area {
                    max-height: calc(100% - 64px) !important;
                    height: auto !important;
                    min-height: 0 !important;
                    flex: 1 1 auto !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    box-sizing: border-box !important;
                    outline: 1px dashed rgba(56, 189, 248, 0.3) !important;
                    outline-offset: -1px;
                    border-radius: 6px;
                    padding-bottom: 8px !important;
                    scrollbar-width: thin;
                    scrollbar-color: #e11d48 rgba(15, 23, 42, 0.4);
                }

                /* Sleek Custom Scrollbars (Prevents elements falling invisibly off-screen) */
                body.is-editing .slide-content-area::-webkit-scrollbar,
                body.is-editing .left-column::-webkit-scrollbar,
                body.is-editing .right-column::-webkit-scrollbar,
                body.is-editing .slide-viewport::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                body.is-editing .slide-content-area::-webkit-scrollbar-track,
                body.is-editing .left-column::-webkit-scrollbar-track,
                body.is-editing .right-column::-webkit-scrollbar-track,
                body.is-editing .slide-viewport::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.4);
                    border-radius: 4px;
                }
                body.is-editing .slide-content-area::-webkit-scrollbar-thumb,
                body.is-editing .left-column::-webkit-scrollbar-thumb,
                body.is-editing .right-column::-webkit-scrollbar-thumb,
                body.is-editing .slide-viewport::-webkit-scrollbar-thumb {
                    background: #e11d48;
                    border-radius: 4px;
                }
                body.is-editing .slide-content-area::-webkit-scrollbar-thumb:hover,
                body.is-editing .left-column::-webkit-scrollbar-thumb:hover,
                body.is-editing .right-column::-webkit-scrollbar-thumb:hover,
                body.is-editing .slide-viewport::-webkit-scrollbar-thumb:hover {
                    background: #fb7185;
                }

                /* Visual Safe Margins & Viewport Boundary Guide */
                .slide-boundary-guide {
                    position: absolute;
                    inset: 4px;
                    border: 1.5px dashed rgba(225, 29, 72, 0.4);
                    border-radius: 8px;
                    pointer-events: none;
                    z-index: 90;
                    display: none;
                    box-sizing: border-box;
                }
                body.is-editing .slide-boundary-guide {
                    display: block;
                }
                .slide-boundary-guide::after {
                    content: '16:9 VEILIGE ZONE';
                    position: absolute;
                    bottom: 6px;
                    right: 10px;
                    font-size: 0.58rem;
                    font-weight: 800;
                    color: rgba(225, 29, 72, 0.55);
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                }


                .deck-toolbar-left, .deck-toolbar-center, .deck-toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .deck-toolbar-center {
                    margin: 0 auto;
                }
                .deck-toolbar-right {
                    margin-left: auto;
                }

                /* Status Badge */
                .deck-status-badge,
                .hr-edit-status-badge {
                    background: #000000;
                    color: #ffffff;
                    font-size: 0.65rem;
                    font-weight: 900;
                    padding: 3px 8px;
                    border-radius: 4px;
                    border: 1px solid #e11d48;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .deck-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #e11d48;
                    box-shadow: 0 0 6px #e11d48;
                    animation: deckPulseDot 1.8s infinite;
                }
                @keyframes deckPulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.85); }
                }

                /* Live Server Sync Status Pill */
                .deck-sync-pill {
                    background: #111827;
                    border: 1px solid #1f293d;
                    font-size: 0.64rem;
                    font-weight: 800;
                    padding: 3px 8px;
                    border-radius: 12px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    white-space: nowrap;
                }
                .deck-sync-pill.connected {
                    color: #4ade80;
                    border-color: rgba(74, 222, 128, 0.35);
                    background: rgba(74, 222, 128, 0.08);
                }
                .deck-sync-pill.local-only {
                    color: #fb923c;
                    border-color: rgba(251, 146, 60, 0.35);
                    background: rgba(251, 146, 60, 0.08);
                }
                .deck-sync-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .deck-sync-pill.connected .deck-sync-dot { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
                .deck-sync-pill.local-only .deck-sync-dot { background: #fb923c; box-shadow: 0 0 6px #fb923c; }

                /* Autosave Indicator */
                .deck-autosave-badge,
                .hr-autosave-badge {
                    background: #111827;
                    color: #94a3b8;
                    border: 1px solid #1f293d;
                    font-size: 0.62rem;
                    font-weight: 800;
                    padding: 3px 8px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    transition: all 0.2s ease;
                }
                .deck-autosave-badge.saving,
                .hr-autosave-badge.saving {
                    color: #38bdf8;
                    border-color: #38bdf8;
                    background: rgba(56, 189, 248, 0.12);
                }
                .deck-autosave-badge.saved,
                .hr-autosave-badge.saved {
                    color: #4ade80;
                    border-color: #4ade80;
                    background: rgba(74, 222, 128, 0.14);
                }

                /* Toolbar Tool Buttons */
                .deck-tool-btn,
                .hr-edit-tool-btn {
                    background: #111827;
                    border: 1px solid #1f293d;
                    color: #e2e8f0;
                    padding: 4px 9px;
                    border-radius: 5px;
                    font-size: 0.70rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.14s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    white-space: nowrap;
                }
                .deck-tool-btn:hover,
                .hr-edit-tool-btn:hover {
                    background: #1e293b;
                    border-color: #38bdf8;
                    color: #ffffff;
                }
                .deck-tool-btn.primary,
                .hr-edit-tool-btn.primary {
                    background: #be123c;
                    color: #ffffff;
                    font-weight: 900;
                    border-color: #e11d48;
                    box-shadow: 0 0 10px rgba(225, 29, 72, 0.35);
                }
                .deck-tool-btn.primary:hover,
                .hr-edit-tool-btn.primary:hover {
                    background: #e11d48;
                }
                .deck-tool-btn.accent {
                    background: #0369a1;
                    color: #ffffff;
                    border-color: #38bdf8;
                }
                .deck-tool-btn.accent:hover {
                    background: #0284c7;
                }
                .deck-tool-btn.warn,
                .hr-edit-tool-btn.warn {
                    background: #3a1a1a;
                    color: #fca5a5;
                    border-color: #7f1d1d;
                }
                .deck-tool-btn.warn:hover,
                .hr-edit-tool-btn.warn:hover {
                    background: #dc2626;
                    color: #ffffff;
                }
                .deck-tool-btn.close,
                .hr-edit-tool-btn.close {
                    background: #0f172a;
                    color: #94a3b8;
                    border-color: #1e293b;
                }

                .deck-divider-v {
                    width: 1px;
                    height: 18px;
                    background: #1f293d;
                    margin: 0 3px;
                }

                /* Add Menu Dropdown */
                .deck-dropdown-wrap {
                    position: relative;
                    display: inline-block;
                }
                .deck-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    background: #0d121f;
                    border: 1px solid #1f293d;
                    border-radius: 7px;
                    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.9), 0 0 10px rgba(225, 29, 72, 0.2);
                    min-width: 220px;
                    display: none;
                    flex-direction: column;
                    z-index: 10005;
                    padding: 5px;
                }
                .deck-dropdown-menu.is-open {
                    display: flex !important;
                }
                .deck-dropdown-item {
                    background: transparent;
                    border: none;
                    color: #e2e8f0;
                    padding: 7px 10px;
                    border-radius: 4px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.12s ease;
                }
                .deck-dropdown-item:hover {
                    background: #1e293b;
                    color: #38bdf8;
                }
                .deck-dropdown-desc {
                    font-size: 0.62rem;
                    color: #94a3b8;
                    margin-left: auto;
                    font-weight: 500;
                }

                /* Floating Formatting Toolbar (#deckFloatingBar & .hr-element-floating-bar) */
                #deckFloatingBar,
                .hr-element-floating-bar {
                    position: absolute;
                    display: none;
                    align-items: center;
                    background: rgba(11, 15, 25, 0.96);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1.5px solid #e11d48;
                    border-radius: 7px;
                    padding: 4px 6px;
                    gap: 4px;
                    z-index: 9998;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(225, 29, 72, 0.35);
                    user-select: none;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    transform: translate(-50%, -100%);
                    margin-top: -8px;
                    white-space: nowrap;
                }
                #deckFloatingBar::after,
                .hr-element-floating-bar::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 6px 6px 0;
                    border-style: solid;
                    border-color: #e11d48 transparent transparent transparent;
                    display: block;
                    width: 0;
                }
                .deck-float-btn,
                .hr-elem-btn {
                    background: #162032;
                    border: 1px solid #23334e;
                    color: #e2e8f0;
                    height: 26px;
                    border-radius: 4px;
                    font-size: 0.70rem;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.12s ease;
                    padding: 2px 7px;
                }
                .deck-float-btn.icon-only {
                    width: 26px;
                    padding: 0;
                }
                .deck-float-btn:hover,
                .hr-elem-btn:hover {
                    background: #be123c;
                    border-color: #e11d48;
                    color: #ffffff;
                }
                .deck-float-btn.is-active {
                    background: #be123c;
                    border-color: #e11d48;
                    color: #ffffff;
                }
                .deck-float-tag,
                .hr-element-tag-label {
                    font-size: 0.62rem;
                    font-weight: 900;
                    color: #e11d48;
                    background: #000000;
                    padding: 2px 6px;
                    border-radius: 3px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-right: 2px;
                }

                /* Card Font Scale Slider Control */
                .hr-card-font-slider-wrap {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: #141c2c;
                    border: 1px solid #23334e;
                    border-radius: 4px;
                    padding: 2px 6px;
                    height: 26px;
                    box-sizing: border-box;
                }
                .hr-card-font-slider-label {
                    font-size: 0.68rem;
                    font-weight: 800;
                    color: #94a3b8;
                    user-select: none;
                }
                .hr-card-font-slider {
                    width: 76px;
                    height: 4px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: #23334e;
                    border-radius: 2px;
                    outline: none;
                    cursor: pointer;
                    accent-color: #e11d48;
                    margin: 0;
                    padding: 0;
                }
                .hr-card-font-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #e11d48;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(225, 29, 72, 0.6);
                    transition: transform 0.1s ease, background 0.1s ease;
                }
                .hr-card-font-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.25);
                    background: #fb7185;
                }
                .hr-card-font-slider::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #e11d48;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 5px rgba(225, 29, 72, 0.6);
                }
                .hr-card-font-slider-badge {
                    font-size: 0.64rem;
                    font-weight: 800;
                    color: #e11d48;
                    min-width: 32px;
                    text-align: right;
                    font-family: monospace;
                    user-select: none;
                }

                /* Color / Badge Highlight Strip in Floating Bar */
                .deck-color-strip {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    padding: 0 2px;
                }
                .deck-color-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 3px;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: transform 0.12s ease, border-color 0.12s ease;
                }
                .deck-color-dot:hover {
                    transform: scale(1.25);
                    border-color: #ffffff;
                    box-shadow: 0 0 6px currentColor;
                }
                .deck-color-dot.color-primary { background: #e11d48; color: #e11d48; }
                .deck-color-dot.color-green   { background: #10b981; color: #10b981; }
                .deck-color-dot.color-blue    { background: #3b82f6; color: #3b82f6; }
                .deck-color-dot.color-purple  { background: #8b5cf6; color: #8b5cf6; }
                .deck-color-dot.color-amber   { background: #f59e0b; color: #f59e0b; }
                .deck-color-dot.color-danger  { background: #ef4444; color: #ef4444; }

                /* Badge highlights in slide text */
                .badge.badge-primary { background: rgba(225, 29, 72, 0.18) !important; color: #f43f5e !important; border: 1px solid #e11d48 !important; }
                .badge.badge-green   { background: rgba(16, 185, 129, 0.18) !important; color: #34d399 !important; border: 1px solid #10b981 !important; }
                .badge.badge-blue    { background: rgba(59, 130, 246, 0.18) !important; color: #60a5fa !important; border: 1px solid #3b82f6 !important; }
                .badge.badge-purple  { background: rgba(139, 92, 246, 0.18) !important; color: #a78bfa !important; border: 1px solid #8b5cf6 !important; }
                .badge.badge-amber   { background: rgba(245, 158, 11, 0.18) !important; color: #fbbf24 !important; border: 1px solid #f59e0b !important; }
                .badge.badge-danger  { background: rgba(239, 68, 68, 0.18) !important; color: #f87171 !important; border: 1px solid #ef4444 !important; }

                /* Card Action Bar & Dedicated Drag Handle */
                .deck-card-action-bar {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: #0a0e1a;
                    border: 1px solid #1f2b3e;
                    border-top: none;
                    border-right: none;
                    border-radius: 0 0 0 6px;
                    padding: 2px 5px;
                    display: none;
                    align-items: center;
                    gap: 3px;
                    z-index: 120;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
                    user-select: none;
                }
                body.is-editing .content-card:hover .deck-card-action-bar,
                body.is-editing .info-card:hover .deck-card-action-bar,
                body.is-editing .code-box:hover .deck-card-action-bar,
                body.is-editing .code-container:hover .deck-card-action-bar,
                body.is-editing .lab-deep-dive:hover .deck-card-action-bar,
                body.is-editing .comparison-column:hover .deck-card-action-bar,
                body.is-editing .deck-accordion-card:hover .deck-card-action-bar,
                body.is-editing .img-edit-card:hover .deck-card-action-bar,
                body.is-editing .glr-selected-element .deck-card-action-bar,
                body.is-editing .deck-selected-element .deck-card-action-bar {
                    display: flex !important;
                }

                .deck-card-btn {
                    background: #141c2c;
                    border: 1px solid #23334e;
                    color: #cbd5e1;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 0.62rem !important;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.12s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                }
                .deck-card-btn:hover {
                    background: #1e293b;
                    color: #38bdf8;
                    border-color: #38bdf8;
                }
                .deck-card-btn.danger,
                .hr-elem-btn.danger {
                    color: #fca5a5;
                    border-color: #7f1d1d;
                }
                .deck-card-btn.danger:hover,
                .hr-elem-btn.danger:hover {
                    background: #dc2626;
                    color: #ffffff;
                    border-color: #ef4444;
                }

                .deck-card-drag-handle {
                    cursor: grab;
                    padding: 2px 4px;
                    display: inline-flex;
                    align-items: center;
                    color: #64748b;
                    border-radius: 3px;
                    transition: color 0.12s ease;
                }
                .deck-card-drag-handle:hover {
                    color: #e11d48;
                    background: rgba(225, 29, 72, 0.12);
                }
                .deck-card-drag-handle:active {
                    cursor: grabbing;
                }

                /* Editable Cards in Edit Mode (Strict Box-Sizing & Anti-Overflow Containment) */
                body.is-editing .content-card,
                body.is-editing .info-card,
                body.is-editing .deep-dive-card,
                body.is-editing .code-container,
                body.is-editing .code-box,
                body.is-editing .lab-deep-dive,
                body.is-editing .deck-accordion-card,
                body.is-editing .comparison-column,
                body.is-editing .img-edit-card,
                body.is-editing .card {
                    border-style: dashed !important;
                    cursor: pointer;
                    position: relative;
                    box-sizing: border-box !important;
                    transition: outline 0.14s ease, box-shadow 0.14s ease;
                    max-width: 100% !important;
                    overflow: hidden !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }
                body.is-editing .content-card:hover,
                body.is-editing .info-card:hover,
                body.is-editing .code-box:hover,
                body.is-editing .code-container:hover,
                body.is-editing .lab-deep-dive:hover,
                body.is-editing .comparison-column:hover,
                body.is-editing .deck-accordion-card:hover,
                body.is-editing .img-edit-card:hover {
                    outline: 1.5px dashed #38bdf8;
                }
                body.is-editing .glr-selected-element,
                body.is-editing .deck-selected-element {
                    outline: 2px solid #e11d48 !important;
                    box-shadow: 0 0 16px rgba(225, 29, 72, 0.45) !important;
                    border-style: solid !important;
                }
                body.is-editing [contenteditable="true"] {
                    outline: none;
                    cursor: text;
                }
                body.is-editing [contenteditable="true"]:focus {
                    background: rgba(225, 29, 72, 0.08);
                    border-radius: 3px;
                }

                /* Drag & Drop Visuals & Magnetic Snap Engine */
                .glr-card-dragging,
                .deck-card-dragging {
                    opacity: 0.85 !important;
                    border: 2px dashed #06b6d4 !important;
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(6, 182, 212, 0.4) !important;
                    cursor: grabbing !important;
                    user-select: none !important;
                }
                .glr-drop-placeholder,
                .deck-drop-placeholder {
                    border: 2px dashed #e11d48;
                    background: rgba(225, 29, 72, 0.08);
                    border-radius: 8px;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #e11d48;
                    font-size: 0.72rem;
                    font-weight: 900;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin: 6px 0;
                    pointer-events: none;
                    box-shadow: 0 0 14px rgba(225, 29, 72, 0.25);
                }
                /* Magnetic Snap Guide Lines (Rotterdam Red & Cyan) */
                .deck-snap-guide-x,
                .glr-snap-guide-v {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(180deg, #06b6d4, #e11d48);
                    box-shadow: 0 0 8px #06b6d4, 0 0 14px rgba(225, 29, 72, 0.6);
                    pointer-events: none;
                    z-index: 10005;
                }
                .deck-snap-guide-y,
                .glr-snap-guide-h {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #06b6d4, #e11d48);
                    box-shadow: 0 0 8px #06b6d4, 0 0 14px rgba(225, 29, 72, 0.6);
                    pointer-events: none;
                    z-index: 10005;
                }
                .deck-card-free-placed {
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35) !important;
                }
                .deck-tool-btn.active,
                .hr-edit-tool-btn.active {
                    background: #082f49 !important;
                    border-color: #06b6d4 !important;
                    color: #38bdf8 !important;
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.4) !important;
                }
                .deck-tool-btn kbd {
                    background: rgba(0, 0, 0, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    border-radius: 3px;
                    padding: 1px 4px;
                    font-size: 0.65rem;
                    font-family: monospace;
                }
                .card-swap-flash {
                    animation: cardSwapHighlight 0.6s ease;
                }
                @keyframes cardSwapHighlight {
                    0% { background: rgba(225, 29, 72, 0.25); }
                    100% { background: transparent; }
                }

                /* Toast Notification System (#deckToastContainer & .hr-toast) */
                #deckToastContainer {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    z-index: 10010;
                    pointer-events: none;
                }
                .deck-toast {
                    background: #0d121f;
                    border: 1.5px solid #1f2b3e;
                    color: #ffffff;
                    padding: 9px 14px;
                    border-radius: 7px;
                    font-size: 0.76rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85), 0 0 12px rgba(0, 0, 0, 0.5);
                    pointer-events: auto;
                    animation: deckToastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    max-width: 380px;
                }
                .deck-toast.success { border-color: #10b981; }
                .deck-toast.warning { border-color: #f59e0b; }
                .deck-toast.error   { border-color: #ef4444; }
                .deck-toast.info    { border-color: #e11d48; }

                .deck-toast-btn {
                    background: #1f2b3e;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #38bdf8;
                    padding: 2px 7px;
                    border-radius: 4px;
                    font-size: 0.68rem;
                    font-weight: 800;
                    cursor: pointer;
                    margin-left: auto;
                }
                .deck-toast-btn:hover {
                    background: #38bdf8;
                    color: #000000;
                }
                @keyframes deckToastIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .hr-toast {
                    position: fixed;
                    bottom: 60px;
                    right: 20px;
                    background: #0f1624;
                    border: 1.5px solid #be123c;
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 0.80rem;
                    font-weight: 800;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(225, 29, 72, 0.3);
                    z-index: 1000;
                    display: none;
                }

                /* Card Width Variations */
                .content-card.full-width-card,
                .card.full-width-card,
                .code-box.full-width-card,
                .lab-deep-dive.full-width-card,
                .deck-accordion-card.full-width-card {
                    width: 100% !important;
                    max-width: 100% !important;
                    grid-column: 1 / -1 !important;
                }
                .content-card.third-width-card,
                .card.third-width-card {
                    width: 32% !important;
                }

                /* Column drop containers & Anti-Wrapping Containment */
                body.is-editing .left-column,
                body.is-editing .right-column {
                    min-height: 120px !important;
                    max-height: 100% !important;
                    min-width: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    display: flex !important;
                    flex-direction: column !important;
                    flex-wrap: nowrap !important;
                    gap: 12px;
                    transition: all 0.15s ease;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    scrollbar-color: #e11d48 rgba(15, 23, 42, 0.4);
                }
                body.is-editing .split-media-layout,
                body.is-editing .split-layout,
                body.is-editing .two-column-layout {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 1.6cqw !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                    flex-wrap: nowrap !important;
                    min-width: 0 !important;
                    min-height: 0 !important;
                    box-sizing: border-box !important;
                    align-items: start !important;
                }
                body.is-editing .left-column:empty,
                body.is-editing .right-column:empty,
                body.is-editing .left-column.is-empty-col,
                body.is-editing .right-column.is-empty-col {
                    min-height: 140px !important;
                    border: 2px dashed rgba(225, 29, 72, 0.45) !important;
                    border-radius: 8px !important;
                    background: rgba(225, 29, 72, 0.04) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: relative;
                }
                body.is-editing .left-column.is-empty-col::after,
                body.is-editing .left-column:empty::after {
                    content: '+ Sleep kaart hierheen (Linkerkolom)';
                    color: #e11d48;
                    font-size: 0.74rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    pointer-events: none;
                }
                body.is-editing .right-column.is-empty-col::after,
                body.is-editing .right-column:empty::after {
                    content: '+ Sleep kaart hierheen (Rechterkolom)';
                    color: #e11d48;
                    font-size: 0.74rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    pointer-events: none;
                }

                body:not(.is-editing) .split-media-layout.single-active-col,
                body:not(.is-editing) .split-layout.single-active-col {
                    grid-template-columns: 1fr !important;
                }
                body:not(.is-editing) .split-media-layout.single-active-col > .right-column.is-empty-col,
                body:not(.is-editing) .split-layout.single-active-col > .right-column.is-empty-col,
                body:not(.is-editing) .split-media-layout.single-active-col > .right-column:empty,
                body:not(.is-editing) .split-layout.single-active-col > .right-column:empty {
                    display: none !important;
                }

                /* Precision Resize Grip */
                .glr-resize-grip {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 24px;
                    height: 24px;
                    cursor: nwse-resize;
                    z-index: 80;
                    display: none;
                    touch-action: none;
                    user-select: none;
                    align-items: flex-end;
                    justify-content: flex-end;
                    padding: 3px;
                }
                body.is-editing .glr-resize-grip {
                    display: flex !important;
                }
                .glr-resize-grip::before {
                    content: '';
                    width: 4px;
                    height: 4px;
                    border-right: 2px solid #e11d48;
                    border-bottom: 2px solid #e11d48;
                    margin-right: 2px;
                    margin-bottom: 2px;
                    pointer-events: none;
                }
                .glr-resize-grip::after {
                    content: '';
                    width: 9px;
                    height: 9px;
                    border-right: 2.5px solid #e11d48;
                    border-bottom: 2.5px solid #e11d48;
                    pointer-events: none;
                }
                .glr-resize-grip:hover::before,
                .glr-resize-grip:hover::after,
                .glr-resize-grip.is-resizing::before,
                .glr-resize-grip.is-resizing::after {
                    border-color: #ffffff !important;
                }

                /* ==========================================================================
                   AUTHENTIC JETBRAINS RIDER / UNITY C# THEME (UNIVERSAL CODE STYLES)
                   ========================================================================== */
                .code-box,
                .code-container {
                    background: #1e1f22 !important;
                    border: 1px solid #393b40 !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
                    margin: 8px 0 !important;
                    position: relative;
                    box-sizing: border-box;
                }

                .code-box pre,
                .code-container pre {
                    background: #1e1f22 !important;
                    color: #bcbec4 !important;
                    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace !important;
                    font-size: calc(clamp(0.64rem, 1.35cqh, 0.76rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1)) !important;
                    line-height: 1.48 !important;
                    padding: 12px 16px !important;
                    margin: 0 !important;
                    overflow-x: auto !important;
                    white-space: pre !important;
                    word-break: normal !important;
                    word-wrap: normal !important;
                }

                .code-box pre code,
                .code-container pre code {
                    background: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    white-space: pre !important;
                }

                /* Universal Card & Div Relative Font Scaling Engine */
                .content-card,
                .info-card,
                .steps-card,
                .media-panel-card,
                .code-box,
                .code-container,
                .hero-topic-card {
                    --card-font-scale: 1;
                    font-size: calc(clamp(0.68rem, 1.45cqh, 0.85rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1));
                }

                .content-card .card-title,
                .info-card .card-title,
                .steps-card .card-title,
                .media-panel-card .card-title,
                .info-card-title,
                .card-title {
                    font-size: calc(clamp(0.78rem, 1.8cqh, 1.0rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1)) !important;
                }

                .content-card .card-body,
                .info-card .card-body,
                .steps-card .card-body,
                .media-panel-card .card-body,
                .hero-topic-card,
                .info-card-text,
                .card-body {
                    font-size: calc(clamp(0.68rem, 1.45cqh, 0.85rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1)) !important;
                }

                .content-card p,
                .info-card p,
                .steps-card p,
                .media-panel-card p,
                .hero-topic-card p,
                .code-box p,
                .code-container p,
                .content-card li,
                .info-card li,
                .steps-card li,
                .media-panel-card li,
                .hero-topic-card li,
                .steps-card .step-item {
                    font-size: calc(clamp(0.68rem, 1.45cqh, 0.85rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1)) !important;
                }

                .content-card pre,
                .info-card pre,
                .steps-card pre,
                .media-panel-card pre,
                .hero-topic-card pre {
                    font-size: calc(clamp(0.64rem, 1.35cqh, 0.76rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1)) !important;
                }

                .content-card code,
                .info-card code,
                .steps-card code,
                .media-panel-card code,
                .hero-topic-card code {
                    font-size: calc(clamp(0.64rem, 1.35cqh, 0.76rem) * var(--card-font-scale, 1) * var(--slide-font-scale, 1) * var(--font-scale, 1)) !important;
                }

                /* JetBrains Rider Editor Tab Header */
                .jb-editor-header,
                .code-container .code-header,
                .code-box .code-header {
                    background: #2b2d30 !important;
                    border-bottom: 1px solid #393b40 !important;
                    padding: 4px 12px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    min-height: 30px;
                    box-sizing: border-box;
                    user-select: none;
                }

                .jb-editor-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: #1e1f22;
                    padding: 3px 10px;
                    border-radius: 5px 5px 0 0;
                    border: 1px solid #393b40;
                    border-bottom: 1px solid #1e1f22;
                    margin-bottom: -5px;
                    color: #dfe1e5;
                    font-size: 0.74rem;
                    font-family: 'JetBrains Mono', Consolas, monospace;
                    font-weight: 600;
                }

                .jb-csharp-icon {
                    background: linear-gradient(135deg, #178600 0%, #239120 100%);
                    color: #ffffff;
                    font-size: 0.60rem;
                    font-weight: 900;
                    padding: 1px 4px;
                    border-radius: 3px;
                    line-height: 1.1;
                    display: inline-block;
                    letter-spacing: -0.2px;
                }

                .jb-filename {
                    color: #dfe1e5;
                    font-family: 'JetBrains Mono', Consolas, monospace;
                }

                .code-copy-btn {
                    font-size: 0.68rem !important;
                    padding: 2px 8px !important;
                    border-radius: 4px !important;
                    background: #393b40 !important;
                    color: #bcbec4 !important;
                    border: 1px solid #4e5157 !important;
                    cursor: pointer !important;
                    transition: all 0.12s ease !important;
                }
                .code-copy-btn:hover {
                    background: #4e5157 !important;
                    color: #ffffff !important;
                    border-color: #6897bb !important;
                }

                /* JetBrains Rider Syntax Token Classes */
                .jb-keyword {
                    color: #cf8e6d !important;
                    font-weight: 600;
                }
                .jb-type {
                    color: #4ec9b0 !important;
                    font-weight: 500;
                }
                .jb-method {
                    color: #ffc66d !important;
                }
                .jb-number {
                    color: #6897bb !important;
                }
                .jb-string {
                    color: #6a8759 !important;
                }
                .jb-attr {
                    color: #bbb529 !important;
                }
                .jb-comment {
                    color: #808080 !important;
                    font-style: italic !important;
                }
                .jb-plain {
                    color: #bcbec4 !important;
                }
            `;
            document.head.appendChild(styleEl);
        }
    };

    // ========================================================================
    // 8. WYSIWYG Toolbar & UI Controls (WYSIWYG & Toolbar Suite)
    // ========================================================================
    const SVG = {
        bold: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>`,
        italic: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>`,
        code: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        bulletList: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
        numberedList: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>`,
        plus: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        minus: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        undo: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
        redo: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
        save: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
        grid: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
        drag: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="2"></circle><circle cx="16" cy="6" r="2"></circle><circle cx="8" cy="12" r="2"></circle><circle cx="16" cy="12" r="2"></circle><circle cx="8" cy="18" r="2"></circle><circle cx="16" cy="18" r="2"></circle></svg>`,
        up: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
        down: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
        copy: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
        trash: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
        convert: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
        export: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
        reset: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>`,
        check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        warning: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        cross: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        magnet: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="6" y1="8" x2="10" y2="8"></line><line x1="14" y1="8" x2="18" y2="8"></line><line x1="6" y1="3" x2="10" y2="3"></line><line x1="14" y1="3" x2="18" y2="3"></line></svg>`,
        expand: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
    };

    const toolbar = {
        _tools: [],
        _floatingActions: [],

        init: function () {
            styles.inject();
            this.createUiElements();
            this.setupSelectionListeners();
            this.checkServerConnection();
            return this;
        },

        registerTool: function (toolDef) {
            if (toolDef && toolDef.id) {
                this._tools.push(toolDef);
                this.renderCustomTool(toolDef);
            }
            return this;
        },

        registerFloatingAction: function (actionDef) {
            if (actionDef && actionDef.id) {
                this._floatingActions.push(actionDef);
                this.renderCustomFloatingAction(actionDef);
            }
            return this;
        },

        createUiElements: function () {
            // 1. Edit Button in Top Bar (or floating fallback)
            const topBar = document.querySelector('.top-bar, header, nav, .header');
            if (!document.getElementById('btnEditToggle') && !document.getElementById('btnDeckTopBarToggle')) {
                const btn = document.createElement('button');
                btn.className = 'btn-edit-toggle' + (topBar ? '' : ' hr-floating-edit-pill');
                btn.id = 'btnEditToggle';
                btn.title = 'Bewerken Modus [E]';
                btn.innerHTML = 'Bewerken <kbd>[E]</kbd>';
                btn.onclick = () => DeckEditor.toggle();

                if (topBar) {
                    const tierSelector = topBar.querySelector('.tier-selector, .tier-filter');
                    if (tierSelector) {
                        topBar.insertBefore(btn, tierSelector.nextSibling);
                    } else {
                        topBar.appendChild(btn);
                    }
                } else {
                    document.body.appendChild(btn);
                }
            }

            // 2. Main Edit Suite Toolbar (#deckEditToolbar and legacy #hrEditToolbar)
            if (!document.getElementById('deckEditToolbar') && !document.getElementById('hrEditToolbar')) {
                const tb = document.createElement('div');
                tb.className = 'hr-edit-toolbar';
                tb.id = 'deckEditToolbar';
                tb.innerHTML = `
                    <div class="deck-toolbar-left">
                        <span class="deck-status-badge">
                            <span class="deck-status-dot"></span> EDIT SUITE
                        </span>
                        <span class="deck-sync-pill local-only" id="deckServerSyncPill" title="Server Sync Status: Klik voor status">
                            <span class="deck-sync-dot"></span> Alleen Browser
                        </span>
                        <span class="deck-autosave-badge" id="hrAutoSaveBadge">Autosave: Actief</span>
                    </div>

                    <div class="deck-toolbar-center">
                        <button class="deck-tool-btn" id="btnDeckUndo" onclick="DeckEditor.undo()" title="Ongedaan maken [Cmd+Z / Ctrl+Z]">${SVG.undo} Undo</button>
                        <button class="deck-tool-btn" id="btnDeckRedo" onclick="DeckEditor.redo()" title="Opnieuw uitvoeren [Cmd+Shift+Z / Cmd+Y]">${SVG.redo} Redo</button>
                        <div class="deck-divider-v"></div>

                        <div class="deck-dropdown-wrap">
                            <button class="deck-tool-btn primary" id="btnDeckAddMenu">${SVG.plus} Element Invoegen</button>
                            <div class="deck-dropdown-menu" id="deckAddDropdown">
                                <button class="deck-dropdown-item" data-add="info">
                                    <span>Info Kaart</span>
                                    <span class="deck-dropdown-desc">Titel + Uitleg</span>
                                </button>
                                <button class="deck-dropdown-item" data-add="code">
                                    <span>Code Blok</span>
                                    <span class="deck-dropdown-desc">Syntax C#</span>
                                </button>
                                <button class="deck-dropdown-item" data-add="deepdive">
                                    <span>Deep Dive / Valkuil</span>
                                    <span class="deck-dropdown-desc">Waarschuwing</span>
                                </button>
                                <button class="deck-dropdown-item" data-add="accordion">
                                    <span>Accordion Details</span>
                                    <span class="deck-dropdown-desc">Uitklapbaar</span>
                                </button>
                                <button class="deck-dropdown-item" data-add="split">
                                    <span>2-Koloms Splitsing</span>
                                    <span class="deck-dropdown-desc">Links & Rechts</span>
                                </button>
                                <button class="deck-dropdown-item" data-add="image">
                                    <span>Afbeelding Kaart</span>
                                    <span class="deck-dropdown-desc">Upload / URL</span>
                                </button>
                            </div>
                        </div>

                        <button class="deck-tool-btn" id="btnLayoutCycle" onclick="DeckEditor.cycleLayout()" title="Wissel aantal kolommen (1 / 2 / 3 kolommen)">${SVG.grid} Lay-out: 2 Kol.</button>
                        <div class="deck-divider-v"></div>
                        <button class="deck-tool-btn active" id="btnDeckSnapToggle" onclick="DeckEditor.toggleMagneticSnap()" title="Magnetisch Snappen [S] (Aan/Uit)">${SVG.magnet} Snap: Aan <kbd>[S]</kbd></button>
                        <button class="deck-tool-btn" id="btnDeckSnapGridCycle" onclick="DeckEditor.cycleSnapGridSize()" title="Wissel Snap Grid Resolutie (10px / 20px)">Grid: 20px</button>
                        <div class="deck-divider-v"></div>
                        <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">Slide Schaal:</span>
                        <button class="deck-tool-btn" id="btnSlideScaleMinus" onclick="DeckEditor.scaleCurrentSlideFont(0.90)" title="Schaal alle tekst op deze slide kleiner (-10%)">A-</button>
                        <span class="deck-tool-btn" id="deckSlideScaleBadge" style="cursor: default; min-width: 42px; text-align: center;">100%</span>
                        <button class="deck-tool-btn" id="btnSlideScalePlus" onclick="DeckEditor.scaleCurrentSlideFont(1.10)" title="Schaal alle tekst op deze slide groter (+10%)">A+</button>
                        <button class="deck-tool-btn" id="btnSlideScaleAuto" onclick="DeckEditor.autoSizeCurrentSlide()" title="Auto-size: meet en pas alle kaarten op deze slide automatisch aan">Auto-Fit</button>
                        <button class="deck-tool-btn" id="btnSlideFillSpace" onclick="DeckEditor.fillCurrentSlide()" title="Vul Ruimte: maak alle divs en tekst schermvullend zonder lege ruimtes">${SVG.expand} Vul Ruimte</button>
                        <button class="deck-tool-btn" onclick="DeckEditor.resetCurrentSlideFont()" title="Reset slide schaal naar 100%">100%</button>
                        <span id="hrCustomToolsContainer"></span>
                    </div>

                    <div class="deck-toolbar-right">
                        <button class="deck-tool-btn accent" id="btnDeckSave" onclick="DeckEditor.save(false)" title="Opslaan op schijf [Ctrl+S]">${SVG.save} Opslaan</button>
                        <button class="deck-tool-btn warn" id="btnDeckReset" onclick="DeckEditor.reset()" title="Slide herstellen naar origineel">${SVG.reset} Herstel</button>
                        <button class="deck-tool-btn warn" id="btnDeckResetTemplate" onclick="DeckEditor.resetToTemplate()" title="Verwijder alle lokale bewerkingen en herstel schone template">&#8634; Reset naar template</button>
                        <div class="deck-dropdown-wrap">
                            <button class="deck-tool-btn" id="btnDeckExportMenu" title="Export opties">${SVG.export} Exporteer &#9662;</button>
                            <div class="deck-dropdown-menu" id="deckExportDropdown" style="right: 0; left: auto; min-width: 220px;">
                                <button class="deck-dropdown-item" onclick="DeckEditor.exportSlideHtml()">
                                    <span>Download Slide HTML</span>
                                    <span class="deck-dropdown-desc">Enkele slide</span>
                                </button>
                                <button class="deck-dropdown-item" onclick="DeckEditor.exportFullPresentationHtml()">
                                    <span>Download Volledige HTML</span>
                                    <span class="deck-dropdown-desc">Hele presentatie</span>
                                </button>
                                <button class="deck-dropdown-item" onclick="DeckEditor.copySlideJson()">
                                    <span>Kopieer Slide JSON</span>
                                    <span class="deck-dropdown-desc">Klembord</span>
                                </button>
                                <button class="deck-dropdown-item" onclick="DeckEditor.exportDeckJson()">
                                    <span>Download Deck JSON</span>
                                    <span class="deck-dropdown-desc">Alle slides</span>
                                </button>
                            </div>
                        </div>
                        <div class="deck-divider-v"></div>
                        <button class="deck-tool-btn close" id="btnDeckClose" onclick="DeckEditor.toggle()" title="Bewerkmodus Sluiten [E]">${SVG.cross} Sluiten [E]</button>
                    </div>
                `;

                // Add legacy ID for backward compatibility
                tb.setAttribute('data-legacy-id', 'hrEditToolbar');

                document.body.insertBefore(tb, document.body.firstChild);
                this.setupDropdownEvents(tb);
                this.setupSyncPillEvents(tb);
            }

            // 3. Floating Formatting Toolbar (#deckFloatingBar and #hrElementFloatingBar)
            this.createFloatingBar();

            // 4. Toast Notification Container
            if (!document.getElementById('deckToastContainer')) {
                const toastContainer = document.createElement('div');
                toastContainer.id = 'deckToastContainer';
                document.body.appendChild(toastContainer);
            }

            // 5. Legacy Toast element fallback
            if (!document.getElementById('hrToast')) {
                const toast = document.createElement('div');
                toast.className = 'hr-toast';
                toast.id = 'hrToast';
                document.body.appendChild(toast);
            }

            eventBus.emit('toolbarReady', {
                toolbar: document.getElementById('deckEditToolbar') || document.getElementById('hrEditToolbar'),
                floatingBar: document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar')
            });
        },

        createFloatingBar: function () {
            if (typeof document === 'undefined') return null;
            let floatBar = document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar');
            if (!floatBar) {
                floatBar = document.createElement('div');
                floatBar.className = 'hr-element-floating-bar';
                floatBar.id = 'deckFloatingBar';
                floatBar.innerHTML = `
                    <span class="deck-float-tag" id="hrElementTagLabel">OPMAAK</span>
                    
                    <!-- Text Formatting Strip -->
                    <button class="deck-float-btn icon-only" id="btnFloatBold" title="Vetgedrukt [Ctrl+B]">${SVG.bold}</button>
                    <button class="deck-float-btn icon-only" id="btnFloatItalic" title="Cursief [Ctrl+I]">${SVG.italic}</button>
                    <button class="deck-float-btn icon-only" id="btnFloatCode" title="Inline Code">${SVG.code}</button>
                    <button class="deck-float-btn icon-only" id="btnFloatList" title="Opsommingstekenlijst">${SVG.bulletList}</button>
                    <button class="deck-float-btn icon-only" id="btnFloatNumList" title="Genummerde lijst">${SVG.numberedList}</button>
                    <div class="deck-divider-v"></div>

                    <!-- Font Scaling Slider & Quick Actions -->
                    <div class="hr-card-font-slider-wrap" title="Tekstschaal aanpassen voor deze kaart/div">
                        <span class="hr-card-font-slider-label">A</span>
                        <input type="range" min="50" max="220" value="100" step="5" class="hr-card-font-slider" id="cardFontScaleSlider" title="Versleep om tekstgrootte aan te passen (50% - 220%)">
                        <span class="hr-card-font-slider-badge" id="cardFontScaleBadge">100%</span>
                    </div>
                    <button class="deck-float-btn" id="btnFloatFontMinus" title="Tekst kleiner in geselecteerde div/kaart (-10%)">A-</button>
                    <button class="deck-float-btn" id="btnFloatFontPlus" title="Tekst groter in geselecteerde div/kaart (+10%)">A+</button>
                    <button class="deck-float-btn auto-fit" id="btnFloatFontAuto" title="Auto-size: pas tekstgrootte automatisch aan op formaat van deze div">Auto</button>
                    <button class="deck-float-btn fill-space" id="btnFloatFontFill" title="Vul Ruimte: laat kaart en tekst de hoogte vullen">${SVG.expand} Vul</button>
                    <button class="deck-float-btn" id="btnFloatFontReset" title="Reset tekstgrootte naar standaard (100%)">100%</button>
                    <button class="deck-float-btn warn" id="btnFloatResetTemplate" onclick="DeckEditor.resetToTemplate()" title="Verwijder alle lokale bewerkingen en herstel schone template">&#8634; Reset naar template</button>
                    <div class="deck-divider-v"></div>

                    <!-- Badge Highlight Palette -->
                    <div class="deck-color-strip" title="Badge / Kleuraccent toevoegen">
                        <span class="deck-color-dot color-primary" data-color="primary" title="Primary Red (#e11d48)"></span>
                        <span class="deck-color-dot color-green" data-color="green" title="Core Green (#10b981)"></span>
                        <span class="deck-color-dot color-blue" data-color="blue" title="Adv Blue (#3b82f6)"></span>
                        <span class="deck-color-dot color-purple" data-color="purple" title="Exp Purple (#8b5cf6)"></span>
                        <span class="deck-color-dot color-amber" data-color="amber" title="Amber Warning (#f59e0b)"></span>
                        <span class="deck-color-dot color-danger" data-color="danger" title="Crimson Danger (#ef4444)"></span>
                    </div>

                    <!-- Card Specific Actions Strip (Visible when card is focused) -->
                    <span id="deckCardFloatingActions" style="display: none; align-items: center; gap: 4px;">
                        <div class="deck-divider-v"></div>
                        <button class="deck-float-btn" id="btnToggleSpan" onclick="DeckEditor.toggleSpan()" title="Wissel tussen 100% volledige rij en kolom">100% Rij</button>
                        <button class="deck-float-btn" onclick="DeckEditor.moveColumn('left')" title="Verplaats naar Linkerkolom">&larr; Links</button>
                        <button class="deck-float-btn" onclick="DeckEditor.moveColumn('right')" title="Verplaats naar Rechterkolom">Rechts &rarr;</button>
                        <button class="deck-float-btn icon-only" onclick="DeckEditor.reorder(-1)" title="Verplaats Omhoog">${SVG.up}</button>
                        <button class="deck-float-btn icon-only" onclick="DeckEditor.reorder(1)" title="Verplaats Omlaag">${SVG.down}</button>
                        <button class="deck-float-btn" onclick="DeckEditor.duplicate()" title="Dupliceer Kaart">${SVG.copy} Kopieer</button>
                        <button class="deck-float-btn danger icon-only" onclick="DeckEditor.delete()" title="Verwijder Kaart">${SVG.trash}</button>
                    </span>

                    <span id="hrCustomFloatingContainer"></span>
                `;

                document.body.appendChild(floatBar);
                this.setupFloatingFormattingEvents(floatBar);
            }
            return floatBar;
        },

        setupDropdownEvents: function (tb) {
            const addBtn = tb.querySelector('#btnDeckAddMenu');
            const addDropdown = tb.querySelector('#deckAddDropdown');
            if (addBtn && addDropdown) {
                addBtn.onclick = (e) => {
                    e.stopPropagation();
                    const isOpen = addDropdown.classList.contains('is-open');
                    tb.querySelectorAll('.deck-dropdown-menu').forEach(m => m.classList.remove('is-open'));
                    if (!isOpen) addDropdown.classList.add('is-open');
                };

                addDropdown.querySelectorAll('.deck-dropdown-item').forEach(item => {
                    item.onclick = (e) => {
                        e.stopPropagation();
                        addDropdown.classList.remove('is-open');
                        const addType = item.dataset.add;
                        operations.addCard(addType);
                    };
                });
            }

            const exportBtn = tb.querySelector('#btnDeckExportMenu');
            const exportDropdown = tb.querySelector('#deckExportDropdown');
            if (exportBtn && exportDropdown) {
                exportBtn.onclick = (e) => {
                    e.stopPropagation();
                    const isOpen = exportDropdown.classList.contains('is-open');
                    tb.querySelectorAll('.deck-dropdown-menu').forEach(m => m.classList.remove('is-open'));
                    if (!isOpen) exportDropdown.classList.add('is-open');
                };

                exportDropdown.querySelectorAll('.deck-dropdown-item').forEach(item => {
                    item.onclick = (e) => {
                        exportDropdown.classList.remove('is-open');
                    };
                });
            }

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.deck-dropdown-wrap')) {
                    tb.querySelectorAll('.deck-dropdown-menu').forEach(m => m.classList.remove('is-open'));
                }
            });
        },

        setupSyncPillEvents: function (tb) {
            const pill = tb.querySelector('#deckServerSyncPill');
            if (!pill) return;

            pill.onclick = (e) => {
                e.stopPropagation();
                this.checkServerConnection(true);
            };
        },

        setupFloatingFormattingEvents: function (bar) {
            bar.querySelector('#btnFloatBold').onclick = (e) => {
                e.preventDefault();
                this.formatText('bold');
            };
            bar.querySelector('#btnFloatItalic').onclick = (e) => {
                e.preventDefault();
                this.formatText('italic');
            };
            bar.querySelector('#btnFloatCode').onclick = (e) => {
                e.preventDefault();
                this.toggleInlineCode();
            };
            bar.querySelector('#btnFloatList').onclick = (e) => {
                e.preventDefault();
                this.formatText('insertUnorderedList');
            };
            bar.querySelector('#btnFloatNumList').onclick = (e) => {
                e.preventDefault();
                this.formatText('insertOrderedList');
            };

            // Slider Control for Card Font Scaling
            const slider = bar.querySelector('#cardFontScaleSlider');
            const badge = bar.querySelector('#cardFontScaleBadge');
            if (slider) {
                let isDraggingSlider = false;

                slider.onpointerdown = (e) => {
                    e.stopPropagation();
                    isDraggingSlider = true;
                    const slideIdx = dom.getCurrentSlideIndex();
                    history.recordState(slideIdx);
                };

                slider.oninput = (e) => {
                    e.stopPropagation();
                    const val = parseInt(slider.value, 10);
                    const scale = val / 100;
                    if (badge) badge.textContent = val + '%';
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.applyDirectFontScaleToCard(target, scale);
                    }
                };

                const finishSliderChange = (e) => {
                    if (e) e.stopPropagation();
                    if (!isDraggingSlider) return;
                    isDraggingSlider = false;
                    const val = parseInt(slider.value, 10);
                    const scale = val / 100;
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.applyDirectFontScaleToCard(target, scale);
                        const slideIdx = dom.getCurrentSlideIndex();
                        storage.saveSlide(slideIdx, { silent: true });
                        operations.triggerAutoSave(200);
                        toolbar.showToast(`Kaart tekstgrootte: ${val}% (opgeslagen)`);
                    }
                };

                slider.onpointerup = finishSliderChange;
                slider.onchange = finishSliderChange;
            }

            const btnMinus = bar.querySelector('#btnFloatFontMinus');
            if (btnMinus) {
                btnMinus.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.scaleCardFont(target, 0.90);
                        this.syncCardFontSlider(target);
                    } else {
                        operations.scaleFont(0.90);
                    }
                };
            }

            const btnPlus = bar.querySelector('#btnFloatFontPlus');
            if (btnPlus) {
                btnPlus.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.scaleCardFont(target, 1.10);
                        this.syncCardFontSlider(target);
                    } else {
                        operations.scaleFont(1.10);
                    }
                };
            }

            const btnAuto = bar.querySelector('#btnFloatFontAuto');
            if (btnAuto) {
                btnAuto.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.autoSizeCardFont(target);
                        this.syncCardFontSlider(target);
                    }
                };
            }

            const btnFill = bar.querySelector('#btnFloatFontFill');
            if (btnFill) {
                btnFill.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.fillCard(target);
                        this.syncCardFontSlider(target);
                    }
                };
            }

            const btnReset = bar.querySelector('#btnFloatFontReset');
            if (btnReset) {
                btnReset.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = operations.getTargetCardOrElement();
                    if (target) {
                        operations.scaleCardFont(target, 1.0, true);
                        this.syncCardFontSlider(target);
                    }
                };
            }

            bar.querySelectorAll('.deck-color-dot').forEach(dot => {
                dot.onclick = (e) => {
                    e.preventDefault();
                    this.applyBadgeHighlight(dot.dataset.color);
                };
            });
        },

        setupSelectionListeners: function () {
            document.addEventListener('selectionchange', () => {
                if (state.isEditMode) {
                    this.updateFloatingBarPosition();
                }
            });

            document.addEventListener('mouseup', () => {
                if (state.isEditMode) {
                    setTimeout(() => this.updateFloatingBarPosition(), 20);
                }
            });
        },

        toggleInlineCode: function () {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const parentCode = range.commonAncestorContainer.parentElement ? range.commonAncestorContainer.parentElement.closest('code') : null;

            if (parentCode) {
                const text = document.createTextNode(parentCode.textContent);
                parentCode.parentElement.replaceChild(text, parentCode);
            } else {
                const selectedText = range.toString();
                if (!selectedText) return;
                const codeEl = document.createElement('code');
                codeEl.textContent = selectedText;
                range.deleteContents();
                range.insertNode(codeEl);
            }
            operations.triggerAutoSave(200);
        },

        applyBadgeHighlight: function (colorTheme) {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const selectedText = range.toString();
            if (!selectedText) return;

            const badge = document.createElement('span');
            badge.className = `badge badge-${colorTheme}`;
            badge.style.borderRadius = '4px';
            badge.style.padding = '1px 6px';
            badge.style.fontSize = '0.9em';
            badge.style.fontWeight = '700';
            badge.textContent = selectedText;

            range.deleteContents();
            range.insertNode(badge);
            operations.triggerAutoSave(200);
            this.showToast(`Badge toegevoegd: ${colorTheme.toUpperCase()}`);
        },

        updateFloatingBarPosition: function () {
            if (!state.isEditMode) return;
            const bar = document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar');
            if (!bar) return;

            const sel = window.getSelection();
            const tagLabel = bar.querySelector('#hrElementTagLabel');
            const cardControls = bar.querySelector('#deckCardFloatingActions');

            // 1. Text Selection has highest priority
            if (sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    bar.style.display = 'flex';
                    bar.style.top = Math.max(10, rect.top + window.scrollY - 10) + 'px';
                    bar.style.left = Math.max(20, rect.left + window.scrollX + rect.width / 2) + 'px';
                    if (tagLabel) tagLabel.textContent = 'TEKST';
                    if (cardControls) cardControls.style.display = 'none';
                    this.syncCardFontSlider(operations.getTargetCardOrElement());
                    return;
                }
            }

            // 2. Focused/Selected Element has second priority
            if (state.selectedElement) {
                const rect = state.selectedElement.getBoundingClientRect();
                bar.style.display = 'flex';
                bar.style.top = Math.max(10, rect.top + window.scrollY - 10) + 'px';
                bar.style.left = Math.max(20, rect.left + window.scrollX + rect.width / 2) + 'px';
                if (tagLabel) tagLabel.textContent = dom.getCardTypeTag(state.selectedElement);
                if (cardControls) cardControls.style.display = 'inline-flex';
                this.syncCardFontSlider(state.selectedElement);
                return;
            }

            bar.style.display = 'none';
        },

        checkServerConnection: function (notify = false) {
            return sync.checkServerStatus(notify);
        },

        updateSyncPill: function (status, url) {
            const pill = document.getElementById('deckServerSyncPill');
            if (!pill) return;

            if (status === 'connected') {
                pill.className = 'deck-sync-pill connected';
                const displayUrl = (url || '').replace(/^https?:\/\//, '');
                pill.innerHTML = `<span class="deck-sync-dot"></span><span>Verbonden (${displayUrl || 'Schijf'})</span>`;
                pill.title = `Lokale edit server actief op ${url}. Direct-to-disk atomic persistence ingeschakeld. Klik om te testen.`;
            } else if (status === 'checking') {
                pill.className = 'deck-sync-pill checking';
                pill.innerHTML = `<span class="deck-sync-dot"></span><span>Zoeken...</span>`;
                pill.title = 'Bezig met zoeken naar actieve edit server...';
            } else {
                pill.className = 'deck-sync-pill local-only';
                pill.innerHTML = `<span class="deck-sync-dot"></span><span>Alleen Browser</span>`;
                pill.title = 'Edit server offline. Wijzigingen worden bewaard in browser localStorage met dirty tracking. Klik om te verbinden.';
            }
        },

        setServerSyncState: function (connected) {
            this.updateSyncPill(connected ? 'connected' : 'offline', state.activeServerUrl);
        },

        renderCustomTool: function (toolDef) {
            const container = document.getElementById('hrCustomToolsContainer');
            if (!container) return;
            const btn = document.createElement('button');
            btn.className = 'deck-tool-btn ' + (toolDef.className || '');
            btn.id = 'tool-' + toolDef.id;
            btn.title = toolDef.title || toolDef.label;
            btn.innerHTML = (toolDef.icon ? toolDef.icon + ' ' : '') + toolDef.label;
            btn.onclick = () => {
                if (typeof toolDef.action === 'function') toolDef.action(DeckEditor);
            };
            container.appendChild(btn);
        },

        renderCustomFloatingAction: function (actionDef) {
            const container = document.getElementById('hrCustomFloatingContainer');
            if (!container) return;
            const btn = document.createElement('button');
            btn.className = 'deck-float-btn ' + (actionDef.className || '');
            btn.id = 'float-action-' + actionDef.id;
            btn.title = actionDef.title || actionDef.label;
            btn.innerHTML = (actionDef.icon ? actionDef.icon + ' ' : '') + actionDef.label;
            btn.onclick = () => {
                if (typeof actionDef.action === 'function') actionDef.action(DeckEditor, state.selectedElement);
            };
            container.appendChild(btn);
        },

        showToast: function (msg, duration = 2600, options = {}) {
            if (typeof document === 'undefined') return;
            let container = document.getElementById('deckToastContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'deckToastContainer';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            const type = options.type || 'info';
            toast.className = `deck-toast ${type}`;

            let iconSvg = SVG.info;
            if (type === 'success') iconSvg = SVG.check;
            if (type === 'warning') iconSvg = SVG.warning;
            if (type === 'error') iconSvg = SVG.cross;

            toast.innerHTML = `
                <span>${iconSvg}</span>
                <span>${msg}</span>
            `;

            if (options.actionText && typeof options.onAction === 'function') {
                const actBtn = document.createElement('button');
                actBtn.className = 'deck-toast-btn';
                actBtn.textContent = options.actionText;
                actBtn.onclick = (e) => {
                    e.stopPropagation();
                    options.onAction();
                    toast.remove();
                };
                toast.appendChild(actBtn);
            }

            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(8px)';
                    toast.style.transition = 'all 0.2s ease';
                    setTimeout(() => toast.remove(), 200);
                }
            }, duration);
        },

        updateAutosaveBadge: function (text, stateClass = '') {
            const badge = document.getElementById('hrAutoSaveBadge');
            if (badge) {
                badge.textContent = text;
                badge.className = 'deck-autosave-badge ' + stateClass;
                if (stateClass === 'saved') {
                    setTimeout(() => {
                        if (badge && state.isEditMode) {
                            badge.textContent = 'Autosave: Actief';
                            badge.className = 'deck-autosave-badge';
                        }
                    }, 1800);
                }
            }
        },

        syncCardFontSlider: function (card) {
            if (typeof document === 'undefined') return;
            const bar = document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar');
            if (!bar) return;
            const slider = bar.querySelector('#cardFontScaleSlider');
            const badge = bar.querySelector('#cardFontScaleBadge');
            if (!slider && !badge) return;

            const target = card || operations.getTargetCardOrElement();
            let currentScale = 1.0;
            if (target) {
                const cardStyleVal = target.style ? (typeof target.style.getPropertyValue === 'function' ? target.style.getPropertyValue('--card-font-scale') : target.style['--card-font-scale']) : null;
                const attrVal = typeof target.getAttribute === 'function' ? (target.getAttribute('data-card-font-scale') || target.getAttribute('data-font-scale')) : null;
                currentScale = parseFloat(cardStyleVal) || parseFloat(attrVal) || 1.0;
            }
            const pct = Math.round(currentScale * 100);
            if (slider) slider.value = Math.max(50, Math.min(220, pct));
            if (badge) badge.textContent = pct + '%';
        },

        positionFloatingBar: function (targetEl) {
            if (targetEl) {
                this.syncCardFontSlider(targetEl);
            }
            this.updateFloatingBarPosition();
        },

        updateLayoutButtonText: function () {
            const btn = document.getElementById('btnLayoutCycle');
            if (!btn) return;
            const container = dom.getSlideContainer();
            if (!container) return;
            const layout = container.querySelector('.split-layout, .split-media-layout, .content-stack, .two-column-layout') || container;
            if (layout.classList.contains('layout-3col')) {
                btn.innerHTML = `${SVG.grid} Lay-out: 3 Kol.`;
            } else if (layout.classList.contains('content-stack') || layout.classList.contains('layout-1col')) {
                btn.innerHTML = `${SVG.grid} Lay-out: 1 Kol.`;
            } else {
                btn.innerHTML = `${SVG.grid} Lay-out: 2 Kol.`;
            }
        },

        updateSnapButtons: function () {
            if (typeof document === 'undefined') return;
            const snapBtn = document.getElementById('btnDeckSnapToggle');
            if (snapBtn) {
                if (state.isMagneticSnap !== false) {
                    snapBtn.classList.add('active');
                    snapBtn.innerHTML = `${SVG.magnet} Snap: Aan <kbd>[S]</kbd>`;
                    snapBtn.title = 'Magnetisch Snappen [S] is Actief (Klik om uit te schakelen)';
                } else {
                    snapBtn.classList.remove('active');
                    snapBtn.innerHTML = `${SVG.magnet} Snap: Uit <kbd>[S]</kbd>`;
                    snapBtn.title = 'Magnetisch Snappen [S] is Uitgeschakeld (Klik om in te schakelen)';
                }
            }
            const gridBtn = document.getElementById('btnDeckSnapGridCycle');
            if (gridBtn) {
                gridBtn.textContent = `Grid: ${state.snapGridSize || 20}px`;
            }
        },

        updateSlideScaleBadge: function (container) {
            if (typeof document === 'undefined') return;
            const badge = document.getElementById('deckSlideScaleBadge');
            if (!badge) return;
            container = container || dom.getSlideContainer();
            if (!container) {
                badge.textContent = '100%';
                return;
            }
            const styleVal = container.style ? (typeof container.style.getPropertyValue === 'function' ? container.style.getPropertyValue('--slide-font-scale') : container.style['--slide-font-scale']) : null;
            const attrVal = typeof container.getAttribute === 'function' ? container.getAttribute('data-slide-font-scale') : null;
            const currentScale = parseFloat(styleVal) || parseFloat(attrVal) || 1.0;
            badge.textContent = Math.round(currentScale * 100) + '%';
        },

        formatText: function (command, value = null) {
            try {
                document.execCommand(command, false, value);
                operations.triggerAutoSave(200);
            } catch (e) {
                console.error('[DeckEditor formatText Error]', e);
            }
        }
    };

    // ========================================================================
    // 9. Pointer-Driven Drag & Snap Engine
    // ========================================================================
    const dragEngine = {
        _activeDrag: null,

        getState: function () {
            return {
                isMagneticSnap: state.isMagneticSnap !== false,
                snapGridSize: state.snapGridSize || 20,
                activeCard: this._activeDrag ? this._activeDrag.card : null
            };
        },

        toggleSnap: function (enabled) {
            state.isMagneticSnap = (typeof enabled === 'boolean') ? enabled : !state.isMagneticSnap;
            if (typeof toolbar !== 'undefined' && toolbar.updateSnapButtons) {
                toolbar.updateSnapButtons();
            }
            return state.isMagneticSnap;
        },

        setGridSize: function (size) {
            if (typeof size === 'number' && size > 0) {
                state.snapGridSize = Math.round(size);
            }
            if (typeof toolbar !== 'undefined' && toolbar.updateSnapButtons) {
                toolbar.updateSnapButtons();
            }
            return state.snapGridSize || 20;
        },

        getGridSize: function () {
            return state.snapGridSize || 20;
        },

        // Mathematical coordinate clamping function: bounds [0, 0] to [containerWidth - cardWidth, containerHeight - cardHeight]
        clamp: function (x, y, cardWidth, cardHeight, containerWidth, containerHeight) {
            const maxX = Math.max(0, (containerWidth || 0) - (cardWidth || 0));
            const maxY = Math.max(0, (containerHeight || 0) - (cardHeight || 0));
            const safeX = (typeof x === 'number' && !isNaN(x)) ? x : 0;
            const safeY = (typeof y === 'number' && !isNaN(y)) ? y : 0;
            return {
                x: Math.max(0, Math.min(maxX, safeX)),
                y: Math.max(0, Math.min(maxY, safeY))
            };
        },

        // Magnetic snapping function with real-time grid, center, sibling edges, dropzones, and strict bounds clamping
        snap: function (x, y, options) {
            options = options || {};
            const enabled = options.enabled !== undefined ? options.enabled : (state.isMagneticSnap !== false);
            const cardWidth = options.cardWidth || 0;
            const cardHeight = options.cardHeight || 0;
            const gridStep = options.gridStep || state.snapGridSize || 20;
            const snapThreshold = (typeof options.snapThreshold === 'number') ? options.snapThreshold : 14;
            const containerRect = options.containerRect || {
                width: 1200,
                height: 800,
                left: 0,
                top: 0
            };
            const siblings = Array.isArray(options.siblings) ? options.siblings : [];
            const dropzones = Array.isArray(options.dropzones) ? options.dropzones : [];

            let snappedX = (typeof x === 'number' && !isNaN(x)) ? x : 0;
            let snappedY = (typeof y === 'number' && !isNaN(y)) ? y : 0;
            const snappedGuides = { x: [], y: [] };
            let dropzoneTarget = null;

            if (!enabled) {
                const clamped = this.clamp(snappedX, snappedY, cardWidth, cardHeight, containerRect.width, containerRect.height);
                return {
                    snappedX: clamped.x,
                    snappedY: clamped.y,
                    snappedGuides,
                    guides: snappedGuides,
                    dropzoneTarget: null
                };
            }

            // 1. Grid Snapping
            if (gridStep > 1) {
                const nearGridX = Math.round(snappedX / gridStep) * gridStep;
                if (Math.abs(snappedX - nearGridX) <= snapThreshold) {
                    snappedX = nearGridX;
                }
                const nearGridY = Math.round(snappedY / gridStep) * gridStep;
                if (Math.abs(snappedY - nearGridY) <= snapThreshold) {
                    snappedY = nearGridY;
                }
            }

            // 2. Container Center Snapping (Horizontal & Vertical)
            const containerCenterX = containerRect.width / 2;
            const cardCenterX = snappedX + cardWidth / 2;
            if (Math.abs(cardCenterX - containerCenterX) <= snapThreshold) {
                snappedX = containerCenterX - cardWidth / 2;
                snappedGuides.x.push(Math.round(containerCenterX));
            }

            const containerCenterY = containerRect.height / 2;
            const cardCenterY = snappedY + cardHeight / 2;
            if (Math.abs(cardCenterY - containerCenterY) <= snapThreshold) {
                snappedY = containerCenterY - cardHeight / 2;
                snappedGuides.y.push(Math.round(containerCenterY));
            }

            // 3. Sibling Edges Snapping (Left, Right, Top, Bottom, Adjacent)
            let bestDiffX = snapThreshold + 1;
            let bestSnapX = null;
            let bestGuideX = null;

            let bestDiffY = snapThreshold + 1;
            let bestSnapY = null;
            let bestGuideY = null;

            for (let i = 0; i < siblings.length; i++) {
                const sib = siblings[i];
                if (!sib) continue;
                const sLeft = sib.x !== undefined ? sib.x : (sib.left || 0);
                const sTop = sib.y !== undefined ? sib.y : (sib.top || 0);
                const sWidth = sib.width || 0;
                const sHeight = sib.height || 0;
                const sRight = sLeft + sWidth;
                const sBottom = sTop + sHeight;

                // Left align
                let d = Math.abs(snappedX - sLeft);
                if (d < bestDiffX) { bestDiffX = d; bestSnapX = sLeft; bestGuideX = sLeft; }
                // Right align
                d = Math.abs((snappedX + cardWidth) - sRight);
                if (d < bestDiffX) { bestDiffX = d; bestSnapX = sRight - cardWidth; bestGuideX = sRight; }
                // Adjacent right
                d = Math.abs(snappedX - sRight);
                if (d < bestDiffX) { bestDiffX = d; bestSnapX = sRight; bestGuideX = sRight; }
                // Adjacent left
                d = Math.abs((snappedX + cardWidth) - sLeft);
                if (d < bestDiffX) { bestDiffX = d; bestSnapX = sLeft - cardWidth; bestGuideX = sLeft; }

                // Top align
                d = Math.abs(snappedY - sTop);
                if (d < bestDiffY) { bestDiffY = d; bestSnapY = sTop; bestGuideY = sTop; }
                // Bottom align
                d = Math.abs((snappedY + cardHeight) - sBottom);
                if (d < bestDiffY) { bestDiffY = d; bestSnapY = sBottom - cardHeight; bestGuideY = sBottom; }
                // Adjacent below
                d = Math.abs(snappedY - sBottom);
                if (d < bestDiffY) { bestDiffY = d; bestSnapY = sBottom; bestGuideY = sBottom; }
                // Adjacent above
                d = Math.abs((snappedY + cardHeight) - sTop);
                if (d < bestDiffY) { bestDiffY = d; bestSnapY = sTop - cardHeight; bestGuideY = sTop; }
            }

            if (bestSnapX !== null) {
                snappedX = bestSnapX;
                const roundedGuideX = Math.round(bestGuideX);
                if (!snappedGuides.x.includes(roundedGuideX)) {
                    snappedGuides.x.push(roundedGuideX);
                }
            }
            if (bestSnapY !== null) {
                snappedY = bestSnapY;
                const roundedGuideY = Math.round(bestGuideY);
                if (!snappedGuides.y.includes(roundedGuideY)) {
                    snappedGuides.y.push(roundedGuideY);
                }
            }

            // 4. Dropzone Proximity Detection (Columns, Split Layouts)
            for (let j = 0; j < dropzones.length; j++) {
                const dz = dropzones[j];
                if (!dz) continue;
                const dzLeft = dz.x !== undefined ? dz.x : (dz.left || 0);
                const dzTop = dz.y !== undefined ? dz.y : (dz.top || 0);
                const dzWidth = dz.width || 0;
                const dzHeight = dz.height || 0;

                const cX = snappedX + cardWidth / 2;
                const cY = snappedY + cardHeight / 2;
                const inX = cX >= (dzLeft - snapThreshold) && cX <= (dzLeft + dzWidth + snapThreshold);
                const inY = cY >= (dzTop - snapThreshold) && cY <= (dzTop + dzHeight + snapThreshold);
                if (inX && inY) {
                    dropzoneTarget = dz;
                    break;
                }
            }

            // 5. ABSOLUTE BOUNDS CLAMPING (Crucial: never fall outside container!)
            const clamped = this.clamp(snappedX, snappedY, cardWidth, cardHeight, containerRect.width, containerRect.height);

            return {
                snappedX: clamped.x,
                snappedY: clamped.y,
                snappedGuides,
                guides: snappedGuides,
                dropzoneTarget
            };
        },

        getGuides: function (container) {
            if (!container || typeof document === 'undefined') return { guideX: null, guideY: null };
            let guideX = container.querySelector(':scope > .deck-snap-guide-x');
            if (!guideX) {
                guideX = document.createElement('div');
                guideX.className = 'deck-snap-guide-x';
                guideX.style.display = 'none';
                container.appendChild(guideX);
            }
            let guideY = container.querySelector(':scope > .deck-snap-guide-y');
            if (!guideY) {
                guideY = document.createElement('div');
                guideY.className = 'deck-snap-guide-y';
                guideY.style.display = 'none';
                container.appendChild(guideY);
            }
            return { guideX, guideY };
        },

        hideGuides: function (container) {
            if (!container || typeof document === 'undefined') return;
            const gx = container.querySelector(':scope > .deck-snap-guide-x');
            if (gx) gx.style.display = 'none';
            const gy = container.querySelector(':scope > .deck-snap-guide-y');
            if (gy) gy.style.display = 'none';
        },

        removeGuides: function (container) {
            if (!container || typeof document === 'undefined') return;
            container.querySelectorAll('.deck-snap-guide-x, .deck-snap-guide-y').forEach(el => el.remove());
        }
    };

    // ========================================================================
    // 10. Operations & Manipulation Engine
    // ========================================================================
    const operations = {
        dragEngine: dragEngine,

        highlightCSharp: function (code) {
            if (!code) return '';
            let raw = String(code)
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');

            const escapeHtml = (str) => str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            const keywords = new Set([
                'using', 'public', 'private', 'protected', 'internal', 'class', 'struct',
                'interface', 'enum', 'void', 'new', 'if', 'else', 'return', 'null',
                'static', 'typeof', 'override', 'virtual', 'abstract', 'float', 'int',
                'bool', 'string', 'double', 'char', 'byte', 'long', 'short', 'var',
                'out', 'ref', 'in', 'this', 'base', 'true', 'false', 'const', 'readonly',
                'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue',
                'default', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
                'namespace', 'get', 'set'
            ]);

            const knownTypes = new Set([
                'MonoBehaviour', 'ScriptableObject', 'CharacterController', 'Transform',
                'Vector2', 'Vector3', 'Vector4', 'Quaternion', 'Camera', 'InputValue',
                'NavMeshAgent', 'NavMeshSurface', 'NavMeshObstacle', 'SimpleNPC',
                'PlayerController3D', 'GameObject', 'Component', 'Collider', 'BoxCollider',
                'SphereCollider', 'CapsuleCollider', 'MeshCollider', 'Rigidbody', 'Rigidbody2D',
                'Time', 'Mathf', 'Debug', 'Color', 'AudioSource', 'TextMeshProUGUI',
                'UnityEvent', 'Coroutine', 'IEnumerator', 'List', 'Dictionary', 'Array',
                'TextAsset', 'JsonUtility', 'UnityWebRequest', 'LevelInteractable',
                'KillzoneRespawn', 'SceneManager'
            ]);

            const knownMethods = new Set([
                'Awake', 'Start', 'Update', 'FixedUpdate', 'LateUpdate', 'OnMove', 'OnJump',
                'GetComponent', 'TryGetComponent', 'Get', 'Move', 'SetDestination',
                'CompareTag', 'Invoke', 'Log', 'LogWarning', 'LogError', 'Normalize',
                'Sqrt', 'Slerp', 'LookRotation', 'SetText', 'Load', 'Save', 'AddScore',
                'ReadAllText', 'FromJson', 'SendWebRequest', 'OnTriggerEnter', 'OnTriggerExit',
                'OnCollisionEnter', 'OnCollisionExit'
            ]);

            const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\$\"(?:[^\"\\]|\\.)*\"|@\"(?:[^\"]|\"\")*\"|\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')|(\[[A-Za-z_][A-Za-z0-9_.]*(?:\([^\]]*\))?\])|(-?\b\d+(?:\.\d+)?[fFmMdD]?\b)|([A-Za-z_][A-Za-z0-9_]*)|([^\sA-Za-z0-9_]+)|(\s+)/g;

            let result = '';
            let match;

            while ((match = tokenRegex.exec(raw)) !== null) {
                const [full, comment, str, attr, num, word, punct, ws] = match;
                if (comment) {
                    result += '<span class="jb-comment">' + escapeHtml(comment) + '</span>';
                } else if (str) {
                    result += '<span class="jb-string">' + escapeHtml(str) + '</span>';
                } else if (attr) {
                    result += '<span class="jb-attr">' + escapeHtml(attr) + '</span>';
                } else if (num) {
                    result += '<span class="jb-number">' + escapeHtml(num) + '</span>';
                } else if (word) {
                    const rest = raw.slice(tokenRegex.lastIndex);
                    const isFollowedByParen = /^\s*\(/.test(rest);
                    const isGenericCall = /^\s*<[^>]+>\s*\(/.test(rest);

                    if (keywords.has(word)) {
                        result += '<span class="jb-keyword">' + word + '</span>';
                    } else if (knownMethods.has(word) || ((isFollowedByParen || isGenericCall) && !knownTypes.has(word))) {
                        result += '<span class="jb-method">' + word + '</span>';
                    } else if (knownTypes.has(word) || /^[A-Z][A-Za-z0-9_]*$/.test(word)) {
                        result += '<span class="jb-type">' + word + '</span>';
                    } else {
                        result += '<span class="jb-plain">' + word + '</span>';
                    }
                } else if (punct) {
                    result += escapeHtml(punct);
                } else if (ws) {
                    result += ws;
                }
            }
            return result;
        },
        selectElement: function (el) {
            this.deselectCurrentElement();
            if (!el) return;

            state.selectedElement = el;
            el.classList.add('glr-selected-element');

            const floatBar = document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar');
            const tagLabel = document.getElementById('hrElementTagLabel');
            const toggleSpanBtn = document.getElementById('btnToggleSpan');

            if (floatBar) {
                if (tagLabel) tagLabel.textContent = dom.getCardTypeTag(el);
                if (toggleSpanBtn) {
                    const isMerged = el.classList.contains('full-width-card');
                    toggleSpanBtn.textContent = isMerged ? 'Kolom' : '100% Rij';
                }
                toolbar.positionFloatingBar(el);
                floatBar.style.display = 'flex';
            }

            eventBus.emit('elementSelected', { element: el, type: dom.getCardTypeTag(el) });
        },

        deselectCurrentElement: function () {
            if (state.selectedElement) {
                state.selectedElement.classList.remove('glr-selected-element');
                eventBus.emit('elementDeselected', { element: state.selectedElement });
                state.selectedElement = null;
            }
            if (state.isSwapMode) this.cancelSwapMode();
            if (typeof document !== 'undefined') {
                const floatBar = document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar');
                if (floatBar) floatBar.style.display = 'none';
            }
        },

        syncSlideColumnStates: function (container) {
            container = container || dom.getSlideContainer();
            if (!container) return;

            const layouts = container.querySelectorAll('.split-media-layout, .split-layout');
            layouts.forEach(layout => {
                let leftCol = layout.querySelector('.left-column');
                let rightCol = layout.querySelector('.right-column');

                // If layout has no columns yet, wrap children in columns
                if (!leftCol && !rightCol && layout.children.length > 0) {
                    leftCol = document.createElement('div');
                    leftCol.className = 'left-column';
                    while (layout.firstChild) {
                        leftCol.appendChild(layout.firstChild);
                    }
                    layout.appendChild(leftCol);
                }

                // Ensure right column exists for drag targets
                if (!rightCol) {
                    rightCol = document.createElement('div');
                    rightCol.className = 'right-column';
                    layout.appendChild(rightCol);
                }

                const getCardCount = (col) => col ? col.querySelectorAll(dom.cardSelectors.join(', ')).length : 0;
                const leftCount = getCardCount(leftCol);
                const rightCount = getCardCount(rightCol);

                if (leftCol) {
                    if (leftCount === 0) leftCol.classList.add('is-empty-col');
                    else leftCol.classList.remove('is-empty-col');
                }
                if (rightCol) {
                    if (rightCount === 0) rightCol.classList.add('is-empty-col');
                    else rightCol.classList.remove('is-empty-col');
                }

                if (rightCount === 0 && leftCount > 0) {
                    layout.classList.add('single-active-col');
                } else if (leftCount === 0 && rightCount > 0) {
                    layout.classList.add('single-active-col');
                } else {
                    layout.classList.remove('single-active-col');
                }
            });
        },

        getTargetCardOrElement: function () {
            if (state.selectedElement) {
                const card = state.selectedElement.closest(dom.cardSelectors.join(', '));
                return card || state.selectedElement;
            }
            return null;
        },

        applyDirectFontScaleToCard: function (card, scale, isReset = false) {
            if (!card) return;

            // Existing card scale factor before modifying attributes
            const existingScale = (card.getAttribute && typeof card.getAttribute === 'function' ? parseFloat(card.getAttribute('data-card-font-scale')) : null) ||
                                  (card.style && typeof card.style.getPropertyValue === 'function' ? parseFloat(card.style.getPropertyValue('--card-font-scale')) : null) || 1.0;

            // 1. Set CSS variable & data attribute
            if (isReset) {
                if (card.style && typeof card.style.removeProperty === 'function') {
                    card.style.removeProperty('--card-font-scale');
                } else if (card.style) {
                    delete card.style['--card-font-scale'];
                }
                if (typeof card.removeAttribute === 'function') {
                    card.removeAttribute('data-card-font-scale');
                    card.removeAttribute('data-font-scale');
                    card.removeAttribute('data-custom-font');
                }
            } else {
                const scaleFixed = scale.toFixed(2);
                if (card.style && typeof card.style.setProperty === 'function') {
                    card.style.setProperty('--card-font-scale', scaleFixed);
                } else if (card.style) {
                    card.style['--card-font-scale'] = scaleFixed;
                }
                if (typeof card.setAttribute === 'function') {
                    card.setAttribute('data-card-font-scale', scaleFixed);
                    card.setAttribute('data-font-scale', scaleFixed);
                    card.setAttribute('data-custom-font', 'true');
                }
            }

            // 2. Collect text targets
            const textSelectors = [
                '.card-title', '.card-body', 'p', 'li', 'ul', 'ol',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'pre', 'code', 'table', 'th', 'td',
                '.punchy-point', '.punchy-tag', 'span',
                '.info-box', '.deep-dive-title', '.lab-deep-dive-title',
                '.lab-box-neutral', '.lab-box-trap', '.lab-box-rule', '.lab-mental-model',
                '.dense-table', '.step-item', '.media-panel-card',
                '.info-card-title', '.info-card-text', '.steps-card-body', '.steps-card',
                '.code-box', '.glr-deepdive-box-content', '.glr-deepdive-box-title',
                '.accordion-body', '.accordion-header', '.comparison-column'
            ];
            const textNodes = card.querySelectorAll ? card.querySelectorAll(textSelectors.join(', ')) : [];
            const allTargets = [card, ...textNodes];

            const validTargets = allTargets.filter(el => {
                if (!el || !el.style) return false;
                // Skip editor UI controls inside the card
                if (el.classList && (
                    el.classList.contains('deck-card-action-bar') ||
                    el.classList.contains('deck-card-btn') ||
                    el.classList.contains('deck-card-drag-handle') ||
                    el.classList.contains('glr-resize-grip') ||
                    el.classList.contains('hr-elem-btn') ||
                    el.classList.contains('jb-header-tab') ||
                    el.classList.contains('jb-editor-header')
                )) return false;

                if (el.closest && el.closest('.deck-card-action-bar, .glr-resize-grip, .jb-header-tab, .jb-editor-header')) {
                    return false;
                }

                // Handle code blocks cleanly: syntax highlight spans inside <pre> inherit from <pre>
                if (el.tagName === 'SPAN' && el.closest && el.closest('pre')) {
                    return false;
                }
                // Skip <code> inside <pre> because <pre> scales the code block and .code-box pre code { font-size: inherit !important; }
                if (el.tagName === 'CODE' && el.closest && el.closest('pre')) {
                    return false;
                }

                return true;
            });

            const formatPx = (val) => {
                const rounded = Math.round(val * 10) / 10;
                return (rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)) + 'px';
            };

            // PASS 1: Pre-capture origFontSize for ALL elements before modifying ANY styles!
            validTargets.forEach(el => {
                if (!el.dataset) el.dataset = {};

                // Sanitize any previously corrupted origFontSize (e.g. from non-px units like 'rem' or microscopic values)
                if (el.dataset.origFontSize) {
                    const str = String(el.dataset.origFontSize).trim();
                    if (!str.endsWith('px') || parseFloat(str) < 5) {
                        delete el.dataset.origFontSize;
                    }
                }

                if (!el.dataset.origFontSize) {
                    let resolvedPx = null;

                    // 1. First check if window.getComputedStyle(el).fontSize is available and returns a valid px value
                    if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
                        try {
                            const cs = window.getComputedStyle(el);
                            const computedFs = cs ? cs.fontSize : null;
                            if (computedFs && typeof computedFs === 'string' && computedFs.trim().endsWith('px')) {
                                const px = parseFloat(computedFs);
                                if (!isNaN(px) && px > 0) {
                                    resolvedPx = px;
                                }
                            }
                        } catch (e) {}
                    }

                    // 2. If window.getComputedStyle is not available or doesn't return px, convert inlineFs
                    if (resolvedPx === null) {
                        const inlineFs = el.style ? (typeof el.style.getPropertyValue === 'function' ? (el.style.getPropertyValue('font-size') || el.style.fontSize) : el.style.fontSize) : null;
                        if (inlineFs && typeof inlineFs === 'string' && !inlineFs.includes('var(')) {
                            const trimmed = inlineFs.replace(/!important/gi, '').trim().toLowerCase();
                            const num = parseFloat(trimmed);
                            if (!isNaN(num) && num > 0) {
                                if (trimmed.endsWith('rem')) {
                                    resolvedPx = num * 16;
                                } else if (trimmed.endsWith('em')) {
                                    resolvedPx = num * 16;
                                } else if (trimmed.endsWith('pt')) {
                                    resolvedPx = num * 1.333;
                                } else if (trimmed.endsWith('px')) {
                                    resolvedPx = num;
                                } else if (trimmed.endsWith('%')) {
                                    resolvedPx = (num / 100) * 16;
                                } else if (num >= 5) {
                                    resolvedPx = num;
                                }
                            }
                        }
                    }

                    // 3. Unscale if element was previously custom-scaled and scale differs from 1.0
                    if (resolvedPx !== null && resolvedPx >= 5) {
                        if (el.dataset.customFont === 'true' && existingScale > 0 && Math.abs(existingScale - 1.0) > 0.05) {
                            resolvedPx = resolvedPx / existingScale;
                        }
                        el.dataset.origFontSize = formatPx(resolvedPx);
                    }

                    // 4. Ensure fallback is '18px'
                    if (!el.dataset.origFontSize) {
                        el.dataset.origFontSize = '18px';
                    }
                }
            });

            // PASS 2: Apply scale or reset based strictly on pre-captured baselines
            validTargets.forEach(el => {
                if (isReset) {
                    if (el.dataset && el.dataset.origFontSize) {
                        if (typeof el.style.setProperty === 'function') {
                            el.style.setProperty('font-size', el.dataset.origFontSize, 'important');
                        } else {
                            el.style.fontSize = el.dataset.origFontSize;
                        }
                        delete el.dataset.origFontSize;
                        delete el.dataset.customFont;
                    } else if (typeof el.style.removeProperty === 'function') {
                        el.style.removeProperty('font-size');
                    } else {
                        delete el.style.fontSize;
                    }
                    return;
                }

                const basePx = parseFloat(el.dataset.origFontSize) || 18;
                const newPx = (basePx * scale).toFixed(1) + 'px';
                if (typeof el.style.setProperty === 'function') {
                    el.style.setProperty('font-size', newPx, 'important');
                } else {
                    el.style.fontSize = newPx;
                }
                el.dataset.customFont = 'true';
            });

            if (typeof toolbar !== 'undefined' && toolbar.syncCardFontSlider) {
                toolbar.syncCardFontSlider(card);
            }
        },

        scaleCardFont: function (card, factor, isReset = false) {
            if (!card) card = this.getTargetCardOrElement();
            if (!card) return;
            const slideIdx = dom.getCurrentSlideIndex();
            history.recordState(slideIdx);

            const cardStyleVal = card.style ? (typeof card.style.getPropertyValue === 'function' ? card.style.getPropertyValue('--card-font-scale') : card.style['--card-font-scale']) : null;
            const currentScale = parseFloat(cardStyleVal) ||
                                 (typeof card.getAttribute === 'function' ? (parseFloat(card.getAttribute('data-card-font-scale')) || parseFloat(card.getAttribute('data-font-scale'))) : null) || 1.0;
            const newScale = isReset ? 1.0 : Math.max(0.40, Math.min(3.0, currentScale * factor));

            this.applyDirectFontScaleToCard(card, newScale, isReset);

            toolbar.positionFloatingBar(card);
            storage.saveSlide(slideIdx, { silent: true });

            const pct = Math.round(newScale * 100);
            toolbar.showToast(isReset ? 'Kaart tekstschaal hersteld naar 100%' : `Kaart tekstgrootte: ${pct}% (opgeslagen)`);
        },

        autoSizeCardFont: function (card, options = {}) {
            const { recordHistory = true, showToast = true, save = true } = options;
            if (!card) card = this.getTargetCardOrElement();
            if (!card) return;
            const slideIdx = dom.getCurrentSlideIndex();
            if (recordHistory) {
                history.recordState(slideIdx);
            }

            // Establish available bounding height
            let targetHeight = card.clientHeight;

            // Check if card extends past slide viewport bottom or column bottom
            const container = dom.getSlideContainer();
            if (container && typeof container.getBoundingClientRect === 'function' && typeof card.getBoundingClientRect === 'function') {
                const containerRect = container.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                const bottomDiff = cardRect.bottom - (containerRect.bottom - 16);
                if (bottomDiff > 0) {
                    targetHeight = Math.max(70, card.clientHeight - bottomDiff);
                }
            }

            const column = card.closest ? card.closest('.left-column, .right-column, .content-stack') : null;
            if (column && column.scrollHeight > column.clientHeight) {
                const colDiff = column.scrollHeight - column.clientHeight;
                targetHeight = Math.max(70, card.clientHeight - colDiff);
            }

            if (!targetHeight || targetHeight < 60) {
                targetHeight = Math.max(80, card.clientHeight || 160);
            }

            const targetWidth = card.clientWidth || 300;

            // Binary search between scale 0.40 (40%) and 2.40 (240%)
            let low = 0.40;
            let high = 2.40;
            let bestScale = 1.0;

            for (let i = 0; i < 10; i++) {
                const mid = (low + high) / 2;
                this.applyDirectFontScaleToCard(card, mid);

                const overflowsY = card.scrollHeight > (targetHeight + 2);
                const overflowsX = card.scrollWidth > (targetWidth + 2);

                if (overflowsY || overflowsX) {
                    high = mid;
                } else {
                    bestScale = mid;
                    low = mid;
                }
            }

            // Apply best scale with safety cushion (0.97)
            const finalScale = Math.max(0.40, Math.min(2.20, bestScale * 0.97));
            this.applyDirectFontScaleToCard(card, finalScale);

            if (save) {
                toolbar.positionFloatingBar(card);
                storage.saveSlide(slideIdx, { silent: true });
            }

            const pct = Math.round(finalScale * 100);
            if (showToast) {
                toolbar.showToast(`Auto-size toegepast: ${pct}% (tekst past exact)`);
            }
            return finalScale;
        },

        autoSizeCurrentSlide: function () {
            const container = dom.getSlideContainer();
            if (!container) return;
            const slideIdx = dom.getCurrentSlideIndex();
            history.recordState(slideIdx);

            const cards = dom.getEditableCards(container);
            if (!cards || cards.length === 0) {
                toolbar.showToast('Geen kaarten gevonden op deze slide');
                return;
            }

            cards.forEach(card => {
                this.autoSizeCardFont(card, { recordHistory: false, showToast: false, save: false });
            });

            storage.saveSlide(slideIdx, { silent: true });
            toolbar.showToast(`Auto-size toegepast op ${cards.length} kaarten (alles passend gemaakt)`);
        },

        fillCard: function (card) {
            if (!card) card = this.getTargetCardOrElement();
            if (!card) return;
            const slideIdx = dom.getCurrentSlideIndex();
            history.recordState(slideIdx);

            if (card.style) {
                card.style.setProperty('flex', '1 1 0%', 'important');
                card.style.setProperty('min-height', '0', 'important');
                card.style.setProperty('max-height', 'none', 'important');
                card.style.setProperty('height', 'auto', 'important');
                card.style.setProperty('display', 'flex', 'important');
                card.style.setProperty('flex-direction', 'column', 'important');
                card.style.setProperty('justify-content', 'space-between', 'important');
                if (typeof card.setAttribute === 'function') {
                    card.setAttribute('data-card-fill', 'true');
                }

                const body = card.querySelector ? card.querySelector('.card-body, .info-card-text, .steps-card-body') : null;
                if (body && body.style) {
                    body.style.setProperty('flex', '1 1 auto', 'important');
                    body.style.setProperty('display', 'flex', 'important');
                    body.style.setProperty('flex-direction', 'column', 'important');
                    body.style.setProperty('justify-content', 'space-between', 'important');
                    body.style.setProperty('gap', '10px', 'important');
                }
            }

            if (typeof card.offsetHeight !== 'undefined') {
                void card.offsetHeight;
            }

            this.autoSizeCardFont(card, { recordHistory: false, showToast: false, save: false });

            toolbar.positionFloatingBar(card);
            storage.saveSlide(slideIdx, { silent: true });
            toolbar.showToast('Kaart en tekst schermvullend gemaakt');
        },

        fillCurrentSlide: function () {
            const container = dom.getSlideContainer();
            if (!container) return;
            const slideIdx = dom.getCurrentSlideIndex();
            history.recordState(slideIdx);

            // 1. Stretch container to full height
            if (container.style) {
                container.style.setProperty('display', 'flex', 'important');
                container.style.setProperty('flex-direction', 'column', 'important');
                container.style.setProperty('height', '100%', 'important');
                container.style.setProperty('min-height', '0', 'important');
            }

            // 2. Stretch layout roots (grids / split layouts)
            const layoutRoots = container.querySelectorAll ? container.querySelectorAll(
                '.split-media-layout, .content-grid-2col, .content-grid-3col, .content-stack, .two-col, .grid-2, .grid-3'
            ) : [];
            layoutRoots.forEach(grid => {
                if (!grid || !grid.style) return;
                grid.style.setProperty('height', '100%', 'important');
                grid.style.setProperty('min-height', '0', 'important');
                grid.style.setProperty('flex', '1 1 auto', 'important');
                grid.style.setProperty('align-items', 'stretch', 'important');
            });

            // 3. Stretch all columns
            const columns = container.querySelectorAll ? container.querySelectorAll(
                '.left-column, .right-column, .content-col, .column, .content-stack, .col'
            ) : [];
            columns.forEach(col => {
                if (!col || !col.style) return;
                col.style.setProperty('display', 'flex', 'important');
                col.style.setProperty('flex-direction', 'column', 'important');
                col.style.setProperty('height', '100%', 'important');
                col.style.setProperty('min-height', '0', 'important');
                col.style.setProperty('justify-content', 'stretch', 'important');
                col.style.setProperty('flex', '1 1 0%', 'important');
            });

            // 4. Stretch all editable cards
            const cards = dom.getEditableCards(container);
            if (!cards || cards.length === 0) {
                toolbar.showToast('Geen kaarten gevonden op deze slide');
                return;
            }

            cards.forEach(card => {
                if (!card || !card.style) return;
                card.style.setProperty('flex', '1 1 0%', 'important');
                card.style.setProperty('min-height', '0', 'important');
                card.style.setProperty('max-height', 'none', 'important');
                card.style.setProperty('height', 'auto', 'important');
                card.style.setProperty('display', 'flex', 'important');
                card.style.setProperty('flex-direction', 'column', 'important');
                card.style.setProperty('justify-content', 'space-between', 'important');
                if (typeof card.setAttribute === 'function') {
                    card.setAttribute('data-card-fill', 'true');
                }

                const body = card.querySelector ? card.querySelector('.card-body, .info-card-text, .steps-card-body') : null;
                if (body && body.style) {
                    body.style.setProperty('flex', '1 1 auto', 'important');
                    body.style.setProperty('display', 'flex', 'important');
                    body.style.setProperty('flex-direction', 'column', 'important');
                    body.style.setProperty('justify-content', 'space-between', 'important');
                    body.style.setProperty('gap', '10px', 'important');
                }
            });

            // 5. Force DOM reflow
            if (typeof container.offsetHeight !== 'undefined') {
                void container.offsetHeight;
            }

            // 6. Scale up the text inside each card to fill the newly expanded card height
            cards.forEach(card => {
                this.autoSizeCardFont(card, { recordHistory: false, showToast: false, save: false });
            });

            // 7. Save slide state
            storage.saveSlide(slideIdx, { silent: true });
            toolbar.showToast(`Slide schermvullend gemaakt: ${cards.length} kaarten en tekst opgevuld`);
        },

        scaleFont: function (factor) {
            return this.scaleCardFont(null, factor);
        },

        scaleCurrentSlideFont: function (factor) {
            const slideIdx = dom.getCurrentSlideIndex();
            history.recordState(slideIdx);

            const container = dom.getSlideContainer();
            if (!container) return;

            const slideStyleVal = container.style ? (typeof container.style.getPropertyValue === 'function' ? container.style.getPropertyValue('--slide-font-scale') : container.style['--slide-font-scale']) : null;
            const currentScale = parseFloat(slideStyleVal) ||
                                 (typeof container.getAttribute === 'function' ? parseFloat(container.getAttribute('data-slide-font-scale')) : null) ||
                                 1.0;
            const newScale = Math.max(0.50, Math.min(2.0, currentScale * factor));
            const newScaleFixed = newScale.toFixed(2);

            if (container.style && typeof container.style.setProperty === 'function') {
                container.style.setProperty('--slide-font-scale', newScaleFixed);
            } else if (container.style) {
                container.style['--slide-font-scale'] = newScaleFixed;
            }
            if (typeof container.setAttribute === 'function') {
                container.setAttribute('data-slide-font-scale', newScaleFixed);
            }

            const viewInteractive = typeof document !== 'undefined' ? document.getElementById('viewInteractive') : null;
            if (viewInteractive && viewInteractive !== container) {
                if (viewInteractive.style && typeof viewInteractive.style.setProperty === 'function') {
                    viewInteractive.style.setProperty('--slide-font-scale', newScaleFixed);
                }
                if (typeof viewInteractive.setAttribute === 'function') {
                    viewInteractive.setAttribute('data-slide-font-scale', newScaleFixed);
                }
            }

            if (container.firstElementChild) {
                if (container.firstElementChild.style && typeof container.firstElementChild.style.setProperty === 'function') {
                    container.firstElementChild.style.setProperty('--slide-font-scale', newScaleFixed);
                }
                if (typeof container.firstElementChild.setAttribute === 'function') {
                    container.firstElementChild.setAttribute('data-slide-font-scale', newScaleFixed);
                }
            }

            // Proportioneel bijwerken van alle kaarten op de slide
            const cards = dom.getEditableCards(container);
            if (cards && cards.length) {
                cards.forEach(card => {
                    const cardScale = (card.getAttribute && typeof card.getAttribute === 'function' ? parseFloat(card.getAttribute('data-card-font-scale')) : null) ||
                                      (card.style && typeof card.style.getPropertyValue === 'function' ? parseFloat(card.style.getPropertyValue('--card-font-scale')) : null) ||
                                      1.0;
                    this.applyDirectFontScaleToCard(card, cardScale * newScale);
                });
            }

            toolbar.updateSlideScaleBadge(container);

            if (typeof window !== 'undefined') {
                if (window.slides && window.slides[slideIdx]) {
                    window.slides[slideIdx].fontScale = parseFloat(newScaleFixed);
                    window.slides[slideIdx]['data-slide-font-scale'] = newScaleFixed;
                }
                if (window.slidesData && window.slidesData[slideIdx]) {
                    window.slidesData[slideIdx].fontScale = parseFloat(newScaleFixed);
                    window.slidesData[slideIdx]['data-slide-font-scale'] = newScaleFixed;
                }
            }

            storage.saveSlide(slideIdx, { silent: true });
            toolbar.showToast('Slide tekstschaal: ' + Math.round(newScale * 100) + '%');
        },

        resetCurrentSlideFont: function () {
            const slideIdx = dom.getCurrentSlideIndex();
            history.recordState(slideIdx);

            const container = dom.getSlideContainer();
            if (!container) return;

            if (container.style && typeof container.style.removeProperty === 'function') {
                container.style.removeProperty('--slide-font-scale');
            } else if (container.style) {
                delete container.style['--slide-font-scale'];
            }
            if (typeof container.removeAttribute === 'function') {
                container.removeAttribute('data-slide-font-scale');
            }

            const viewInteractive = typeof document !== 'undefined' ? document.getElementById('viewInteractive') : null;
            if (viewInteractive && viewInteractive !== container) {
                if (viewInteractive.style && typeof viewInteractive.style.removeProperty === 'function') {
                    viewInteractive.style.removeProperty('--slide-font-scale');
                } else if (viewInteractive.style) {
                    delete viewInteractive.style['--slide-font-scale'];
                }
                if (typeof viewInteractive.removeAttribute === 'function') {
                    viewInteractive.removeAttribute('data-slide-font-scale');
                }
            }

            if (container.firstElementChild) {
                if (container.firstElementChild.style && typeof container.firstElementChild.style.removeProperty === 'function') {
                    container.firstElementChild.style.removeProperty('--slide-font-scale');
                } else if (container.firstElementChild.style) {
                    delete container.firstElementChild.style['--slide-font-scale'];
                }
                if (typeof container.firstElementChild.removeAttribute === 'function') {
                    container.firstElementChild.removeAttribute('data-slide-font-scale');
                }
            }

            // Reset alle kaarten op de slide
            const cards = dom.getEditableCards(container);
            if (cards && cards.length) {
                cards.forEach(card => {
                    const cardScale = (card.getAttribute && typeof card.getAttribute === 'function' ? parseFloat(card.getAttribute('data-card-font-scale')) : null) ||
                                      (card.style && typeof card.style.getPropertyValue === 'function' ? parseFloat(card.style.getPropertyValue('--card-font-scale')) : null) ||
                                      1.0;
                    this.applyDirectFontScaleToCard(card, cardScale, cardScale === 1.0);
                });
            }

            toolbar.updateSlideScaleBadge(container);

            if (typeof window !== 'undefined') {
                if (window.slides && window.slides[slideIdx]) {
                    delete window.slides[slideIdx].fontScale;
                    delete window.slides[slideIdx]['data-slide-font-scale'];
                }
                if (window.slidesData && window.slidesData[slideIdx]) {
                    delete window.slidesData[slideIdx].fontScale;
                    delete window.slidesData[slideIdx]['data-slide-font-scale'];
                }
            }

            storage.safeRemove(storage.getSlideKey(slideIdx) + '_scale');
            storage.saveSlide(slideIdx, { silent: true });
            toolbar.showToast('Slide tekstschaal gereset naar 100%');
        },

        cycleLayout: function () {
            const container = dom.getSlideContainer();
            if (!container) return;
            history.recordState(dom.getCurrentSlideIndex());

            let layout = container.querySelector('.split-layout, .split-media-layout, .content-stack, .two-column-layout');
            if (!layout) {
                layout = document.createElement('div');
                layout.className = 'split-layout layout-2col';
                while (container.firstChild) {
                    layout.appendChild(container.firstChild);
                }
                container.appendChild(layout);
            }

            let next = 'layout-2col';
            if (layout.classList.contains('layout-2col') || layout.classList.contains('split-layout')) {
                next = 'layout-3col';
            } else if (layout.classList.contains('layout-3col')) {
                next = 'layout-1col';
            } else {
                next = 'layout-2col';
            }

            layout.className = (next === 'layout-1col' ? 'content-stack layout-1col' : 'split-layout ' + next);
            if (next === 'layout-3col') {
                layout.style.display = 'grid';
                layout.style.gridTemplateColumns = 'repeat(3, 1fr)';
                layout.style.gap = '14px';
                toolbar.showToast('Lay-out: 3 Kolommen geactiveerd');
            } else if (next === 'layout-2col') {
                layout.style.display = 'grid';
                layout.style.gridTemplateColumns = '1fr 1fr';
                layout.style.gap = '14px';
                toolbar.showToast('Lay-out: 2 Kolommen geactiveerd');
            } else {
                layout.style.display = 'flex';
                layout.style.flexDirection = 'column';
                layout.style.gap = '14px';
                toolbar.showToast('Lay-out: 1 Kolom geactiveerd');
            }

            toolbar.updateLayoutButtonText();
            DeckEditor.applyEditMode();
            this.triggerAutoSave(300);
        },

        toggleSpan: function () {
            if (!state.selectedElement) return;
            history.recordState(dom.getCurrentSlideIndex());
            const el = state.selectedElement;
            const isMerged = el.classList.contains('full-width-card');
            const layout = el.closest('.split-media-layout, .split-layout');

            if (!isMerged) {
                el.classList.add('full-width-card');
                el.style.width = '100%';
                el.style.maxWidth = '100%';
                el.style.gridColumn = '1 / -1';

                if (layout) {
                    const rightCol = layout.querySelector('.right-column');
                    const leftCol = layout.querySelector('.left-column');
                    const rightCards = rightCol ? rightCol.querySelectorAll(dom.cardSelectors.join(', ')).length : 0;
                    if (rightCards === 0) {
                        layout.classList.add('single-active-col');
                    } else {
                        layout.insertBefore(el, rightCol.nextSibling || layout.lastChild);
                    }
                }
                toolbar.showToast('Kaart: 100% Volledige Rij');
            } else {
                el.classList.remove('full-width-card');
                el.style.gridColumn = '';
                el.style.width = '';
                el.style.maxWidth = '';

                if (layout) {
                    const leftCol = layout.querySelector('.left-column');
                    if (leftCol && el.parentElement === layout) {
                        leftCol.appendChild(el);
                    }
                }
                toolbar.showToast('Kaart: Kolombreedte');
            }

            this.syncSlideColumnStates();
            this.triggerAutoSave(200);
        },

        moveColumn: function (targetColName) {
            this.moveCardToColumn(state.selectedElement, targetColName);
        },

        moveCardToColumn: function (card, targetColName) {
            card = card || state.selectedElement;
            if (!card) return;
            history.recordState(dom.getCurrentSlideIndex());
            const container = dom.getSlideContainer();
            if (!container) return;

            let layout = card.closest('.split-media-layout, .split-layout');
            if (!layout) {
                layout = container.querySelector('.split-media-layout, .split-layout');
            }

            if (!layout) {
                layout = document.createElement('div');
                layout.className = 'split-media-layout';
                const leftCol = document.createElement('div');
                leftCol.className = 'left-column';
                const rightCol = document.createElement('div');
                rightCol.className = 'right-column';

                while (container.firstChild) {
                    leftCol.appendChild(container.firstChild);
                }
                layout.appendChild(leftCol);
                layout.appendChild(rightCol);
                container.appendChild(layout);
            }

            let leftCol = layout.querySelector('.left-column');
            let rightCol = layout.querySelector('.right-column');

            if (!leftCol) {
                leftCol = document.createElement('div');
                leftCol.className = 'left-column';
                layout.insertBefore(leftCol, layout.firstChild);
            }
            if (!rightCol) {
                rightCol = document.createElement('div');
                rightCol.className = 'right-column';
                layout.appendChild(rightCol);
            }

            card.classList.remove('full-width-card');
            card.style.gridColumn = '';
            card.style.width = '';
            card.style.maxWidth = '100%';
            card.style.boxSizing = 'border-box';
            // Clear rigid fixed heights that could force overflow in multi-card column
            card.style.height = '';
            card.style.minHeight = '';
            card.style.maxHeight = '';
            card.style.flex = '';

            const targetCol = (targetColName === 'left') ? leftCol : rightCol;
            targetCol.appendChild(card);
            toolbar.showToast(targetColName === 'left' ? 'Kaart verplaatst naar Linkerkolom' : 'Kaart verplaatst naar Rechterkolom');

            layout.classList.remove('single-active-col');
            this.syncSlideColumnStates();

            // Prevent pushing cards into an overflow state:
            // If adding a card causes overflow, automatically adjust font size / padding or balance cards
            this.preventColumnOverflow(targetCol, container);
            const otherCol = (targetColName === 'left') ? rightCol : leftCol;
            this.preventColumnOverflow(otherCol, container);

            DeckEditor.applyEditMode();
            this.flashElement(card);
            this.selectElement(card);
            this.triggerAutoSave(200);
        },

        preventColumnOverflow: function (column, container) {
            if (!column) return;
            container = container || dom.getSlideContainer();
            const maxH = container ? (container.clientHeight || 460) : 460;
            const cards = Array.from(column.querySelectorAll(dom.cardSelectors.join(', ')));
            const count = cards.length;
            if (count === 0) return;

            // Check if column scrollHeight exceeds max available height or if multiple cards exist
            const isOverflowing = column.scrollHeight > maxH || (count >= 2 && column.scrollHeight > maxH * 0.85);

            if (isOverflowing || count >= 2) {
                cards.forEach((c) => {
                    // Remove rigid fixed pixel heights that exceed slot
                    if (c.style.height && parseInt(c.style.height, 10) > (maxH / count)) {
                        c.style.height = '';
                        c.style.minHeight = '';
                        c.style.flex = '';
                        c.style.maxHeight = '';
                    }
                    // Auto compact padding based on card count
                    if (count >= 3) {
                        c.style.padding = '8px 12px';
                    } else if (count === 2) {
                        c.style.padding = '12px 16px';
                    }
                    // Auto-refit text to prevent overflow
                    operations.fitTextToCard(c);
                });

                if (count >= 3) {
                    column.style.gap = '8px';
                } else {
                    column.style.gap = '12px';
                }
            }
        },

        reorder: function (dir) {
            this.reorderCard(state.selectedElement, dir);
        },

        reorderCard: function (card, dir) {
            card = card || state.selectedElement;
            if (!card || !card.parentElement) return;
            history.recordState(dom.getCurrentSlideIndex());
            const p = card.parentElement;
            if (dir === -1 && card.previousElementSibling) {
                p.insertBefore(card, card.previousElementSibling);
                this.flashElement(card);
                this.selectElement(card);
                this.triggerAutoSave(200);
            } else if (dir === 1 && card.nextElementSibling) {
                p.insertBefore(card.nextElementSibling, card);
                this.flashElement(card);
                this.selectElement(card);
                this.triggerAutoSave(200);
            }
        },

        startSwap: function () {
            if (!state.selectedElement) return;
            state.isSwapMode = true;
            toolbar.showToast('Klik op een andere kaart om posities te wisselen [Escape = Annuleren]');
        },

        cancelSwapMode: function () {
            state.isSwapMode = false;
        },

        executeSwap: function (cardA, cardB) {
            if (!cardA || !cardB || cardA === cardB) {
                this.cancelSwapMode();
                return;
            }
            history.recordState(dom.getCurrentSlideIndex());
            const parentA = cardA.parentElement;
            const parentB = cardB.parentElement;
            const siblingA = (cardA.nextElementSibling === cardB) ? cardA : cardA.nextElementSibling;

            parentB.insertBefore(cardA, cardB);
            parentA.insertBefore(cardB, siblingA);

            this.flashElement(cardA);
            this.flashElement(cardB);
            this.cancelSwapMode();
            this.selectElement(cardA);
            this.triggerAutoSave(200);
            toolbar.showToast('Posities van kaarten omgewisseld');
        },

        duplicate: function () {
            this.duplicateCard(state.selectedElement);
        },

        duplicateCard: function (card) {
            card = card || state.selectedElement;
            if (!card || !card.parentElement) return;
            history.recordState(dom.getCurrentSlideIndex());
            const clone = card.cloneNode(true);
            clone.classList.remove('glr-selected-element', 'card-swap-flash', 'deck-selected-element');
            const oldBar = clone.querySelector('.deck-card-action-bar');
            if (oldBar) oldBar.remove();
            const oldGrip = clone.querySelector('.glr-resize-grip');
            if (oldGrip) oldGrip.remove();

            card.parentElement.insertBefore(clone, card.nextElementSibling);

            DeckEditor.applyEditMode();
            this.flashElement(clone);
            this.selectElement(clone);
            this.triggerAutoSave(200);
            toolbar.showToast('Kaart gedupliceerd');
        },

        deleteElement: function (targetCard = null) {
            const el = targetCard || state.selectedElement;
            if (!el) return;
            history.recordState(dom.getCurrentSlideIndex());
            el.remove();
            this.deselectCurrentElement();
            this.triggerAutoSave(200);
            toolbar.showToast('Kaart verwijderd', 3500, {
                actionText: 'Ongedaan maken',
                onAction: () => DeckEditor.undo()
            });
        },

        cycleCardWidth: function (card) {
            card = card || state.selectedElement;
            if (!card) return;

            history.recordState(dom.getCurrentSlideIndex());
            const isFull = card.classList.contains('full-width-card');
            const isThird = card.classList.contains('third-width-card');

            card.classList.remove('full-width-card', 'third-width-card');
            card.style.gridColumn = '';
            card.style.width = '';
            card.style.maxWidth = '100%';
            card.style.boxSizing = 'border-box';

            let label = '50% Kolom (Normaal)';
            if (!isFull && !isThird) {
                card.classList.add('full-width-card');
                card.style.width = '100%';
                card.style.maxWidth = '100%';
                card.style.gridColumn = '1 / -1';
                label = '100% Rij (Volledig)';
            } else if (isFull) {
                card.classList.add('third-width-card');
                card.style.width = '32%';
                card.style.maxWidth = '32%';
                label = '33% Kolom (1/3)';
            }

            const bar = card.querySelector(':scope > .deck-card-action-bar');
            if (bar) {
                const wBtn = bar.querySelectorAll('.deck-card-btn')[0];
                if (wBtn) {
                    wBtn.textContent = card.classList.contains('full-width-card') ? '100%' : (card.classList.contains('third-width-card') ? '33%' : '50%');
                }
            }

            operations.fitTextToCard(card);
            if (card.parentElement) {
                this.preventColumnOverflow(card.parentElement, dom.getSlideContainer());
            }

            this.syncSlideColumnStates();
            this.triggerAutoSave(200);
            toolbar.showToast(`Kaartbreedte: ${label}`);
        },

        convertCardType: function (card) {
            card = card || state.selectedElement;
            if (!card || !card.parentElement) return;

            history.recordState(dom.getCurrentSlideIndex());

            // Extract title
            const titleEl = card.querySelector('.card-title, summary, .deep-dive-title, .img-edit-card-title, h1, h2, h3, h4');
            let titleText = titleEl ? titleEl.textContent.trim() : 'Kaart Titel';
            if (titleText.endsWith('Kopieer')) {
                titleText = titleText.replace(/Kopieer$/, '').trim();
            }

            // Extract body text
            let bodyText = '';
            const bodyEl = card.querySelector('.card-body');
            if (bodyEl) {
                bodyText = bodyEl.innerHTML.trim();
            } else {
                const paragraphs = card.querySelectorAll('p, li');
                if (paragraphs.length > 0) {
                    bodyText = Array.from(paragraphs).map(p => p.outerHTML).join('');
                } else {
                    bodyText = '<p>Beschrijf hier de inhoud van de kaart.</p>';
                }
            }

            // Code text if present
            const codeEl = card.querySelector('pre code, code, pre');
            const codeText = codeEl ? codeEl.textContent.trim() : `// Typ hier uw code\nfunction example() {\n    return true;\n}`;

            // Determine current type
            const isAccordion = card.tagName.toLowerCase() === 'details' || card.classList.contains('deck-accordion-card');
            const isDeepDive = card.classList.contains('lab-deep-dive');
            const isCode = card.classList.contains('code-container') || card.classList.contains('code-box');
            const isWarning = card.classList.contains('warning-card') || card.classList.contains('lab-box-neutral');

            let newEl = null;
            let typeName = '';

            if (isCode) {
                // Next: Deep Dive
                typeName = 'Deep Dive';
                newEl = document.createElement('div');
                newEl.className = 'lab-deep-dive';
                newEl.style.cssText = 'margin-top: 14px; padding: 16px 20px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 8px; color: #0f172a;';
                newEl.innerHTML = `
                    <div style="font-size: 0.95rem; font-weight: 900; color: #0369a1; margin-bottom: 8px;">LAB MODE STUDY GUIDE: DEEP DIVE - ${titleText}</div>
                    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; color: #14532d; font-size: 0.84rem;">
                        <strong>Mentaal Model:</strong> ${card.textContent.includes('Mentaal Model:') ? '' : titleText + ' - '}Beschrijf het mentale model.
                    </div>
                    <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; color: #7f1d1d; font-size: 0.84rem;">
                        <strong>Valkuil & Waarom het Fout Gaat:</strong> Beruchte valkuilen bij implementatie.
                    </div>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 14px; color: #1e40af; font-size: 0.84rem;">
                        <strong>Gouden Regel voor je Project:</strong> Direct toepasbare vuistregel.
                    </div>
                `;
            } else if (isDeepDive) {
                // Next: Accordion
                typeName = 'Accordion Details';
                newEl = document.createElement('details');
                newEl.className = 'deck-accordion-card content-card primary';
                newEl.open = true;
                newEl.innerHTML = `
                    <summary class="card-title core" style="cursor: pointer; user-select: none; font-weight: 700; color: #f8fafc;">
                        ${titleText} (Klik om in/uit te klappen)
                    </summary>
                    <div class="card-body" style="padding-top: 10px;">
                        ${bodyText || '<p>Gedetailleerde informatie die in- en uitgeklapt kan worden.</p>'}
                    </div>
                `;
            } else if (isAccordion) {
                // Next: Warning Card
                typeName = 'Waarschuwing / Let Op';
                newEl = document.createElement('div');
                newEl.className = 'content-card warning-card';
                newEl.style.cssText = 'border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.08);';
                newEl.innerHTML = `
                    <div class="card-title core" style="color: #fbbf24; font-weight: 800;">${titleText}</div>
                    <div class="card-body">
                        ${bodyText || '<p>Belangrijke aandachtspunten en waarschuwingen voor dit onderwerp.</p>'}
                    </div>
                `;
            } else if (isWarning) {
                // Next: Standard Content Card
                typeName = 'Inhoud Kaart (Tekst)';
                newEl = document.createElement('div');
                newEl.className = 'content-card primary';
                newEl.innerHTML = `
                    <div class="card-title core">${titleText}</div>
                    <div class="card-body">
                        ${bodyText || '<p>Typ hier de inhoud van deze kaart.</p>'}
                    </div>
                `;
            } else {
                // Default was content or image -> Next: Code Box
                typeName = 'Code Blok';
                newEl = document.createElement('div');
                newEl.className = 'content-card primary code-container';
                const cleanTitle = (titleText && titleText !== 'Nieuwe Kaart Titel') ? titleText : 'Script.cs';
                const filename = cleanTitle.endsWith('.cs') ? cleanTitle : cleanTitle.replace(/\s+/g, '') + '.cs';
                const highlighted = this.highlightCSharp(codeText);
                newEl.innerHTML = `
                    <div class="jb-editor-header">
                        <div class="jb-editor-tab">
                            <span class="jb-csharp-icon">C#</span>
                            <span class="jb-filename">${filename}</span>
                        </div>
                        <button class="code-copy-btn" onclick="DeckEditor.copyCode(this)">Kopieer</button>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <pre style="background: #1e1f22; color: #bcbec4; padding: 12px 14px; border-radius: 0 0 6px 6px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.80rem; margin: 0; overflow-x: auto; line-height: 1.45;"><code>${highlighted}</code></pre>
                    </div>
                `;
            }

            // Carry over layout classes (such as full-width-card or third-width-card)
            if (card.classList.contains('full-width-card')) {
                newEl.classList.add('full-width-card');
                newEl.style.width = '100%';
                newEl.style.maxWidth = '100%';
                newEl.style.gridColumn = '1 / -1';
            } else if (card.classList.contains('third-width-card')) {
                newEl.classList.add('third-width-card');
                newEl.style.width = '32%';
            }

            card.parentElement.replaceChild(newEl, card);
            DeckEditor.applyEditMode();
            this.flashElement(newEl);
            this.selectElement(newEl);
            this.triggerAutoSave(200);
            toolbar.showToast(`Kaart geconverteerd naar: ${typeName}`);
        },

        addCard: function (type) {
            const container = dom.getSlideContainer();
            if (!container) return;

            history.recordState(dom.getCurrentSlideIndex());

            let targetParent = (state.selectedElement && state.selectedElement.parentElement) ? state.selectedElement.parentElement : container;
            let newEl = null;

            if (type === 'text' || type === 'info') {
                newEl = document.createElement('div');
                newEl.className = 'content-card primary';
                newEl.innerHTML = `
                    <div class="card-title core">Nieuwe Kaart Titel</div>
                    <div class="card-body">
                        <p>Typ hier de inhoud van deze kaart. Pas tekst aan of versleep de hoek om de grootte automatisch aan te passen.</p>
                    </div>
                `;
            } else if (type === 'image') {
                newEl = document.createElement('div');
                newEl.className = 'content-card primary img-edit-card';
                newEl.style.padding = '12px';
                newEl.innerHTML = `
                    <div class="card-title core img-edit-card-title">Afbeelding Titel</div>
                    <div class="img-frame" style="margin: 8px 0; background: #0b0f19; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 140px;">
                        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='100%' height='100%' fill='%23121622'/><text x='50%' y='50%' fill='%230284c7' font-family='sans-serif' font-size='13' text-anchor='middle' font-weight='bold'>[Afbeelding Placeholder - Voer URL in of upload]</text></svg>" alt="Afbeelding" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                    </div>
                    <div class="img-controls-bar" style="display: flex; gap: 6px; margin-top: 6px;">
                        <input type="text" class="img-url-input" placeholder="Voer afbeeldings-URL of lokaal pad in..." onchange="DeckEditor.updateCardImage(this)" style="flex: 1; background: #0f172a; color: #f8fafc; border: 1px solid #334155; padding: 4px 8px; border-radius: 4px; font-size: 0.72rem;" />
                        <input type="file" accept="image/*" style="display:none;" onchange="DeckEditor.handleImageUpload(this)" />
                        <button class="hr-elem-btn" onclick="this.previousElementSibling.click()">Upload</button>
                    </div>
                `;
            } else if (type === 'code') {
                newEl = document.createElement('div');
                newEl.className = 'content-card primary code-container';
                const defaultCode = `using UnityEngine;\n\npublic class PlayerController3D : MonoBehaviour\n{\n    [SerializeField] private float moveSpeed = 6.0f;\n    private CharacterController controller;\n\n    void Awake() {\n        controller = GetComponent<CharacterController>();\n    }\n\n    void Update() {\n        // Locomotion update\n    }\n}`;
                const highlighted = this.highlightCSharp(defaultCode);
                newEl.innerHTML = `
                    <div class="jb-editor-header">
                        <div class="jb-editor-tab">
                            <span class="jb-csharp-icon">C#</span>
                            <span class="jb-filename">PlayerController3D.cs</span>
                        </div>
                        <button class="code-copy-btn" onclick="DeckEditor.copyCode(this)">Kopieer</button>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <pre style="background: #1e1f22; color: #bcbec4; padding: 12px 14px; border-radius: 0 0 6px 6px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.80rem; margin: 0; overflow-x: auto; line-height: 1.45;"><code>${highlighted}</code></pre>
                    </div>
                `;
            } else if (type === 'deepdive') {
                newEl = document.createElement('div');
                newEl.className = 'lab-deep-dive';
                newEl.style.cssText = 'margin-top: 14px; padding: 16px 20px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 8px; color: #0f172a;';
                newEl.innerHTML = `
                    <div style="font-size: 0.95rem; font-weight: 900; color: #0369a1; margin-bottom: 8px;">LAB MODE STUDY GUIDE: DEEP DIVE</div>
                    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; color: #14532d; font-size: 0.84rem;">
                        <strong>Mentaal Model:</strong> Beschrijf hier het mentale model.
                    </div>
                    <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; color: #7f1d1d; font-size: 0.84rem;">
                        <strong>Valkuil & Waarom het Fout Gaat:</strong> Beschrijf een beruchte valkuil.
                    </div>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 14px; color: #1e40af; font-size: 0.84rem;">
                        <strong>Gouden Regel voor je Project:</strong> Strikte vuistregel voor directe toepassing.
                    </div>
                `;
            } else if (type === 'accordion') {
                newEl = document.createElement('details');
                newEl.className = 'deck-accordion-card content-card primary';
                newEl.open = true;
                newEl.innerHTML = `
                    <summary class="card-title core" style="cursor: pointer; user-select: none; font-weight: 700; color: #f8fafc;">
                        Accordion Titel (Klik om in/uit te klappen)
                    </summary>
                    <div class="card-body" style="padding-top: 10px;">
                        <p>Inhoud van de accordeonsectie. Ideaal voor extra verdieping of uitklapbare opdrachten.</p>
                    </div>
                `;
            } else if (type === 'split') {
                newEl = document.createElement('div');
                newEl.className = 'split-media-layout full-width-card';
                newEl.style.display = 'grid';
                newEl.style.gridTemplateColumns = '1fr 1fr';
                newEl.style.gap = '14px';
                newEl.innerHTML = `
                    <div class="left-column">
                        <div class="content-card primary">
                            <div class="card-title core">Linkerkolom</div>
                            <div class="card-body"><p>Inhoud voor de linkerkant.</p></div>
                        </div>
                    </div>
                    <div class="right-column">
                        <div class="content-card primary">
                            <div class="card-title core">Rechterkolom</div>
                            <div class="card-body"><p>Inhoud voor de rechterkant.</p></div>
                        </div>
                    </div>
                `;
            }

            if (newEl) {
                if (state.selectedElement && state.selectedElement.parentElement === targetParent) {
                    targetParent.insertBefore(newEl, state.selectedElement.nextElementSibling);
                } else {
                    targetParent.appendChild(newEl);
                }
                DeckEditor.applyEditMode();
                this.flashElement(newEl);
                this.selectElement(newEl);
                this.triggerAutoSave(200);
                toolbar.showToast('Nieuwe kaart toegevoegd');
            }
        },

        updateCardImage: function (input) {
            const card = input.closest('.img-edit-card') || (state.selectedElement ? state.selectedElement : null);
            if (!card) return;
            const img = card.querySelector('img');
            if (img && input.value) {
                img.src = input.value;
                this.triggerAutoSave(200);
                toolbar.showToast('Afbeelding bijgewerkt');
            }
        },

        handleImageUpload: function (input) {
            if (!input.files || !input.files[0]) return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const card = input.closest('.img-edit-card') || state.selectedElement;
                if (!card) return;
                const img = card.querySelector('img');
                if (img) {
                    img.src = e.target.result;
                    this.triggerAutoSave(200);
                    toolbar.showToast('Afbeelding geladen');
                }
            };
            reader.readAsDataURL(file);
        },

        copyCode: function (btn) {
            const pre = btn.closest('.code-container, .code-box, .content-card').querySelector('pre, code');
            if (!pre) return;
            const text = pre.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Gekopieerd!';
                setTimeout(() => { btn.textContent = orig; }, 1500);
            });
        },

        flashElement: function (el) {
            if (!el) return;
            el.classList.add('card-swap-flash');
            setTimeout(() => el.classList.remove('card-swap-flash'), 600);
        },

        triggerAutoSave: function (delayMs = config.debounceAutosaveMs) {
            if (!state.isEditMode) return;
            storage.markDirty(dom.getCurrentSlideIndex());
            toolbar.updateAutosaveBadge('Autosave: Opslaan...', 'saving');
            clearTimeout(state.autoSaveTimer);
            state.autoSaveTimer = setTimeout(() => {
                storage.saveSlide(dom.getCurrentSlideIndex(), { silent: true });
            }, delayMs);
        },

        // Setup Card Actions Bar with dedicated drag handle and controls
        setupCardActions: function (card) {
            if (!card) return;
            let bar = card.querySelector(':scope > .deck-card-action-bar');
            if (bar) bar.remove();

            bar = document.createElement('div');
            bar.className = 'deck-card-action-bar';

            // 1. Dedicated Drag Handle (Pointer-driven with magnetic snap)
            const dragHandle = document.createElement('span');
            dragHandle.className = 'deck-card-drag-handle';
            dragHandle.title = 'Versleep kaart naar een andere positie of kolom [S voor magnetisch snappen]';
            dragHandle.innerHTML = SVG.drag;
            dragHandle.style.touchAction = 'none';

            dragHandle.onmousedown = (e) => {
                e.stopPropagation();
            };
            dragHandle.ontouchstart = (e) => {
                e.stopPropagation();
            };

            bar.appendChild(dragHandle);

            // 2. Width cycle button (Normal 50% / 100% Rij / 33%)
            const widthBtn = document.createElement('button');
            widthBtn.className = 'deck-card-btn';
            const isFull = card.classList.contains('full-width-card');
            const isThird = card.classList.contains('third-width-card');
            widthBtn.textContent = isFull ? '100%' : (isThird ? '33%' : '50%');
            widthBtn.title = 'Wissel breedte (50% Normaal / 100% Rij / 33% Kolom)';
            widthBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.cycleCardWidth(card);
            };
            bar.appendChild(widthBtn);

            // 3. Move Column (Left / Right)
            const leftColBtn = document.createElement('button');
            leftColBtn.className = 'deck-card-btn';
            leftColBtn.textContent = '←';
            leftColBtn.title = 'Verplaats naar linkerkolom';
            leftColBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.moveCardToColumn(card, 'left');
            };
            bar.appendChild(leftColBtn);

            const rightColBtn = document.createElement('button');
            rightColBtn.className = 'deck-card-btn';
            rightColBtn.textContent = '→';
            rightColBtn.title = 'Verplaats naar rechterkolom';
            rightColBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.moveCardToColumn(card, 'right');
            };
            bar.appendChild(rightColBtn);

            // 4. Up / Down Reorder
            const upBtn = document.createElement('button');
            upBtn.className = 'deck-card-btn';
            upBtn.innerHTML = SVG.up;
            upBtn.title = 'Verplaats omhoog';
            upBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.reorderCard(card, -1);
            };
            bar.appendChild(upBtn);

            const downBtn = document.createElement('button');
            downBtn.className = 'deck-card-btn';
            downBtn.innerHTML = SVG.down;
            downBtn.title = 'Verplaats omlaag';
            downBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.reorderCard(card, 1);
            };
            bar.appendChild(downBtn);

            // 5. Card Font Scale Controls (A- / A+ / Auto / 100%)
            const fontMinusBtn = document.createElement('button');
            fontMinusBtn.className = 'deck-card-btn';
            fontMinusBtn.textContent = 'A-';
            fontMinusBtn.title = 'Tekst kleiner in deze specifieke kaart (-10%)';
            fontMinusBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.scaleCardFont(card, 0.90);
            };
            bar.appendChild(fontMinusBtn);

            const fontPlusBtn = document.createElement('button');
            fontPlusBtn.className = 'deck-card-btn';
            fontPlusBtn.textContent = 'A+';
            fontPlusBtn.title = 'Tekst groter in deze specifieke kaart (+10%)';
            fontPlusBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.scaleCardFont(card, 1.10);
            };
            bar.appendChild(fontPlusBtn);

            const fontAutoBtn = document.createElement('button');
            fontAutoBtn.className = 'deck-card-btn auto-fit';
            fontAutoBtn.textContent = 'Auto';
            fontAutoBtn.title = 'Auto-size: meet div en schaal tekst automatisch om er perfect in te passen';
            fontAutoBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.autoSizeCardFont(card);
            };
            bar.appendChild(fontAutoBtn);

            const fontFillBtn = document.createElement('button');
            fontFillBtn.className = 'deck-card-btn fill-space';
            fontFillBtn.innerHTML = `${SVG.expand} Vul`;
            fontFillBtn.title = 'Vul Ruimte: laat deze kaart en tekst de beschikbare kolomhoogte vullen';
            fontFillBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.fillCard(card);
            };
            bar.appendChild(fontFillBtn);

            const fontResetBtn = document.createElement('button');
            fontResetBtn.className = 'deck-card-btn';
            fontResetBtn.textContent = '100%';
            fontResetBtn.title = 'Herstel tekstgrootte naar standaard (100%)';
            fontResetBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.scaleCardFont(card, 1.0, true);
            };
            bar.appendChild(fontResetBtn);

            // 6. Convert Type
            const convertBtn = document.createElement('button');
            convertBtn.className = 'deck-card-btn';
            convertBtn.innerHTML = `${SVG.convert} Type`;
            convertBtn.title = 'Converteer kaarttype (Tekst / Code / Deep Dive / Accordion / Waarschuwing)';
            convertBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.convertCardType(card);
            };
            bar.appendChild(convertBtn);

            // 6. Duplicate
            const dupBtn = document.createElement('button');
            dupBtn.className = 'deck-card-btn';
            dupBtn.innerHTML = SVG.copy;
            dupBtn.title = 'Dupliceer kaart';
            dupBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.duplicateCard(card);
            };
            bar.appendChild(dupBtn);

            // 7. Delete (with undo toast)
            const delBtn = document.createElement('button');
            delBtn.className = 'deck-card-btn danger';
            delBtn.innerHTML = SVG.trash;
            delBtn.title = 'Verwijder kaart';
            delBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                operations.deleteElement(card);
            };
            bar.appendChild(delBtn);

            card.insertBefore(bar, card.firstChild);
        },

        getOrCreateDropPlaceholder: function () {
            if (!state.dropPlaceholder) {
                state.dropPlaceholder = document.createElement('div');
                state.dropPlaceholder.className = 'glr-drop-placeholder deck-drop-placeholder';
                state.dropPlaceholder.textContent = 'Kaart Hier Plaatsen';
            }
            return state.dropPlaceholder;
        },

        // Setup Pointer-Driven Drag & Magnetic Snap Engine
        setupCardDragEvents: function (card) {
            if (!card) return;
            // Native draggable disabled so smooth pointer events handle movement without browser quirks
            card.setAttribute('draggable', 'false');

            card.onpointerdown = (e) => {
                if (!state.isEditMode) return;
                if (e.button !== 0) return; // Primary mouse/pointer button only

                const target = e.target;
                const isDragHandle = Boolean(target.closest('.deck-card-drag-handle'));

                // If not clicking via handle, guard against unwanted drags
                if (!isDragHandle) {
                    // Do not drag if interacting with toolbar buttons, grips, inputs, or links
                    if (target.closest('.deck-card-btn, .glr-resize-grip, button, input, textarea, select, a')) {
                        return;
                    }
                    // Do not drag if user is focusing or editing contenteditable text
                    if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
                        return;
                    }
                }

                e.preventDefault();
                e.stopPropagation();

                const container = dom.getSlideContainer();
                if (!container) return;

                const curContainerRect = container.getBoundingClientRect();
                const startCardRect = card.getBoundingClientRect();
                const startPointerX = e.clientX;
                const startPointerY = e.clientY;

                // Position relative to slide container
                const initialLeft = startCardRect.left - curContainerRect.left + container.scrollLeft;
                const initialTop = startCardRect.top - curContainerRect.top + container.scrollTop;

                let isDragging = false;
                let lastSnappedX = initialLeft;
                let lastSnappedY = initialTop;

                try {
                    card.setPointerCapture(e.pointerId);
                } catch (err) {}

                const onPointerMove = (moveEvt) => {
                    const deltaX = moveEvt.clientX - startPointerX;
                    const deltaY = moveEvt.clientY - startPointerY;

                    if (!isDragging) {
                        const threshold = isDragHandle ? 2 : 5;
                        if (Math.hypot(deltaX, deltaY) < threshold) {
                            return;
                        }
                        // Start Drag Session: record snapshot for undo/redo
                        isDragging = true;
                        history.recordState(dom.getCurrentSlideIndex());
                        state.draggedItem = card;
                        card.classList.add('glr-card-dragging', 'deck-card-dragging');
                        card.style.willChange = 'transform';
                    }

                    const dynamicContainerRect = container.getBoundingClientRect();
                    const targetX = initialLeft + deltaX;
                    const targetY = initialTop + deltaY;

                    // Collect sibling cards for magnetic edge snapping
                    const siblings = dom.getEditableCards(container)
                        .filter(c => c !== card && !c.classList.contains('glr-card-dragging'))
                        .map(c => {
                            const r = c.getBoundingClientRect();
                            return {
                                x: r.left - dynamicContainerRect.left + container.scrollLeft,
                                y: r.top - dynamicContainerRect.top + container.scrollTop,
                                width: r.width,
                                height: r.height,
                                element: c
                            };
                        });

                    // Collect dropzone containers (columns & split layouts)
                    const dropzones = Array.from(container.querySelectorAll(
                        '.left-column, .right-column, .split-layout, .split-media-layout, .content-stack, .content-col, .two-column-layout'
                    )).map(dz => {
                        const r = dz.getBoundingClientRect();
                        return {
                            x: r.left - dynamicContainerRect.left + container.scrollLeft,
                            y: r.top - dynamicContainerRect.top + container.scrollTop,
                            width: r.width,
                            height: r.height,
                            element: dz
                        };
                    });

                    // Real-time magnetic snap calculation
                    const snapResult = dragEngine.snap(targetX, targetY, {
                        cardWidth: startCardRect.width,
                        cardHeight: startCardRect.height,
                        gridStep: state.snapGridSize || 20,
                        snapThreshold: 14,
                        containerRect: {
                            width: dynamicContainerRect.width,
                            height: dynamicContainerRect.height,
                            left: dynamicContainerRect.left,
                            top: dynamicContainerRect.top
                        },
                        siblings: siblings,
                        dropzones: dropzones,
                        enabled: state.isMagneticSnap !== false
                    });

                    let finalX = snapResult.snappedX;
                    let finalY = snapResult.snappedY;

                    // STRICT VIEWPORT & SCREEN BOUNDARY GUARD ("zorg dat niks buitenscherm kan vallen")
                    const screenLeft = dynamicContainerRect.left + finalX;
                    const screenTop = dynamicContainerRect.top + finalY;
                    if (screenLeft < 0) {
                        finalX = Math.max(0, -dynamicContainerRect.left);
                    }
                    if (screenLeft + startCardRect.width > window.innerWidth) {
                        finalX = Math.min(finalX, Math.max(0, window.innerWidth - dynamicContainerRect.left - startCardRect.width));
                    }
                    if (screenTop < 0) {
                        finalY = Math.max(0, -dynamicContainerRect.top);
                    }
                    if (screenTop + startCardRect.height > window.innerHeight) {
                        finalY = Math.min(finalY, Math.max(0, window.innerHeight - dynamicContainerRect.top - startCardRect.height));
                    }

                    lastSnappedX = finalX;
                    lastSnappedY = finalY;

                    // Visual snap guide lines in DOM (.deck-snap-guide-x, .deck-snap-guide-y)
                    const { guideX, guideY } = dragEngine.getGuides(container);
                    if (guideX) {
                        if (snapResult.snappedGuides && snapResult.snappedGuides.x && snapResult.snappedGuides.x.length > 0) {
                            guideX.style.display = 'block';
                            guideX.style.left = snapResult.snappedGuides.x[0] + 'px';
                        } else {
                            guideX.style.display = 'none';
                        }
                    }
                    if (guideY) {
                        if (snapResult.snappedGuides && snapResult.snappedGuides.y && snapResult.snappedGuides.y.length > 0) {
                            guideY.style.display = 'block';
                            guideY.style.top = snapResult.snappedGuides.y[0] + 'px';
                        } else {
                            guideY.style.display = 'none';
                        }
                    }

                    // Smooth translate during drag
                    card.style.transform = `translate3d(${Math.round(finalX - initialLeft)}px, ${Math.round(finalY - initialTop)}px, 0)`;
                    card.style.zIndex = '1000';

                    // Structured column dropzone detection
                    const placeholder = operations.getOrCreateDropPlaceholder();
                    const elemUnderPointer = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
                    const targetDropzone = (elemUnderPointer && elemUnderPointer.closest(
                        '.left-column, .right-column, .split-layout, .split-media-layout, .content-stack, .content-col, .two-column-layout'
                    )) || (snapResult.dropzoneTarget ? snapResult.dropzoneTarget.element : null);

                    if (targetDropzone && container.contains(targetDropzone)) {
                        const hoveredCard = elemUnderPointer ? elemUnderPointer.closest(dom.cardSelectors.join(', ')) : null;
                        if (hoveredCard && hoveredCard !== card && targetDropzone.contains(hoveredCard)) {
                            const hRect = hoveredCard.getBoundingClientRect();
                            const midY = hRect.top + hRect.height / 2;
                            if (moveEvt.clientY < midY) {
                                targetDropzone.insertBefore(placeholder, hoveredCard);
                            } else {
                                targetDropzone.insertBefore(placeholder, hoveredCard.nextSibling);
                            }
                        } else if (!targetDropzone.contains(placeholder)) {
                            targetDropzone.appendChild(placeholder);
                        }
                    } else {
                        // Dragging in free space outside structured columns
                        if (placeholder && placeholder.parentElement) {
                            placeholder.remove();
                        }
                    }
                };

                const onPointerUp = (upEvt) => {
                    try {
                        card.releasePointerCapture(upEvt.pointerId);
                    } catch (err) {}

                    card.removeEventListener('pointermove', onPointerMove);
                    card.removeEventListener('pointerup', onPointerUp);
                    card.removeEventListener('pointercancel', onPointerUp);

                    dragEngine.hideGuides(container);
                    card.style.willChange = '';

                    if (!isDragging) {
                        operations.selectElement(card);
                        return;
                    }

                    card.classList.remove('glr-card-dragging', 'deck-card-dragging');
                    state.draggedItem = null;

                    const placeholder = state.dropPlaceholder;
                    if (placeholder && placeholder.parentElement && container.contains(placeholder)) {
                        // Mode 1: Structured Slot Drop in Column/Stack
                        const targetParent = placeholder.parentElement;
                        targetParent.insertBefore(card, placeholder);
                        placeholder.remove();

                        card.style.transform = '';
                        card.style.position = '';
                        card.style.left = '';
                        card.style.top = '';
                        card.style.zIndex = '';
                        card.classList.remove('deck-card-free-placed');

                        operations.syncSlideColumnStates();
                        operations.flashElement(card);
                        operations.selectElement(card);
                        operations.triggerAutoSave(200);
                        toolbar.showToast('Kaart geplaatst in kolom');
                    } else {
                        // Mode 2: Free-Floating Placement with Magnetic Snapping
                        if (placeholder && placeholder.parentElement) {
                            placeholder.remove();
                        }

                        if (window.getComputedStyle(container).position === 'static') {
                            container.style.position = 'relative';
                        }

                        if (card.parentElement !== container) {
                            container.appendChild(card);
                        }

                        card.style.position = 'absolute';
                        card.style.left = Math.round(lastSnappedX) + 'px';
                        card.style.top = Math.round(lastSnappedY) + 'px';
                        card.style.transform = '';
                        card.style.zIndex = '10';
                        card.classList.add('deck-card-free-placed');

                        operations.syncSlideColumnStates();
                        operations.flashElement(card);
                        operations.selectElement(card);
                        operations.triggerAutoSave(200);
                        toolbar.showToast(`Kaart vrij geplaatst (${Math.round(lastSnappedX)}px, ${Math.round(lastSnappedY)}px)`);
                    }

                    eventBus.emit('cardMoved', { card, x: lastSnappedX, y: lastSnappedY });
                };

                card.addEventListener('pointermove', onPointerMove);
                card.addEventListener('pointerup', onPointerUp);
                card.addEventListener('pointercancel', onPointerUp);
            };

            // HTML5 fallback drag listeners for external drop targets
            card.ondragstart = (e) => {
                if (!state.isEditMode) return;
                state.draggedItem = card;
                card.classList.add('glr-card-dragging', 'deck-card-dragging');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', 'glr-card');
                }
            };
            card.ondragend = () => {
                card.setAttribute('draggable', 'false');
                card.classList.remove('glr-card-dragging', 'deck-card-dragging');
                if (state.dropPlaceholder) state.dropPlaceholder.remove();
                state.draggedItem = null;
            };
        },

        setupContainerDropEvents: function (container) {
            container.ondragover = (e) => {
                if (!state.draggedItem) return;
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

                const targetCard = e.target.closest(dom.cardSelectors.join(', '));
                const placeholder = this.getOrCreateDropPlaceholder();

                if (targetCard && targetCard !== state.draggedItem && container.contains(targetCard)) {
                    const rect = targetCard.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        container.insertBefore(placeholder, targetCard);
                    } else {
                        container.insertBefore(placeholder, targetCard.nextSibling);
                    }
                } else if (!container.contains(placeholder)) {
                    container.appendChild(placeholder);
                }
            };

            container.ondrop = (e) => {
                e.preventDefault();
                if (state.draggedItem && state.dropPlaceholder && state.dropPlaceholder.parentElement) {
                    const targetParent = state.dropPlaceholder.parentElement;
                    targetParent.insertBefore(state.draggedItem, state.dropPlaceholder);
                    state.dropPlaceholder.remove();
                    state.draggedItem.classList.remove('glr-card-dragging', 'deck-card-dragging');
                    this.syncSlideColumnStates();
                    this.flashElement(state.draggedItem);
                    this.selectElement(state.draggedItem);
                    this.triggerAutoSave(200);
                    toolbar.showToast('Kaart geplaatst');
                }
            };
        },

        // Setup Precision Resize Grip with text refitting
        setupCardResizeGrip: function (card) {
            let grip = card.querySelector('.glr-resize-grip');
            if (!grip) {
                grip = document.createElement('div');
                grip.className = 'glr-resize-grip';
                grip.title = 'Versleep om breedte en hoogte aan te passen';
                card.appendChild(grip);
            }

            grip.onpointerdown = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const cardRect = card.getBoundingClientRect();
                const resizeStartX = e.clientX;
                const resizeStartY = e.clientY;
                const initialW = cardRect.width;
                const initialH = cardRect.height;
                grip.classList.add('is-resizing');

                try { grip.setPointerCapture(e.pointerId); } catch (err) {}

                // Determine container and viewport bounds for strict height clamping
                const container = card.closest('.slide-content-area') || dom.getSlideContainer();
                const viewport = card.closest('.slide-viewport, #interactiveSlide, .view-interactive') || document.querySelector('.slide-viewport');

                let maxAvailableHeight = 520;
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const spaceToContainerBottom = Math.max(50, containerRect.bottom - cardRect.top - 12);
                    const containerUsableH = Math.max(50, (container.clientHeight || 500) - 16);
                    maxAvailableHeight = Math.min(spaceToContainerBottom, containerUsableH);
                } else if (viewport) {
                    const vpRect = viewport.getBoundingClientRect();
                    maxAvailableHeight = Math.max(50, vpRect.bottom - cardRect.top - 32);
                }

                const onPointerMove = (moveEvt) => {
                    const deltaX = moveEvt.clientX - resizeStartX;
                    const deltaY = moveEvt.clientY - resizeStartY;
                    const parentW = card.parentElement ? card.parentElement.clientWidth : 800;
                    const maxAvailableWidth = Math.max(100, parentW - 8);
                    const targetW = Math.min(maxAvailableWidth, Math.max(100, initialW + deltaX));
                    const targetH = Math.min(maxAvailableHeight, Math.max(50, initialH + deltaY));

                    card.style.setProperty('height', Math.round(targetH) + 'px', 'important');
                    card.style.setProperty('max-height', 'none', 'important');
                    card.style.setProperty('min-height', '0', 'important');
                    card.style.setProperty('flex', '0 0 ' + Math.round(targetH) + 'px', 'important');

                    if (targetW > parentW * 0.96 || deltaX > 160) {
                        if (!card.classList.contains('full-width-card')) {
                            card.classList.add('full-width-card');
                            card.style.setProperty('grid-column', '1 / -1', 'important');
                            card.style.setProperty('width', '100%', 'important');
                            card.style.setProperty('max-width', '100%', 'important');
                            const layout = card.closest('.split-media-layout, .split-layout');
                            if (layout) layout.classList.add('single-active-col');
                        }
                    } else {
                        if (card.classList.contains('full-width-card') && deltaX < 0) {
                            card.classList.remove('full-width-card');
                            card.style.removeProperty('grid-column');
                        }
                        card.style.setProperty('width', Math.round(targetW) + 'px', 'important');
                        card.style.setProperty('max-width', '100%', 'important');
                    }

                    operations.fitTextToCard(card);
                };

                const onPointerUp = (upEvt) => {
                    grip.classList.remove('is-resizing');
                    try { grip.releasePointerCapture(upEvt.pointerId); } catch (err) {}
                    grip.removeEventListener('pointermove', onPointerMove);
                    grip.removeEventListener('pointerup', onPointerUp);
                    operations.fitTextToCard(card);
                    operations.syncSlideColumnStates();
                    operations.triggerAutoSave(300);
                    if (typeof toolbar !== 'undefined' && toolbar.syncCardFontSlider) {
                        toolbar.syncCardFontSlider(card);
                    }
                };

                grip.addEventListener('pointermove', onPointerMove);
                grip.addEventListener('pointerup', onPointerUp);
            };
        },

        fitTextToCard: function (card) {
            if (!card || state.isFittingText) return;
            state.isFittingText = true;
            try {
                const targetH = card.clientHeight;
                const targetW = card.clientWidth;
                if (!targetH || targetH < 40) return;

                let low = 0.40;
                let high = 2.40;
                let bestScale = 0.40;

                for (let i = 0; i < 6; i++) {
                    const mid = (low + high) / 2;
                    this.applyDirectFontScaleToCard(card, mid);

                    const overflowsY = card.scrollHeight > (targetH + 2);
                    const overflowsX = card.scrollWidth > (targetW + 2);

                    if (overflowsY || overflowsX) {
                        high = mid;
                    } else {
                        bestScale = mid;
                        low = mid;
                    }
                }
                const finalScale = Math.max(0.40, Math.min(2.20, bestScale * 0.98));
                this.applyDirectFontScaleToCard(card, finalScale);
            } finally {
                state.isFittingText = false;
            }
        }
    };

    // ========================================================================
    // 10. Universal Slide Transitions Hook & MutationObserver
    // ========================================================================
    const transitions = {
        _isHooked: false,
        _observer: null,
        _lastSlideIndex: -1,

        init: function () {
            if (this._isHooked) return;
            this._isHooked = true;

            this.hookSlideNavigationFunctions();
            this.hookHashAndPopstate();
            this.hookMutationObserver();
        },

        onSlideChangeUniversal: function (slideIdx) {
            if (typeof slideIdx !== 'number') slideIdx = dom.getCurrentSlideIndex();
            if (slideIdx === this._lastSlideIndex) return;

            const prevIdx = this._lastSlideIndex;
            this._lastSlideIndex = slideIdx;
            state.currentSlideIndex = slideIdx;

            operations.deselectCurrentElement();

            // Restore saved slide content only if dirty
            if (state.dirtySlides && state.dirtySlides.has(slideIdx)) {
                storage.loadSlide(slideIdx);
            }

            // Re-apply edit mode bindings if currently editing
            if (state.isEditMode) {
                setTimeout(() => {
                    if (state.isEditMode) {
                        DeckEditor.applyEditMode();
                    }
                }, 25);
            }

            eventBus.emit('slideChange', { newIndex: slideIdx, oldIndex: prevIdx });
        },

        hookSlideNavigationFunctions: function () {
            const self = this;
            const functionNames = [
                'selectSlide',
                'changeSlide',
                'goToSlide',
                'setSlide',
                'nextSlide',
                'prevSlide',
                'showSlide'
            ];

            if (typeof window === 'undefined') return;
            functionNames.forEach(fnName => {
                if (typeof window[fnName] === 'function') {
                    const original = window[fnName];
                    window[fnName] = function (...args) {
                        const currentIdx = dom.getCurrentSlideIndex();
                        if (state.isEditMode && state.dirtySlides && state.dirtySlides.has(currentIdx)) {
                            storage.saveSlide(currentIdx, { silent: true });
                        }
                        const res = original.apply(this, args);
                        setTimeout(() => {
                            self.onSlideChangeUniversal(dom.getCurrentSlideIndex());
                        }, 20);
                        return res;
                    };
                }
            });
        },

        hookHashAndPopstate: function () {
            const self = this;
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                window.addEventListener('hashchange', () => {
                    setTimeout(() => self.onSlideChangeUniversal(dom.getCurrentSlideIndex()), 20);
                });
                window.addEventListener('popstate', () => {
                    setTimeout(() => self.onSlideChangeUniversal(dom.getCurrentSlideIndex()), 20);
                });
            }
        },

        hookMutationObserver: function () {
            if (typeof MutationObserver === 'undefined') return;
            const self = this;
            if (this._observer) return;

            let debounceTimer = null;
            this._observer = new MutationObserver(() => {
                if (state.isInternalMutation) return;

                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const currentIdx = dom.getCurrentSlideIndex();
                    if (currentIdx !== self._lastSlideIndex) {
                        self.onSlideChangeUniversal(currentIdx);
                    }
                }, 40);
            });

            const target = document.getElementById('viewport') ||
                           document.getElementById('slideContentArea') ||
                           document.getElementById('interactiveSlide') ||
                           document.body;

            if (target) {
                this._observer.observe(target, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            }
        }
    };

    // ========================================================================
    // 11. Event Listeners & Global Keyboard Shortcuts
    // ========================================================================
    const handleKeyDown = (e) => {
        const target = e.target;
        const isTyping = target && (
            target.isContentEditable ||
            (target.closest && target.closest('[contenteditable="true"]')) ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT'
        );

        // Shortcut: Ctrl+S / Cmd+S
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
            e.preventDefault();
            storage.saveSlide(dom.getCurrentSlideIndex(), { silent: false });
            return;
        }

        // Reliable macOS + Windows Undo/Redo detection
        const isUndo = (e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ') && !e.shiftKey;
        const isRedo = ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y' || e.code === 'KeyY')) ||
                       ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ'));

        if (isUndo) {
            if (isTyping) {
                let nativeUndoHandled = false;
                try {
                    if (typeof document !== 'undefined' && document.queryCommandEnabled && document.queryCommandEnabled('undo')) {
                        nativeUndoHandled = document.execCommand('undo');
                    }
                } catch (err) {
                    nativeUndoHandled = false;
                }
                if (nativeUndoHandled) {
                    e.preventDefault();
                    return;
                }
                // If native undo is exhausted or at baseline, call history.undo() to revert the entire card state!
                e.preventDefault();
                history.undo(dom.getCurrentSlideIndex());
                return;
            } else {
                // When not typing (e.g. card selected, dragged, moved, resized, deleted, or layout changed):
                e.preventDefault();
                history.undo(dom.getCurrentSlideIndex());
                return;
            }
        }

        if (isRedo) {
            if (isTyping) {
                let nativeRedoHandled = false;
                try {
                    if (typeof document !== 'undefined' && document.queryCommandEnabled && document.queryCommandEnabled('redo')) {
                        nativeRedoHandled = document.execCommand('redo');
                    }
                } catch (err) {
                    nativeRedoHandled = false;
                }
                if (nativeRedoHandled) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                history.redo(dom.getCurrentSlideIndex());
                return;
            } else {
                e.preventDefault();
                history.redo(dom.getCurrentSlideIndex());
                return;
            }
        }

        if (isTyping) {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (e.target && typeof e.target.blur === 'function') e.target.blur();
                if (state.selectedElement) operations.deselectCurrentElement();
            }
            return;
        }

        // When in Edit Mode and not typing, enable slide navigation
        if (state.isEditMode) {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                e.preventDefault();
                if (typeof window.changeSlide === 'function') {
                    window.changeSlide(1);
                } else if (typeof window.selectSlide === 'function') {
                    window.selectSlide(dom.getCurrentSlideIndex() + 1);
                } else if (typeof window.nextSlide === 'function') {
                    window.nextSlide();
                }
                return;
            }

            if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                if (typeof window.changeSlide === 'function') {
                    window.changeSlide(-1);
                } else if (typeof window.selectSlide === 'function') {
                    window.selectSlide(dom.getCurrentSlideIndex() - 1);
                } else if (typeof window.prevSlide === 'function') {
                    window.prevSlide();
                }
                return;
            }

            if (e.key === 'Home') {
                e.preventDefault();
                if (typeof window.selectSlide === 'function') window.selectSlide(0);
                return;
            } else if (e.key === 'End') {
                e.preventDefault();
                const total = dom.getSlideCount();
                if (typeof window.selectSlide === 'function' && total > 0) window.selectSlide(total - 1);
                return;
            }
        }

        // In Edit Mode navigation & manipulation
        if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            DeckEditor.toggleMagneticSnap();
            return;
        } else if (e.key.toLowerCase() === 'e') {
            e.preventDefault();
            DeckEditor.toggle();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (state.isSwapMode) {
                operations.cancelSwapMode();
                toolbar.showToast('Wisselmodus geannuleerd');
            } else if (state.selectedElement) {
                operations.deselectCurrentElement();
            } else {
                DeckEditor.toggle();
            }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.selectedElement) {
                e.preventDefault();
                operations.deleteElement();
            }
        }
    };

    function setupEventListeners() {
        if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;

        // Capture baseline history snapshot on focusin so history.past is never empty when pressing Cmd+Z
        document.addEventListener('focusin', (e) => {
            if (!state.isEditMode) return;
            const target = e.target;
            if (target && (
                target.isContentEditable ||
                (target.closest && target.closest('[contenteditable="true"]')) ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA'
            )) {
                history.recordBaseline(dom.getCurrentSlideIndex());
            }
        }, true);

        // Autosave input listeners with debounced typing history snapshots
        let typingHistoryTimer = null;
        document.addEventListener('input', (e) => {
            if (!state.isEditMode) return;
            const target = e.target;
            if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                operations.triggerAutoSave();
                clearTimeout(typingHistoryTimer);
                typingHistoryTimer = setTimeout(() => {
                    if (state.isEditMode) {
                        history.recordState(dom.getCurrentSlideIndex());
                    }
                }, 600);
            }
        }, true);

        // Click selection and blur
        document.addEventListener('click', (e) => {
            if (!state.isEditMode) return;
            const floatBar = document.getElementById('deckFloatingBar') || document.getElementById('hrElementFloatingBar');
            const toolbarEl = document.getElementById('deckEditToolbar') || document.getElementById('hrEditToolbar');
            const btnEdit = document.getElementById('btnEditToggle');

            if (floatBar && floatBar.contains(e.target)) return;
            if (toolbarEl && toolbarEl.contains(e.target)) return;
            if (btnEdit && btnEdit.contains(e.target)) return;

            const card = e.target.closest(dom.cardSelectors.join(', '));
            if (!card) {
                operations.deselectCurrentElement();
            }
        });

        // Window resize repositioning
        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            window.addEventListener('resize', () => {
                if (state.selectedElement && state.isEditMode) {
                    toolbar.positionFloatingBar(state.selectedElement);
                }
            }, { passive: true });

            window.addEventListener('keydown', handleKeyDown, true);
        }
    }

    // ========================================================================
    // 12. Main DeckEditor Library Object & Public API
    // ========================================================================
    const DeckEditor = {
        version: '2.0.0',
        __initialized: false,
        isSupported: true,

        // Subsystem namespaces for modular extension
        config: config,
        state: state,
        dom: dom,
        storage: storage,
        sync: sync,
        history: history,
        toolbar: toolbar,
        operations: operations,
        transitions: transitions,
        events: eventBus,
        dragEngine: dragEngine,
        handleKeyDown: handleKeyDown,
        utils: {
            clamp: function (x, y, cw, ch, pw, ph) {
                return dragEngine.clamp(x, y, cw, ch, pw, ph);
            },
            snap: function (x, y, opts) {
                return dragEngine.snap(x, y, opts);
            }
        },

        // Core lifecycle methods
        init: function () {
            if (this.__initialized) return this;
            this.__initialized = true;

            storage.purgeCorruptedDuplicates();
            toolbar.init();
            transitions.init();
            sync.init();
            setupEventListeners();

            // Load saved content for current slide on start
            const slideIdx = dom.getCurrentSlideIndex();
            storage.loadSlide(slideIdx);

            eventBus.emit('initialized', { deckName: dom.getDeckName(), slideIndex: slideIdx });
            return this;
        },

        enable: function () {
            if (state.isEditMode) return this;
            state.isEditMode = true;
            window.isEditMode = true;
            document.body.classList.add('is-editing');

            const btn = document.getElementById('btnEditToggle');
            if (btn) btn.classList.add('btn-edit-active');

            this.applyEditMode();
            toolbar.showToast('Bewerken geactiveerd [E]');
            eventBus.emit('modeChanged', { isEditMode: true });
            return this;
        },

        disable: function () {
            if (!state.isEditMode) return this;
            state.isEditMode = false;
            window.isEditMode = false;
            document.body.classList.remove('is-editing');

            const btn = document.getElementById('btnEditToggle');
            if (btn) btn.classList.remove('btn-edit-active');

            operations.deselectCurrentElement();
            this.disableEditModeDOM();
            toolbar.showToast('Bewerken afgesloten');
            eventBus.emit('modeChanged', { isEditMode: false });
            return this;
        },

        toggle: function () {
            return state.isEditMode ? this.disable() : this.enable();
        },

        applyEditMode: function () {
            if (typeof document === 'undefined') return this;
            const container = dom.getSlideContainer();
            if (!container) return this;

            operations.syncSlideColumnStates(container);
            toolbar.updateLayoutButtonText();
            toolbar.updateSnapButtons();
            toolbar.updateSlideScaleBadge(container);

            // 1. Text elements editable
            const textNodes = container.querySelectorAll(
                '.card-title, .card-body, .card-body p, .card-body li, h1, h2, h3, p, li, pre, code, td, th, ' +
                '.info-box, .deep-dive-title, .img-edit-card-title, .hero-topic-card'
            );
            textNodes.forEach(el => {
                el.setAttribute('contenteditable', 'true');
                el.setAttribute('spellcheck', 'false');
            });

            // Auto syntax-highlight code blocks on blur when edited
            const codeBoxes = container.querySelectorAll('.code-box, .code-container');
            codeBoxes.forEach(box => {
                const pre = box.querySelector('pre');
                if (pre && !pre.__jb_bound) {
                    pre.__jb_bound = true;
                    pre.addEventListener('blur', function () {
                        const raw = pre.textContent;
                        const codeEl = pre.querySelector('code');
                        const highlighted = operations.highlightCSharp(raw);
                        if (codeEl) {
                            codeEl.innerHTML = highlighted;
                        } else {
                            pre.innerHTML = `<code>${highlighted}</code>`;
                        }
                        operations.triggerAutoSave(200);
                    });
                }
            });

            // 2. Slide Title in Header editable
            const slideTitleEl = dom.getSlideTitleElement();
            if (slideTitleEl) {
                slideTitleEl.setAttribute('contenteditable', 'true');
                slideTitleEl.setAttribute('spellcheck', 'false');
            }

            // 3. Make cards draggable & resizable and attach dedicated action bar
            const cards = dom.getEditableCards(container);
            cards.forEach(card => {
                operations.setupCardDragEvents(card);
                operations.setupCardResizeGrip(card);
                operations.setupCardActions(card);
                card.onclick = (e) => {
                    e.stopPropagation();
                    if (state.isSwapMode && state.selectedElement && state.selectedElement !== card) {
                        operations.executeSwap(state.selectedElement, card);
                        return;
                    }
                    if (state.isSwapMode) operations.cancelSwapMode();
                    operations.selectElement(card);
                };
            });

            // 4. Drop containers (both columns and root layouts)
            const dropContainers = container.querySelectorAll(
                '.left-column, .right-column, .split-layout, .split-media-layout, .content-stack, .content-col, .two-column-layout'
            );
            dropContainers.forEach(c => operations.setupContainerDropEvents(c));

            // 5. Visual Viewport Boundary Guide (Safe margins indicator)
            const viewport = document.getElementById('viewport') || document.querySelector('.slide-viewport');
            if (viewport && !viewport.querySelector('.slide-boundary-guide')) {
                const guide = document.createElement('div');
                guide.className = 'slide-boundary-guide';
                guide.title = 'Veilige weergavezone (16:9 safe zone)';
                viewport.appendChild(guide);
            }

            return this;
        },

        disableEditModeDOM: function () {
            const container = dom.getSlideContainer();
            if (!container) return this;

            container.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            const slideTitleEl = dom.getSlideTitleElement();
            if (slideTitleEl) slideTitleEl.removeAttribute('contenteditable');

            const cards = dom.getEditableCards(container);
            cards.forEach(card => {
                card.removeAttribute('draggable');
                card.onpointerdown = null;
                card.onclick = null;
                const grip = card.querySelector('.glr-resize-grip');
                if (grip) grip.remove();
                const bar = card.querySelector('.deck-card-action-bar');
                if (bar) bar.remove();
            });

            dragEngine.removeGuides(container);
            if (state.dropPlaceholder) state.dropPlaceholder.remove();

            // Remove visual boundary guide
            const guides = document.querySelectorAll('.slide-boundary-guide');
            guides.forEach(g => g.remove());

            return this;
        },

        // Delegated quick methods
        save: function (silent = false) { storage.saveSlide(dom.getCurrentSlideIndex(), { silent }); return this; },
        reset: function () { storage.resetSlide(dom.getCurrentSlideIndex()); return this; },
        resetToTemplate: function () { storage.resetDeckToTemplate(); return this; },
        exportHtml: function () { sync.exportSlideHtml(dom.getCurrentSlideIndex()); return this; },
        exportSlideHtml: function (idx) { sync.exportSlideHtml(idx); return this; },
        exportFullPresentationHtml: function () { sync.exportFullPresentationHtml(); return this; },
        exportFullDeck: function () { return sync.exportFullDeck(); },
        copySlideJson: function (idx) { sync.copySlideJson(idx); return this; },
        exportDeckJson: function () { sync.exportDeckJson(); return this; },
        isServerOnline: function () { return state.serverStatus === 'connected'; },
        getDirtySlides: function () { return storage.getDirtySlides(); },
        hasUnsavedChanges: function () { return storage.hasUnsavedChanges(); },
        undo: function () { history.undo(dom.getCurrentSlideIndex()); return this; },
        redo: function () { history.redo(dom.getCurrentSlideIndex()); return this; },
        scaleFont: function (f) { operations.scaleFont(f); return this; },
        scaleCardFont: function (card, factor, isReset) { operations.scaleCardFont(card, factor, isReset); return this; },
        autoSizeCardFont: function (card) { operations.autoSizeCardFont(card); return this; },
        autoSize: function (card) { operations.autoSizeCardFont(card); return this; },
        autoSizeCurrentSlide: function () { operations.autoSizeCurrentSlide(); return this; },
        fillCard: function (card) { operations.fillCard(card); return this; },
        fillCurrentSlide: function () { operations.fillCurrentSlide(); return this; },
        fillSlide: function () { operations.fillCurrentSlide(); return this; },
        scaleCurrentSlideFont: function (f) { operations.scaleCurrentSlideFont(f); return this; },
        resetCurrentSlideFont: function () { operations.resetCurrentSlideFont(); return this; },
        cycleLayout: function () { operations.cycleLayout(); return this; },
        toggleSpan: function () { operations.toggleSpan(); return this; },
        moveColumn: function (c) { operations.moveColumn(c); return this; },
        moveCardToColumn: function (card, c) { return operations.moveCardToColumn(card, c); },
        reorder: function (d) { operations.reorder(d); return this; },
        reorderCard: function (card, d) { return operations.reorderCard(card, d); },
        startSwap: function () { operations.startSwap(); return this; },
        duplicate: function () { operations.duplicate(); return this; },
        duplicateCard: function (card) { return operations.duplicateCard(card); },
        delete: function () { operations.deleteElement(); return this; },
        deleteCard: function (card) { return operations.deleteElement(card); },
        convertCardType: function (card) { return operations.convertCardType(card); },
        cycleCardWidth: function (card) { return operations.cycleCardWidth(card); },
        addCard: function (t) { operations.addCard(t); return this; },
        copyCode: function (b) { operations.copyCode(b); return this; },
        highlightCSharp: function (code) { return operations.highlightCSharp(code); },
        updateCardImage: function (i) { operations.updateCardImage(i); return this; },
        handleImageUpload: function (i) { operations.handleImageUpload(i); return this; },
        preventColumnOverflow: function (col, cont) { operations.preventColumnOverflow(col, cont); return this; },
        toggleMagneticSnap: function (force) {
            const val = dragEngine.toggleSnap(force);
            if (typeof toolbar !== 'undefined' && toolbar.showToast) {
                toolbar.showToast(val ? `Magnetisch Snappen: Actief (Grid: ${dragEngine.getGridSize()}px)` : 'Magnetisch Snappen: Uitgeschakeld');
            }
            return val;
        },
        setSnapGridSize: function (size) {
            const s = dragEngine.setGridSize(size);
            if (typeof toolbar !== 'undefined' && toolbar.showToast) {
                toolbar.showToast(`Snap Grid ingesteld op: ${s}px`);
            }
            return s;
        },
        cycleSnapGridSize: function () {
            const cur = dragEngine.getGridSize();
            const next = cur === 20 ? 10 : 20;
            dragEngine.setGridSize(next);
            if (typeof toolbar !== 'undefined' && toolbar.showToast) {
                toolbar.showToast(`Snap Grid resolutie: ${next}px`);
            }
            return next;
        },
        isMagneticSnap: function () { return state.isMagneticSnap !== false; },
        getSnapGridSize: function () { return dragEngine.getGridSize(); }
    };

    // ========================================================================
    // 13. Full Backward Compatibility Layer with Legacy Globals
    // ========================================================================
    if (typeof window !== 'undefined') {
        window.isEditMode = false;
        window.__HR_EDIT_MODE_INITIALIZED__ = true;
        window.toggleEditMode = () => DeckEditor.toggle();
        window.undoSlideEdit = () => DeckEditor.undo();
        window.redoSlideEdit = () => DeckEditor.redo();
        window.cycleSlideLayout = () => DeckEditor.cycleLayout();
        window.moveElementColumn = (col) => DeckEditor.moveColumn(col);
        window.moveCardToColumn = (card, col) => DeckEditor.moveCardToColumn(card, col);
        window.moveSelectedElement = (dir) => DeckEditor.reorder(dir);
        window.reorderCard = (card, dir) => DeckEditor.reorderCard(card, dir);
        window.startSwapMode = () => DeckEditor.startSwap();
        window.duplicateSelectedElement = () => DeckEditor.duplicate();
        window.duplicateCard = (card) => DeckEditor.duplicateCard(card);
        window.deleteSelectedElement = () => DeckEditor.delete();
        window.deleteCard = (card) => DeckEditor.deleteCard(card);
        window.convertCardType = (card) => DeckEditor.convertCardType(card);
        window.cycleCardWidth = (card) => DeckEditor.cycleCardWidth(card);
        window.preventColumnOverflow = (col, cont) => DeckEditor.preventColumnOverflow(col, cont);
        window.addCardToSlide = (type) => DeckEditor.addCard(type);
        window.scaleSelectedElementFont = (factor) => DeckEditor.scaleFont(factor);
        window.scaleCardFont = (card, factor, isReset) => DeckEditor.scaleCardFont(card, factor, isReset);
        window.autoSizeCardFont = (card) => DeckEditor.autoSizeCardFont(card);
        window.autoSize = (card) => DeckEditor.autoSize(card);
        window.autoSizeCurrentSlide = () => DeckEditor.autoSizeCurrentSlide();
        window.fillCard = (card) => DeckEditor.fillCard(card);
        window.fillCurrentSlide = () => DeckEditor.fillCurrentSlide();
        window.fillSlide = () => DeckEditor.fillCurrentSlide();
        window.scaleCurrentSlideFont = (factor) => DeckEditor.scaleCurrentSlideFont(factor);
        window.resetCurrentSlideFont = () => DeckEditor.resetCurrentSlideFont();
        window.toggleElementMerged = () => DeckEditor.toggleSpan();
        window.saveCurrentSlideEdits = (silent) => DeckEditor.save(silent);
        window.resetCurrentSlideEdits = () => DeckEditor.reset();
        window.resetToTemplate = () => DeckEditor.resetToTemplate();
        window.exportSlideHtml = (idx) => DeckEditor.exportSlideHtml(idx);
        window.exportFullPresentationHtml = () => DeckEditor.exportFullPresentationHtml();
        window.exportFullDeck = () => DeckEditor.exportFullDeck();
        window.copySlideJson = (idx) => DeckEditor.copySlideJson(idx);
        window.exportDeckJson = () => DeckEditor.exportDeckJson();
        window.copyCode = (btn) => DeckEditor.copyCode(btn);
        window.highlightCSharp = (code) => DeckEditor.highlightCSharp(code);
        window.updateCardImage = (input) => DeckEditor.updateCardImage(input);
        window.handleImageFileUpload = (input) => DeckEditor.handleImageUpload(input);
        window.toggleMagneticSnap = (force) => DeckEditor.toggleMagneticSnap(force);
        window.setSnapGridSize = (size) => DeckEditor.setSnapGridSize(size);
        window.cycleSnapGridSize = () => DeckEditor.cycleSnapGridSize();
        window.DeckEditor = DeckEditor;
    }

    // Auto-initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => DeckEditor.init());
        } else {
            DeckEditor.init();
        }
    }

    return DeckEditor;
});
