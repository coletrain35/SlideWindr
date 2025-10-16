import React from 'react';
import PropTypes from 'prop-types';
import {
    LayersIcon,
    MoveHorizontalIcon,
    MinusIcon,
    HashIcon,
    AlignCenterVerticalIcon,
    RepeatIcon,
    MouseIcon,
    TimerIcon,
    UndoIcon,
    RedoIcon
} from './Icons';

const TRANSITION_STYLES = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];

const ToggleButton = ({ checked, onChange, title, children }) => (
    <button
        onClick={onChange}
        title={title}
        className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
            checked
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);

const PresentationToolbar = ({ settings, updateSettings, undo, redo, canUndo, canRedo }) => {
    const handleCheckboxChange = (key) => {
        updateSettings({ [key]: !settings[key] });
    };

    const handleValueChange = (key, value) => {
        updateSettings({ [key]: value });
    };

    return (
        <div className="mb-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-x-6 gap-y-2 flex-wrap text-sm">
            {/* Undo/Redo Section */}
            {(undo && redo) && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        title="Undo (Ctrl+Z)"
                        className={`p-2 rounded-lg transition-all ${
                            canUndo
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transform hover:scale-110'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        <UndoIcon />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                        className={`p-2 rounded-lg transition-all ${
                            canRedo
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transform hover:scale-110'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        <RedoIcon />
                    </button>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                </div>
            )}
            <div className="flex items-center gap-2">
                <LayersIcon />
                <label htmlFor="transition-select" className="font-medium text-gray-700 dark:text-gray-300">Transition:</label>
                <select
                    id="transition-select"
                    value={settings.transition}
                    onChange={e => handleValueChange('transition', e.target.value)}
                    className="border-gray-300 dark:border-gray-600 border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                    {TRANSITION_STYLES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <LayersIcon />
                <label htmlFor="bg-transition-select" className="font-medium text-gray-700 dark:text-gray-300">BG Transition:</label>
                <select
                    id="bg-transition-select"
                    value={settings.backgroundTransition}
                    onChange={e => handleValueChange('backgroundTransition', e.target.value)}
                    className="border-gray-300 dark:border-gray-600 border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                    {TRANSITION_STYLES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-6">
                <ToggleButton checked={settings.controls} onChange={() => handleCheckboxChange('controls')} title="Navigation Controls"><MoveHorizontalIcon /></ToggleButton>
                <ToggleButton checked={settings.progress} onChange={() => handleCheckboxChange('progress')} title="Progress Bar"><MinusIcon /></ToggleButton>
                <ToggleButton checked={settings.slideNumber} onChange={() => handleCheckboxChange('slideNumber')} title="Slide Number"><HashIcon /></ToggleButton>
                <ToggleButton checked={settings.center} onChange={() => handleCheckboxChange('center')} title="Center Vertically"><AlignCenterVerticalIcon /></ToggleButton>
                <ToggleButton checked={settings.loop} onChange={() => handleCheckboxChange('loop')} title="Loop Presentation"><RepeatIcon /></ToggleButton>
                <ToggleButton checked={settings.mouseWheel} onChange={() => handleCheckboxChange('mouseWheel')} title="Mouse Wheel Navigation"><MouseIcon /></ToggleButton>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-6">
                <TimerIcon />
                <label htmlFor="autoslide-input" className="font-medium text-gray-700 dark:text-gray-300">Auto-Slide (ms):</label>
                <input
                    id="autoslide-input"
                    type="number"
                    value={settings.autoSlide}
                    onChange={e => {
                        const value = Math.max(0, Math.min(60000, +e.target.value || 0));
                        handleValueChange('autoSlide', value);
                    }}
                    step="100"
                    min="0"
                    max="60000"
                    className="w-20 border-gray-300 dark:border-gray-600 border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>
        </div>
    );
};

PresentationToolbar.propTypes = {
    settings: PropTypes.shape({
        transition: PropTypes.string.isRequired,
        backgroundTransition: PropTypes.string.isRequired,
        controls: PropTypes.bool.isRequired,
        progress: PropTypes.bool.isRequired,
        slideNumber: PropTypes.bool.isRequired,
        center: PropTypes.bool.isRequired,
        loop: PropTypes.bool.isRequired,
        autoSlide: PropTypes.number.isRequired,
        mouseWheel: PropTypes.bool.isRequired
    }).isRequired,
    updateSettings: PropTypes.func.isRequired,
    undo: PropTypes.func,
    redo: PropTypes.func,
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool
};

ToggleButton.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};

// Memoize to prevent re-renders when settings haven't changed
export default React.memo(PresentationToolbar);
