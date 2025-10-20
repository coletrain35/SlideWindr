import React from 'react';
import PropTypes from 'prop-types';
import {
    AlignLeftIcon,
    AlignCenterHorizontalIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignMiddleIcon,
    AlignBottomIcon,
    DistributeHorizontalIcon,
    DistributeVerticalIcon,
    BringToFrontIcon,
    SendToBackIcon,
    BringForwardIcon,
    SendBackwardIcon,
    GridIcon
} from './Icons';

const ToolbarButton = ({ onClick, title, children, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-all ${
            disabled
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transform hover:scale-110'
        }`}
    >
        {children}
    </button>
);

ToolbarButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    disabled: PropTypes.bool
};

const AlignmentToolbar = ({
    selectedElementIds,
    onAlign,
    onDistribute,
    onReorder,
    showGrid,
    onToggleGrid,
    snapToGrid,
    onToggleSnapToGrid
}) => {
    const hasSelection = selectedElementIds.length > 0;
    const hasMultiple = selectedElementIds.length > 1;
    const hasMultipleForDistribute = selectedElementIds.length >= 3;

    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4 flex-wrap text-sm">
            {/* Horizontal Alignment */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Align H:</span>
                <ToolbarButton
                    onClick={() => onAlign('left')}
                    title="Align Left"
                    disabled={!hasMultiple}
                >
                    <AlignLeftIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onAlign('center')}
                    title="Align Center"
                    disabled={!hasMultiple}
                >
                    <AlignCenterHorizontalIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onAlign('right')}
                    title="Align Right"
                    disabled={!hasMultiple}
                >
                    <AlignRightIcon />
                </ToolbarButton>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Vertical Alignment */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Align V:</span>
                <ToolbarButton
                    onClick={() => onAlign('top')}
                    title="Align Top"
                    disabled={!hasMultiple}
                >
                    <AlignTopIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onAlign('middle')}
                    title="Align Middle"
                    disabled={!hasMultiple}
                >
                    <AlignMiddleIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onAlign('bottom')}
                    title="Align Bottom"
                    disabled={!hasMultiple}
                >
                    <AlignBottomIcon />
                </ToolbarButton>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Distribute */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Distribute:</span>
                <ToolbarButton
                    onClick={() => onDistribute('horizontal')}
                    title="Distribute Horizontally (3+ elements)"
                    disabled={!hasMultipleForDistribute}
                >
                    <DistributeHorizontalIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onDistribute('vertical')}
                    title="Distribute Vertically (3+ elements)"
                    disabled={!hasMultipleForDistribute}
                >
                    <DistributeVerticalIcon />
                </ToolbarButton>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Layer Order */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Order:</span>
                <ToolbarButton
                    onClick={() => onReorder('front')}
                    title="Bring to Front"
                    disabled={!hasSelection}
                >
                    <BringToFrontIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onReorder('forward')}
                    title="Bring Forward"
                    disabled={!hasSelection}
                >
                    <BringForwardIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onReorder('backward')}
                    title="Send Backward"
                    disabled={!hasSelection}
                >
                    <SendBackwardIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => onReorder('back')}
                    title="Send to Back"
                    disabled={!hasSelection}
                >
                    <SendToBackIcon />
                </ToolbarButton>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Grid Options */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Grid:</span>
                <button
                    onClick={onToggleGrid}
                    title={`${showGrid ? 'Hide' : 'Show'} Grid`}
                    className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                        showGrid
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    <GridIcon />
                </button>
                <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={onToggleSnapToGrid}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Snap</span>
                </label>
            </div>
        </div>
    );
};

AlignmentToolbar.propTypes = {
    selectedElementIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onAlign: PropTypes.func.isRequired,
    onDistribute: PropTypes.func.isRequired,
    onReorder: PropTypes.func.isRequired,
    showGrid: PropTypes.bool.isRequired,
    onToggleGrid: PropTypes.func.isRequired,
    snapToGrid: PropTypes.bool.isRequired,
    onToggleSnapToGrid: PropTypes.func.isRequired
};

export default React.memo(AlignmentToolbar);
