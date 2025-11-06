import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';
import LiveReactRenderer from './LiveReactRenderer';
import ShapeRenderer from './shapes/ShapeRenderer';
import RichTextEditor from './RichTextEditor';
import TableComponent from './TableComponent';
import CodeBlock from './CodeBlock';
import ChartComponent from './ChartComponent';
import HTMLContentElement from './HTMLContentElement';
import AnimatedElement from './AnimatedElement';
import VideoElement from './VideoElement';
import AudioElement from './AudioElement';
import SmartArtComponent from './SmartArtComponent';
import { CodeIcon, MousePointerClickIcon, StopCircleIcon } from './Icons';

const ElementComponent = ({ element, onMouseDown, onResizeMouseDown, onRotateMouseDown, isSelected, isMultiSelected, updateElement, isInteracting, setInteractingElementId, librariesLoaded, onEditorReady, previewAnimations = false, animationKey = 0 }) => {
    const style = {
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
        // Visual indicator for flow mode elements
        ...(element.layoutMode === 'flow' && {
            outline: isSelected ? '2px dashed rgba(59, 130, 246, 0.5)' : 'none',
        })
    };

    const handleContentChange = (e) => {
        updateElement(element.id, { content: e.target.innerHTML });
    };

    const renderContent = () => {
        switch (element.type) {
            case 'text':
                // Build style object with preserved styles from import
                const textStyle = {
                    fontSize: `${element.fontSize}px`,
                    color: element.color,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    // Apply background and container styles (for imported styled containers)
                    ...(element.backgroundColor && { backgroundColor: element.backgroundColor }),
                    ...(element.borderRadius && { borderRadius: `${element.borderRadius}px` }),
                    ...(element.padding && { padding: element.padding }),
                    // Apply computed styles if available (from reveal.js import)
                    ...(element.computedStyles && {
                        fontFamily: element.computedStyles.fontFamily,
                        fontWeight: element.computedStyles.fontWeight,
                        fontStyle: element.computedStyles.fontStyle,
                        textAlign: element.computedStyles.textAlign,
                        lineHeight: element.computedStyles.lineHeight,
                        textTransform: element.computedStyles.textTransform,
                        letterSpacing: element.computedStyles.letterSpacing,
                        textShadow: element.computedStyles.textShadow,
                        boxShadow: element.computedStyles.boxShadow,
                        border: element.computedStyles.border
                    })
                };

                return isSelected && !element.reactComponent ? (
                    <RichTextEditor
                        content={element.content}
                        onChange={(html) => updateElement(element.id, { content: html })}
                        fontSize={element.fontSize}
                        color={element.color}
                        onEditorReady={onEditorReady}
                    />
                ) : (
                    <div
                        dangerouslySetInnerHTML={{ __html: element.content }}
                        style={textStyle}
                        className={`prose reveal ${element.className || ''}`}
                    />
                );
            case 'shape':
                return <ShapeRenderer element={element} />;
            case 'image':
                return <img src={element.imageData || element.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />;
            case 'iframe':
                if (!element.htmlContent) {
                    return (
                        <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                            <CodeIcon />
                            <p className="text-sm text-gray-600 mt-2 font-semibold">HTML Embed</p>
                            <p className="text-xs text-gray-500 mt-1">Paste your code into the properties panel to see it here.</p>
                        </div>
                    );
                }
                return <iframe srcDoc={element.htmlContent} style={{ width: '100%', height: '100%', border: 'none', pointerEvents: isInteracting ? 'auto' : 'none' }} title="Embedded Content"></iframe>;
            case 'component':
                if (!element.reactComponent?.code || element.reactComponent.code.trim() === '' || element.reactComponent.code.includes('// Paste your React component code here')) {
                    return (
                        <div className="w-full h-full bg-purple-50 dark:bg-purple-900/20 border-2 border-dashed border-purple-400 dark:border-purple-600 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                            <CodeIcon className="w-12 h-12 text-purple-400 dark:text-purple-500 mb-2" />
                            <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold">React Component</p>
                            <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                                Paste your component code in the properties panel →
                            </p>
                        </div>
                    );
                }
                return null; // Component renders via LiveReactRenderer below
            case 'table':
                return <TableComponent element={element} isSelected={isSelected} updateElement={updateElement} setInteractingElementId={setInteractingElementId} />;
            case 'code':
                return <CodeBlock code={element.code} language={element.language} fontSize={element.fontSize} showLineNumbers={element.showLineNumbers} />;
            case 'chart':
                return (
                    <ChartComponent
                        chartType={element.chartType}
                        chartData={element.chartData}
                        chartOptions={element.chartOptions}
                        width={element.width}
                        height={element.height}
                    />
                );
            case 'htmlContent':
                return <HTMLContentElement element={element} />;
            case 'video':
                return <VideoElement element={element} isInteracting={isInteracting} updateElement={updateElement} />;
            case 'audio':
                return <AudioElement element={element} isInteracting={isInteracting} updateElement={updateElement} />;
            case 'smartart':
                return (
                    <SmartArtComponent
                        diagramType={element.diagramType}
                        nodes={element.nodes}
                        style={element.smartArtStyle}
                        width={element.width}
                        height={element.height}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`absolute ${isSelected ? 'z-10' : ''} ${isInteracting ? 'z-20' : ''}`}
            style={style}
            onMouseDown={!isInteracting ? (e) => onMouseDown(e, element.id) : undefined}
            onClick={(e) => e.stopPropagation()}
        >
            <AnimatedElement
                key={`anim-${element.id}-${animationKey}`}
                animation={element.animation}
                isInPresentationMode={previewAnimations}
                shouldAnimate={true}
            >
                {renderContent()}
            </AnimatedElement>
            {/* For component type, render directly (not as overlay) */}
            {element.type === 'component' && Object.values(librariesLoaded).every(Boolean) && element.reactComponent && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ pointerEvents: isInteracting ? 'auto' : 'none', fontSize: `${element.fontSize || 48}px` }}>
                    <ErrorBoundary fallbackMessage="Failed to render component">
                        <LiveReactRenderer
                            id={element.id}
                            component={element.reactComponent}
                        />
                    </ErrorBoundary>
                </div>
            )}
            {/* For other types, render as overlay */}
            {element.type !== 'component' && (
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {Object.values(librariesLoaded).every(Boolean) && element.reactComponent && (
                        <ErrorBoundary fallbackMessage="Failed to render element component">
                            <LiveReactRenderer
                                id={element.id}
                                component={element.reactComponent}
                            />
                        </ErrorBoundary>
                    )}
                </div>
            )}
            {isSelected && !isInteracting && (
                <>
                    <div className={`absolute -inset-1 border-2 ${isMultiSelected ? 'border-purple-500' : 'border-blue-500'} pointer-events-none`}></div>
                    {(element.type === 'iframe' && element.htmlContent) && (
                        <button
                            onClick={() => setInteractingElementId(element.id)}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-blue-600"
                            title="Interact with this content"
                        >
                            <MousePointerClickIcon />
                            Interact
                        </button>
                    )}
                    {element.type === 'component' && element.reactComponent?.code && !element.reactComponent.code.includes('// Paste your React component code here') && (
                        <button
                            onClick={() => setInteractingElementId(element.id)}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-purple-600"
                            title="Interact with this component"
                        >
                            <MousePointerClickIcon />
                            Interact
                        </button>
                    )}
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(handle => (
                        <div
                            key={handle}
                            onMouseDown={e => onResizeMouseDown(e, element.id, handle)}
                            className="absolute bg-white border-2 border-blue-500 w-3 h-3 -m-1.5"
                            style={{
                                cursor: `${handle.includes('top') ? 'n' : 's'}${handle.includes('left') ? 'w' : 'e'}-resize`,
                                top: handle.includes('top') ? '0' : '100%',
                                left: handle.includes('left') ? '0' : '100%',
                            }}
                        ></div>
                    ))}
                    {/* Rotation handle */}
                    <div
                        onMouseDown={e => onRotateMouseDown(e, element.id)}
                        className="absolute bg-green-500 border-2 border-white rounded-full w-4 h-4 -m-2 shadow-lg hover:bg-green-600 hover:scale-110 transition-all cursor-grab active:cursor-grabbing"
                        style={{
                            top: '-24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                        title="Drag to rotate (hold Shift for 15° snaps)"
                    >
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                        >
                            <path d="M8 2 A6 6 0 0 1 14 8" strokeLinecap="round"/>
                            <path d="M8 2 L8 4 M8 2 L6 2" strokeLinecap="round"/>
                        </svg>
                    </div>
                </>
            )}
            {isInteracting && (
                <button
                    onClick={() => setInteractingElementId(null)}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-red-600"
                    title="Stop interacting"
                >
                    <StopCircleIcon />
                    Done
                </button>
            )}
        </div>
    );
};

