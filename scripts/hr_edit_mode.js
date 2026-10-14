/**
 * ============================================================================
 * HR EDIT MODE - BACKWARD COMPATIBILITY BRIDGE & ENTRYPOINT
 * Automatically loads and initializes the Universal Deck Editor Library (hr_deck_editor.js).
 * Preserves 100% backward compatibility for all legacy presentations.
 * ============================================================================
 */

(function () {
    'use strict';

    // 1. Strict Environment Guard
    var isLocalEnvironment = (function () {
        try {
            var h = window.location.hostname;
            var p = window.location.protocol;
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

    if (!isLocalEnvironment) return;

    // Prevent duplicate loader execution
    if (window.DeckEditor && window.DeckEditor.__initialized) return;

    // 2. Resolve relative path to hr_deck_editor.js
    var currentScript = document.currentScript;
    var targetSrc = '';
    if (currentScript && currentScript.src) {
        targetSrc = currentScript.src.replace(/hr_edit_mode\.js(\?.*)?$/i, 'hr_deck_editor.js$1');
    }

    var candidatePaths = targetSrc ? [targetSrc] : [
        '../scripts/hr_deck_editor.js',
        '../../scripts/hr_deck_editor.js',
        '/scripts/hr_deck_editor.js',
        'scripts/hr_deck_editor.js'
    ];

    function loadScript(idx) {
        if (window.DeckEditor) {
            if (!window.DeckEditor.__initialized) window.DeckEditor.init();
            return;
        }
        if (idx >= candidatePaths.length) {
            console.warn('[DeckEditor Loader] Failed to locate hr_deck_editor.js across candidate paths.');
            return;
        }
        var s = document.createElement('script');
        s.src = candidatePaths[idx];
        s.async = false;
        s.onload = function () {
            if (window.DeckEditor && !window.DeckEditor.__initialized) {
                window.DeckEditor.init();
            }
        };
        s.onerror = function () {
            loadScript(idx + 1);
        };
        document.head.appendChild(s);
    }

    // Set safety flags & stubs
    window.isEditMode = window.isEditMode || false;
    window.__HR_EDIT_MODE_INITIALIZED__ = true;

    loadScript(0);
})();
