import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactComponentEditor from './ReactComponentEditor';
import { useDebouncedCallback } from '../utils/debounce';

const ElementProperties = ({ selectedElement, updateElement, deleteElement }) => {
    // Local state for immediate UI updates on numeric inputs
    const [localX, setLocalX] = useState(selectedElement.x);
    const [localY, setLocalY] = useState(selectedElement.y);
    const [localWidth, setLocalWidth] = useState(selectedElement.width);
    const [localHeight, setLocalHeight] = useState(selectedElement.height);
    const [localFontSize, setLocalFontSize] = useState(selectedElement.fontSize);

    // Debounced callbacks to update parent state (150ms delay for better performance)
    const debouncedXChange = useDebouncedCallback((value) => {
        updateElement(selectedElement.id, { x: value });
    }, 150);

    const debouncedYChange = useDebouncedCallback((value) => {
        updateElement(selectedElement.id, { y: value });
    }, 150);

    const debouncedWidthChange = useDebouncedCallback((value) => {
        updateElement(selectedElement.id, { width: value });
    }, 150);

    const debouncedHeightChange = useDebouncedCallback((value) => {
        updateElement(selectedElement.id, { height: value });
    }, 150);

    const debouncedFontSizeChange = useDebouncedCallback((value) => {
        updateElement(selectedElement.id, { fontSize: value });
    }, 150);

    // Sync local state when selectedElement changes
    useEffect(() => {
        setLocalX(selectedElement.x);
        setLocalY(selectedElement.y);
        setLocalWidth(selectedElement.width);
        setLocalHeight(selectedElement.height);
        setLocalFontSize(selectedElement.fontSize);
    }, [selectedElement.id, selectedElement.x, selectedElement.y, selectedElement.width, selectedElement.height, selectedElement.fontSize]);

    const handleXChange = (e) => {
        const value = +e.target.value;
        setLocalX(value);
        debouncedXChange(value);
    };

    const handleYChange = (e) => {
        const value = +e.target.value;
        setLocalY(value);
        debouncedYChange(value);
    };

    const handleWidthChange = (e) => {
        const value = Math.max(10, Math.min(5000, +e.target.value || 10));
        setLocalWidth(value);
        debouncedWidthChange(value);
    };

    const handleHeightChange = (e) => {
        const value = Math.max(10, Math.min(5000, +e.target.value || 10));
        setLocalHeight(value);
        debouncedHeightChange(value);
    };

    const handleFontSizeChange = (e) => {
        const value = +e.target.value;
        setLocalFontSize(value);
        debouncedFontSizeChange(value);
    };

    return (
        <>
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Element Properties</h2>
            <div className="space-y-4 text-sm">
                {/* Position & Size Card */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Position & Size</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">X:</label>
                            <input
                                type="number"
                                value={Math.round(localX)}
                                onChange={handleXChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Y:</label>
                            <input
                                type="number"
                                value={Math.round(localY)}
                                onChange={handleYChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="elem-width" className="text-xs text-gray-600 dark:text-gray-400">Width:</label>
                            <input
                                id="elem-width"
                                type="number"
                                min="10"
                                max="5000"
                                value={Math.round(localWidth)}
                                onChange={handleWidthChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="elem-height" className="text-xs text-gray-600 dark:text-gray-400">Height:</label>
                        <input
                                id="elem-height"
                                type="number"
                                min="10"
                                max="5000"
                                value={Math.round(localHeight)}
                                onChange={handleHeightChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Rotation Card */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Transform</h3>
                    <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Rotation: {selectedElement.rotation || 0}°</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedElement.rotation || 0}
                            onChange={e => updateElement(selectedElement.id, { rotation: +e.target.value })}
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                {/* Element-Specific Properties */}
                {selectedElement.type === 'text' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Text Properties</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Font Size:</label>
                                <input
                                    type="number"
                                    value={Math.round(localFontSize)}
                                    onChange={handleFontSizeChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Color:</label>
                                <input
                                    type="color"
                                    value={selectedElement.color}
                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}
                {selectedElement.type === 'shape' && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">Shape Properties</h3>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Background Color:</label>
                            <input
                                type="color"
                                value={selectedElement.backgroundColor}
                                onChange={e => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                        </div>
                    </div>
                )}
                {selectedElement.type === 'image' && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Image Properties</h3>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Image URL:</label>
                            <input
                                type="text"
                                value={selectedElement.src}
                                onChange={e => updateElement(selectedElement.id, { src: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 transition-all"
                            />
                        </div>
                    </div>
                )}
                {selectedElement.type === 'iframe' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <h3 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">HTML Embed</h3>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">HTML Code:</label>
                            <textarea
                                value={selectedElement.htmlContent}
                                onChange={e => updateElement(selectedElement.id, { htmlContent: e.target.value })}
                                className="w-full h-48 border border-gray-300 dark:border-gray-600 rounded-lg p-2 font-mono text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <ReactComponentEditor
                        title="Element Component"
                        componentData={selectedElement.reactComponent}
                        onChange={(data) => updateElement(selectedElement.id, { reactComponent: data })}
                    />
                </div>

                <button
                    onClick={deleteElement}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm mt-4"
                >
                    Delete Element
                </button>
            </div>
        </>
    );
};

ElementProperties.propTypes = {
    selectedElement: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'shape', 'image', 'iframe']).isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        rotation: PropTypes.number,
        fontSize: PropTypes.number,
        color: PropTypes.string,
        backgroundColor: PropTypes.string,
        src: PropTypes.string,
        htmlContent: PropTypes.string,
        content: PropTypes.string,
        reactComponent: PropTypes.shape({
            code: PropTypes.string,
            props: PropTypes.string,
            css: PropTypes.string
        })
    }).isRequired,
    updateElement: PropTypes.func.isRequired,
    deleteElement: PropTypes.func.isRequired
};

// Memoize to prevent re-renders when selected element hasn't changed
export default React.memo(ElementProperties);
