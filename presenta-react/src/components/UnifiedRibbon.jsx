import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    TypeIcon,
    SquareIcon,
    ImageIcon,
    CodeIcon,
    TableIcon,
    BarChartIcon,
    VideoIcon,
    AudioIcon,
    AlignLeftIcon,
    AlignCenterHorizontalIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignMiddleIcon,
    AlignBottomIcon,
    DistributeHorizontalIcon,
    DistributeVerticalIcon,
    BringToFrontIcon,
    SendToBackIcon,
    BringForwardIcon,
    SendBackwardIcon,
    GridIcon,
    UndoIcon,
    RedoIcon
} from './Icons';

/**
 * Unified Ribbon Toolbar - Single adaptive toolbar that changes based on context
 * Combines: Presentation settings, element tools, alignment, and formatting
 */
const UnifiedRibbon = ({
    // Presentation controls
    settings,
    updateSettings,
    undo,
    redo,
    canUndo,
    canRedo,

    // Element creation
    addElement,
    selectedShapeType,
    setSelectedShapeType,

    // Selected element (for context tabs)
    selectedElement,
    selectedElementIds,
    updateElement,
    deleteElement,
    copyElement,
    pasteElement,

    // Alignment
    onAlign,
    onDistribute,
    onReorder,
    showGrid,
    onToggleGrid,
    snapToGrid,
    onToggleSnapToGrid,
    previewAnimations,
    onTogglePreviewAnimations,

    // Text editor
    editor
}) => {
    const [activeTab, setActiveTab] = useState('home');

    const hasSelection = selectedElementIds.length > 0;
    const hasMultiple = selectedElementIds.length > 1;
    const hasMultipleForDistribute = selectedElementIds.length >= 3;
    const isText = selectedElement?.type === 'text';
    const isShape = selectedElement?.type === 'shape';
    const isImage = selectedElement?.type === 'image';
    const isComponent = selectedElement?.type === 'component';
    const isChart = selectedElement?.type === 'chart';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-2">
            {/* Tab Headers */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        activeTab === 'home'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    Home
                </button>

                {hasSelection && (
                    <button
                        onClick={() => setActiveTab('format')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'format'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {isText && '📝 Text Format'}
                        {isShape && '🔷 Shape Format'}
                        {isImage && '🖼️ Image Format'}
                        {isComponent && '⚛️ Component Format'}
                        {isChart && '📊 Chart Format'}
                        {!isText && !isShape && !isImage && !isComponent && !isChart && '⚙️ Format'}
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="p-2">
                {activeTab === 'home' && (
                    <HomeTab
                        undo={undo}
                        redo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        addElement={addElement}
                        selectedShapeType={selectedShapeType}
                        setSelectedShapeType={setSelectedShapeType}
                        selectedElementIds={selectedElementIds}
                        onAlign={onAlign}
                        onDistribute={onDistribute}
                        onReorder={onReorder}
                        showGrid={showGrid}
                        onToggleGrid={onToggleGrid}
                        snapToGrid={snapToGrid}
                        onToggleSnapToGrid={onToggleSnapToGrid}
                        previewAnimations={previewAnimations}
                        onTogglePreviewAnimations={onTogglePreviewAnimations}
                        hasSelection={hasSelection}
                        hasMultiple={hasMultiple}
                        hasMultipleForDistribute={hasMultipleForDistribute}
                    />
                )}

                {activeTab === 'format' && hasSelection && (
                    <FormatTab
                        selectedElement={selectedElement}
                        updateElement={updateElement}
                        deleteElement={deleteElement}
                        copyElement={copyElement}
                        pasteElement={pasteElement}
                        editor={editor}
                        isText={isText}
                        isShape={isShape}
                        isImage={isImage}
                        isComponent={isComponent}
                        isChart={isChart}
                    />
                )}
            </div>
        </div>
    );
};

// HOME TAB - Element creation + Alignment
const HomeTab = ({
    undo, redo, canUndo, canRedo,
    addElement, selectedShapeType, setSelectedShapeType,
    selectedElementIds, onAlign, onDistribute, onReorder,
    showGrid, onToggleGrid, snapToGrid, onToggleSnapToGrid,
    previewAnimations, onTogglePreviewAnimations,
    hasSelection, hasMultiple, hasMultipleForDistribute
}) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                    className={`p-1.5 rounded transition-all ${
                        canUndo
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                >
                    <UndoIcon />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                    className={`p-1.5 rounded transition-all ${
                        canRedo
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                >
                    <RedoIcon />
                </button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Insert Elements */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Insert:</span>
                <button
                    onClick={() => addElement('text')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Text"
                >
                    <TypeIcon /> Text
                </button>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => addElement('shape')}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300"
                        title={`Add ${selectedShapeType.charAt(0).toUpperCase() + selectedShapeType.slice(1)}`}
                    >
                        <SquareIcon /> Shape
                    </button>
                    <select
                        value={selectedShapeType}
                        onChange={(e) => setSelectedShapeType(e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        title="Select Shape Type"
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

                <button
                    onClick={() => addElement('image')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Image"
                >
                    <ImageIcon />
                </button>

                <button
                    onClick={() => addElement('component')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300"
                    title="Add React Component"
                >
                    <CodeIcon /> Component
                </button>

                <button
                    onClick={() => addElement('table')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Table"
                >
                    <TableIcon /> Table
                </button>

                <button
                    onClick={() => addElement('code')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-pink-50 dark:hover:bg-pink-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Code Block"
                >
                    <CodeIcon /> Code
                </button>

                <button
                    onClick={() => addElement('chart')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Chart"
                >
                    <BarChartIcon /> Chart
                </button>

                <button
                    onClick={() => addElement('video')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Video"
                >
                    <VideoIcon /> Video
                </button>

                <button
                    onClick={() => addElement('audio')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/30 text-gray-700 dark:text-gray-300"
                    title="Add Audio"
                >
                    <AudioIcon /> Audio
                </button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Alignment */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Align:</span>
                <button onClick={() => onAlign('left')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title={hasMultiple ? "Align Left (to leftmost)" : "Align Left (to canvas)"}><AlignLeftIcon /></button>
                <button onClick={() => onAlign('center')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title={hasMultiple ? "Align Center (average)" : "Align Center (to canvas)"}><AlignCenterHorizontalIcon /></button>
                <button onClick={() => onAlign('right')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title={hasMultiple ? "Align Right (to rightmost)" : "Align Right (to canvas)"}><AlignRightIcon /></button>
                <button onClick={() => onAlign('top')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title={hasMultiple ? "Align Top (to topmost)" : "Align Top (to canvas)"}><AlignTopIcon /></button>
                <button onClick={() => onAlign('middle')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title={hasMultiple ? "Align Middle (average)" : "Align Middle (to canvas)"}><AlignMiddleIcon /></button>
                <button onClick={() => onAlign('bottom')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title={hasMultiple ? "Align Bottom (to bottommost)" : "Align Bottom (to canvas)"}><AlignBottomIcon /></button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Distribute */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Distribute:</span>
                <button onClick={() => onDistribute('horizontal')} disabled={!hasMultipleForDistribute} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Distribute Horizontally (needs 3+ elements)"><DistributeHorizontalIcon /></button>
                <button onClick={() => onDistribute('vertical')} disabled={!hasMultipleForDistribute} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Distribute Vertically (needs 3+ elements)"><DistributeVerticalIcon /></button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Arrange */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Arrange:</span>
                <button onClick={() => onReorder('front')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Bring to Front (top layer)"><BringToFrontIcon /></button>
                <button onClick={() => onReorder('forward')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Bring Forward (up one layer)"><BringForwardIcon /></button>
                <button onClick={() => onReorder('backward')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Send Backward (down one layer)"><SendBackwardIcon /></button>
                <button onClick={() => onReorder('back')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Send to Back (bottom layer)"><SendToBackIcon /></button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Grid */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleGrid}
                    className={`p-1.5 rounded transition-all ${
                        showGrid ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    title="Toggle Grid"
                >
                    <GridIcon />
                </button>
                <label className="flex items-center gap-1 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={onToggleSnapToGrid}
                        className="w-3 h-3"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Snap</span>
                </label>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Animation Preview */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onTogglePreviewAnimations}
                    className={`px-2 py-1.5 rounded transition-all flex items-center gap-1 text-xs font-medium ${
                        previewAnimations ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Preview Animations"
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6 3L13 8L6 13V3z" />
                    </svg>
                    <span>Animations</span>
                </button>
            </div>
        </div>
    );
};

// FORMAT TAB - Element-specific formatting
const FormatTab = ({ selectedElement, updateElement, deleteElement, copyElement, pasteElement, editor, isText, isShape, isImage, isComponent, isChart }) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {isText && editor && <TextFormatTools editor={editor} selectedElement={selectedElement} updateElement={updateElement} />}
            {isShape && <ShapeFormatTools selectedElement={selectedElement} updateElement={updateElement} />}
            {isImage && <ImageFormatTools selectedElement={selectedElement} updateElement={updateElement} />}
            {isComponent && <ComponentFormatTools selectedElement={selectedElement} updateElement={updateElement} />}
            {isChart && <ChartFormatTools selectedElement={selectedElement} updateElement={updateElement} />}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Common Actions */}
            <div className="flex items-center gap-2">
                <button onClick={copyElement} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Copy</button>
                <button onClick={pasteElement} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Paste</button>
                <button onClick={deleteElement} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </div>
        </div>
    );
};

// Text formatting tools
const TextFormatTools = ({ editor, selectedElement, updateElement }) => {
    if (!editor) return null;

    return (
        <>
            {/* Font controls */}
            <div className="flex items-center gap-2">
                <select
                    value={editor.getAttributes('textStyle').fontFamily || 'inherit'}
                    onChange={(e) => {
                        if (e.target.value === 'inherit') {
                            editor.chain().focus().unsetFontFamily().run();
                        } else {
                            editor.chain().focus().setFontFamily(e.target.value).run();
                        }
                    }}
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                >
                    <option value="inherit">Default</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                </select>

                <input
                    type="number"
                    value={selectedElement.fontSize || 24}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                    className="w-16 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                    min="8"
                    max="120"
                />

                <input
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                    className="w-8 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Text styles */}
            <div className="flex items-center gap-1">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded text-xs font-bold ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded text-xs italic ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>I</button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded text-xs underline ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>U</button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`px-2 py-1 rounded text-xs ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>≡</button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`px-2 py-1 rounded text-xs ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>≣</button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`px-2 py-1 rounded text-xs ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>≡</button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Lists */}
            <div className="flex items-center gap-1">
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded text-xs ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>•</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 rounded text-xs ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>1.</button>
            </div>
        </>
    );
};

// Shape formatting tools
const ShapeFormatTools = ({ selectedElement, updateElement }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Fill:</span>
            <input
                type="color"
                value={selectedElement.backgroundColor || '#3b82f6'}
                onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                className="w-8 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />

            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2">Border:</span>
            <input
                type="color"
                value={selectedElement.borderColor || '#000000'}
                onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                className="w-8 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
                type="number"
                value={selectedElement.borderWidth || 2}
                onChange={(e) => updateElement(selectedElement.id, { borderWidth: parseInt(e.target.value) })}
                className="w-16 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                min="0"
                max="20"
                placeholder="Width"
            />
        </div>
    );
};

// Image formatting tools
const ImageFormatTools = ({ selectedElement, updateElement }) => {
    return (
        <div className="text-xs text-gray-600 dark:text-gray-400">
            Image controls (crop, filters coming soon)
        </div>
    );
};

// Component formatting tools
const ComponentFormatTools = ({ selectedElement, updateElement }) => {
    return (
        <div className="flex items-center gap-3">
            {/* Font Size */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Size:
                </label>
                <input
                    type="number"
                    value={selectedElement.fontSize || 48}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 48 })}
                    className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    min="8"
                    max="200"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                Edit component code in the properties panel →
            </span>
        </div>
    );
};

// Chart formatting tools
const ChartFormatTools = ({ selectedElement, updateElement }) => {
    return (
        <div className="flex items-center gap-3">
            {/* Chart Type */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Type:
                </label>
                <select
                    value={selectedElement.chartType || 'bar'}
                    onChange={(e) => updateElement(selectedElement.id, { chartType: e.target.value })}
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    <option value="pie">Pie</option>
                    <option value="doughnut">Doughnut</option>
                    <option value="radar">Radar</option>
                    <option value="polarArea">Polar</option>
                </select>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Legend Toggle */}
            <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                    <input
                        type="checkbox"
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
                        className="w-3 h-3"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Legend</span>
                </label>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Presets:</span>
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
                    title="4 quarters of sales data"
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
                    title="6 months of revenue data"
                >
                    Monthly
                </button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Edit JSON data in the properties panel →
            </span>
        </div>
    );
};

// PropTypes
UnifiedRibbon.propTypes = {
    settings: PropTypes.object,
    updateSettings: PropTypes.func,
    undo: PropTypes.func,
    redo: PropTypes.func,
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool,
    addElement: PropTypes.func.isRequired,
    selectedShapeType: PropTypes.string.isRequired,
    setSelectedShapeType: PropTypes.func.isRequired,
    selectedElement: PropTypes.object,
    selectedElementIds: PropTypes.array.isRequired,
    updateElement: PropTypes.func.isRequired,
    deleteElement: PropTypes.func.isRequired,
    copyElement: PropTypes.func.isRequired,
    pasteElement: PropTypes.func.isRequired,
    onAlign: PropTypes.func.isRequired,
    onDistribute: PropTypes.func.isRequired,
    onReorder: PropTypes.func.isRequired,
    showGrid: PropTypes.bool.isRequired,
    onToggleGrid: PropTypes.func.isRequired,
    snapToGrid: PropTypes.bool.isRequired,
    onToggleSnapToGrid: PropTypes.func.isRequired,
    previewAnimations: PropTypes.bool.isRequired,
    onTogglePreviewAnimations: PropTypes.func.isRequired,
    editor: PropTypes.object
};

HomeTab.propTypes = {
    undo: PropTypes.func,
    redo: PropTypes.func,
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool,
    addElement: PropTypes.func.isRequired,
    selectedShapeType: PropTypes.string.isRequired,
    setSelectedShapeType: PropTypes.func.isRequired,
    selectedElementIds: PropTypes.array.isRequired,
    onAlign: PropTypes.func.isRequired,
    onDistribute: PropTypes.func.isRequired,
    onReorder: PropTypes.func.isRequired,
    showGrid: PropTypes.bool.isRequired,
    onToggleGrid: PropTypes.func.isRequired,
    snapToGrid: PropTypes.bool.isRequired,
    onToggleSnapToGrid: PropTypes.func.isRequired,
    previewAnimations: PropTypes.bool.isRequired,
    onTogglePreviewAnimations: PropTypes.func.isRequired,
    hasSelection: PropTypes.bool.isRequired,
    hasMultiple: PropTypes.bool.isRequired,
    hasMultipleForDistribute: PropTypes.bool.isRequired
};

FormatTab.propTypes = {
    selectedElement: PropTypes.object,
    updateElement: PropTypes.func.isRequired,
    deleteElement: PropTypes.func.isRequired,
    copyElement: PropTypes.func.isRequired,
    pasteElement: PropTypes.func.isRequired,
    editor: PropTypes.object,
    isText: PropTypes.bool.isRequired,
    isShape: PropTypes.bool.isRequired,
    isImage: PropTypes.bool.isRequired,
    isComponent: PropTypes.bool.isRequired,
    isChart: PropTypes.bool.isRequired
};

TextFormatTools.propTypes = {
    editor: PropTypes.object,
    selectedElement: PropTypes.object,
    updateElement: PropTypes.func.isRequired
};

ShapeFormatTools.propTypes = {
    selectedElement: PropTypes.object.isRequired,
    updateElement: PropTypes.func.isRequired
};

ImageFormatTools.propTypes = {
    selectedElement: PropTypes.object.isRequired,
    updateElement: PropTypes.func.isRequired
};

ComponentFormatTools.propTypes = {
    selectedElement: PropTypes.object.isRequired,
    updateElement: PropTypes.func.isRequired
};

ChartFormatTools.propTypes = {
    selectedElement: PropTypes.object.isRequired,
    updateElement: PropTypes.func.isRequired
};

export default React.memo(UnifiedRibbon);
