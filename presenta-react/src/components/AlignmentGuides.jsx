import React from 'react';
import PropTypes from 'prop-types';

/**
 * Alignment guides and grid overlay component
 * Shows smart guides when dragging elements and optional grid
 */
const AlignmentGuides = ({ guides, showGrid, gridSize = 20, canvasWidth = 960, canvasHeight = 540 }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Grid Overlay */}
            {showGrid && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ width: canvasWidth, height: canvasHeight }}
                >
                    <defs>
                        <pattern
                            id="grid-pattern"
                            width={gridSize}
                            height={gridSize}
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-gray-300 dark:text-gray-600"
                                opacity="0.3"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            )}

            {/* Smart Alignment Guides */}
            {guides && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ width: canvasWidth, height: canvasHeight }}
                >
                    {/* Vertical guides */}
                    {guides.vertical && guides.vertical.map((guide, index) => (
                        <line
                            key={`v-${index}`}
                            x1={guide.x}
                            y1="0"
                            x2={guide.x}
                            y2={canvasHeight}
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            className="animate-pulse"
                        />
                    ))}

                    {/* Horizontal guides */}
                    {guides.horizontal && guides.horizontal.map((guide, index) => (
                        <line
                            key={`h-${index}`}
                            x1="0"
                            y1={guide.y}
                            x2={canvasWidth}
                            y2={guide.y}
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            className="animate-pulse"
                        />
                    ))}
                </svg>
            )}
        </div>
    );
};

AlignmentGuides.propTypes = {
    guides: PropTypes.shape({
        vertical: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number.isRequired,
            type: PropTypes.string
        })),
        horizontal: PropTypes.arrayOf(PropTypes.shape({
            y: PropTypes.number.isRequired,
            type: PropTypes.string
        })),
        snapX: PropTypes.number,
        snapY: PropTypes.number
    }),
    showGrid: PropTypes.bool,
    gridSize: PropTypes.number,
    canvasWidth: PropTypes.number,
    canvasHeight: PropTypes.number
};

export default React.memo(AlignmentGuides);
