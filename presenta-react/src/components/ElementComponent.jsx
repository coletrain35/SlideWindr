import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';
import LiveReactRenderer from './LiveReactRenderer';
import { CodeIcon, MousePointerClickIcon, StopCircleIcon } from './Icons';

const ElementComponent = ({ element, onMouseDown, onResizeMouseDown, isSelected, updateElement, isInteracting, setInteractingElementId, librariesLoaded }) => {
    const style = {
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
    };

    const handleContentChange = (e) => {
        updateElement(element.id, { content: e.target.innerHTML });
    };

    const renderContent = () => {
        switch (element.type) {
            case 'text':
                return (
                    <div
                        contentEditable={isSelected && !element.reactComponent}
                        suppressContentEditableWarning={true}
                        onBlur={handleContentChange}
                        dangerouslySetInnerHTML={{ __html: element.content }}
                        style={{ fontSize: `${element.fontSize}px`, color: element.color, width: '100%', height: '100%', outline: 'none' }}
                        className="prose"
                    />
                );
            case 'shape':
                return <div style={{ width: '100%', height: '100%', backgroundColor: element.backgroundColor }}></div>;
            case 'image':
                return <img src={element.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />;
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
            {renderContent()}
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
            {isSelected && !isInteracting && (
                <>
                    <div className="absolute -inset-1 border-2 border-blue-500 pointer-events-none"></div>
                    {element.type === 'iframe' && (element.htmlContent &&
                        <button
                            onClick={() => setInteractingElementId(element.id)}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-blue-600"
                            title="Interact with this content"
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
        type: PropTypes.oneOf(['text', 'shape', 'image', 'iframe']).isRequired,
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
    isSelected: PropTypes.bool.isRequired,
    updateElement: PropTypes.func.isRequired,
    isInteracting: PropTypes.bool.isRequired,
    setInteractingElementId: PropTypes.func.isRequired,
    librariesLoaded: PropTypes.object.isRequired
};

// Memoize component to prevent unnecessary re-renders
// Only re-render when element data, selection state, or interaction state changes
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
        JSON.stringify(prevProps.element) === JSON.stringify(nextProps.element)
    );
});
