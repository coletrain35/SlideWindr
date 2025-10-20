import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    TypeIcon,
    SquareIcon,
    ImageIcon,
    CodeIcon,
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
                        {!isText && !isShape && !isImage && !isComponent && '⚙️ Format'}
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
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Alignment */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Align:</span>
                <button onClick={() => onAlign('left')} disabled={!hasMultiple} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Align Left"><AlignLeftIcon /></button>
                <button onClick={() => onAlign('center')} disabled={!hasMultiple} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Align Center"><AlignCenterHorizontalIcon /></button>
                <button onClick={() => onAlign('right')} disabled={!hasMultiple} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Align Right"><AlignRightIcon /></button>
                <button onClick={() => onAlign('top')} disabled={!hasMultiple} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Align Top"><AlignTopIcon /></button>
                <button onClick={() => onAlign('middle')} disabled={!hasMultiple} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Align Middle"><AlignMiddleIcon /></button>
                <button onClick={() => onAlign('bottom')} disabled={!hasMultiple} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Align Bottom"><AlignBottomIcon /></button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Arrange */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Arrange:</span>
                <button onClick={() => onReorder('front')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Bring to Front"><BringToFrontIcon /></button>
                <button onClick={() => onReorder('back')} disabled={!hasSelection} className="p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Send to Back"><SendToBackIcon /></button>
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
        </div>
    );
};

// FORMAT TAB - Element-specific formatting
const FormatTab = ({ selectedElement, updateElement, deleteElement, copyElement, pasteElement, editor, isText, isShape, isImage, isComponent }) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {isText && editor && <TextFormatTools editor={editor} selectedElement={selectedElement} updateElement={updateElement} />}
            {isShape && <ShapeFormatTools selectedElement={selectedElement} updateElement={updateElement} />}
            {isImage && <ImageFormatTools selectedElement={selectedElement} updateElement={updateElement} />}
            {isComponent && <ComponentFormatTools selectedElement={selectedElement} updateElement={updateElement} />}

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
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                React Component - Edit code in the properties panel →
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
    isImage: PropTypes.bool.isRequired
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

export default React.memo(UnifiedRibbon);
