const fs = require('fs');
const path = require('path');

console.log('Generating Class 8 (Problem Solving & Dev Tooling) presentation...');

const slidesData = require('./slides');

// Read template from basics2
const basics2Path = path.resolve(__dirname, '../presentation_basics2/presentation_unity6_basics2.html');
const basics2Content = fs.readFileSync(basics2Path, 'utf8');

// Extract CSS up to </style>
const styleMatch = basics2Content.match(/<style>([\s\S]*?)<\/style>/);
let cssStyles = styleMatch ? styleMatch[1] : '';

// Sanitize cssStyles so that card dimensions and flex can be overridden by user resizing / edit mode
cssStyles = cssStyles
    .replace(/flex:\s*0\s+0\s+auto\s*!important;/g, 'flex: 0 0 auto;')
    .replace(/height:\s*auto\s*!important;/g, 'height: auto;')
    .replace(/min-height:\s*auto\s*!important;/g, 'min-height: auto;')
    .replace(/\.tier-selector\s*\{[\s\S]*?\.tier-btn\.active-exp\s*\{[^}]*\}\s*/g, '');

// Build the full HTML document
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="icon" type="image/jpeg" href="../HR_Logo.jpg">
    <title>Lesson 08: Problem Solving, Mechanic Decomposition &amp; Dev Tooling (Unity 6) &bull; HR Minor GDD</title>
    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
    <style>
