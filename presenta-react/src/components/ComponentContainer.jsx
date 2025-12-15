/**
 * SECURITY NOTE: This component executes arbitrary user-provided code.
 *
 * Security Considerations:
 * - User code is transpiled with Babel and executed using Function constructor
 * - This allows full JavaScript execution within the browser context
 * - Malicious code could potentially access localStorage, cookies, or make network requests
 *
 * Recommendations for Production:
 * - Implement sandboxed iframe execution for untrusted code
 * - Add Content Security Policy (CSP) headers to limit capabilities
 * - Implement code review/approval workflow for shared presentations
 * - Consider using a Web Worker for code isolation
 * - Add rate limiting for code execution
 *
 * Only use trusted code sources in this component.
 */

import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import * as OGL from 'ogl';
import * as Fiber from '@react-three/fiber';
import * as Drei from '@react-three/drei';
import * as PP from '@react-three/postprocessing';
import * as Postprocessing from 'postprocessing';
import * as Babel from '@babel/standalone';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';

const ComponentContainer = React.memo(({ code, propsString }) => {
    const [Renderable, setRenderable] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!code) {
            setRenderable(null);
            setError(null);
            return;
        }

        const dependencyResolver = (dep) => {
            if (dep === 'react') return React;
            if (dep === 'three') return THREE;
            if (dep === 'ogl') return OGL;
            if (dep === '@react-three/fiber') return Fiber;
            if (dep === '@react-three/drei') return Drei;
            if (dep === '@react-three/postprocessing') return PP;
            if (dep === 'postprocessing') return Postprocessing;
            if (dep === 'gsap') return gsap;
            if (dep === 'framer-motion' || dep === 'motion/react') return { motion, AnimatePresence };
            // Allow relative path imports for CSS by ignoring them
            if (dep.startsWith('./') && dep.endsWith('.css')) return {};
            console.warn(`Unknown dependency: ${dep}`);
            return {};
        };

        try {
            // Check if Babel is available
            console.log('Babel object:', Babel);
            console.log('Babel.transform:', Babel?.transform);
            console.log('Babel keys:', Object.keys(Babel || {}));

            if (!Babel || typeof Babel.transform !== 'function') {
                throw new Error("Babel is not loaded properly. Available keys: " + Object.keys(Babel || {}).join(', '));
            }

            // Transform JSX to JavaScript
            const transformResult = Babel.transform(code, {
                presets: ['react']
            });

            if (!transformResult || !transformResult.code) {
                throw new Error("Babel transform failed to produce code");
            }

            let transformed = transformResult.code;

            console.log('Transformed code before processing:', transformed);

            // Remove any import statements and replace export default
            // Match various export default patterns
            // Special handling for 'ogl' and 'three' imports - convert to destructuring
            transformed = transformed
                .replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]ogl['"];?/g, (match, imports) => {
                    return `const { ${imports} } = OGL;`;
                })
                .replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]three['"];?/g, (match, imports) => {
                    return `const { ${imports} } = THREE;`;
                })
                .replace(/import\s+['"][^'"]+['"];?/g, '')  // Remove CSS/side-effect imports: import './file.css'
                .replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"];?/g, '')  // Remove namespace imports: import * as Name from 'module'
                .replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?/g, '')  // Remove named imports: import { x, y } from 'module'
                .replace(/import\s+\w+\s+from\s+['"][^'"]+['"];?/g, '')  // Remove default imports: import Name from 'module'
                .replace(/import\s+\w+,\s*{[^}]+}\s+from\s+['"][^'"]+['"];?/g, '')  // Remove mixed imports: import Name, { x } from 'module'
                .replace(/export\s+default\s+function/g, 'exports.default = function')
                .replace(/export\s+default\s+/g, 'exports.default = ')
                .replace(/export\s+const\s+/g, 'const ')  // Convert export const to const
                .replace(/export\s+let\s+/g, 'let ')  // Convert export let to let
                .replace(/export\s+var\s+/g, 'var ')  // Convert export var to var
                .replace(/export\s+function\s+/g, 'function ')  // Convert export function to function
                .replace(/export\s*{\s*default\s*}/g, '')  // Remove export { default }
                .replace(/export\s*{[^}]+}/g, ''); // Remove other named exports like export { Foo, Bar }

            // Inject a mock IntersectionObserver that always reports in-view
            // This ensures components that animate on scroll are visible in the editor
            const ioShim = `
            const IntersectionObserver = class {
                constructor(cb) { this.cb = cb; }
                observe(el) { 
                    // Delay slightly to ensure mount
                    setTimeout(() => {
                        this.cb([{ isIntersecting: true, target: el, intersectionRatio: 1 }]);
                    }, 100); 
                }
                unobserve() {}
                disconnect() {}
            };
            `;

            transformed = ioShim + transformed;

            console.log('Transformed code after processing:', transformed);

            const exports = {};
            try {
                // Provide React hooks and common imports as globals
                const moduleFunc = new Function(
                    'exports',
                    'require',
                    'React',
                    'useState',
                    'useEffect',
                    'useLayoutEffect',
                    'useRef',
                    'useMemo',
                    'useCallback',
                    'useContext',
                    'useReducer',
                    'useImperativeHandle',
                    'useDebugValue',
                    'useId',
                    'useDeferredValue',
                    'useTransition',
                    'useInsertionEffect',
                    'useSyncExternalStore',
                    'THREE',
                    'OGL',
                    'gsap',
                    'motion',
                    'AnimatePresence',
                    'Effect',
                    'EffectComposer',
                    'EffectPass',
                    'RenderPass',
                    transformed
                );
                moduleFunc(
                    exports,
                    dependencyResolver,
                    React,
                    React.useState,
                    React.useEffect,
                    React.useLayoutEffect,
                    React.useRef,
                    React.useMemo,
                    React.useCallback,
                    React.useContext,
                    React.useReducer,
                    React.useImperativeHandle,
                    React.useDebugValue,
                    React.useId,
                    React.useDeferredValue,
                    React.useTransition,
                    React.useInsertionEffect,
                    React.useSyncExternalStore,
                    THREE,
                    OGL,
                    gsap,
                    motion,
                    AnimatePresence,
                    Postprocessing.Effect,
                    Postprocessing.EffectComposer,
                    Postprocessing.EffectPass,
                    Postprocessing.RenderPass
                );
            } catch (execError) {
                console.error('Error executing transformed code:', execError);
                throw new Error(`Code execution failed: ${execError.message}`);
            }

            const Component = exports.default;
            if (typeof Component !== 'function' && typeof Component !== 'object') {
                throw new Error("The code must have a default export which is a React component.");
            }

            let props = {};
            if (propsString) {
                try {
                    props = JSON.parse(propsString);
                } catch (parseError) {
                    throw new Error(`Invalid JSON in props: ${parseError.message}`);
                }
            }

            setRenderable(React.createElement(Component, props));
            setError(null);
        } catch (e) {
            setRenderable(null);
            setError(prevError => {
                let errorToReturn = e;

                // Enhance error message if it looks like CSS was pasted into the JS editor
                if (e.message && e.message.includes("Unexpected token")) {
                    const trimmedCode = code.trim();
                    if (trimmedCode.match(/^([.#][\w-]+\s*\{|@media|@import|:root|body\s*\{)/)) {
                        errorToReturn = new Error("It looks like you pasted CSS code into the Component Code editor. Please move styles to the CSS tab to fix this error.");
                    }
                }

                if (prevError && prevError.message === errorToReturn.message) {
                    return prevError;
                }
                return errorToReturn;
            });
        }

        // Cleanup function
        return () => {
            setRenderable(null);
        };
    }, [code, propsString]);

    if (error) {
        return (
            <div className="absolute inset-0 bg-red-100 text-red-700 p-2 text-xs font-mono overflow-auto" title={error.stack}>
                Error: {error.message}
            </div>
        );
    }

    // Convert props to CSS variables and extract container style
    const cssVars = {};
    let containerStyle = {};

    if (propsString) {
        try {
            const props = JSON.parse(propsString);
            Object.entries(props).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    // Convert camelCase to kebab-case for CSS vars
                    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                    cssVars[cssVarName] = value;
                }
            });

            // Extract special containerStyle prop if present
            if (props._containerStyle) {
                containerStyle = props._containerStyle;
            }
        } catch (e) {
            // Ignore parsing errors here as they are handled above
        }
    }

    return Renderable ? (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            ...containerStyle,
            ...cssVars
        }}>
            {Renderable}
        </div>
    ) : null;
});

ComponentContainer.displayName = 'ComponentContainer';

export default ComponentContainer;
