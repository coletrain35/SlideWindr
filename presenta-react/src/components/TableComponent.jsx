import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const TableComponent = ({ element, isSelected, updateElement, setInteractingElementId }) => {
    const [selectedCell, setSelectedCell] = useState(null);
    const [editingCell, setEditingCell] = useState(null);
    const inputRef = useRef(null);

    // Auto-focus and select all text when entering edit mode
    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingCell]);

    // Notify parent when we start/stop interacting to prevent element deletion
    useEffect(() => {
        if (editingCell && setInteractingElementId) {
            setInteractingElementId(element.id);
        } else if (!editingCell && setInteractingElementId) {
            setInteractingElementId(null);
        }
    }, [editingCell, element.id, setInteractingElementId]);

    const handleCellClick = (rowIdx, colIdx, e) => {
        if (isSelected) {
            e.stopPropagation();
            setSelectedCell({ row: rowIdx, col: colIdx });
            // Single click starts editing
            setEditingCell({ row: rowIdx, col: colIdx });
        }
    };

    const handleCellChange = (rowIdx, colIdx, value) => {
        const newCellData = element.cellData.map((row, rIdx) =>
            row.map((cell, cIdx) => (rIdx === rowIdx && cIdx === colIdx ? value : cell))
        );
        updateElement(element.id, { cellData: newCellData });
    };

    const handleCellBlur = () => {
        setEditingCell(null);
        setSelectedCell(null);
    };

    const handleKeyDown = (e, rowIdx, colIdx) => {
        // Prevent delete/backspace from deleting the table element
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.stopPropagation();
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            setEditingCell(null);
            setSelectedCell(null);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            // Move to next cell
            const nextCol = colIdx + 1;
            if (nextCol < element.columns) {
                setEditingCell({ row: rowIdx, col: nextCol });
                setSelectedCell({ row: rowIdx, col: nextCol });
            } else if (rowIdx + 1 < element.rows) {
                // Move to first cell of next row
                setEditingCell({ row: rowIdx + 1, col: 0 });
                setSelectedCell({ row: rowIdx + 1, col: 0 });
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setEditingCell(null);
            setSelectedCell(null);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <table
                style={{
                    width: '100%',
                    height: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed'
                }}
            >
                <tbody>
                    {element.cellData.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {row.map((cellContent, colIdx) => {
                                const cellStyle = element.cellStyles[rowIdx][colIdx];
                                const isEditing = editingCell && editingCell.row === rowIdx && editingCell.col === colIdx;
                                const isSelectedCell = selectedCell && selectedCell.row === rowIdx && selectedCell.col === colIdx;

                                return (
                                    <td
                                        key={`${rowIdx}-${colIdx}`}
                                        onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                                        style={{
                                            backgroundColor: cellStyle.backgroundColor,
                                            color: cellStyle.color,
                                            textAlign: cellStyle.textAlign,
                                            verticalAlign: cellStyle.verticalAlign,
                                            fontWeight: cellStyle.fontWeight,
                                            fontSize: `${cellStyle.fontSize}px`,
                                            padding: isEditing ? '0' : `${cellStyle.padding}px`,
                                            border: `${cellStyle.borderWidth}px solid ${cellStyle.borderColor}`,
                                            position: 'relative',
                                            outline: isSelectedCell && isSelected ? '2px solid #3b82f6' : 'none',
                                            outlineOffset: '-2px',
                                            cursor: isSelected ? 'text' : 'default'
                                        }}
                                    >
                                        {isEditing ? (
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={cellContent}
                                                onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                                onBlur={handleCellBlur}
                                                onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none',
                                                    outline: '2px solid #3b82f6',
                                                    outlineOffset: '-2px',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    color: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit',
                                                    textAlign: 'inherit',
                                                    padding: `${cellStyle.padding}px`,
                                                    boxSizing: 'border-box',
                                                    caretColor: cellStyle.color
                                                }}
                                            />
                                        ) : (
                                            cellContent
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

TableComponent.propTypes = {
    element: PropTypes.shape({
        id: PropTypes.string.isRequired,
        rows: PropTypes.number.isRequired,
        columns: PropTypes.number.isRequired,
        cellData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
        cellStyles: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired
    }).isRequired,
    isSelected: PropTypes.bool.isRequired,
    updateElement: PropTypes.func.isRequired,
    setInteractingElementId: PropTypes.func
};

export default TableComponent;
