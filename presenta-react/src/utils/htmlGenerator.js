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
        if (bg.type === 'color' && !bg.reactComponent) {
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
            const code = (slide.background.reactComponent.code || '')
                .replace(/\\/g, '\\\\')
                .replace(/'/g, '&#39;')
                .replace(/\n/g, '\\n');
            const props = (slide.background.reactComponent.props || '{}')
                .replace(/'/g, '&#39;');
            bgReactContainer = `<div class='absolute inset-0' style='width: 100%; height: 100%;' data-react-code='${code}' data-react-props='${props}'></div>`;
        }

        // Generate HTML for each element
        const elementsHtml = slide.elements.map(el => {
            const style = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; transform: rotate(${el.rotation || 0}deg);`;

            // Generate React component container for element
            let reactContainer = '';
            if (el.reactComponent) {
                const code = (el.reactComponent.code || '')
                    .replace(/\\/g, '\\\\')
                    .replace(/'/g, '&#39;')
                    .replace(/\n/g, '\\n');
                const props = (el.reactComponent.props || '{}')
                    .replace(/'/g, '&#39;');
                reactContainer = `<div class='absolute inset-0 pointer-events-none' style='width: 100%; height: 100%; max-width: ${el.width}px; max-height: ${el.height}px; overflow: hidden;' data-react-code='${code}' data-react-props='${props}'></div>`;
            }

            // Generate base element HTML based on type
            let baseElementHtml = '';
            switch (el.type) {
                case 'text': {
                    // Build style string with preserved styles
                    let textStyles = `color: ${el.color}; font-size: ${el.fontSize}px; width: 100%; height: 100%;`;

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
                    baseElementHtml = `<div${className} style="${textStyles}">${el.content}</div>`;
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
            }

            return `<div style="${style}">${baseElementHtml}${reactContainer}</div>`;
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reset.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/theme/${presentation.theme}.min.css">
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
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            ${slidesHtml}
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://unpkg.com/postprocessing@6.23.5/build/postprocessing.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script>
        Reveal.initialize(${JSON.stringify(settingsForReveal, null, 2)});

        const dependencyResolver = (dep) => {
            if (dep === 'react') return React;
            if (dep === 'three') return THREE;
            if (dep === 'postprocessing') return POSTPROCESSING;
            if (dep === 'gsap') return gsap;
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

                const code = container.dataset.reactCode.replace(/\\\\\\\\/g, '\\\\').replace(/&#39;/g, "'").replace(/\\\\n/g, '\\n');
                const propsString = container.dataset.reactProps.replace(/&#39;/g, "'");

                console.log('Rendering React component', index);

                try {
                    const transformed = Babel.transform(code, {
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
                        typeof gsap !== 'undefined' ? gsap : {}
                    );

                    const Component = exports.default;
                    if (!Component) throw new Error("Component must have a default export.");

                    const props = JSON.parse(propsString);

                    ReactDOM.render(React.createElement(Component, props), container);
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
