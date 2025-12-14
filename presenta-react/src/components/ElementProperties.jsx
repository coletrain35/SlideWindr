import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactComponentEditor from './ReactComponentEditor';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import AudioUploader from './AudioUploader';
import { useDebouncedCallback } from '../utils/debounce';

const ElementProperties = ({ selectedElement, updateElement, deleteElement, copyElement, pasteElement }) => {
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
                    <div className="space-y-2">
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
                        <div className="flex gap-1">
                            <button
                                onClick={() => {
                                    const newRotation = ((selectedElement.rotation || 0) - 90 + 360) % 360;
                                    updateElement(selectedElement.id, { rotation: newRotation });
                                }}
                                className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                                title="Rotate -90°"
                            >
                                ↶ 90°
                            </button>
                            <button
                                onClick={() => {
                                    const newRotation = ((selectedElement.rotation || 0) - 45 + 360) % 360;
                                    updateElement(selectedElement.id, { rotation: newRotation });
                                }}
                                className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                                title="Rotate -45°"
                            >
                                ↶ 45°
                            </button>
                            <button
                                onClick={() => updateElement(selectedElement.id, { rotation: 0 })}
                                className="flex-1 px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                                title="Reset to 0°"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => {
                                    const newRotation = ((selectedElement.rotation || 0) + 45) % 360;
                                    updateElement(selectedElement.id, { rotation: newRotation });
                                }}
                                className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                                title="Rotate +45°"
                            >
                                45° ↷
                            </button>
                            <button
                                onClick={() => {
                                    const newRotation = ((selectedElement.rotation || 0) + 90) % 360;
                                    updateElement(selectedElement.id, { rotation: newRotation });
                                }}
                                className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                                title="Rotate +90°"
                            >
                                90° ↷
                            </button>
                        </div>
                    </div>
                </div>

                {/* Element-Specific Properties */}
                {selectedElement.type === 'text' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Text Properties</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Font Size: {Math.round(localFontSize)}px</label>
                                <input
                                    type="range"
                                    min="8"
                                    max="120"
                                    value={localFontSize}
                                    onChange={handleFontSizeChange}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Text Color:</label>
                                <input
                                    type="color"
                                    value={selectedElement.color}
                                    onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-600">
                                <p>💡 Tip: Select text to access rich formatting options (bold, italic, alignment, lists, etc.)</p>
                            </div>
                        </div>
                    </div>
                )}
                {selectedElement.type === 'shape' && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">Shape Properties</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Shape Type:</label>
                                <select
                                    value={selectedElement.shapeType || 'rectangle'}
                                    onChange={e => {
                                        const newShapeType = e.target.value;
                                        const updates = { shapeType: newShapeType };

                                        // Adjust dimensions when switching to shapes that need specific aspect ratios
                                        const squareShapes = ['circle', 'star', 'pentagon', 'hexagon', 'diamond'];

                                        if (squareShapes.includes(newShapeType)) {
                                            // For shapes that should be square, use the smaller dimension
                                            const size = Math.min(selectedElement.width, selectedElement.height);
                                            updates.width = size;
                                            updates.height = size;
                                        } else if (newShapeType === 'triangle') {
                                            // Triangle looks good with slight height adjustment
                                            const width = selectedElement.width;
                                            updates.height = Math.round(width * 0.87); // ~√3/2 ratio
                                        }
                                        // For rectangle, ellipse, arrow, line - keep existing dimensions

                                        updateElement(selectedElement.id, updates);
                                    }}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 transition-all"
                                >
                                    <option value="rectangle">Rectangle</option>
                                    <option value="circle">Circle</option>
                                    <option value="ellipse">Ellipse</option>
                                    <option value="triangle">Triangle</option>
                                    <option value="diamond">Diamond</option>
                                    <option value="arrow">Arrow</option>
                                    <option value="line">Line</option>
                                    <option value="star">Star</option>
                                    <option value="pentagon">Pentagon</option>
                                    <option value="hexagon">Hexagon</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Fill Color:</label>
                                <input
                                    type="color"
                                    value={selectedElement.backgroundColor || '#3b82f6'}
                                    onChange={e => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Border Width: {selectedElement.borderWidth || 0}px</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={selectedElement.borderWidth || 0}
                                    onChange={e => updateElement(selectedElement.id, { borderWidth: +e.target.value })}
                                    className="w-full accent-purple-500"
                                />
                            </div>
                            {(selectedElement.borderWidth || 0) > 0 && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">Border Color:</label>
                                        <input
                                            type="color"
                                            value={selectedElement.borderColor || '#000000'}
                                            onChange={e => updateElement(selectedElement.id, { borderColor: e.target.value })}
                                            className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 dark:text-gray-400">Border Style:</label>
                                        <select
                                            value={selectedElement.borderStyle || 'solid'}
                                            onChange={e => updateElement(selectedElement.id, { borderStyle: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 transition-all"
                                        >
                                            <option value="solid">Solid</option>
                                            <option value="dashed">Dashed</option>
                                            <option value="dotted">Dotted</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {selectedElement.shapeType === 'rectangle' && (
                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Corner Radius: {selectedElement.borderRadius || 0}px</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedElement.borderRadius || 0}
                                        onChange={e => updateElement(selectedElement.id, { borderRadius: +e.target.value })}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={selectedElement.opacity || 1}
                                    onChange={e => updateElement(selectedElement.id, { opacity: +e.target.value })}
                                    className="w-full accent-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
                {selectedElement.type === 'image' && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Image Properties</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Upload Image:</label>
                                <ImageUploader
                                    currentImage={selectedElement.imageData || selectedElement.src}
                                    onImageUpload={(base64) => updateElement(selectedElement.id, { imageData: base64, src: base64 })}
                                />
                            </div>
                            <div className="flex items-center">
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                                <span className="px-2 text-xs text-gray-500 dark:text-gray-400">OR</span>
                                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Image URL:</label>
                                <input
                                    type="text"
                                    value={selectedElement.imageData ? '' : (selectedElement.src || '')}
                                    onChange={e => updateElement(selectedElement.id, { src: e.target.value, imageData: '' })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 transition-all"
                                />
                            </div>
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
                {selectedElement.type === 'table' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                        <h3 className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wide">Table Properties</h3>
                        <div className="space-y-3">
                            {/* Table Structure */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Table Structure:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-500">Rows: {selectedElement.rows}</label>
                                        <div className="flex gap-1 mt-1">
                                            <button
                                                onClick={() => {
                                                    const newRows = selectedElement.rows + 1;
                                                    const newCellData = [...selectedElement.cellData, Array(selectedElement.columns).fill('New Cell')];
                                                    const newCellStyles = [...selectedElement.cellStyles, Array(selectedElement.columns).fill(null).map(() => ({
                                                        backgroundColor: '#ffffff',
                                                        color: '#000000',
                                                        textAlign: 'left',
                                                        verticalAlign: 'middle',
                                                        fontWeight: 'normal',
                                                        fontSize: 14,
                                                        padding: 8,
                                                        borderColor: '#d1d5db',
                                                        borderWidth: 1
                                                    }))];
                                                    updateElement(selectedElement.id, { rows: newRows, cellData: newCellData, cellStyles: newCellStyles });
                                                }}
                                                className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                                            >
                                                + Row
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedElement.rows > 1) {
                                                        const newRows = selectedElement.rows - 1;
                                                        const newCellData = selectedElement.cellData.slice(0, -1);
                                                        const newCellStyles = selectedElement.cellStyles.slice(0, -1);
                                                        updateElement(selectedElement.id, { rows: newRows, cellData: newCellData, cellStyles: newCellStyles });
                                                    }
                                                }}
                                                className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs disabled:opacity-50"
                                                disabled={selectedElement.rows <= 1}
                                            >
                                                - Row
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-500">Columns: {selectedElement.columns}</label>
                                        <div className="flex gap-1 mt-1">
                                            <button
                                                onClick={() => {
                                                    const newCols = selectedElement.columns + 1;
                                                    const newCellData = selectedElement.cellData.map(row => [...row, 'New Cell']);
                                                    const newCellStyles = selectedElement.cellStyles.map(row => [...row, {
                                                        backgroundColor: '#ffffff',
                                                        color: '#000000',
                                                        textAlign: 'left',
                                                        verticalAlign: 'middle',
                                                        fontWeight: 'normal',
                                                        fontSize: 14,
                                                        padding: 8,
                                                        borderColor: '#d1d5db',
                                                        borderWidth: 1
                                                    }]);
                                                    updateElement(selectedElement.id, { columns: newCols, cellData: newCellData, cellStyles: newCellStyles });
                                                }}
                                                className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                                            >
                                                + Col
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedElement.columns > 1) {
                                                        const newCols = selectedElement.columns - 1;
                                                        const newCellData = selectedElement.cellData.map(row => row.slice(0, -1));
                                                        const newCellStyles = selectedElement.cellStyles.map(row => row.slice(0, -1));
                                                        updateElement(selectedElement.id, { columns: newCols, cellData: newCellData, cellStyles: newCellStyles });
                                                    }
                                                }}
                                                className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs disabled:opacity-50"
                                                disabled={selectedElement.columns <= 1}
                                            >
                                                - Col
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Header Row Style Quick Apply */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Quick Styles:</label>
                                <button
                                    onClick={() => {
                                        // Apply header row style to first row
                                        const newCellStyles = selectedElement.cellStyles.map((row, rowIdx) =>
                                            row.map(cell => ({
                                                ...cell,
                                                backgroundColor: rowIdx === 0 ? '#3b82f6' : '#ffffff',
                                                color: rowIdx === 0 ? '#ffffff' : '#000000',
                                                fontWeight: rowIdx === 0 ? 'bold' : 'normal'
                                            }))
                                        );
                                        updateElement(selectedElement.id, { cellStyles: newCellStyles });
                                    }}
                                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                                >
                                    Apply Header Row Style
                                </button>
                            </div>

                            <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-2 border border-yellow-300 dark:border-yellow-700">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    💡 Tip: Click on a table cell to edit its content. Press Enter or click outside to finish editing. Use Tab to navigate between cells.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Properties */}
                {selectedElement.type === 'chart' && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                        <h3 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">Chart Properties</h3>
                        <div className="space-y-3">
                            {/* Chart Type */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Chart Type:</label>
                                <select
                                    value={selectedElement.chartType || 'bar'}
                                    onChange={(e) => updateElement(selectedElement.id, { chartType: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="bar">Bar Chart</option>
                                    <option value="line">Line Chart</option>
                                    <option value="pie">Pie Chart</option>
                                    <option value="doughnut">Doughnut Chart</option>
                                    <option value="radar">Radar Chart</option>
                                    <option value="polarArea">Polar Area Chart</option>
                                </select>
                            </div>

                            {/* Chart Data Editor */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Data (JSON):</label>
                                <textarea
                                    value={JSON.stringify(selectedElement.chartData, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const data = JSON.parse(e.target.value);
                                            updateElement(selectedElement.id, { chartData: data });
                                        } catch (err) {
                                            // Invalid JSON, don't update
                                        }
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                                    rows={8}
                                    placeholder='{"labels": ["A", "B"], "datasets": [...]}'
                                />
                            </div>

                            {/* Legend Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="chart-legend"
                                    checked={selectedElement.chartOptions?.plugins?.legend?.display !== false}
                                    onChange={(e) => updateElement(selectedElement.id, {
                                        chartOptions: {
                                            ...selectedElement.chartOptions,
                                            plugins: {
                                                ...selectedElement.chartOptions?.plugins,
                                                legend: {
                                                    ...selectedElement.chartOptions?.plugins?.legend,
                                                    display: e.target.checked
                                                }
                                            }
                                        }
                                    })}
                                    className="rounded"
                                />
                                <label htmlFor="chart-legend" className="text-xs text-gray-700 dark:text-gray-300">
                                    Show Legend
                                </label>
                            </div>

                            {/* Quick Data Presets */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Quick Presets:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => updateElement(selectedElement.id, {
                                            chartData: {
                                                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                                                datasets: [{
                                                    label: 'Sales',
                                                    data: [65, 59, 80, 81],
                                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                                    borderColor: 'rgba(54, 162, 235, 1)',
                                                    borderWidth: 2
                                                }]
                                            }
                                        })}
                                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                                    >
                                        Quarterly
                                    </button>
                                    <button
                                        onClick={() => updateElement(selectedElement.id, {
                                            chartData: {
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                                datasets: [{
                                                    label: 'Revenue',
                                                    data: [12, 19, 3, 5, 2, 15],
                                                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                                    borderColor: 'rgba(75, 192, 192, 1)',
                                                    borderWidth: 2
                                                }]
                                            }
                                        })}
                                        className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-xs"
                                    >
                                        Monthly
                                    </button>
                                </div>
                            </div>

                            <div className="bg-indigo-100 dark:bg-indigo-900/40 rounded p-2 border border-indigo-300 dark:border-indigo-700">
                                <p className="text-xs text-indigo-800 dark:text-indigo-200">
                                    💡 Tip: Edit the JSON data above to customize your chart. Use quick presets for common data patterns.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Properties */}
                {selectedElement.type === 'video' && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                        <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">Video Properties</h3>
                        <div className="space-y-3">
                            {/* Video Upload or URL */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Video Source:</label>
                                <div className="space-y-2">
                                    <VideoUploader
                                        onVideoUpload={(data) => updateElement(selectedElement.id, { videoData: data, videoUrl: '' })}
                                        currentVideo={selectedElement.videoData}
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">or</div>
                                    <input
                                        type="text"
                                        value={selectedElement.videoUrl || ''}
                                        onChange={(e) => updateElement(selectedElement.id, { videoUrl: e.target.value, videoData: '' })}
                                        placeholder="https://youtube.com/watch?v=... or direct video URL"
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Upload a file or paste YouTube/Vimeo/direct video URL
                                    </p>
                                </div>
                            </div>

                            {/* Object Fit */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Fit:</label>
                                <select
                                    value={selectedElement.objectFit || 'contain'}
                                    onChange={(e) => updateElement(selectedElement.id, { objectFit: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="contain">Contain (fit inside)</option>
                                    <option value="cover">Cover (fill area)</option>
                                    <option value="fill">Fill (stretch)</option>
                                    <option value="none">None (original size)</option>
                                </select>
                            </div>

                            {/* Playback Options */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="video-autoplay"
                                        checked={selectedElement.autoplay || false}
                                        onChange={(e) => updateElement(selectedElement.id, { autoplay: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="video-autoplay" className="text-xs text-gray-700 dark:text-gray-300">
                                        Autoplay
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="video-loop"
                                        checked={selectedElement.loop || false}
                                        onChange={(e) => updateElement(selectedElement.id, { loop: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="video-loop" className="text-xs text-gray-700 dark:text-gray-300">
                                        Loop
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="video-muted"
                                        checked={selectedElement.muted || false}
                                        onChange={(e) => updateElement(selectedElement.id, { muted: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="video-muted" className="text-xs text-gray-700 dark:text-gray-300">
                                        Muted
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="video-controls"
                                        checked={selectedElement.controls !== false}
                                        onChange={(e) => updateElement(selectedElement.id, { controls: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="video-controls" className="text-xs text-gray-700 dark:text-gray-300">
                                        Show Controls
                                    </label>
                                </div>
                            </div>

                            {/* Border Radius */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                    Border Radius: {selectedElement.borderRadius || 0}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={selectedElement.borderRadius || 0}
                                    onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Audio Properties */}
                {selectedElement.type === 'audio' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <h3 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">Audio Properties</h3>
                        <div className="space-y-3">
                            {/* Audio Upload or URL */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Audio Source:</label>
                                <div className="space-y-2">
                                    <AudioUploader
                                        onAudioUpload={(data) => updateElement(selectedElement.id, { audioData: data, audioUrl: '' })}
                                        currentAudio={selectedElement.audioData}
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">or</div>
                                    <input
                                        type="text"
                                        value={selectedElement.audioUrl || ''}
                                        onChange={(e) => updateElement(selectedElement.id, { audioUrl: e.target.value, audioData: '' })}
                                        placeholder="https://example.com/audio.mp3"
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Upload a file or paste direct audio URL
                                    </p>
                                </div>
                            </div>

                            {/* Playback Options */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="audio-autoplay"
                                        checked={selectedElement.autoplay || false}
                                        onChange={(e) => updateElement(selectedElement.id, { autoplay: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="audio-autoplay" className="text-xs text-gray-700 dark:text-gray-300">
                                        Autoplay
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="audio-loop"
                                        checked={selectedElement.loop || false}
                                        onChange={(e) => updateElement(selectedElement.id, { loop: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="audio-loop" className="text-xs text-gray-700 dark:text-gray-300">
                                        Loop
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="audio-muted"
                                        checked={selectedElement.muted || false}
                                        onChange={(e) => updateElement(selectedElement.id, { muted: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="audio-muted" className="text-xs text-gray-700 dark:text-gray-300">
                                        Muted
                                    </label>
                                </div>
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Background Color:</label>
                                <input
                                    type="color"
                                    value={selectedElement.backgroundColor || '#f3f4f6'}
                                    onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer"
                                />
                            </div>

                            {/* Border Radius */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                    Border Radius: {selectedElement.borderRadius || 8}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={selectedElement.borderRadius || 8}
                                    onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SmartArt Properties */}
                {selectedElement.type === 'smartart' && (
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800">
                        <h3 className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wide">SmartArt Diagram Properties</h3>
                        <div className="space-y-3">
                            {/* Diagram Type */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Diagram Type:</label>
                                <select
                                    value={selectedElement.diagramType || 'process'}
                                    onChange={(e) => updateElement(selectedElement.id, { diagramType: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="process">Process (Horizontal)</option>
                                    <option value="vertical-process">Process (Vertical)</option>
                                    <option value="hierarchy">Hierarchy</option>
                                    <option value="cycle">Cycle</option>
                                    <option value="relationship">Relationship</option>
                                    <option value="matrix">Matrix</option>
                                    <option value="pyramid">Pyramid</option>
                                    <option value="funnel">Funnel</option>
                                </select>
                            </div>

                            {/* Node Editor */}
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">Nodes:</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {(selectedElement.nodes || []).map((node, index) => (
                                        <div key={node.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                            <input
                                                type="text"
                                                value={node.text}
                                                onChange={(e) => {
                                                    const newNodes = [...selectedElement.nodes];
                                                    newNodes[index] = { ...node, text: e.target.value };
                                                    updateElement(selectedElement.id, { nodes: newNodes });
                                                }}
                                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                placeholder="Node text"
                                            />
                                            <input
                                                type="color"
                                                value={node.color || '#3b82f6'}
                                                onChange={(e) => {
                                                    const newNodes = [...selectedElement.nodes];
                                                    newNodes[index] = { ...node, color: e.target.value };
                                                    updateElement(selectedElement.id, { nodes: newNodes });
                                                }}
                                                className="w-8 h-8 rounded cursor-pointer"
                                                title="Node color"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newNodes = selectedElement.nodes.filter((_, i) => i !== index);
                                                    updateElement(selectedElement.id, { nodes: newNodes });
                                                }}
                                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                                title="Remove node"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        const newNode = {
                                            id: crypto.randomUUID(),
                                            text: `Step ${(selectedElement.nodes?.length || 0) + 1}`,
                                            color: '#3b82f6'
                                        };
                                        updateElement(selectedElement.id, {
                                            nodes: [...(selectedElement.nodes || []), newNode]
                                        });
                                    }}
                                    className="w-full mt-2 px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-xs"
                                >
                                    + Add Node
                                </button>
                            </div>

                            {/* Style Settings */}
                            <div className="border-t border-teal-200 dark:border-teal-700 pt-2">
                                <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">Style Settings</h4>

                                {/* Node Shape */}
                                <div className="mb-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Node Shape:</label>
                                    <select
                                        value={selectedElement.smartArtStyle?.shape || 'rounded'}
                                        onChange={(e) => updateElement(selectedElement.id, {
                                            smartArtStyle: { ...selectedElement.smartArtStyle, shape: e.target.value }
                                        })}
                                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="rectangle">Rectangle</option>
                                        <option value="rounded">Rounded Rectangle</option>
                                        <option value="circle">Circle</option>
                                        <option value="hexagon">Hexagon</option>
                                    </select>
                                </div>

                                {/* Text Color */}
                                <div className="mb-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Text Color:</label>
                                    <input
                                        type="color"
                                        value={selectedElement.smartArtStyle?.textColor || '#ffffff'}
                                        onChange={(e) => updateElement(selectedElement.id, {
                                            smartArtStyle: { ...selectedElement.smartArtStyle, textColor: e.target.value }
                                        })}
                                        className="w-full h-8 rounded cursor-pointer"
                                    />
                                </div>

                                {/* Border Settings */}
                                <div className="mb-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Border Color:</label>
                                    <input
                                        type="color"
                                        value={selectedElement.smartArtStyle?.borderColor || '#1e40af'}
                                        onChange={(e) => updateElement(selectedElement.id, {
                                            smartArtStyle: { ...selectedElement.smartArtStyle, borderColor: e.target.value }
                                        })}
                                        className="w-full h-8 rounded cursor-pointer"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                        Border Width: {selectedElement.smartArtStyle?.borderWidth || 2}px
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={selectedElement.smartArtStyle?.borderWidth || 2}
                                        onChange={(e) => updateElement(selectedElement.id, {
                                            smartArtStyle: { ...selectedElement.smartArtStyle, borderWidth: parseInt(e.target.value) }
                                        })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Font Size */}
                                <div className="mb-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                        Font Size: {selectedElement.smartArtStyle?.fontSize || 14}px
                                    </label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="24"
                                        value={selectedElement.smartArtStyle?.fontSize || 14}
                                        onChange={(e) => updateElement(selectedElement.id, {
                                            smartArtStyle: { ...selectedElement.smartArtStyle, fontSize: parseInt(e.target.value) }
                                        })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Connector Settings */}
                                <div className="mb-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="smartart-connectors"
                                        checked={selectedElement.smartArtStyle?.showConnectors !== false}
                                        onChange={(e) => updateElement(selectedElement.id, {
                                            smartArtStyle: { ...selectedElement.smartArtStyle, showConnectors: e.target.checked }
                                        })}
                                        className="rounded"
                                    />
                                    <label htmlFor="smartart-connectors" className="text-xs text-gray-700 dark:text-gray-300">
                                        Show Connectors
                                    </label>
                                </div>

                                {selectedElement.smartArtStyle?.showConnectors !== false && (
                                    <>
                                        <div className="mb-2">
                                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Connector Color:</label>
                                            <input
                                                type="color"
                                                value={selectedElement.smartArtStyle?.connectorColor || '#64748b'}
                                                onChange={(e) => updateElement(selectedElement.id, {
                                                    smartArtStyle: { ...selectedElement.smartArtStyle, connectorColor: e.target.value }
                                                })}
                                                className="w-full h-8 rounded cursor-pointer"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Connector Style:</label>
                                            <select
                                                value={selectedElement.smartArtStyle?.connectorStyle || 'solid'}
                                                onChange={(e) => updateElement(selectedElement.id, {
                                                    smartArtStyle: { ...selectedElement.smartArtStyle, connectorStyle: e.target.value }
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="solid">Solid</option>
                                                <option value="dashed">Dashed</option>
                                                <option value="dotted">Dotted</option>
                                            </select>
                                        </div>

                                        <div className="mb-2">
                                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Arrow Type:</label>
                                            <select
                                                value={selectedElement.smartArtStyle?.arrowType || 'arrow'}
                                                onChange={(e) => updateElement(selectedElement.id, {
                                                    smartArtStyle: { ...selectedElement.smartArtStyle, arrowType: e.target.value }
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="arrow">Arrow</option>
                                                <option value="none">None</option>
                                                <option value="line">Line</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-teal-100 dark:bg-teal-900/40 rounded p-2 border border-teal-300 dark:border-teal-700">
                                <p className="text-xs text-teal-800 dark:text-teal-200">
                                    💡 Tip: Add or remove nodes using the buttons above. Customize colors and styles to match your presentation theme.
                                </p>
                            </div>
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

                {/* Animation Properties Card */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">Animation</h3>
                    <div className="space-y-3">
                        {/* Animation Type */}
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Entrance Effect:</label>
                            <select
                                value={selectedElement.animation?.type || 'none'}
                                onChange={(e) => updateElement(selectedElement.id, {
                                    animation: {
                                        ...(selectedElement.animation || {}),
                                        type: e.target.value
                                    }
                                })}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="none">No Animation</option>
                                <optgroup label="Fade">
                                    <option value="fadeIn">Fade In</option>
                                </optgroup>
                                <optgroup label="Slide">
                                    <option value="slideInLeft">Slide In from Left</option>
                                    <option value="slideInRight">Slide In from Right</option>
                                    <option value="slideInUp">Slide In from Bottom</option>
                                    <option value="slideInDown">Slide In from Top</option>
                                </optgroup>
                                <optgroup label="Zoom">
                                    <option value="zoomIn">Zoom In</option>
                                    <option value="bounceIn">Bounce In</option>
                                </optgroup>
                                <optgroup label="Rotate">
                                    <option value="rotateIn">Rotate In</option>
                                    <option value="flipIn">Flip In</option>
                                </optgroup>
                                <optgroup label="Emphasis">
                                    <option value="pulse">Pulse (Loop)</option>
                                    <option value="shake">Shake</option>
                                    <option value="swing">Swing</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                Duration: {selectedElement.animation?.duration || 0.5}s
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={selectedElement.animation?.duration || 0.5}
                                onChange={(e) => updateElement(selectedElement.id, {
                                    animation: {
                                        ...(selectedElement.animation || {}),
                                        duration: parseFloat(e.target.value)
                                    }
                                })}
                                className="w-full"
                            />
                        </div>

                        {/* Delay */}
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                Delay: {selectedElement.animation?.delay || 0}s
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                value={selectedElement.animation?.delay || 0}
                                onChange={(e) => updateElement(selectedElement.id, {
                                    animation: {
                                        ...(selectedElement.animation || {}),
                                        delay: parseFloat(e.target.value)
                                    }
                                })}
                                className="w-full"
                            />
                        </div>

                        {/* Easing */}
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Easing:</label>
                            <select
                                value={selectedElement.animation?.easing || 'easeOut'}
                                onChange={(e) => updateElement(selectedElement.id, {
                                    animation: {
                                        ...(selectedElement.animation || {}),
                                        easing: e.target.value
                                    }
                                })}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="linear">Linear</option>
                                <option value="easeIn">Ease In</option>
                                <option value="easeOut">Ease Out</option>
                                <option value="easeInOut">Ease In-Out</option>
                                <option value="spring">Spring</option>
                            </select>
                        </div>

                        {/* Fragment Order */}
                        <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                Reveal Order:
                                <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">
                                    {selectedElement.fragmentOrder === 0
                                        ? 'Always Visible'
                                        : `Click ${selectedElement.fragmentOrder || 0}`}
                                </span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                value={selectedElement.fragmentOrder || 0}
                                onChange={(e) => updateElement(selectedElement.id, {
                                    fragmentOrder: parseInt(e.target.value, 10)
                                })}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                0 = Always visible, 1+ = Appears on click in presentation mode
                            </p>
                        </div>

                        {(selectedElement.animation?.type && selectedElement.animation.type !== 'none') && (
                            <div className="bg-purple-100 dark:bg-purple-900/40 rounded p-2 border border-purple-300 dark:border-purple-700">
                                <p className="text-xs text-purple-800 dark:text-purple-200">
                                    🎬 Animation will play when exporting to HTML presentation
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={copyElement}
                            title="Copy (Ctrl+C)"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                        >
                            Copy
                        </button>
                        <button
                            onClick={pasteElement}
                            title="Paste (Ctrl+V)"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                        >
                            Paste
                        </button>
                    </div>
                    <button
                        onClick={deleteElement}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                    >
                        Delete Element
                    </button>
                </div>
            </div>
        </>
    );
};

ElementProperties.propTypes = {
    selectedElement: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'shape', 'image', 'iframe', 'table', 'component']).isRequired,
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
    deleteElement: PropTypes.func.isRequired,
    copyElement: PropTypes.func.isRequired,
    pasteElement: PropTypes.func.isRequired
};

// Memoize to prevent re-renders when selected element hasn't changed
export default React.memo(ElementProperties);
