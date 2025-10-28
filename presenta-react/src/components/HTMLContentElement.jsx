import { useEffect, useRef } from 'react';

/**
 * HTMLContentElement - Component for rendering raw HTML content from imported reveal.js slides
 * Preserves all original HTML structure, classes, and inline styles
 * Wraps content in reveal.js-compatible structure for proper CSS application
 */
export default function HTMLContentElement({ element }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && element.htmlContent) {
      // Inject the HTML content
      containerRef.current.innerHTML = element.htmlContent;
    }
  }, [element.htmlContent]);

  return (
    <div
      className="reveal"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        pointerEvents: 'none' // Prevent interaction in editor mode
      }}
    >
      <div
        className="slides"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <section
          ref={containerRef}
          className="present"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  );
}
