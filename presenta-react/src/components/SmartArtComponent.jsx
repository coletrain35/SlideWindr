import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * SmartArt Component for creating professional diagrams
 * Supports various diagram types: process, hierarchy, cycle, relationship, matrix, pyramid
 */
const SmartArtComponent = ({ diagramType, nodes, style, width, height }) => {
    // Default nodes if none provided
    const defaultNodes = [
        { id: '1', text: 'Step 1', color: '#3b82f6' },
        { id: '2', text: 'Step 2', color: '#8b5cf6' },
        { id: '3', text: 'Step 3', color: '#ec4899' }
    ];

    const diagramNodes = nodes && nodes.length > 0 ? nodes : defaultNodes;

    // Default style configuration
    const defaultStyle = {
        nodeColor: '#3b82f6',
        textColor: '#ffffff',
        borderColor: '#1e40af',
        borderWidth: 2,
        fontSize: 14,
        fontWeight: 'normal',
        shape: 'rectangle', // rectangle, rounded, circle, hexagon
        showConnectors: true,
        connectorColor: '#64748b',
        connectorWidth: 2,
        connectorStyle: 'solid', // solid, dashed, dotted
        arrowType: 'arrow' // arrow, none, line
    };

    const finalStyle = { ...defaultStyle, ...(style || {}) };

    // Calculate layout based on diagram type
    const layout = useMemo(() => {
        switch (diagramType) {
            case 'process':
                return calculateProcessLayout(diagramNodes, width, height, finalStyle);
            case 'hierarchy':
                return calculateHierarchyLayout(diagramNodes, width, height, finalStyle);
            case 'cycle':
                return calculateCycleLayout(diagramNodes, width, height, finalStyle);
            case 'relationship':
                return calculateRelationshipLayout(diagramNodes, width, height, finalStyle);
            case 'matrix':
                return calculateMatrixLayout(diagramNodes, width, height, finalStyle);
            case 'pyramid':
                return calculatePyramidLayout(diagramNodes, width, height, finalStyle);
            case 'vertical-process':
                return calculateVerticalProcessLayout(diagramNodes, width, height, finalStyle);
            case 'funnel':
                return calculateFunnelLayout(diagramNodes, width, height, finalStyle);
            default:
                return calculateProcessLayout(diagramNodes, width, height, finalStyle);
        }
    }, [diagramType, diagramNodes, width, height, finalStyle]);

    // Render connector line between two points
    const renderConnector = (x1, y1, x2, y2, showArrow = true) => {
        const { connectorColor, connectorWidth, connectorStyle, arrowType } = finalStyle;

        // Calculate arrow points
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 10;
        const arrowWidth = 6;

        const arrowPoints = showArrow && arrowType === 'arrow' ? [
            { x: x2, y: y2 },
            { x: x2 - arrowLength * Math.cos(angle - Math.PI / 6), y: y2 - arrowLength * Math.sin(angle - Math.PI / 6) },
            { x: x2 - arrowLength * Math.cos(angle + Math.PI / 6), y: y2 - arrowLength * Math.sin(angle + Math.PI / 6) }
        ] : [];

        return (
            <g key={`connector-${x1}-${y1}-${x2}-${y2}`}>
                <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={connectorColor}
                    strokeWidth={connectorWidth}
                    strokeDasharray={connectorStyle === 'dashed' ? '5,5' : connectorStyle === 'dotted' ? '2,2' : '0'}
                    markerEnd={showArrow && arrowType === 'arrow' ? 'url(#arrowhead)' : ''}
                />
            </g>
        );
    };

    // Render a single node
    const renderNode = (node, x, y, nodeWidth, nodeHeight, index) => {
        const { nodeColor, textColor, borderColor, borderWidth, fontSize, fontWeight, shape } = finalStyle;
        const color = node.color || nodeColor;

        let shapeElement;
        const rx = shape === 'rounded' ? 10 : 0;

        switch (shape) {
            case 'circle':
            case 'rounded':
            case 'rectangle':
            default:
                shapeElement = (
                    <rect
                        x={x}
                        y={y}
                        width={nodeWidth}
                        height={nodeHeight}
                        fill={color}
                        stroke={borderColor}
                        strokeWidth={borderWidth}
                        rx={shape === 'circle' ? nodeHeight / 2 : rx}
                    />
                );
                break;
            case 'hexagon':
                const hexPoints = calculateHexagonPoints(x, y, nodeWidth, nodeHeight);
                shapeElement = (
                    <polygon
                        points={hexPoints}
                        fill={color}
                        stroke={borderColor}
                        strokeWidth={borderWidth}
                    />
                );
                break;
        }

        return (
            <g key={`node-${node.id}-${index}`}>
                {shapeElement}
                <text
                    x={x + nodeWidth / 2}
                    y={y + nodeHeight / 2}
                    fill={textColor}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                    {truncateText(node.text, nodeWidth, fontSize)}
                </text>
            </g>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                xmlns="http://www.w3.org/2000/svg"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <polygon
                            points="0 0, 10 3, 0 6"
                            fill={finalStyle.connectorColor}
                        />
                    </marker>
                </defs>

                {/* Render connectors first (below nodes) */}
                {finalStyle.showConnectors && layout.connectors && layout.connectors.map((conn, idx) =>
                    renderConnector(conn.x1, conn.y1, conn.x2, conn.y2, conn.showArrow !== false)
                )}

                {/* Render nodes */}
                {layout.nodes.map((node, idx) =>
                    renderNode(node, node.x, node.y, node.width, node.height, idx)
                )}
            </svg>
        </div>
    );
};

// ===== LAYOUT ALGORITHMS =====

// Horizontal process flow (left to right)
function calculateProcessLayout(nodes, width, height, style) {
    const nodeWidth = Math.min(120, (width - 40) / nodes.length - 20);
    const nodeHeight = 60;
    const spacing = (width - nodeWidth * nodes.length) / (nodes.length + 1);
    const startY = (height - nodeHeight) / 2;

    const layoutNodes = nodes.map((node, idx) => ({
        ...node,
        x: spacing + idx * (nodeWidth + spacing),
        y: startY,
        width: nodeWidth,
        height: nodeHeight
    }));

    const connectors = [];
    for (let i = 0; i < layoutNodes.length - 1; i++) {
        connectors.push({
            x1: layoutNodes[i].x + nodeWidth,
            y1: layoutNodes[i].y + nodeHeight / 2,
            x2: layoutNodes[i + 1].x,
            y2: layoutNodes[i + 1].y + nodeHeight / 2,
            showArrow: true
        });
    }

    return { nodes: layoutNodes, connectors };
}

// Vertical process flow (top to bottom)
function calculateVerticalProcessLayout(nodes, width, height, style) {
    const nodeWidth = 120;
    const nodeHeight = Math.min(60, (height - 40) / nodes.length - 20);
    const spacing = (height - nodeHeight * nodes.length) / (nodes.length + 1);
    const startX = (width - nodeWidth) / 2;

    const layoutNodes = nodes.map((node, idx) => ({
        ...node,
        x: startX,
        y: spacing + idx * (nodeHeight + spacing),
        width: nodeWidth,
        height: nodeHeight
    }));

    const connectors = [];
    for (let i = 0; i < layoutNodes.length - 1; i++) {
        connectors.push({
            x1: layoutNodes[i].x + nodeWidth / 2,
            y1: layoutNodes[i].y + nodeHeight,
            x2: layoutNodes[i + 1].x + nodeWidth / 2,
            y2: layoutNodes[i + 1].y,
            showArrow: true
        });
    }

    return { nodes: layoutNodes, connectors };
}

// Hierarchy tree layout
function calculateHierarchyLayout(nodes, width, height, style) {
    const nodeWidth = 100;
    const nodeHeight = 50;
    const levelHeight = height / 4;

    // Simple 3-level hierarchy: 1 root, rest distributed in 2 levels
    const layoutNodes = [];
    const connectors = [];

    if (nodes.length === 0) return { nodes: [], connectors: [] };

    // Root node
    const rootNode = {
        ...nodes[0],
        x: (width - nodeWidth) / 2,
        y: 20,
        width: nodeWidth,
        height: nodeHeight
    };
    layoutNodes.push(rootNode);

    // Second level nodes
    const secondLevelCount = Math.min(3, nodes.length - 1);
    const secondLevelSpacing = width / (secondLevelCount + 1);

    for (let i = 0; i < secondLevelCount && i + 1 < nodes.length; i++) {
        const node = {
            ...nodes[i + 1],
            x: secondLevelSpacing * (i + 1) - nodeWidth / 2,
            y: levelHeight,
            width: nodeWidth,
            height: nodeHeight
        };
        layoutNodes.push(node);

        // Connect to root
        connectors.push({
            x1: rootNode.x + nodeWidth / 2,
            y1: rootNode.y + nodeHeight,
            x2: node.x + nodeWidth / 2,
            y2: node.y,
            showArrow: true
        });
    }

    // Third level nodes if any
    const thirdLevelStart = secondLevelCount + 1;
    const thirdLevelCount = nodes.length - thirdLevelStart;
    if (thirdLevelCount > 0) {
        const thirdLevelSpacing = width / (thirdLevelCount + 1);
        for (let i = 0; i < thirdLevelCount; i++) {
            const node = {
                ...nodes[thirdLevelStart + i],
                x: thirdLevelSpacing * (i + 1) - nodeWidth / 2,
                y: levelHeight * 2,
                width: nodeWidth,
                height: nodeHeight
            };
            layoutNodes.push(node);

            // Connect to nearest second level node
            const parentIdx = Math.floor(i * secondLevelCount / thirdLevelCount) + 1;
            if (layoutNodes[parentIdx]) {
                connectors.push({
                    x1: layoutNodes[parentIdx].x + nodeWidth / 2,
                    y1: layoutNodes[parentIdx].y + nodeHeight,
                    x2: node.x + nodeWidth / 2,
                    y2: node.y,
                    showArrow: true
                });
            }
        }
    }

    return { nodes: layoutNodes, connectors };
}

// Circular cycle layout
function calculateCycleLayout(nodes, width, height, style) {
    const nodeWidth = 80;
    const nodeHeight = 60;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const angleStep = (2 * Math.PI) / nodes.length;
    const startAngle = -Math.PI / 2; // Start at top

    const layoutNodes = nodes.map((node, idx) => {
        const angle = startAngle + idx * angleStep;
        return {
            ...node,
            x: centerX + radius * Math.cos(angle) - nodeWidth / 2,
            y: centerY + radius * Math.sin(angle) - nodeHeight / 2,
            width: nodeWidth,
            height: nodeHeight
        };
    });

    const connectors = [];
    for (let i = 0; i < layoutNodes.length; i++) {
        const current = layoutNodes[i];
        const next = layoutNodes[(i + 1) % layoutNodes.length];
        connectors.push({
            x1: current.x + nodeWidth / 2,
            y1: current.y + nodeHeight / 2,
            x2: next.x + nodeWidth / 2,
            y2: next.y + nodeHeight / 2,
            showArrow: true
        });
    }

    return { nodes: layoutNodes, connectors };
}

// Relationship/Venn diagram layout
function calculateRelationshipLayout(nodes, width, height, style) {
    const nodeWidth = 100;
    const nodeHeight = 80;

    // Arrange in a connected pattern
    const layoutNodes = [];
    const centerX = width / 2;
    const centerY = height / 2;

    if (nodes.length === 0) return { nodes: [], connectors: [] };

    if (nodes.length === 1) {
        layoutNodes.push({
            ...nodes[0],
            x: centerX - nodeWidth / 2,
            y: centerY - nodeHeight / 2,
            width: nodeWidth,
            height: nodeHeight
        });
    } else if (nodes.length === 2) {
        const spacing = 30;
        layoutNodes.push({
            ...nodes[0],
            x: centerX - nodeWidth - spacing / 2,
            y: centerY - nodeHeight / 2,
            width: nodeWidth,
            height: nodeHeight
        });
        layoutNodes.push({
            ...nodes[1],
            x: centerX + spacing / 2,
            y: centerY - nodeHeight / 2,
            width: nodeWidth,
            height: nodeHeight
        });
    } else {
        // Arrange in a triangle or grid
        const radius = Math.min(width, height) * 0.3;
        const angleStep = (2 * Math.PI) / Math.min(nodes.length, 6);

        nodes.forEach((node, idx) => {
            if (idx < 6) {
                const angle = idx * angleStep - Math.PI / 2;
                layoutNodes.push({
                    ...node,
                    x: centerX + radius * Math.cos(angle) - nodeWidth / 2,
                    y: centerY + radius * Math.sin(angle) - nodeHeight / 2,
                    width: nodeWidth,
                    height: nodeHeight
                });
            }
        });
    }

    // Connect all nodes to each other
    const connectors = [];
    for (let i = 0; i < layoutNodes.length; i++) {
        for (let j = i + 1; j < layoutNodes.length; j++) {
            connectors.push({
                x1: layoutNodes[i].x + nodeWidth / 2,
                y1: layoutNodes[i].y + nodeHeight / 2,
                x2: layoutNodes[j].x + nodeWidth / 2,
                y2: layoutNodes[j].y + nodeHeight / 2,
                showArrow: false
            });
        }
    }

    return { nodes: layoutNodes, connectors };
}

// Matrix/Grid layout
function calculateMatrixLayout(nodes, width, height, style) {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    const nodeWidth = (width - 40) / cols - 10;
    const nodeHeight = (height - 40) / rows - 10;
    const marginX = 20;
    const marginY = 20;

    const layoutNodes = nodes.map((node, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        return {
            ...node,
            x: marginX + col * (nodeWidth + 10),
            y: marginY + row * (nodeHeight + 10),
            width: nodeWidth,
            height: nodeHeight
        };
    });

    return { nodes: layoutNodes, connectors: [] };
}

// Pyramid layout
function calculatePyramidLayout(nodes, width, height, style) {
    const levels = Math.min(nodes.length, 4);
    const nodeHeight = (height - 40) / levels - 10;
    const layoutNodes = [];

    let nodeIdx = 0;
    for (let level = 0; level < levels && nodeIdx < nodes.length; level++) {
        const nodesInLevel = level + 1;
        const nodeWidth = Math.min(120, (width - 40) / nodesInLevel - 10);
        const levelY = 20 + level * (nodeHeight + 10);

        for (let i = 0; i < nodesInLevel && nodeIdx < nodes.length; i++) {
            const totalWidth = nodesInLevel * nodeWidth + (nodesInLevel - 1) * 10;
            const startX = (width - totalWidth) / 2;

            layoutNodes.push({
                ...nodes[nodeIdx],
                x: startX + i * (nodeWidth + 10),
                y: levelY,
                width: nodeWidth,
                height: nodeHeight
            });
            nodeIdx++;
        }
    }

    // Connect nodes to nodes in level below
    const connectors = [];
    let prevLevelStart = 0;
    let prevLevelCount = 1;

    for (let level = 1; level < levels; level++) {
        const currLevelStart = prevLevelStart + prevLevelCount;
        const currLevelCount = Math.min(level + 1, layoutNodes.length - currLevelStart);

        for (let i = 0; i < prevLevelCount && prevLevelStart + i < layoutNodes.length; i++) {
            const parent = layoutNodes[prevLevelStart + i];
            // Connect to 1-2 children
            for (let j = i; j <= i + 1 && currLevelStart + j < layoutNodes.length && j < currLevelCount; j++) {
                const child = layoutNodes[currLevelStart + j];
                connectors.push({
                    x1: parent.x + parent.width / 2,
                    y1: parent.y + parent.height,
                    x2: child.x + child.width / 2,
                    y2: child.y,
                    showArrow: true
                });
            }
        }

        prevLevelStart = currLevelStart;
        prevLevelCount = currLevelCount;
    }

    return { nodes: layoutNodes, connectors };
}

// Funnel layout
function calculateFunnelLayout(nodes, width, height, style) {
    const nodeHeight = (height - 40) / nodes.length - 10;
    const layoutNodes = [];

    nodes.forEach((node, idx) => {
        const ratio = 1 - (idx / Math.max(nodes.length - 1, 1)) * 0.7; // Taper from 100% to 30%
        const nodeWidth = width * ratio * 0.8;
        const x = (width - nodeWidth) / 2;
        const y = 20 + idx * (nodeHeight + 10);

        layoutNodes.push({
            ...node,
            x,
            y,
            width: nodeWidth,
            height: nodeHeight
        });
    });

    const connectors = [];
    for (let i = 0; i < layoutNodes.length - 1; i++) {
        connectors.push({
            x1: layoutNodes[i].x + layoutNodes[i].width / 2,
            y1: layoutNodes[i].y + nodeHeight,
            x2: layoutNodes[i + 1].x + layoutNodes[i + 1].width / 2,
            y2: layoutNodes[i + 1].y,
            showArrow: true
        });
    }

    return { nodes: layoutNodes, connectors };
}

// ===== UTILITY FUNCTIONS =====

function calculateHexagonPoints(x, y, width, height) {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;

    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);
        points.push(`${px},${py}`);
    }
    return points.join(' ');
}

