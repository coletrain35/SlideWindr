/**
 * Generates a standalone reveal.js HTML file from presentation data
 * @param {Object} presentation - The presentation object containing slides, settings, theme, and title
 * @returns {void} - Triggers a download of the HTML file
 */
export function generateRevealHTML(presentation) {
    // Collect all CSS from React components
    const allComponentCss = presentation.slides
        .flatMap(slide => [
            slide.background?.reactComponent?.css,
            ...slide.elements.map(el => el.reactComponent?.css)
        ])
        .filter(Boolean)
        .join('\n\n');

    // Helper function to generate HTML for a single slide
    const generateSlideHtml = (slide) => {
        const bg = slide.background || { type: 'color', value: '#ffffff' };
        let bgAttrs = '';

        // Set background attributes for reveal.js
        if (bg.type === 'gradient' && !bg.reactComponent) {
            bgAttrs = `data-background-gradient="${bg.value}"`;
        } else if (bg.type === 'color' && !bg.reactComponent) {
            bgAttrs = `data-background-color="${bg.value}"`;
        } else if (bg.type === 'image' && !bg.reactComponent) {
            bgAttrs = `data-background-image="${bg.value}"`;
        }

        // Add per-slide transition if specified
        if (slide.transition) {
            bgAttrs += ` data-transition="${slide.transition}"`;
        }

        // Generate React component container for background
        let bgReactContainer = '';
        if (slide.background?.reactComponent) {
            const code = encodeURIComponent(slide.background.reactComponent.code || '');
            const props = encodeURIComponent(slide.background.reactComponent.props || '{}');
            bgReactContainer = `<div class='absolute inset-0' style='width: 100%; height: 100%;' data-react-code="${code}" data-react-props="${props}"></div>`;
        }

        // ARCHITECTURAL CHANGE: Handle flow mode differently
        if (slide.layoutMode === 'flow') {
            // Flow mode: Output elements directly without absolute positioning
            const elementsHtml = slide.elements.map(el => {
                if (el.layoutMode === 'flow') {
                    // Check if this is a simple element (has tagName but not isFlowContainer)
                    // Simple elements need to be wrapped with their tag
                    if (el.tagName && !el.isFlowContainer && !el.isComplexElement) {
                        // Wrap content with original tag
                        // Get class attribute if exists
                        const classAttr = el.className ? ` class="${el.className}"` : '';
                        return `<${el.tagName}${classAttr}>${el.content}</${el.tagName}>`;
                    }
                    // Complex containers and other flow elements: return content as-is
                    return el.content;
                }
                // Fallback: if individual element needs absolute positioning
                return generateAbsoluteElement(el);
            }).join('\n');

            return `<section ${bgAttrs}>${bgReactContainer}${elementsHtml}</section>`;
        }

        // ABSOLUTE MODE: Existing logic below
        // Generate HTML for each element
        const elementsHtml = slide.elements.map(el => {
            // Map animation types to custom CSS animation classes
            const animationClassMap = {
                'fadeIn': 'custom-fadeIn',
                'slideInLeft': 'custom-slideInLeft',
                'slideInRight': 'custom-slideInRight',
                'slideInUp': 'custom-slideInUp',
                'slideInDown': 'custom-slideInDown',
                'zoomIn': 'custom-zoomIn',
                'bounceIn': 'custom-bounceIn',
                'rotateIn': 'custom-rotateIn',
                'flipIn': 'custom-flipIn',
                'pulse': 'custom-pulse',
                'shake': 'custom-shake',
                'swing': 'custom-swing'
            };

            // Build outer wrapper style (positioning and rotation)
            const outerStyle = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; transform: rotate(${el.rotation || 0}deg);`;

            // Build inner wrapper for animation (if applicable)
            let innerWrapperOpen = '';
            let innerWrapperClose = '';

            // Handle fragments (step-by-step reveal) and animations
            const hasAnimation = el.animation?.type && el.animation.type !== 'none';
            const hasFragmentOrder = el.fragmentOrder && el.fragmentOrder > 0;

            if (hasAnimation || hasFragmentOrder) {
                let fragmentClass = 'fragment';
                let fragmentAttrs = '';
                let animationStyle = 'width: 100%; height: 100%;';

                // Add fragment index if specified
                if (hasFragmentOrder) {
                    fragmentAttrs = ` data-fragment-index="${el.fragmentOrder}"`;
                }

                // Add animation if specified
                if (hasAnimation) {
                    const duration = el.animation.duration || 0.5;
                    const delay = el.animation.delay || 0;
                    const rawEasing = el.animation.easing || 'ease-out';

                    // Map easing values to valid CSS timing functions
                    const easingMap = {
                        'linear': 'linear',
                        'easeIn': 'ease-in',
                        'easeOut': 'ease-out',
                        'easeInOut': 'ease-in-out',
                        'spring': 'ease-out', // Spring doesn't exist in CSS, use ease-out
                        'ease-in': 'ease-in',
                        'ease-out': 'ease-out',
                        'ease-in-out': 'ease-in-out'
                    };
                    const easing = easingMap[rawEasing] || 'ease-out';

                    const animationClass = animationClassMap[el.animation.type] || 'custom-fadeIn';
                    fragmentClass += ` ${animationClass}`;

                    // Keyframe-based animations (bounceIn, pulse, shake, swing) use CSS custom properties
                    // Transition-based animations use inline transition styles
                    const keyframeAnimations = ['bounceIn', 'pulse', 'shake', 'swing'];

                    if (keyframeAnimations.includes(el.animation.type)) {
                        // Use CSS custom properties for keyframe animations
                        animationStyle += ` --anim-duration: ${duration}s; --anim-delay: ${delay}s; --anim-easing: ${easing};`;
                    } else {
                        // Build transition property with actual values for entrance animations
                        const transitionValue = `opacity ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s`;
                        animationStyle += ` transition: ${transitionValue};`;
                    }
                }

                innerWrapperOpen = `<div class="${fragmentClass}"${fragmentAttrs} style="${animationStyle}">`;
                innerWrapperClose = `</div>`;
            }

            const style = outerStyle;

            // Generate React component container for element
            let reactContainer = '';
            if (el.reactComponent) {
                const code = encodeURIComponent(el.reactComponent.code || '');
                const props = encodeURIComponent(el.reactComponent.props || '{}');
                reactContainer = `<div class='absolute inset-0 pointer-events-none' style='width: 100%; height: 100%; max-width: ${el.width}px; max-height: ${el.height}px; overflow: hidden;' data-react-code="${code}" data-react-props="${props}"></div>`;
            }

            // Generate base element HTML based on type
            let baseElementHtml = '';
            switch (el.type) {
                case 'text': {
                    // Use semantic tag if available (h1, h2, p, ul, etc.) or default to div
                    const semanticTag = el.tagName || 'div';

                    // Build style string with preserved styles
                    const color = el.color || '#000000';
                    let textStyles = `color: ${color}; font-size: ${el.fontSize}px;`;

                    // For non-semantic wrapper divs, add width/height
                    if (semanticTag === 'div' || semanticTag === 'section') {
                        textStyles += ` width: 100%; height: 100%;`;
                    }

                    // Add container styles if this is a styled container (from reveal.js import)
                    if (el.isStyledContainer) {
                        if (el.backgroundColor) textStyles += ` background-color: ${el.backgroundColor};`;
                        if (el.padding) textStyles += ` padding: ${el.padding};`;
                        if (el.borderRadius) textStyles += ` border-radius: ${el.borderRadius}px;`;
                    }

                    // Add computed styles if available (from reveal.js import)
                    if (el.computedStyles) {
                        if (el.computedStyles.fontFamily) textStyles += ` font-family: ${el.computedStyles.fontFamily};`;
                        if (el.computedStyles.fontWeight) textStyles += ` font-weight: ${el.computedStyles.fontWeight};`;
                        if (el.computedStyles.fontStyle) textStyles += ` font-style: ${el.computedStyles.fontStyle};`;
                        if (el.computedStyles.textAlign) textStyles += ` text-align: ${el.computedStyles.textAlign};`;
                        if (el.computedStyles.lineHeight) textStyles += ` line-height: ${el.computedStyles.lineHeight};`;
                        if (el.computedStyles.textTransform) textStyles += ` text-transform: ${el.computedStyles.textTransform};`;
                        if (el.computedStyles.letterSpacing) textStyles += ` letter-spacing: ${el.computedStyles.letterSpacing};`;
                        if (el.computedStyles.textShadow) textStyles += ` text-shadow: ${el.computedStyles.textShadow};`;
                    }

                    // Add inline style if available
                    if (el.inlineStyle) {
                        textStyles += ` ${el.inlineStyle}`;
                    }

                    const className = el.className ? ` class="${el.className}"` : '';

                    // Use semantic tag for output (preserves h1, h2, p, ul, etc.)
                    baseElementHtml = `<${semanticTag}${className} style="${textStyles}">${el.content}</${semanticTag}>`;
                    break;
                }
                case 'shape':
                    baseElementHtml = `<div style="background-color: ${el.backgroundColor}; width: 100%; height: 100%;"></div>`;
                    break;
                case 'image': {
                    const imgClass = el.className ? ` class="${el.className}"` : '';
                    const imgStyle = el.style || 'object-fit: cover; width: 100%; height: 100%;';
                    baseElementHtml = `<img src="${el.src}"${imgClass} style="${imgStyle}" draggable="false">`;
                    break;
                }
                case 'iframe': {
                    const escapedHtml = (el.htmlContent || '')
                        .replace(/"/g, '&quot;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    baseElementHtml = `<iframe srcdoc="${escapedHtml}" style="border: none; width: 100%; height: 100%;"></iframe>`;
                    break;
                }
                case 'htmlContent':
                    // For htmlContent elements, return the raw HTML without wrapping
                    // This preserves the original reveal.js slide structure
                    return el.htmlContent || '';
                case 'table': {
                    const tableRows = el.cellData.map((row, rowIdx) => {
                        const cells = row.map((cellContent, colIdx) => {
                            const cellStyle = el.cellStyles[rowIdx][colIdx];
                            const style = `background-color: ${cellStyle.backgroundColor}; color: ${cellStyle.color}; text-align: ${cellStyle.textAlign}; vertical-align: ${cellStyle.verticalAlign}; font-weight: ${cellStyle.fontWeight}; font-size: ${cellStyle.fontSize}px; padding: ${cellStyle.padding}px; border: ${cellStyle.borderWidth}px solid ${cellStyle.borderColor};`;
                            return `<td style="${style}">${cellContent}</td>`;
                        }).join('');
                        return `<tr>${cells}</tr>`;
                    }).join('');
                    baseElementHtml = `<table style="width: 100%; height: 100%; border-collapse: collapse;"><tbody>${tableRows}</tbody></table>`;
                    break;
                }
                case 'video': {
                    const videoUrl = el.videoUrl || el.videoData || '';
                    if (!videoUrl) {
                        baseElementHtml = `<div style="width: 100%; height: 100%; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; border-radius: ${el.borderRadius || 0}px;">No video URL</div>`;
                        break;
                    }

                    // Detect YouTube/Vimeo embeds
                    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
                    const youtubeMatch = videoUrl.match(youtubeRegex);
                    const vimeoMatch = videoUrl.match(vimeoRegex);

                    if (youtubeMatch) {
                        const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                        const autoplayParam = el.autoplay ? '?autoplay=1' : '';
                        const loopParam = el.loop ? (el.autoplay ? '&loop=1' : '?loop=1') : '';
                        const muteParam = el.muted ? (el.autoplay || el.loop ? '&mute=1' : '?mute=1') : '';
                        baseElementHtml = `<iframe src="${embedUrl}${autoplayParam}${loopParam}${muteParam}" style="width: 100%; height: 100%; border: none; border-radius: ${el.borderRadius || 0}px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    } else if (vimeoMatch) {
                        const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                        const autoplayParam = el.autoplay ? '?autoplay=1' : '';
                        const loopParam = el.loop ? (el.autoplay ? '&loop=1' : '?loop=1') : '';
                        const muteParam = el.muted ? (el.autoplay || el.loop ? '&muted=1' : '?muted=1') : '';
                        baseElementHtml = `<iframe src="${embedUrl}${autoplayParam}${loopParam}${muteParam}" style="width: 100%; height: 100%; border: none; border-radius: ${el.borderRadius || 0}px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                    } else {
                        // Direct video file
                        const autoplayAttr = el.autoplay ? ' autoplay' : '';
                        const loopAttr = el.loop ? ' loop' : '';
                        const mutedAttr = el.muted ? ' muted' : '';
                        const controlsAttr = el.controls !== false ? ' controls' : '';
                        const objectFit = el.objectFit || 'contain';
                        baseElementHtml = `<video src="${videoUrl}" style="width: 100%; height: 100%; object-fit: ${objectFit}; border-radius: ${el.borderRadius || 0}px;"${autoplayAttr}${loopAttr}${mutedAttr}${controlsAttr}></video>`;
                    }
                    break;
                }
                case 'audio': {
                    const audioUrl = el.audioUrl || el.audioData || '';
                    if (!audioUrl) {
                        baseElementHtml = `<div style="width: 100%; height: 100%; background-color: ${el.backgroundColor || '#f3f4f6'}; display: flex; align-items: center; justify-content: center; color: #6b7280; border-radius: ${el.borderRadius || 8}px;">No audio URL</div>`;
                        break;
                    }

                    const autoplayAttr = el.autoplay ? ' autoplay' : '';
                    const loopAttr = el.loop ? ' loop' : '';
                    const mutedAttr = el.muted ? ' muted' : '';
                    const controlsAttr = ' controls'; // Always show controls for audio
                    const audioStyle = `width: 100%; height: 100%; background-color: ${el.backgroundColor || '#f3f4f6'}; border-radius: ${el.borderRadius || 8}px; padding: 8px; box-sizing: border-box;`;

                    baseElementHtml = `<div style="${audioStyle}"><audio src="${audioUrl}" style="width: 100%; height: 100%;"${autoplayAttr}${loopAttr}${mutedAttr}${controlsAttr}></audio></div>`;
                    break;
                }
            }

            return `<div style="${style}">${innerWrapperOpen}${baseElementHtml}${reactContainer}${innerWrapperClose}</div>`;
        }).join('\n');

        return `<section ${bgAttrs}>${bgReactContainer}${elementsHtml}</section>`;
    };

    // Generate HTML for slides, handling nested structure
    const parentSlides = presentation.slides.filter(s => !s.parentId);
    const slidesHtml = parentSlides.map(parentSlide => {
        const childSlides = presentation.slides.filter(s => s.parentId === parentSlide.id);

        if (childSlides.length === 0) {
            // No children, just return the parent slide
            return generateSlideHtml(parentSlide);
        } else {
            // Has children, wrap parent and children in outer section
            const parentHtml = generateSlideHtml(parentSlide);
            const childrenHtml = childSlides.map(child => generateSlideHtml(child)).join('\n');
            return `<section>\n${parentHtml}\n${childrenHtml}\n</section>`;
        }
    }).join('\n');

    // Configure reveal.js settings
    const settingsForReveal = {
        ...presentation.settings,
        width: 960,
        height: 540,
        hash: true,
        embedded: false,
        plugins: []
    };

    // Generate complete HTML document
    const html = `
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${presentation.title}</title>
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@4.6.1/dist/reset.css">
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@4.6.1/dist/reveal.css">
    <link rel="stylesheet" href="https://unpkg.com/reveal.js@4.6.1/dist/theme/${presentation.theme || 'white'}.css" id="theme-link">
    <style>
    /* Set explicit slide dimensions (16:9 aspect ratio) */
    .reveal .slides section {
        width: 960px !important;
        height: 540px !important;
    }
    /* Ensure React component containers have proper dimensions */
    [data-react-code] {
        position: absolute;
        inset: 0;
        width: 960px;
        height: 540px;
    }
    .pixel-blast-container {
        width: 100%;
        height: 100%;
    }
    ${allComponentCss}

    /* Custom CSS from imported reveal.js presentations */
    ${presentation.customCSS || ''}

    /* Custom animations for elements - Initial hidden states */
    /* Transition timing is set via inline styles on each element */
    .fragment.custom-fadeIn {
        opacity: 0;
    }
    .fragment.custom-slideInLeft {
        opacity: 0;
        transform: translateX(-100px);
    }
    .fragment.custom-slideInRight {
        opacity: 0;
        transform: translateX(100px);
    }
    .fragment.custom-slideInUp {
        opacity: 0;
        transform: translateY(100px);
    }
    .fragment.custom-slideInDown {
        opacity: 0;
        transform: translateY(-100px);
    }
    .fragment.custom-zoomIn {
        opacity: 0;
        transform: scale(0);
    }
    .fragment.custom-bounceIn {
        opacity: 0;
        transform: scale(0);
    }
    .fragment.custom-rotateIn {
        opacity: 0;
        transform: rotate(-180deg) scale(0);
    }
    .fragment.custom-flipIn {
        opacity: 0;
        transform: perspective(400px) rotateY(-90deg);
    }

    /* Visible states - when Reveal.js makes the fragment visible */
    .fragment.visible.custom-fadeIn,
    .fragment.visible.custom-slideInLeft,
    .fragment.visible.custom-slideInRight,
    .fragment.visible.custom-slideInUp,
    .fragment.visible.custom-slideInDown,
    .fragment.visible.custom-zoomIn,
    .fragment.visible.custom-rotateIn,
    .fragment.visible.custom-flipIn {
        opacity: 1;
        transform: translateX(0) translateY(0) scale(1) rotate(0deg);
    }

    /* BounceIn needs keyframe animation for the bounce effect */
    @keyframes bounceIn {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        60% {
            transform: scale(1.2);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    .fragment.visible.custom-bounceIn {
        animation: bounceIn var(--anim-duration, 0.6s) var(--anim-easing, ease-out) var(--anim-delay, 0s) both;
        opacity: 1;
    }

    /* Emphasis animations - pulse, shake, swing */
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    @keyframes shake {
        0%, 100% {
            transform: translateX(0);
        }
        20% {
            transform: translateX(-10px);
        }
        40% {
            transform: translateX(10px);
        }
        60% {
            transform: translateX(-10px);
        }
        80% {
            transform: translateX(10px);
        }
    }
    @keyframes swing {
        0%, 100% {
            transform: rotate(0deg);
        }
        20% {
            transform: rotate(15deg);
        }
        40% {
            transform: rotate(-15deg);
        }
        60% {
            transform: rotate(10deg);
        }
        80% {
            transform: rotate(-10deg);
        }
    }

    /* Emphasis animation classes - visible from start */
    .fragment.custom-pulse {
        opacity: 1;
    }
    .fragment.visible.custom-pulse {
        animation: pulse var(--anim-duration, 0.5s) var(--anim-easing, ease-out) var(--anim-delay, 0s) infinite;
    }
    .fragment.custom-shake {
        opacity: 1;
    }
    .fragment.visible.custom-shake {
        animation: shake var(--anim-duration, 0.5s) var(--anim-easing, ease-out) var(--anim-delay, 0s) both;
    }
    .fragment.custom-swing {
        opacity: 1;
    }
    .fragment.visible.custom-swing {
        animation: swing var(--anim-duration, 0.8s) var(--anim-easing, ease-out) var(--anim-delay, 0s) both;
    }
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            ${slidesHtml}
        </div>
    </div>
    <script src="https://unpkg.com/reveal.js@4.6.1/dist/reveal.js"></script>
    <script src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://unpkg.com/postprocessing@6.23.5/build/postprocessing.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://unpkg.com/ogl@0.0.76/dist/ogl.umd.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.js"></script>
    <script>
        ${presentation.customJS ? `// Custom JavaScript from imported presentation\n        ${presentation.customJS}\n\n        ` : ''}Reveal.initialize(${JSON.stringify(settingsForReveal, null, 2)});

        // Add custom method to handle Reveal.js scaling transparency
        window._getUnscaledRect = function(element) {
            if (!element || typeof element.getBoundingClientRect !== 'function') {
                return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0, x: 0, y: 0 };
            }
            const rect = element.getBoundingClientRect();
            // Calculate scale based on the element's own dimensions (most robust)
            // This handles nested transforms, zoom, and Reveal.js scaling accurately
            let scaleX = 1;
            let scaleY = 1;
            
            if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                 scaleX = rect.width / element.offsetWidth;
                 scaleY = rect.height / element.offsetHeight;
            } else if (window.Reveal && Reveal.getScale) {
                 scaleX = Reveal.getScale();
                 scaleY = Reveal.getScale();
            }

            return {
                top: rect.top / scaleY,
                left: rect.left / scaleX,
                width: rect.width / scaleX,
                height: rect.height / scaleY,
                bottom: rect.bottom / scaleY,
                right: rect.right / scaleX,
                x: rect.x / scaleX,
                y: rect.y / scaleY
            };
        };

        const dependencyResolver = (dep) => {
            if (dep === 'react') return React;
            if (dep === 'three') return THREE;
            if (dep === 'postprocessing') return POSTPROCESSING;
            if (dep === 'gsap') return gsap;
            if (dep === 'ogl') return ogl;
            if (dep === 'framer-motion' || dep === 'motion/react') return { motion: Motion.motion, AnimatePresence: Motion.AnimatePresence };
            // Allow relative path imports for CSS by ignoring them
            if (dep.startsWith('./') && dep.endsWith('.css')) return {};
            console.warn('Unknown dependency:', dep);
            return {};
        };

        // Track which containers have been rendered to prevent re-renders
        const renderedContainers = new Set();

        // Render all React components once on load
        Reveal.on('ready', event => {
            const containers = document.querySelectorAll('[data-react-code]');
            console.log('Found', containers.length, 'React component(s) to render');

            containers.forEach((container, index) => {
                // Skip if already rendered
                if (renderedContainers.has(container)) {
                    console.log('Skipping already rendered container', index);
                    return;
                }

                const code = decodeURIComponent(container.dataset.reactCode);
                const propsString = decodeURIComponent(container.dataset.reactProps);

                console.log('Rendering React component', index);

                try {
                    // AUTO-PATCH: Handle Reveal.js scaling for getBoundingClientRect
                    // We replace the standard call with our global unscaled version
                    // Regex find "object.getBoundingClientRect()" and turns it into "window._getUnscaledRect(object)"
                    // NOTE: We use new RegExp with quad-escaped backslashes. 
                    // We must escape double quotes (\\\" -> \" -> ") and backslashes (\\\\ -> \\ -> \).
                    // This creates a regex that matches identifiers including brackets, quotes, dots, dollar signs.
                    let codeToRun = code.replace(new RegExp("([\\\\w\\\\.$[\\\\]\\\"']+)\\\\.getBoundingClientRect\\\\(\\\\)", "g"), 'window._getUnscaledRect($1)');

                    // AUTO-PATCH: Fix SplashCursor/Fluid coordinate mapping
                    // The component uses window.addEventListener but the canvas is inside a scaled slide.
                    // We need to subtract the canvas offset from the global mouse coordinates.
                    // Matches: scaleByPixelRatio(e.clientX) -> scaleByPixelRatio(e.clientX - (typeof canvas !== 'undefined' ? canvas.getBoundingClientRect().left : 0))
                    codeToRun = codeToRun.replace(new RegExp("scaleByPixelRatio\\\\(([^)]+)\\\\.clientX\\\\)", "g"), "scaleByPixelRatio($1.clientX - (typeof canvas !== 'undefined' ? canvas.getBoundingClientRect().left : 0))");
                    codeToRun = codeToRun.replace(new RegExp("scaleByPixelRatio\\\\(([^)]+)\\\\.clientY\\\\)", "g"), "scaleByPixelRatio($1.clientY - (typeof canvas !== 'undefined' ? canvas.getBoundingClientRect().top : 0))");

                    // AUTO-PATCH: Fix SplashCursor sizing (100vw -> 100%)
                    // Canvas using 100vw inside a scaled slide will likely overflow the slide.
                    // We replace '100vw' and '100vh' with '100%' to constrain it to the container (which is already set to slide size).
                    // We must escape the double quote in the character class: ['\\\"'] matches ' or "
                    codeToRun = codeToRun.replace(new RegExp("['\\\"]100vw['\\\"]", "g"), "'100%'");
                    codeToRun = codeToRun.replace(new RegExp("['\\\"]100vh['\\\"]", "g"), "'100%'");

                    const transformed = Babel.transform(codeToRun, {
                        presets: ['react'],
                        plugins: [ ["transform-modules-commonjs", { "loose": true }] ]
                    }).code;

                    const exports = {};
                    new Function(
                        'exports',
                        'require',
                        'React',
                        'useState',
                        'useEffect',
                        'useLayoutEffect',
                        'useRef',
                        'useMemo',
                        'useCallback',
                        'useContext',
                        'useReducer',
                        'useImperativeHandle',
                        'useDebugValue',
                        'useId',
                        'useDeferredValue',
                        'useTransition',
                        'useInsertionEffect',
                        'useSyncExternalStore',
                        'THREE',
                        'POSTPROCESSING',
                        'gsap',
                        'ogl',
                        'motion',
                        'AnimatePresence',
                        transformed
                    )(
                        exports,
                        dependencyResolver,
                        React,
                        React.useState,
                        React.useEffect,
                        React.useLayoutEffect,
                        React.useRef,
                        React.useMemo,
                        React.useCallback,
                        React.useContext,
                        React.useReducer,
                        React.useImperativeHandle,
                        React.useDebugValue,
                        React.useId,
                        React.useDeferredValue,
                        React.useTransition,
                        React.useInsertionEffect,
                        React.useSyncExternalStore,
                        typeof THREE !== 'undefined' ? THREE : {},
                        typeof POSTPROCESSING !== 'undefined' ? POSTPROCESSING : {},
                        typeof gsap !== 'undefined' ? gsap : {},
                        typeof ogl !== 'undefined' ? ogl : {},
                        (typeof Motion !== 'undefined' && Motion.motion) ? Motion.motion : {},
                        (typeof Motion !== 'undefined' && Motion.AnimatePresence) ? Motion.AnimatePresence : {}
                    );

                    const Component = exports.default;
                    if (!Component) throw new Error("Component must have a default export.");

                    const props = JSON.parse(propsString);

                    // Replicate ComponentContainer logic for styling and alignment
                    const cssVars = {};
                    let containerStyle = {};

                    // Extract CSS variables and container styles from props
                    Object.entries(props).forEach(([key, value]) => {
                        if (typeof value === 'string' || typeof value === 'number') {
                            // Convert camelCase to kebab-case for CSS vars
                            const cssVarName = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
                            cssVars[cssVarName] = value;
                        }
                    });

                    if (props._containerStyle) {
                        containerStyle = props._containerStyle;
                    }

                    // Create a wrapper component to apply styles
                    const Wrapper = () => {
                        return React.createElement('div', {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                margin: 0,
                                ...containerStyle,
                                ...cssVars
                            }
                        }, React.createElement(Component, props));
                    };

                    const root = ReactDOM.createRoot(container);
                    root.render(React.createElement(Wrapper));
                    renderedContainers.add(container);
                    console.log('Successfully rendered React component', index);
                } catch (e) {
                    console.error("Failed to render React component", index, ":", e);
                    container.innerHTML = '<div style="color:red; background: #fee; padding: 10px; font-size: 12px; text-align: left;">Error: ' + e.message + '</div>';
                }
            });
        });

        // Detect WebGL context loss
        window.addEventListener('webglcontextlost', (e) => {
            console.error('WebGL context lost detected on element:', e.target);
            e.preventDefault(); // Prevent default behavior
        }, true);

        window.addEventListener('webglcontextrestored', (e) => {
            console.log('WebGL context restored on element:', e.target);
        }, true);
    </script>
</body>
</html>`;

    // Trigger download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.html';
    a.click();
    URL.revokeObjectURL(url);
}
