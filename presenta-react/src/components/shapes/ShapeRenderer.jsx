import React from 'react';
import PropTypes from 'prop-types';

const ShapeRenderer = ({ element }) => {
    const {
        shapeType = 'rectangle',
        backgroundColor = '#3b82f6',
        borderColor = '#000000',
        borderWidth = 0,
        borderStyle = 'solid',
        borderRadius = 0,
        opacity = 1
    } = element;

    const baseStyle = {
        width: '100%',
        height: '100%',
        backgroundColor,
        border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
        opacity,
        pointerEvents: 'none', // Allow parent to handle mouse events
    };

    // Render different shapes based on shapeType
    switch (shapeType) {
        case 'rectangle':
            return <div style={{ ...baseStyle, borderRadius: `${borderRadius}px` }} />;

        case 'circle':
            return <div style={{ ...baseStyle, borderRadius: '50%' }} />;

        case 'ellipse':
            return <div style={{ ...baseStyle, borderRadius: '50%' }} />;

        case 'triangle':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <polygon
                        points="50,10 90,90 10,90"
                        fill={backgroundColor}
                        stroke={borderWidth > 0 ? borderColor : 'none'}
                        strokeWidth={borderWidth}
                        opacity={opacity}
                    />
                </svg>
            );

        case 'arrow':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <path
                        d="M 10,25 L 70,25 L 70,10 L 90,25 L 70,40 L 70,25"
                        fill={backgroundColor}
                        stroke={borderWidth > 0 ? borderColor : 'none'}
                        strokeWidth={borderWidth}
                        strokeLinejoin="miter"
                        opacity={opacity}
                    />
                </svg>
            );

        case 'line':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <line
                        x1="0"
                        y1="100"
                        x2="100"
                        y2="0"
                        stroke={borderColor || backgroundColor}
                        strokeWidth={Math.max(borderWidth, 2)}
                        opacity={opacity}
                    />
                </svg>
            );

        case 'star':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <polygon
                        points="50,10 61,35 88,35 67,52 77,77 50,60 23,77 33,52 12,35 39,35"
                        fill={backgroundColor}
                        stroke={borderWidth > 0 ? borderColor : 'none'}
                        strokeWidth={borderWidth}
                        opacity={opacity}
                    />
                </svg>
            );

        case 'pentagon':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <polygon
                        points="50,10 90,40 75,90 25,90 10,40"
                        fill={backgroundColor}
                        stroke={borderWidth > 0 ? borderColor : 'none'}
                        strokeWidth={borderWidth}
                        opacity={opacity}
                    />
                </svg>
            );

        case 'hexagon':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <polygon
                        points="25,10 75,10 100,50 75,90 25,90 0,50"
                        fill={backgroundColor}
                        stroke={borderWidth > 0 ? borderColor : 'none'}
                        strokeWidth={borderWidth}
                        opacity={opacity}
                    />
                </svg>
            );

        case 'diamond':
            return (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                    <polygon
                        points="50,10 90,50 50,90 10,50"
                        fill={backgroundColor}
                        stroke={borderWidth > 0 ? borderColor : 'none'}
                        strokeWidth={borderWidth}
                        opacity={opacity}
                    />
                </svg>
            );

        default:
            return <div style={baseStyle} />;
    }
};

ShapeRenderer.propTypes = {
    element: PropTypes.shape({
        shapeType: PropTypes.string,
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number,
        borderStyle: PropTypes.string,
        borderRadius: PropTypes.number,
        opacity: PropTypes.number
    }).isRequired
};

export default ShapeRenderer;