function truncateText(text, maxWidth, fontSize) {
    const maxChars = Math.floor(maxWidth / (fontSize * 0.6));
    if (text.length > maxChars) {
        return text.substring(0, maxChars - 3) + '...';
    }
    return text;
}

SmartArtComponent.propTypes = {
    diagramType: PropTypes.oneOf([
        'process',
        'vertical-process',
        'hierarchy',
        'cycle',
        'relationship',
        'matrix',
        'pyramid',
        'funnel'
    ]).isRequired,
    nodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        color: PropTypes.string
    })),
    style: PropTypes.shape({
        nodeColor: PropTypes.string,
        textColor: PropTypes.string,
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number,
        fontSize: PropTypes.number,
        fontWeight: PropTypes.string,
        shape: PropTypes.oneOf(['rectangle', 'rounded', 'circle', 'hexagon']),
        showConnectors: PropTypes.bool,
        connectorColor: PropTypes.string,
        connectorWidth: PropTypes.number,
        connectorStyle: PropTypes.oneOf(['solid', 'dashed', 'dotted']),
        arrowType: PropTypes.oneOf(['arrow', 'none', 'line'])
    }),
    width: PropTypes.number,
    height: PropTypes.number
};

SmartArtComponent.defaultProps = {
    diagramType: 'process',
    width: 600,
    height: 400
};

export default SmartArtComponent;
