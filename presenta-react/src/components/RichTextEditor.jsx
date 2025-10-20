import React from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-700/50">
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
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
                <option value="inherit">Default</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
            </select>

            {/* Bold */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded text-xs font-bold ${
                    editor.isActive('bold')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
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
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
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
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
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
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Strikethrough"
            >
                S
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Align Left */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'left' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Align Left"
            >
                ⫷
            </button>

            {/* Align Center */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'center' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Align Center"
            >
                ≡
            </button>

            {/* Align Right */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'right' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Align Right"
            >
                ⫸
            </button>

            {/* Justify */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive({ textAlign: 'justify' })
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Justify"
            >
                ≣
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Bullet List */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('bulletList')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Bullet List"
            >
                •
            </button>

            {/* Ordered List */}
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('orderedList')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Numbered List"
            >
                1.
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Subscript */}
            <button
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={`px-2 py-1 rounded text-xs ${
                    editor.isActive('subscript')
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
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
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}
                title="Superscript"
            >
                X²
            </button>
        </div>
    );
};

MenuBar.propTypes = {
    editor: PropTypes.object
};

const RichTextEditor = ({ content, onChange, fontSize = 24, color = '#000000' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            FontFamily,
            Underline,
            Subscript,
            Superscript,
        ],
        content: content || '<p>Type here...</p>',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none',
            },
        },
    });

    // Update editor content when prop changes (for external updates)
    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '<p>Type here...</p>');
        }
    }, [content, editor]);

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                className="px-3 py-2 min-h-[100px]"
                style={{
                    fontSize: `${fontSize}px`,
                    color: color,
                }}
            />
        </div>
    );
};

RichTextEditor.propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    fontSize: PropTypes.number,
    color: PropTypes.string
};

export default RichTextEditor;
