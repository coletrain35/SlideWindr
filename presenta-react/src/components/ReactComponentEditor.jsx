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

    // Auto-extract props when code changes (if props are empty)
    useEffect(() => {
        if (localCode && localCode.trim() && (!localProps || localProps.trim() === '' || localProps === '{}')) {
            // Small delay to avoid running on every keystroke
            const timer = setTimeout(() => {
                extractPropsFromCode(true); // silent mode
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [localCode]);

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
            // Auto-show visual editor when props are available
            if (Object.keys(parsed).length > 0 && !showAdvanced) {
                // Don't collapse it if it's already showing advanced
                setShowAdvanced(false);
            }
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
    const extractPropsFromCode = (silent = false) => {
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
                if (!silent) {
                    alert('Could not find component props in the code. Make sure your component uses destructured props like:\nconst MyComponent = ({ prop1 = value, prop2 = value }) => { ... }');
                }
                return null;
            }

            const propsString = funcMatch[2]; // The content between { and }
            const props = {};

            // Match individual props with default values
            // This handles: propName = defaultValue (with optional comma/newline after)
            // Updated regex to handle arrays, objects, and strings properly
            // Matches: arrays [...], objects {...}, strings "..." or '...', or simple values
            const propMatches = propsString.matchAll(/(\w+)\s*=\s*(\[[^\]]*\]|\{[^}]*\}|"[^"]*"|'[^']*'|[^,\n]+?)(?:\s*,|\s*\n|$)/gs);

            for (const match of propMatches) {
                const propName = match[1].trim();
                let defaultValue = match[2].trim();

                // Evaluate the default value
                try {
                    // Handle arrays
                    if (defaultValue.startsWith('[') && defaultValue.endsWith(']')) {
                        try {
                            // Try to parse as JSON
                            props[propName] = JSON.parse(defaultValue);
                        } catch {
                            // Fallback: simple array parsing
                            const items = defaultValue.slice(1, -1).split(',').map(v => {
                                v = v.trim();
                                if (v.startsWith('"') || v.startsWith("'")) return v.slice(1, -1);
                                if (!isNaN(v)) return parseFloat(v);
                                return v;
                            });
                            props[propName] = items;
                        }
                    }
                    // Handle common cases
                    else if (defaultValue === 'true') props[propName] = true;
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

            // Add smart defaults for common props that might not have default values
            const propsStringLower = propsString.toLowerCase();
            if (propsStringLower.includes('children') && !props.children) {
                props.children = 'Your text here';
            }
            if (propsStringLower.includes('text') && !props.text) {
                props.text = 'Your text here';
            }
            if (propsStringLower.includes('label') && !props.label) {
                props.label = 'Label';
            }
            if (propsStringLower.includes('title') && !props.title) {
                props.title = 'Title';
            }

            if (Object.keys(props).length === 0) {
                if (!silent) {
                    alert('No props with default values found. Add default values to your component props like:\nconst MyComponent = ({ color = "#ffffff", size = 10 }) => { ... }');
                }
                return null;
            }

            const jsonString = JSON.stringify(props, null, 2);
            setLocalProps(jsonString);
            debouncedPropsChange(jsonString);
            return props;
        } catch (e) {
            console.error('Error extracting props:', e);
            if (!silent) {
                alert('Error extracting props from code. Make sure your component has a valid function signature.');
            }
            return null;
        }
    };

    // Render visual control for a prop based on its type and value
    const renderPropControl = (key, value) => {
        const type = typeof value;

        // Array handling (for colors, items, etc.)
        if (Array.isArray(value)) {
            // Special handling for color arrays
            if (key.toLowerCase().includes('color') && value.every(v => typeof v === 'string' && v.match(/^#[0-9a-fA-F]{6}$/))) {
                return (
                    <div key={key} className="mb-3">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {value.map((color, idx) => (
                                <input
                                    key={idx}
                                    type="color"
                                    value={color}
                                    onChange={(e) => {
                                        const newArray = [...value];
                                        newArray[idx] = e.target.value;
                                        updatePropValue(key, newArray);
                                    }}
                                    className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                            ))}
                            <button
                                onClick={() => updatePropValue(key, [...value, '#000000'])}
                                className="w-12 h-10 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 flex items-center justify-center text-gray-400 hover:text-blue-500"
                                title="Add color"
                            >
                                +
                            </button>
                        </div>
                    </div>
                );
            }
            // Generic array as comma-separated text
            return (
                <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}: (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={value.join(', ')}
                        onChange={(e) => {
                            const newArray = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                            updatePropValue(key, newArray);
                        }}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>
            );
        }

        // Color picker for hex colors or props with "color" in the name
        // Supports hex, rgba, names, etc. via hybrid control
        if (type === 'string' && (value.match(/^#[0-9A-Fa-f]{6}$/) || key.toLowerCase().includes('color'))) {
            return (
                <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => updatePropValue(key, e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                            />
                            <div
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: value }}
                            />
                        </div>
                        <input
                            type="color"
                            value={value.match(/^#[0-9A-Fa-f]{6}$/) ? value : '#000000'}
                            onChange={(e) => updatePropValue(key, e.target.value)}
                            className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0"
                            title="Pick color"
                        />
                    </div>
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
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
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
            // Use textarea for longer text fields (children, text, content, etc.)
            const isLongText = ['children', 'text', 'content', 'description', 'message'].includes(key.toLowerCase());

            return (
                <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </label>
                    {isLongText ? (
                        <textarea
                            value={value}
                            onChange={(e) => updatePropValue(key, e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                            placeholder="Enter text here..."
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updatePropValue(key, e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    )}
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

            {/* Container Styling Controls (No-Code) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wide">Container Styling (No-Code)</h4>

                {/* Text Color */}
                <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Text Color:</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={parsedProps?._containerStyle?.color || ''}
                                onChange={(e) => {
                                    const style = { ...(parsedProps?._containerStyle || {}) };
                                    if (e.target.value) style.color = e.target.value;
                                    else delete style.color;
                                    updatePropValue('_containerStyle', style);
                                }}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                placeholder="inherit"
                            />
                            <div
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-gray-300 shadow-sm"
                                style={{ backgroundColor: parsedProps?._containerStyle?.color || 'transparent' }}
                            />
                        </div>
                        <input
                            type="color"
                            value={
                                (parsedProps?._containerStyle?.color && parsedProps._containerStyle.color.match(/^#[0-9A-Fa-f]{6}$/))
                                    ? parsedProps._containerStyle.color
                                    : '#000000'
                            }
                            onChange={(e) => {
                                const style = { ...(parsedProps?._containerStyle || {}) };
                                style.color = e.target.value;
                                updatePropValue('_containerStyle', style);
                            }}
                            className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0"
                            title="Pick color"
                        />
                    </div>
                </div>

                {/* Font Size */}
                <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Font Size (px):</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="range"
                            min="8"
                            max="100"
                            value={parseInt(parsedProps?._containerStyle?.fontSize) || 16}
                            onChange={(e) => {
                                const style = { ...(parsedProps?._containerStyle || {}) };
                                style.fontSize = `${e.target.value}px`;
                                updatePropValue('_containerStyle', style);
                            }}
                            className="flex-1"
                        />
                        <input
                            type="text"
                            value={parsedProps?._containerStyle?.fontSize || ''}
                            onChange={(e) => {
                                const style = { ...(parsedProps?._containerStyle || {}) };
                                if (e.target.value) style.fontSize = e.target.value;
                                else delete style.fontSize;
                                updatePropValue('_containerStyle', style);
                            }}
                            className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="inherit"
                        />
                    </div>
                </div>

                {/* Alignment */}
                <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Alignment:</label>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit">
                        {[
                            { align: 'flex-start', justify: 'flex-start', label: 'Top Left' },
                            { align: 'flex-start', justify: 'center', label: 'Top Center' },
                            { align: 'flex-start', justify: 'flex-end', label: 'Top Right' },
                            { align: 'center', justify: 'flex-start', label: 'Center Left' },
                            { align: 'center', justify: 'center', label: 'Center' },
                            { align: 'center', justify: 'flex-end', label: 'Center Right' },
                            { align: 'flex-end', justify: 'flex-start', label: 'Bottom Left' },
                            { align: 'flex-end', justify: 'center', label: 'Bottom Center' },
                            { align: 'flex-end', justify: 'flex-end', label: 'Bottom Right' },
                        ].map((pos, idx) => {
                            const currentStyle = parsedProps?._containerStyle || {};
                            const isActive = currentStyle.alignItems === pos.align && currentStyle.justifyContent === pos.justify;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const style = { ...(parsedProps?._containerStyle || {}) };
                                        style.display = 'flex';
                                        style.flexDirection = 'column';
                                        style.alignItems = pos.align;
                                        style.justifyContent = pos.justify;
                                        updatePropValue('_containerStyle', style);
                                    }}
                                    className={`w-8 h-8 rounded text-xs flex items-center justify-center transition-colors ${isActive
                                            ? 'bg-purple-500 text-white shadow-sm'
                                            : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'
                                        }`}
                                    title={pos.label}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

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
                                Auto-extract from JSX
                            </button>
                            <button
                                onClick={() => {
                                    if (!localCss) return;

                                    // 1. Find defined variables: --var-name: value;
                                    const definedVars = [...localCss.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+)(?:;|$)/g)];

                                    // 2. Find used variables: var(--var-name, optional-fallback)
                                    // Relaxed regex to catch the name even if there's a fallback
                                    const usedVars = [...localCss.matchAll(/var\(--([a-zA-Z0-9-]+)(?:,\s*[^)]*)?\)/g)];

                                    const newProps = { ...(parsedProps || {}) };
                                    let addedCount = 0;

                                    // Helper: kebab-case to camelCase
                                    const toCamelCase = (s) => s.replace(/-./g, x => x[1].toUpperCase());

                                    // Process defined variables first (they have default values)
                                    definedVars.forEach(match => {
                                        const varName = match[1];
                                        const value = match[2].trim();
                                        const propName = toCamelCase(varName);

                                        if (newProps[propName] === undefined) {
                                            // Try to parse numbers/colors
                                            if (!isNaN(parseFloat(value)) && isFinite(value)) {
                                                newProps[propName] = parseFloat(value);
                                            } else {
                                                newProps[propName] = value;
                                            }
                                            addedCount++;
                                        }
                                    });

                                    // Process used variables (default to empty string if not found)
                                    usedVars.forEach(match => {
                                        const varName = match[1];
                                        const propName = toCamelCase(varName);

                                        if (newProps[propName] === undefined) {
                                            newProps[propName] = "";
                                            addedCount++;
                                        }
                                    });

                                    if (addedCount > 0) {
                                        const jsonString = JSON.stringify(newProps, null, 2);
                                        setLocalProps(jsonString);
                                        debouncedPropsChange(jsonString);
                                        alert(`Extracted ${addedCount} props from CSS!`);
                                    } else {
                                        if (definedVars.length === 0 && usedVars.length === 0) {
                                            alert('No new CSS variables found to extract. Make sure you are using format var(--var-name) or --var-name: value');
                                        } else {
                                            alert('CSS variables found but they are already in your props!');
                                        }
                                    }
                                }}
                                className="text-xs px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors ml-2"
                                title="Extract props from CSS variables"
                            >
                                Auto-extract from CSS
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
