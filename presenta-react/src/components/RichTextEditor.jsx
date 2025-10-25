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
import { Highlight } from '@tiptap/extension-highlight';

const RichTextEditor = ({ content, onChange, fontSize = 24, color = '#000000', onEditorReady }) => {
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
            Highlight.configure({
                multicolor: true,
            }),
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

    // Notify parent when editor is ready
    React.useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // Update editor content when prop changes (for external updates)
    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '<p>Type here...</p>');
        }
    }, [content, editor]);

    return (
        <EditorContent
            editor={editor}
            className="w-full h-full outline-none"
            style={{
                fontSize: `${fontSize}px`,
                color: color,
            }}
        />
    );
};

RichTextEditor.propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    fontSize: PropTypes.number,
    color: PropTypes.string,
    onEditorReady: PropTypes.func
};

export default RichTextEditor;
