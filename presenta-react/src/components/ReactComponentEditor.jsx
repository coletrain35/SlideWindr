import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TrashIcon } from './Icons';
import { useDebouncedCallback } from '../utils/debounce';

const ReactComponentEditor = ({ componentData, onChange, title }) => {
    // Local state for immediate UI updates
    const [localCode, setLocalCode] = useState(componentData?.code || '');
    const [localProps, setLocalProps] = useState(componentData?.props || '');
    const [localCss, setLocalCss] = useState(componentData?.css || '');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [parsedProps, setParsedProps] = useState(null);
    const [propsError, setPropsError] = useState(null);

    // Debounced callbacks to update parent state (300ms delay)
    const debouncedCodeChange = useDebouncedCallback((value) => {
        onChange({ ...(componentData || {}), code: value });
    }, 300);

    const debouncedPropsChange = useDebouncedCallback((value) => {
        onChange({ ...(componentData || {}), props: value });
    }, 300);

    const debouncedCssChange = useDebouncedCallback((value) => {
        onChange({ ...(componentData || {}), css: value });
    }, 300);

    // Handlers update local state immediately and debounced parent state
    const handleCodeChange = (e) => {
        const value = e.target.value;
        setLocalCode(value);
        debouncedCodeChange(value);
    };

    const handlePropsChange = (e) => {
        const value = e.target.value;
        setLocalProps(value);
        debouncedPropsChange(value);
    };

    const handleCssChange = (e) => {
        const value = e.target.value;
        setLocalCss(value);
        debouncedCssChange(value);
    };

    // Sync local state when componentData changes externally
    useEffect(() => {
        setLocalCode(componentData?.code || '');
        setLocalProps(componentData?.props || '');
        setLocalCss(componentData?.css || '');
    }, [componentData?.code, componentData?.props, componentData?.css]);

    // Parse props JSON for visual editor
    useEffect(() => {
        if (!localProps || localProps.trim() === '') {
            setParsedProps(null);
            setPropsError(null);
            return;
        }
        try {
            const parsed = JSON.parse(localProps);
            setParsedProps(parsed);
            setPropsError(null);
        } catch (e) {
            setParsedProps(null);
            setPropsError(e.message);
        }
    }, [localProps]);

    // Update a specific prop value
    const updatePropValue = (key, value) => {
        try {
            const updated = { ...parsedProps, [key]: value };
            const jsonString = JSON.stringify(updated, null, 2);
            setLocalProps(jsonString);
            debouncedPropsChange(jsonString);
        } catch (e) {
            console.error('Error updating prop:', e);
        }
    };

    // Extract default props from component code
    const extractPropsFromCode = () => {
        try {
            // Look for function parameters with destructuring and default values
            // This regex handles multi-line prop definitions
            // Matches: const Name = ({ ... }) => or function Name({ ... })
            let funcMatch = localCode.match(/(?:const|let|var)\s+(\w+)\s*=\s*\(\s*\{([\s\S]*?)\}\s*\)\s*=>/);

            if (!funcMatch) {
                // Try function declaration style
                funcMatch = localCode.match(/function\s+(\w+)\s*\(\s*\{([\s\S]*?)\}\s*\)/);
            }

            if (!funcMatch) {
                alert('Could not find component props in the code. Make sure your component uses destructured props like:\nconst MyComponent = ({ prop1 = value, prop2 = value }) => { ... }');
                return;
            }

            const propsString = funcMatch[2]; // The content between { and }
            const props = {};

            // Match individual props with default values
            // This handles: propName = defaultValue (with optional comma/newline after)
            const propMatches = propsString.matchAll(/(\w+)\s*=\s*([^,\n]+?)(?:,|\s*\n|$)/gs);

            for (const match of propMatches) {
                const propName = match[1].trim();
                let defaultValue = match[2].trim();

                // Evaluate the default value
                try {
                    // Handle common cases
                    if (defaultValue === 'true') props[propName] = true;
                    else if (defaultValue === 'false') props[propName] = false;
                    else if (defaultValue.startsWith("'") || defaultValue.startsWith('"')) {
                        props[propName] = defaultValue.slice(1, -1); // Remove quotes
                    } else if (!isNaN(defaultValue)) {
                        props[propName] = parseFloat(defaultValue);
                    } else {
                        // For complex values, try to parse as is
                        props[propName] = defaultValue.replace(/['"]/g, '');
                    }
                } catch (e) {
                    console.warn(`Could not parse default value for ${propName}:`, defaultValue);
                }
            }

            if (Object.keys(props).length === 0) {
                alert('No props with default values found. Add default values to your component props like:\nconst MyComponent = ({ color = "#ffffff", size = 10 }) => { ... }');
                return;
            }

            const jsonString = JSON.stringify(props, null, 2);
            setLocalProps(jsonString);
            debouncedPropsChange(jsonString);
        } catch (e) {
            console.error('Error extracting props:', e);
            alert('Error extracting props from code. Make sure your component has a valid function signature.');
        }
    };

    // Render visual control for a prop based on its type and value
    const renderPropControl = (key, value) => {
        const type = typeof value;

        // Color picker for hex colors
        if (type === 'string' && value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return (
                <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </label>
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => updatePropValue(key, e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                </div>
            );
        }

        // Number slider with input
        if (type === 'number') {
            // Determine reasonable min/max based on the value and key name
            let min = 0, max = 100, step = 1;
            const keyLower = key.toLowerCase();

            if (keyLower.includes('opacity') || keyLower.includes('alpha')) {
                min = 0; max = 1; step = 0.01;
            } else if (keyLower.includes('speed') || keyLower.includes('wobble')) {
                min = 0; max = 10; step = 0.1;
            } else if (keyLower.includes('scale') || keyLower.includes('intensity') || keyLower.includes('strength') || keyLower.includes('density')) {
                min = 0; max = 5; step = 0.1;
            } else if (keyLower.includes('radius') || keyLower.includes('thickness') || keyLower.includes('jitter')) {
                min = 0; max = 2; step = 0.05;
            } else if (keyLower.includes('size') && value < 20) {
                min = 1; max = 20; step = 0.5;
            } else if (keyLower.includes('fade')) {
                min = 0; max = 1; step = 0.05;
            } else if (value > 100) {
                max = Math.max(1000, value * 2);
            }

            return (
                <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) => updatePropValue(key, parseFloat(e.target.value))}
                            className="flex-1"
                        />
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) => updatePropValue(key, parseFloat(e.target.value) || 0)}
                            className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
            );
        }

        // Boolean toggle
        if (type === 'boolean') {
            return (
                <div key={key} className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </label>
                    <button
                        onClick={() => updatePropValue(key, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            );
        }

        // String select for known values
        if (type === 'string' && ['direction', 'mode', 'type', 'variant', 'shape', 'style'].some(k => key.toLowerCase().includes(k))) {
            const options = {
                direction: ['forward', 'reverse', 'pingpong'],
                mode: ['normal', 'multiply', 'screen', 'overlay'],
                type: ['solid', 'gradient', 'radial'],
                variant: ['square', 'circle', 'triangle', 'diamond'],
                shape: ['square', 'circle', 'triangle', 'diamond'],
                style: ['normal', 'outlined', 'filled', 'gradient']
            };

            const optionKey = Object.keys(options).find(k => key.toLowerCase().includes(k));
            if (optionKey && options[optionKey]) {
                return (
                    <div key={key} className="mb-3">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </label>
                        <select
                            value={value}
                            onChange={(e) => updatePropValue(key, e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            {options[optionKey].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                );
            }
        }

        // Text input for other strings
        if (type === 'string') {
            return (
                <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updatePropValue(key, e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>
            );
        }

        return null;
    };

    const addComponent = () => {
        onChange({
            code: `// Your component must be the default export.
// Props are passed as an object and can be used to control appearance.
// TIP: Expose colors as hex values, sizes as numbers, and options as strings
// for the best visual editing experience!

export default function MyComponent({
    text = "Hello World",
    textColor = "#ffffff",
    bgColor = "#4f46e5",
    fontSize = 32,
    borderRadius = 8,
    showBorder = true
}) {
    return (
        <div className="my-component-style" style={{
            color: textColor,
            background: bgColor,
            fontSize: fontSize + 'px',
            borderRadius: borderRadius + 'px',
            border: showBorder ? '2px solid rgba(255,255,255,0.3)' : 'none'
        }}>
            {text}
        </div>
    );
}`,
            props: `{
  "text": "Hello from React!",
  "textColor": "#ffffff",
  "bgColor": "#4f46e5",
  "fontSize": 32,
  "borderRadius": 8,
  "showBorder": true
}`,
            css: `.my-component-style {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.3s ease;
}`
        });
    };

    const removeComponent = () => onChange(null);

    if (!componentData) {
        return (
            <button
                onClick={addComponent}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
            >
                Add React Component
            </button>
        );
    }

    return (
        <div className="space-y-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h3>
                <button
                    onClick={removeComponent}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove Component"
                >
                    <TrashIcon />
                </button>
            </div>

            {/* Visual Props Editor */}
            {parsedProps && Object.keys(parsedProps).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wide">Visual Controls</h4>
                    <div className="space-y-2">
                        {Object.entries(parsedProps).map(([key, value]) => renderPropControl(key, value))}
                    </div>
                </div>
            )}

            {propsError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs text-red-700 dark:text-red-400">
                    Invalid JSON: {propsError}
                </div>
            )}

            {/* Advanced Code Editor Toggle */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-left px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-between"
            >
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Code Editor</span>
                <svg
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showAdvanced && (
                <>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Component Code (JSX):</label>
                        <textarea
                            value={localCode}
                            onChange={handleCodeChange}
                            className="w-full h-48 border border-gray-300 dark:border-gray-600 rounded-lg p-2 font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            spellCheck="false"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Props (JSON string):</label>
                            <button
                                onClick={extractPropsFromCode}
                                className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                title="Extract default props from component code"
                            >
                                Auto-extract Props
                            </button>
                        </div>
                        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                            <strong>Tip:</strong> Props must be valid JSON. Use the Auto-extract button to generate props from your component's default values.
                        </div>
                        <textarea
                            value={localProps}
                            onChange={handlePropsChange}
                            className="w-full h-20 border border-gray-300 dark:border-gray-600 rounded-lg p-2 font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            spellCheck="false"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Component CSS:</label>
                        <textarea
                            value={localCss}
                            onChange={handleCssChange}
                            className="w-full h-24 border border-gray-300 dark:border-gray-600 rounded-lg p-2 font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            spellCheck="false"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

ReactComponentEditor.propTypes = {
    componentData: PropTypes.shape({
        code: PropTypes.string,
        props: PropTypes.string,
        css: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
};

export default ReactComponentEditor;
