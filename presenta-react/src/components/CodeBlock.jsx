import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import hljs from 'highlight.js/lib/core';

// Import popular languages
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml); // HTML uses XML highlighter
hljs.registerLanguage('css', css);
hljs.registerLanguage('markdown', markdown);

const CodeBlock = ({ code, language, fontSize, showLineNumbers }) => {
    const codeRef = useRef(null);

    useEffect(() => {
        if (codeRef.current) {
            // Highlight the code
            if (language && language !== 'plaintext') {
                try {
                    const highlighted = hljs.highlight(code, { language }).value;
                    codeRef.current.innerHTML = highlighted;
                } catch (e) {
                    // Fallback to auto-detection or plain text
                    codeRef.current.textContent = code;
                }
            } else {
                codeRef.current.textContent = code;
            }
        }
    }, [code, language]);

    // Split code into lines for line numbers
    const lines = code.split('\n');

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                fontSize: `${fontSize}px`,
                overflow: 'auto',
                padding: '16px',
                boxSizing: 'border-box',
                display: 'flex',
                gap: showLineNumbers ? '12px' : '0'
            }}
        >
            {showLineNumbers && (
                <div
                    style={{
                        color: '#858585',
                        textAlign: 'right',
                        userSelect: 'none',
                        paddingRight: '12px',
                        borderRight: '1px solid #3e3e3e',
                        minWidth: '40px'
                    }}
                >
                    {lines.map((_, i) => (
                        <div key={i} style={{ lineHeight: '1.5' }}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            )}
            <pre
                style={{
                    margin: 0,
                    flex: 1,
                    overflow: 'visible'
                }}
            >
                <code
                    ref={codeRef}
                    className={`language-${language}`}
                    style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: '1.5',
                        display: 'block'
                    }}
                />
            </pre>
        </div>
    );
};

CodeBlock.propTypes = {
    code: PropTypes.string.isRequired,
    language: PropTypes.string,
    fontSize: PropTypes.number,
    showLineNumbers: PropTypes.bool
};

CodeBlock.defaultProps = {
    language: 'javascript',
    fontSize: 14,
    showLineNumbers: true
};

export default CodeBlock;