ElementComponent.propTypes = {
    element: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'shape', 'image', 'iframe', 'component', 'table', 'code']).isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        rotation: PropTypes.number,
        content: PropTypes.string,
        fontSize: PropTypes.number,
        color: PropTypes.string,
        backgroundColor: PropTypes.string,
        src: PropTypes.string,
        htmlContent: PropTypes.string,
        reactComponent: PropTypes.shape({
            code: PropTypes.string,
            props: PropTypes.string,
            css: PropTypes.string
        })
    }).isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onResizeMouseDown: PropTypes.func.isRequired,
    onRotateMouseDown: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    isMultiSelected: PropTypes.bool,
    updateElement: PropTypes.func.isRequired,
    isInteracting: PropTypes.bool.isRequired,
    setInteractingElementId: PropTypes.func.isRequired,
    librariesLoaded: PropTypes.object.isRequired,
    onEditorReady: PropTypes.func
};

// Memoize component to prevent unnecessary re-renders
// Only re-render when element data, selection state, interaction state, or animation preview state changes
export default React.memo(ElementComponent, (prevProps, nextProps) => {
    return (
        prevProps.element.id === nextProps.element.id &&
        prevProps.element.x === nextProps.element.x &&
        prevProps.element.y === nextProps.element.y &&
        prevProps.element.width === nextProps.element.width &&
        prevProps.element.height === nextProps.element.height &&
        prevProps.element.rotation === nextProps.element.rotation &&
        prevProps.element.type === nextProps.element.type &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isInteracting === nextProps.isInteracting &&
        prevProps.previewAnimations === nextProps.previewAnimations &&
        prevProps.animationKey === nextProps.animationKey &&
        JSON.stringify(prevProps.element) === JSON.stringify(nextProps.element)
    );
});
