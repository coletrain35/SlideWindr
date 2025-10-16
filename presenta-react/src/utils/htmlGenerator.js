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

    // Generate HTML for each slide
    const slidesHtml = presentation.slides.map(slide => {
        const bg = slide.background || { type: 'color', value: '#ffffff' };
        let bgAttrs = '';

        // Set background attributes for reveal.js
        if (bg.type === 'color' && !bg.reactComponent) {
            bgAttrs = `data-background-color="${bg.value}"`;
        } else if (bg.type === 'image' && !bg.reactComponent) {
            bgAttrs = `data-background-image="${bg.value}"`;
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
            bgReactContainer = `<div class='absolute inset-0 w-full h-full' data-react-code='${code}' data-react-props='${props}'></div>`;
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
                reactContainer = `<div class='absolute inset-0 w-full h-full pointer-events-none' data-react-code='${code}' data-react-props='${props}'></div>`;
            }

            // Generate base element HTML based on type
            let baseElementHtml = '';
            switch (el.type) {
                case 'text':
                    baseElementHtml = `<div style="color: ${el.color}; font-size: ${el.fontSize}px; width: 100%; height: 100%;">${el.content}</div>`;
                    break;
                case 'shape':
                    baseElementHtml = `<div style="background-color: ${el.backgroundColor}; width: 100%; height: 100%;"></div>`;
                    break;
                case 'image':
                    baseElementHtml = `<img src="${el.src}" style="object-fit: cover; width: 100%; height: 100%;" draggable="false">`;
                    break;
                case 'iframe': {
                    const escapedHtml = (el.htmlContent || '')
                        .replace(/"/g, '&quot;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    baseElementHtml = `<iframe srcdoc="${escapedHtml}" style="border: none; width: 100%; height: 100%;"></iframe>`;
                    break;
                }
            }

            return `<div style="${style}">${baseElementHtml}${reactContainer}</div>`;
        }).join('\n');

        return `<section ${bgAttrs}>${bgReactContainer}${elementsHtml}</section>`;
    }).join('\n');

    // Configure reveal.js settings
    const settingsForReveal = {
        ...presentation.settings,
        hash: true,
        embedded: true,
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
    ${allComponentCss}
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
    <script>
        Reveal.initialize(${JSON.stringify(settingsForReveal, null, 2)});

        const dependencyResolver = (dep) => {
            if (dep === 'react') return React;
            if (dep === 'three') return THREE;
            if (dep === 'postprocessing') return POSTPROCESSING;
            throw new Error('Unknown dependency: ' + dep);
        };

        Reveal.on('ready', event => {
            document.querySelectorAll('[data-react-code]').forEach(container => {
                const code = container.dataset.reactCode.replace(/\\\\\\\\/g, '\\\\').replace(/&#39;/g, "'").replace(/\\\\n/g, '\\n');
                const propsString = container.dataset.reactProps.replace(/&#39;/g, "'");

                try {
                    const transformed = Babel.transform(code, {
                        presets: ['react'],
                        plugins: [ ["transform-modules-commonjs", { "loose": true }] ]
                    }).code;

                    const exports = {};
                    new Function('exports', 'require', transformed)(
                        exports,
                        dependencyResolver
                    );

                    const Component = exports.default;
                    if (!Component) throw new Error("Component must have a default export.");

                    const props = JSON.parse(propsString);

                    ReactDOM.render(React.createElement(Component, props), container);
                } catch (e) {
                    console.error("Failed to render React component:", { code, propsString, error: e });
                    container.innerHTML = '<div style="color:red; background: #fee; padding: 10px; font-size: 12px; text-align: left;">Error: ' + e.message + '</div>';
                }
            });
        });
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
