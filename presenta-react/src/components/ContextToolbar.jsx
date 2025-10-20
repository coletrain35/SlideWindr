import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Context-sensitive toolbar that shows different tabs based on selected element type
 * Similar to PowerPoint's ribbon interface
 */
const ContextToolbar = ({ selectedElement, editor }) => {
    const [activeTab, setActiveTab] = useState('format');

    if (!selectedElement) return null;

    const isText = selectedElement.type === 'text';
    const isShape = selectedElement.type === 'shape';
    const isImage = selectedElement.type === 'image';

    return (
        <div className="mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            {/* Tab Headers */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                <button
                    onClick={() => setActiveTab('format')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'format'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    {isText && '📝 Text Format'}
                    {isShape && '🔷 Shape Format'}
                    {isImage && '🖼️ Image Format'}
                    {!isText && !isShape && !isImage && '⚙️ Format'}
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-3">
                {activeTab === 'format' && (
                    <div className="flex flex-wrap items-center gap-2">
                        {isText && editor && <TextFormatTools editor={editor} />}
                        {isShape && <ShapeFormatTools />}
                        {isImage && <ImageFormatTools />}
                    </div>
                )}
            </div>
        </div>
    );
};

// Text formatting tools (moved from MenuBar)
const TextFormatTools = ({ editor }) => {
    if (!editor) return null;

    return (
        <>
            {/* Font Family */}
            <select
                value={editor.getAttributes('textStyle').fontFamily || 'inherit'}
                onChange={(e) => {
                    if (e.target.value === 'inherit') {
                        editor.chain().focus().unsetFontFamily().run();
                    } else {
                        editor.chain().focus().setFontFamily(e.target.value).run();
                    }
                }}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
                <option value="inherit">Default</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
            </select>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Bold */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded text-xs font-bold ${
                    editor.isActive('bold')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Bold (Ctrl+B)"
            >
                B
            </button>

            {/* Italic */}
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 rounded text-xs italic ${
                    editor.isActive('italic')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Italic (Ctrl+I)"
            >
                I
            </button>

            {/* Underline */}
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-2 py-1 rounded text-xs underline ${
                    editor.isActive('underline')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Underline (Ctrl+U)"
            >
                U
            </button>

            {/* Strikethrough */}
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-2 py-1 rounded text-xs line-through ${
                    editor.isActive('strike')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Strikethrough"
            >
                S
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Align Left */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'left' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Left"
            >
                ≡
            </button>

            {/* Align Center */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'center' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Center"
            >
                ≣
            </button>

            {/* Align Right */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'right' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Right"
            >
                ≣
            </button>

            {/* Align Justify */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'justify' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Justify"
            >
                ≣
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Bullet List */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('bulletList')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Bullet List"
            >
                •
            </button>

            {/* Numbered List */}
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('orderedList')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Numbered List"
            >
                1.
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Subscript */}
            <button
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('subscript')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Subscript"
            >
                X₂
            </button>

            {/* Superscript */}
            <button
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('superscript')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Superscript"
            >
                X²
            </button>
        </>
    );
};

// Placeholder for shape formatting tools
const ShapeFormatTools = () => {
    return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
            Shape formatting tools will appear here (border, fill, etc.)
        </div>
    );
};

// Placeholder for image formatting tools
const ImageFormatTools = () => {
    return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
            Image formatting tools will appear here (crop, filters, etc.)
        </div>
    );
};

ContextToolbar.propTypes = {
    selectedElement: PropTypes.object,
    editor: PropTypes.object
};

TextFormatTools.propTypes = {
    editor: PropTypes.object
};

export default React.memo(ContextToolbar);