${cssStyles}
        :root {
            --font-scale: 1;
            --slide-font-scale: 1;
            --card-font-scale: 1;
            --effective-font-scale: calc(var(--slide-font-scale, 1) * var(--card-font-scale, 1) * var(--font-scale, 1));
        }

        .slide-viewport,
        .slide-content-area,
        .content-card,
        .media-panel-card {
            --effective-font-scale: calc(var(--slide-font-scale, 1) * var(--card-font-scale, 1) * var(--font-scale, 1));
        }

        .content-card,
        .media-panel-card {
            position: relative;
        }

        .view-interactive,
        #interactiveSlide {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            scrollbar-width: thin;
            scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
        }
        .view-interactive::-webkit-scrollbar {
            width: 6px;
        }
        .view-interactive::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.4);
            border-radius: 3px;
        }

        /* Responsive Container-Query Typography Calibrated for 16:9 Viewport */
        .slide-content-area {
            font-size: calc(clamp(0.72rem, 1.65cqh, 0.95rem) * var(--effective-font-scale, 1));
        }

        .slide-content-area .card-title,
        .card-title {
            font-size: calc(clamp(0.85rem, 2.0cqh, 1.15rem) * var(--effective-font-scale, 1));
        }

        .slide-content-area .card-body,
        .card-body {
            font-size: calc(clamp(0.70rem, 1.55cqh, 0.90rem) * var(--effective-font-scale, 1));
            line-height: 1.45;
        }

        .slide-content-area .card-body ul,
        .slide-content-area .card-body ol,
        .slide-content-area .card-body li {
            font-size: inherit !important;
            line-height: 1.45 !important;
        }

        .slide-content-area .dense-table th,
        .slide-content-area .dense-table td,
        .dense-table th,
        .dense-table td {
            font-size: calc(clamp(0.68rem, 1.45cqh, 0.85rem) * var(--effective-font-scale, 1));
            padding: 0.35cqh 0.8cqw !important;
        }

        .content-card {
            padding: 1.0cqh 1.2cqw !important;
        }

        .compare-option-box {
            font-size: calc(clamp(0.68rem, 1.45cqh, 0.85rem) * var(--effective-font-scale, 1));
        }

        /* Clean borderless standalone image cards */
        .standalone-img-card,
        .img-edit-card,
        .media-panel-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
        }

        .standalone-img-card .img-title,
        .media-panel-card .img-title,
        .media-panel-card > div:first-child {
            font-weight: 800;
            color: #0369a1;
            text-transform: uppercase;
            font-size: 0.72rem;
            margin-bottom: 4px;
            flex: 0 0 auto;
        }

        .standalone-img-card .img-frame,
        .img-edit-card .img-frame,
        .media-panel-card .img-frame {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            border-radius: 6px;
        }

        .standalone-img-card img,
        .img-edit-card img,
        .media-panel-card img {
            width: 100% !important;
            height: auto !important;
            max-height: 48cqh !important;
            object-fit: contain !important;
            display: block !important;
            border-radius: 6px;
        }

        .slide-content-area h1 { font-size: calc(clamp(1.2rem, 2.8cqh, 1.8rem) * var(--effective-font-scale, 1)); }
        .slide-content-area h2 { font-size: calc(clamp(1.05rem, 2.3cqh, 1.4rem) * var(--effective-font-scale, 1)); }
        .slide-content-area h3 { font-size: calc(clamp(0.92rem, 1.9cqh, 1.15rem) * var(--effective-font-scale, 1)); }
        .slide-content-area h4 { font-size: calc(clamp(0.82rem, 1.7cqh, 1.0rem) * var(--effective-font-scale, 1)); }

        /* ==========================================================================
           JetBrains Rider / Unity C# Syntax Highlighting Theme
           ========================================================================== */
        .code-box,
        .code-container {
            background: #1e1f22 !important;
            border: 1px solid #393b40 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            margin: 6px 0 !important;
            position: relative;
        }

        .slide-content-area .code-box pre,
        .slide-content-area .code-container pre,
        .code-box pre,
        .code-container pre {
            background: #1e1f22 !important;
            color: #bcbec4 !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace !important;
            font-size: calc(clamp(0.54rem, 1.08cqh, 0.65rem) * var(--effective-font-scale, 1));
            line-height: 1.20 !important;
            padding: 0.6cqh 0.8cqw !important;
            margin: 0 !important;
            max-height: 75cqh !important;
            overflow-y: auto !important;
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

        .jb-editor-header,
        .code-box .code-header,
        .code-container .code-header {
            background: #2b2d30 !important;
            border-bottom: 1px solid #393b40 !important;
            padding: 4px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            user-select: none;
            min-height: 28px;
            box-sizing: border-box;
        }

        .jb-editor-tab {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #1e1f22;
            padding: 3px 10px;
            border-radius: 5px 5px 0 0;
            border: 1px solid #393b40;
            border-bottom: 1px solid #1e1f22;
            margin-bottom: -5px;
            color: #dfe1e5;
            font-size: 0.73rem;
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

        /* JetBrains Rider Syntax Classes */
        .jb-keyword { color: #cf8e6d !important; font-weight: 600; }
        .jb-type { color: #4ec9b0 !important; font-weight: 500; }
        .jb-method { color: #ffc66d !important; }
        .jb-number { color: #6897bb !important; }
        .jb-string { color: #6a8759 !important; }
        .jb-attr { color: #bbb529 !important; }
        .jb-comment { color: #808080 !important; font-style: italic !important; }
        .jb-plain { color: #bcbec4 !important; }

        .slide-content-area .punchy-point {
            font-size: calc(clamp(0.68rem, 1.45cqh, 0.82rem) * var(--effective-font-scale, 1));
            margin-bottom: 0.3cqh !important;
        }

        .split-media-layout {
            display: grid !important;
            grid-template-columns: 1.05fr 0.95fr !important;
            gap: 1.6cqw !important;
            align-items: start !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            flex: 0 0 auto !important;
            overflow: visible !important;
        }

        .split-media-layout .left-column,
        .split-media-layout .right-column {
            display: flex !important;
            flex-direction: column !important;
            gap: 1cqh !important;
            justify-content: flex-start !important;
            min-height: 0 !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
        }

        .split-media-layout .left-column .content-card,
        .split-media-layout .right-column .content-card {
            flex: 0 0 auto;
            height: auto;
            min-height: 0;
            padding: 1.4cqh 1.8cqw !important;
        }

        /* Semantic Card Theme Variations */
        .content-card.primary {
            border-left: 6px solid #059669 !important;
            background: #ffffff;
        }
        .content-card.primary .card-title,
        .card-title.primary,
        .card-title.core {
            color: #059669 !important;
        }

        .content-card.danger,
        .content-card.warning-card {
            border-left: 6px solid #ef4444 !important;
            background: #fff5f5;
        }
        .content-card.danger .card-title,
        .card-title.danger {
            color: #b91c1c !important;
        }

        .content-card.info,
        .content-card.adv-card {
            border-left: 6px solid #0284c7 !important;
            background: #f0f9ff;
        }
        .content-card.info .card-title,
        .card-title.info,
        .card-title.adv {
            color: #0369a1 !important;
        }

        .content-card.exp-card {
            border-left: 6px solid #7c3aed !important;
            background: #faf5ff;
        }
        .card-title.exp {
            color: #6d28d9 !important;
        }

        .content-card.success {
            border-left: 6px solid #10b981 !important;
            background: #f0fdf4;
        }
        .card-title.success {
            color: #047857 !important;
        }

        .content-stack {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.2cqh !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            flex: 0 0 auto !important;
        }

        /* High-contrast WCAG 2.1 AA legibility guarantees */
        .punchy-tag {
            background: #0369a1 !important;
            color: #ffffff !important;
            font-weight: 800 !important;
            border-radius: 4px !important;
            padding: 2px 7px !important;
            border: none !important;
            letter-spacing: 0.5px;
            display: inline-block;
            font-size: 0.65rem;
        }

        code:not(pre code) {
            background: #f1f5f9;
            color: #0f172a;
            padding: 1px 5px;
            border-radius: 4px;
            font-family: Consolas, Monaco, "Courier New", Courier, monospace;
            font-size: 0.88em;
            border: 1px solid #cbd5e1;
        }

        .media-panel-card code:not(pre code) {
            background: rgba(255, 255, 255, 0.12);
            color: #38bdf8;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .view-interactive.hr-inverted-slide code:not(pre code) {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.35);
        }

        .slide-footer .footer-brand-text {
            color: #475569 !important;
            font-weight: 700;
        }

        .view-interactive.hr-inverted-slide .slide-footer .footer-brand-text {
            color: #ffffff !important;
        }

        .view-interactive.hr-inverted-slide {
            background: #d80041 !important;
            color: #ffffff !important;
        }

        .view-interactive.hr-inverted-slide .content-card {
            background: #b50036 !important;
            border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
            border-left: 6px solid #ffffff !important;
            color: #ffffff !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .view-interactive.hr-inverted-slide .card-title,
        .view-interactive.hr-inverted-slide .card-body,
        .view-interactive.hr-inverted-slide .card-body strong,
        .view-interactive.hr-inverted-slide .card-body li {
            color: #ffffff !important;
        }

        .brand-title {
            font-size: 0.9rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand-logo,
        .brand-title img {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            max-width: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 1.5px solid var(--hr-red) !important;
            flex-shrink: 0 !important;
            display: inline-block !important;
        }

        /* ==========================================================================
           LECTURE MODE VIEWPORT CONTAINMENT & PROGRESSIVE DISCLOSURE
           ========================================================================== */
        body.lecture-mode .slide-viewport {
            container-type: size !important;
            overflow: hidden !important;
        }

        body.lecture-mode .view-interactive {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            height: 100% !important;
            max-height: 100% !important;
        }

        /* Sleek unobtrusive custom scrollbar in Lecture Mode */
        body.lecture-mode .view-interactive::-webkit-scrollbar {
            width: 6px;
        }
        body.lecture-mode .view-interactive::-webkit-scrollbar-track {
            background: transparent;
        }
        body.lecture-mode .view-interactive::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.35);
            border-radius: 4px;
        }
        body.lecture-mode .view-interactive::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.65);
        }

        body.lecture-mode .slide-content-area {
            max-height: calc(100% - 70px) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
        }

        body.lecture-mode .lab-deep-dive,
        body.lecture-mode .lab-only,
        body.lecture-mode details.slide-accordion,
        body.lecture-mode details.tier-accordion {
            display: none !important;
        }

        body.lecture-mode .lecture-only {
            display: block !important;
        }

        body.lab-mode .lecture-only {
            display: none !important;
        }

        body.lab-mode .slide-viewport {
            overflow: hidden !important;
        }

        body.lab-mode .view-interactive {
            overflow-y: auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            padding: 16px 24px !important;
            box-sizing: border-box !important;
        }

        /* Clean Scrollbar in Lab Mode */
        body.lab-mode .view-interactive::-webkit-scrollbar {
            width: 8px;
        }
        body.lab-mode .view-interactive::-webkit-scrollbar-track {
            background: #0f172a;
        }
        body.lab-mode .view-interactive::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
        body.lab-mode .view-interactive::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }

        body.lab-mode .slide-content-area {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
        }

        body.lab-mode .content-stack {
            overflow: visible !important;
            height: auto !important;
        }

        body.lab-mode .split-media-layout {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
        }

        /* Lab Mode Deep-Dive Study Guide Card */
        .lab-deep-dive {
            margin-top: 10px;
            padding: 12px 16px;
            background: #ffffff;
            border: 2px solid #0284c7;
            border-left: 6px solid #0284c7;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            color: #0f172a;
            text-align: left;
            box-sizing: border-box;
            width: 100%;
            display: none;
        }

        body.lab-mode .lab-deep-dive {
            display: block !important;
        }

        .lab-deep-dive-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 6px;
        }

        .lab-deep-dive-title {
            font-size: 0.88rem;
            font-weight: 900;
            color: #0369a1;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .lab-deep-dive-badge {
            background: #e0f2fe;
            color: #0284c7;
            font-size: 0.68rem;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid #bae6fd;
            text-transform: uppercase;
        }

        .lab-mental-model {
            background: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 8px;
            color: #14532d;
            font-size: 0.80rem;
            line-height: 1.45;
        }

        .lab-grid-2col {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 8px;
            margin-bottom: 8px;
        }

        .lab-box-neutral {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 0.78rem;
            line-height: 1.45;
            color: #334155;
        }

        .lab-box-trap {
            background: #fef2f2;
            border: 1.5px solid #fca5a5;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 8px;
            color: #7f1d1d;
            font-size: 0.78rem;
            line-height: 1.45;
        }

        .lab-box-rule {
            background: #eff6ff;
            border: 1.5px solid #bfdbfe;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.80rem;
            color: #1e40af;
            line-height: 1.45;
        }

        /* Accordion Styling (Standardized) */
        details.slide-accordion,
        details.tier-accordion {
            border-radius: 8px;
            overflow: hidden;
            margin-top: 8px;
            border: 1.5px solid #cbd5e1;
            border-left: 5px solid #0284c7;
            background: #f0f9ff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
            width: 100%;
            box-sizing: border-box;
            transition: all 0.15s ease;
        }

        body.lecture-mode details.slide-accordion,
        body.lecture-mode details.tier-accordion {
            display: none !important;
        }

        body.lab-mode details.slide-accordion,
        body.lab-mode details.tier-accordion {
            display: block !important;
        }

        summary.accordion-header {
            font-weight: 800;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 12px;
            font-size: 0.82rem;
            color: #0369a1;
            user-select: none;
            -webkit-user-select: none;
        }

        summary.accordion-header::-webkit-details-marker {
            display: none;
        }

        summary.accordion-header .accordion-expand,
        summary.accordion-header span:last-child {
            font-size: 0.75rem;
        }

        .accordion-body {
            padding: 8px 14px;
            border-top: 1px solid #e2e8f0;
            font-size: 0.80rem;
            line-height: 1.45;
            color: #334155;
            background: #ffffff;
        }



        /* High-contrast WCAG 2.1 AA text enforcement on light backgrounds */
        .slide-content-area [style*="#ff6b6b"],
        .slide-content-area [style*="#f87171"],
        .slide-content-area [style*="#ef4444"],
        .slide-content-area [style*="#fca5a5"] {
            color: #991b1b !important;
            font-weight: 700 !important;
        }
        .slide-content-area [style*="#4ade80"],
        .slide-content-area [style*="#34d399"],
        .slide-content-area [style*="#22c55e"],
        .slide-content-area [style*="#10b981"],
        .slide-content-area [style*="#86efac"] {
            color: #166534 !important;
            font-weight: 700 !important;
        }
        .slide-content-area [style*="#fbbf24"],
        .slide-content-area [style*="#facc15"] {
            color: #92400e !important;
            font-weight: 700 !important;
        }
        /* Do vs Don't table specific high-contrast rules */
        .dense-table th:first-child,
        .dense-table td:first-child {
            color: #991b1b !important;
        }
        .dense-table th:nth-child(2),
        .dense-table td:nth-child(2) {
            color: #166534 !important;
        }
    </style>
</head>
<body class="lecture-mode">
    <!-- Top University Brand Bar -->
    <header class="top-bar">
        <div class="brand-title">
            <img class="brand-logo" src="assets/HR_Logo.jpg" onerror="this.onerror=null; this.src='../HR_Logo.jpg';" style="width: 28px; height: 28px; min-width: 28px; max-width: 28px; min-height: 28px; max-height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--hr-red); flex-shrink: 0;" alt="HR Logo">
            <span>HR CMGT &bull; Lesson 08: Problem Solving &bull; <strong>Modern Unity 6</strong></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <a href="../index.html" class="portal-nav-btn" style="color: #94a3b8; text-decoration: none; font-size: 0.78rem; font-weight: 700; background: #14141e; border: 1px solid #28283c; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s ease;">&larr; Course Portal</a>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="main-workspace">
        <!-- Slide Drawer -->
        <nav class="slide-drawer" id="slideDrawer"></nav>

        <!-- Stage Area -->
        <main class="stage-area" id="stageArea">
            <div class="slide-viewport" id="viewport" style="position: relative;">
                <!-- Modern Slide View -->
                <div id="interactiveSlide" class="view-interactive" style="display: flex; width: 100%; height: 100%;">
                    <div class="slide-header" id="slideHeader">
                        <div class="slide-title-banner" id="slideTitle"></div>
                    </div>
                    <div class="slide-content-area" id="slideContentArea"></div>
                    <div class="slide-footer">
                        <span class="footer-brand-text" style="font-size: 0.65rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Hogeschool Rotterdam &bull; Minor Game Design &amp; Development &bull; Lesson 08</span>
                    </div>
                </div>

                <!-- Pace Speed Bubble -->
                <div id="paceSpeedBubble" class="pace-speed-bubble" onclick="clearAllPaceFlags()" title="Student flags: click to clear">0</div>
            </div>
        </main>
    </div>

    <!-- Bottom Navigation Bar -->
    <footer class="bottom-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
            <button class="nav-btn" id="prevBtn" onclick="changeSlide(-1)">&larr; Previous</button>
            <button class="nav-btn" id="btnFullscreen" onclick="toggleFullscreen()" title="Toggle Fullscreen [F]">Fullscreen [F]</button>
            <button class="nav-btn" id="btnHelp" onclick="toggleHelpModal(true)" title="View Keyboard Shortcuts [?]">[?] Shortcuts</button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="viewmode-toggle" title="Switch View Mode">
                <button class="viewmode-btn active" id="btnViewLecture" onclick="setViewMode('lecture')">Lecture Mode</button>
                <button class="viewmode-btn" id="btnViewLab" onclick="setViewMode('lab')">Lab Mode</button>
            </div>
            <div class="font-slider-wrap" title="Adjust text font size">
                <span class="font-slider-label">Font:</span>
                <input type="range" id="fontScaleSlider" class="font-slider-ctrl" min="70" max="140" value="100" step="5" oninput="setFontScale(this.value)">
                <span id="fontScaleValue" class="font-slider-val">100%</span>
            </div>
            <span class="mode-indicator new" id="modeBadge" style="background: rgba(16, 185, 129, 0.15); color: #166534; border: 1px solid #166534; padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">Unity 6 Studio Dev</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
            <span class="slide-counter" id="slideCounter">Slide 1 / ${slidesData.length}</span>
            <button class="nav-btn" id="nextBtn" onclick="changeSlide(1)">Next &rarr;</button>
        </div>
    </footer>

    <!-- Keyboard Shortcut Help Modal [?] -->
    <div id="helpModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleHelpModal(false)">
        <div class="help-modal-content">
            <div class="help-modal-header">
                <h3>Keyboard Shortcuts</h3>
                <button class="help-close-btn" onclick="toggleHelpModal(false)">&times;</button>
            </div>
            <div class="shortcut-list">
                <div class="shortcut-row"><span class="shortcut-key">&rarr; / Space</span><span>Next Slide</span></div>
                <div class="shortcut-row"><span class="shortcut-key">&larr;</span><span>Previous Slide</span></div>
                <div class="shortcut-row"><span class="shortcut-key">F</span><span>Toggle Fullscreen</span></div>
                <div class="shortcut-row"><span class="shortcut-key">L</span><span>Toggle Lecture / Lab Mode</span></div>
                <div class="shortcut-row"><span class="shortcut-key">N</span><span>Speaker Notes</span></div>
                <div class="shortcut-row"><span class="shortcut-key">?</span><span>Show / Hide this Help</span></div>
                <div class="shortcut-row"><span class="shortcut-key">Esc</span><span>Close Dialogs</span></div>
            </div>
        </div>
    </div>

    <!-- Presenter Speaker Notes Modal [N] -->
    <div id="notesModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleSpeakerNotes(false)">
        <div class="help-modal-content" style="max-width: 620px; border-left: 5px solid #38bdf8;">
            <div class="help-modal-header">
                <h3 style="color: #38bdf8; font-weight: 800;">Speaker Notes [N]</h3>
                <button class="help-close-btn" onclick="toggleSpeakerNotes(false)">&times;</button>
            </div>
            <div id="speakerNotesBody" style="font-size: 0.92rem; line-height: 1.6; color: #f1f5f9; padding: 10px 0;"></div>
        </div>
    </div>

    <!-- Script Block -->
    <script>
        var slidesData = ${JSON.stringify(slidesData, null, 2)};
        const SLIDE_STORAGE_KEY = 'hr_last_slide_' + (window.location.pathname || 'presentation');

        function getInitialSlideIndex() {
            try {
                if (window.location && window.location.hash) {
                    const match = window.location.hash.match(/^#slide-(\d+)$/i);
                    if (match) {
                        const parsed = parseInt(match[1], 10) - 1;
                        if (!isNaN(parsed) && parsed >= 0 && parsed < slidesData.length) {
                            return parsed;
                        }
                    }
                }
                const saved = localStorage.getItem(SLIDE_STORAGE_KEY);
                if (saved !== null) {
                    const parsed = parseInt(saved, 10);
                    if (!isNaN(parsed) && parsed >= 0 && parsed < slidesData.length) {
                        return parsed;
                    }
                }
            } catch (e) {}
            return 0;
        }

        var currentSlide = getInitialSlideIndex();
        window.slidesData = slidesData;
        window.currentSlide = currentSlide;
        let viewMode = 'lecture';
        let challengeTimers = {};
        let challengeRemaining = {};

        window.addEventListener('hashchange', () => {
            const match = window.location.hash.match(/^#slide-(\d+)$/i);
            if (match) {
                const idx = parseInt(match[1], 10) - 1;
                if (!isNaN(idx) && idx >= 0 && idx < slidesData.length && idx !== currentSlide) {
                    selectSlide(idx);
                }
            }
        });

        function init() {
            let savedMode = 'lecture';
            try { savedMode = localStorage.getItem('hr_gdd_viewmode') || 'lecture'; } catch (e) {}
            let savedFontScale = 100;
            try { savedFontScale = localStorage.getItem('gdd_font_scale') || 100; } catch (e) {}
            setFontScale(savedFontScale);
            buildDrawer();
            setupKeyboard();
            setViewMode(savedMode);
            renderSlide();
        }

        function buildDrawer() {
            const drawer = document.getElementById('slideDrawer');
            if (!drawer) return;
            drawer.innerHTML = '';
            slidesData.forEach((s, i) => {
                const item = document.createElement('div');
                item.className = 'drawer-item' + (i === currentSlide ? ' active' : '');
                item.onclick = () => selectSlide(i);
                let title = s.title || "Slide " + (i + 1);
                if (s.isHero) title = "Overview & Topics";
                item.innerHTML = \`
                    <span class="drawer-num">\${(i + 1).toString().padStart(2, '0')}</span>
                    <span class="drawer-title">\${title}</span>
                \`;
                drawer.appendChild(item);
            });
        }

        function updateDrawerActive() {
            const items = document.querySelectorAll('.drawer-item');
            items.forEach((it, idx) => {
                it.classList.toggle('active', idx === currentSlide);
            });
            if (items[currentSlide]) {
                items[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function renderSlide(index) {
            if (typeof index === 'number' && index >= 0 && index < slidesData.length) {
                currentSlide = index;
                window.currentSlide = index;
            }
            const s = slidesData[currentSlide];
            const interactive = document.getElementById('interactiveSlide');
            const header = document.getElementById('slideHeader');
            const titleEl = document.getElementById('slideTitle');
            const contentEl = document.getElementById('slideContentArea');

            if (!s || !contentEl || !interactive) return;

            try {
                localStorage.setItem(SLIDE_STORAGE_KEY, String(currentSlide));
                if (window.location && window.location.hash !== '#slide-' + (currentSlide + 1)) {
                    history.replaceState(null, '', '#slide-' + (currentSlide + 1));
                }
            } catch (e) {}

            interactive.scrollTop = 0;
            interactive.classList.remove('hr-inverted-slide');

            document.getElementById('slideCounter').textContent = \`Slide \${currentSlide + 1} / \${slidesData.length}\`;
            updateDrawerActive();

            if (s.isHero) {
                header.style.display = 'none';
                contentEl.innerHTML = \`
                    <div class="hero-wrapper" style="display: flex; flex-direction: column; justify-content: center; height: 100%; max-width: 900px; margin: 0 auto; padding: 20px;">
                        <span style="color: var(--hr-red); font-size: 0.90rem; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">Workshop &bull; 2-Hour Intensive</span>
                        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0f172a; margin: 8px 0 6px 0; line-height: 1.2;">\${s.title}</h1>
                        <p style="font-size: 1.1rem; color: #334155; font-weight: 600; margin-bottom: 24px;">\${s.subtitle}</p>
                        
                        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                            <div style="font-size: 0.85rem; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">Today's 4 Interactive Milestones:</div>
                            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                                \${s.topics.map(t => \`<li style="display: flex; align-items: center; gap: 10px; font-size: 0.92rem; font-weight: 600; color: #1e293b;"><span style="color: var(--hr-red); font-weight: 900;">&bull;</span>\${t}</li>\`).join('')}
                            </ul>
                        </div>
                        \${s.content || ''}
                    </div>
                \`;
                return;
            }

            if (s.isInverted) {
                interactive.classList.add('hr-inverted-slide');
                header.style.display = 'none';
                let topicsHtml = '';
                if (s.topics && s.topics.length > 0) {
                    topicsHtml = \`
                        <div style="margin-top: 16px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 8px; padding: 12px 18px; text-align: left;">
                            <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: rgba(255, 255, 255, 0.9); margin-bottom: 8px;">Key Topics Covered:</div>
                            <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                \${s.topics.map(t => \`<li style="font-size: 0.88rem; font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 8px;"><span style="color: #ffffff; font-weight: 900;">&bull;</span>\${t}</li>\`).join('')}
                            </ul>
                        </div>
                    \`;
                }
                contentEl.innerHTML = \`
                    <div style="display: flex; flex-direction: column; justify-content: center; height: 100%; max-width: 860px; margin: 0 auto; padding: 24px; text-align: center;">
                        <span style="background: #ffffff; color: var(--hr-red); padding: 4px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); align-self: center;">Section Milestone</span>
                        <h1 style="font-size: 2.2rem; font-weight: 900; color: #ffffff; margin-bottom: 8px;">\${s.title}</h1>
                        <p style="font-size: 1.05rem; color: #ffffff; font-weight: 600; margin-bottom: 16px;">\${s.subtitle}</p>
                        \${s.content || ''}
                        \${topicsHtml}
                    </div>
                \`;
                return;
            }

            header.style.display = 'flex';
            titleEl.textContent = s.title;
            contentEl.innerHTML = s.content || '';
        }

        function changeSlide(direction) {
            selectSlide(currentSlide + direction);
        }

        function selectSlide(idx) {
            if (idx < 0 || idx >= slidesData.length) return;
            currentSlide = idx;
            window.currentSlide = idx;
            renderSlide();
        }

        function setViewMode(mode) {
            viewMode = mode;
            if (mode === 'lecture') {
                document.body.classList.remove('lab-mode');
                document.body.classList.add('lecture-mode');
            } else {
                document.body.classList.remove('lecture-mode');
                document.body.classList.add('lab-mode');
            }
            const btnLecture = document.getElementById('btnViewLecture');
            const btnLab = document.getElementById('btnViewLab');
            if (btnLecture) btnLecture.classList.toggle('active', mode === 'lecture');
            if (btnLab) btnLab.classList.toggle('active', mode === 'lab');
            try { localStorage.setItem('hr_gdd_viewmode', mode); } catch (e) {}
        }

        function toggleLectureLabMode() {
            setViewMode(viewMode === 'lecture' ? 'lab' : 'lecture');
        }

        function setFontScale(val) {
            const scale = parseFloat(val) / 100;
            document.documentElement.style.setProperty('--font-scale', scale);
            document.documentElement.style.setProperty('--lecture-font-scale', scale);
            const disp = document.getElementById('fontScaleValue');
            if (disp) disp.textContent = val + '%';
            const slider = document.getElementById('fontScaleSlider');
            if (slider && slider.value !== String(val)) slider.value = val;
            try { localStorage.setItem('gdd_font_scale', val); } catch (e) {}
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        function toggleHelpModal(show) {
            const m = document.getElementById('helpModal');
            if (m) m.style.display = (show ?? m.style.display === 'none') ? 'flex' : 'none';
        }

        function toggleSpeakerNotes(show) {
            const m = document.getElementById('notesModal');
            if (!m) return;
            const open = (show ?? m.style.display === 'none');
            m.style.display = open ? 'flex' : 'none';
            if (open) {
                document.getElementById('speakerNotesBody').textContent = slidesData[currentSlide].notes || "No notes for this slide.";
            }
        }

        function formatTime(s) {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const sec = (s % 60).toString().padStart(2, '0');
            return \`\${m}:\${sec}\`;
        }

        function lecturerStartTimer(timerId, totalSeconds) {
            if (challengeTimers[timerId]) clearInterval(challengeTimers[timerId]);
            challengeRemaining[timerId] = challengeRemaining[timerId] || totalSeconds;
            const disp = document.getElementById(timerId);

            challengeTimers[timerId] = setInterval(() => {
                challengeRemaining[timerId]--;
                if (disp) disp.textContent = formatTime(challengeRemaining[timerId]);
                if (challengeRemaining[timerId] <= 0) {
                    clearInterval(challengeTimers[timerId]);
                    if (disp) {
                        disp.textContent = "TIME UP!";
                        disp.style.color = "#ef4444";
                    }
                }
            }, 1000);
        }

        function lecturerPauseTimer(timerId) {
            if (challengeTimers[timerId]) {
                clearInterval(challengeTimers[timerId]);
                challengeTimers[timerId] = null;
            }
        }

        function lecturerResetTimer(timerId, totalSeconds) {
            lecturerPauseTimer(timerId);
            challengeRemaining[timerId] = totalSeconds;
            const disp = document.getElementById(timerId);
            if (disp) {
                disp.textContent = formatTime(totalSeconds);
                disp.style.color = "#38bdf8";
            }
        }

        function copyCode(btn) {
            if (window.DeckEditor && typeof window.DeckEditor.copyCode === 'function') {
                window.DeckEditor.copyCode(btn);
                return;
            }
            const pre = btn.closest('.code-box, .code-container, .content-card')?.querySelector('pre');
            if (!pre) return;
            const textToCopy = pre.innerText || pre.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Gekopieerd!';
                btn.style.background = '#10b981';
                btn.style.color = '#ffffff';
                setTimeout(() => {
                    btn.textContent = orig;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1800);
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = textToCopy;
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    const orig = btn.textContent;
                    btn.textContent = 'Gekopieerd!';
                    btn.style.background = '#10b981';
                    btn.style.color = '#ffffff';
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1800);
                } catch(e) {}
                document.body.removeChild(ta);
            });
        }
        window.copyCode = copyCode;

        function setupKeyboard() {
            document.addEventListener('keydown', (e) => {
                const active = document.activeElement;
                const isTyping = (e.target && (
                    e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.isContentEditable ||
                    (e.target.closest && e.target.closest('[contenteditable="true"]'))
                )) || (active && (
                    active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable ||
                    (active.closest && active.closest('[contenteditable="true"]'))
                ));
                if (isTyping) return;
                if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                    e.preventDefault();
                    changeSlide(1);
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    e.preventDefault();
                    changeSlide(-1);
                } else if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    toggleFullscreen();
                } else if (e.key === 'l' || e.key === 'L') {
                    e.preventDefault();
                    toggleLectureLabMode();
                } else if (e.key === 'p' || e.key === 'P') {
                    e.preventDefault();
                    setViewMode('lecture');
                } else if (e.key === 'n' || e.key === 'N') {
                    e.preventDefault();
                    toggleSpeakerNotes();
                } else if (e.key === '?') {
                    e.preventDefault();
                    toggleHelpModal();
                } else if (e.key === 'Escape') {
                    toggleHelpModal(false);
                    toggleSpeakerNotes(false);
                } else if (e.key === 'Home') {
                    selectSlide(0);
                } else if (e.key === 'End') {
                    selectSlide(slidesData.length - 1);
                }
            });
        }

        window.onload = init;
    </script>
    <!-- One-time cache purge: automatically purge stale slide caches containing old pastel colors or non-English text -->
    <script>
        try {
            var contrastMigrationKey = 'hr_contrast_v6_purged';
            var englishMigrationKey = 'hr_deck_build_v7_english';
            if (!localStorage.getItem(englishMigrationKey)) {
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k && (k.indexOf('presentation_problemsolving') !== -1 || k.indexOf('hr_deck_editor') !== -1 || k.indexOf('hr_deck_v2') !== -1 || k.indexOf('hr_edit_v1') !== -1)) {
                        keysToRemove.push(k);
                    }
                }
                keysToRemove.forEach(function(key) { localStorage.removeItem(key); });
                localStorage.setItem(contrastMigrationKey, 'true');
                localStorage.setItem(englishMigrationKey, 'true');
            }
        } catch (e) {}
    </script>
</body>
</html>
`;

// Target output paths as specified
const outPath = path.resolve(__dirname, 'presentation_unity6_problemsolving.html');
const indexPath = path.resolve(__dirname, 'index.html');
const rootOutPath = path.resolve(__dirname, '../presentation_unity6_problemsolving.html');
const docsOutPath = path.resolve(__dirname, '../docs/presentation_problemsolving/presentation_unity6_problemsolving.html');
const docsIndexPath = path.resolve(__dirname, '../docs/presentation_problemsolving/index.html');
const docsRootOutPath = path.resolve(__dirname, '../docs/presentation_unity6_problemsolving.html');

// Ensure parent directories exist
[
    path.dirname(outPath),
    path.dirname(indexPath),
    path.dirname(rootOutPath),
    path.dirname(docsOutPath),
    path.dirname(docsIndexPath),
    path.dirname(docsRootOutPath)
].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Write all outputs
fs.writeFileSync(outPath, fullHtml, 'utf8');
fs.writeFileSync(indexPath, fullHtml, 'utf8');
fs.writeFileSync(rootOutPath, fullHtml, 'utf8');
fs.writeFileSync(docsOutPath, fullHtml, 'utf8');
fs.writeFileSync(docsIndexPath, fullHtml, 'utf8');
fs.writeFileSync(docsRootOutPath, fullHtml, 'utf8');

console.log('Successfully generated Class 8 presentation:');
console.log(' - ' + indexPath + ' (' + fs.statSync(indexPath).size + ' bytes)');
console.log(' - ' + outPath + ' (' + fs.statSync(outPath).size + ' bytes)');
console.log(' - ' + rootOutPath + ' (' + fs.statSync(rootOutPath).size + ' bytes)');
console.log(' - ' + docsIndexPath + ' (' + fs.statSync(docsIndexPath).size + ' bytes)');
console.log(' - ' + docsOutPath + ' (' + fs.statSync(docsOutPath).size + ' bytes)');
console.log(' - ' + docsRootOutPath + ' (' + fs.statSync(docsRootOutPath).size + ' bytes)');
