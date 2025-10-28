import { useState } from 'react';
import { getAvailableLayouts } from '../data/slideLayouts';
import { XIcon } from './Icons';

/**
 * LayoutSelector - Modal dialog for choosing a slide layout
 */
export default function LayoutSelector({ isOpen, onClose, onSelectLayout }) {
  const [selectedLayoutId, setSelectedLayoutId] = useState('blank');
  const layouts = getAvailableLayouts();

  if (!isOpen) return null;

  const handleSelect = () => {
    onSelectLayout(selectedLayoutId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose a Layout</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select a layout template for your new slide
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Layout Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayoutId(layout.id)}
                className={`
                  relative group p-4 rounded-lg border-2 transition-all
                  ${selectedLayoutId === layout.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }
                `}
              >
                {/* Layout Preview */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center overflow-hidden">
                  <div className="text-6xl text-gray-400 dark:text-gray-500 font-mono leading-none whitespace-pre">
                    {layout.thumbnail}
                  </div>
                </div>

                {/* Layout Info */}
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {layout.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {layout.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {selectedLayoutId === layout.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
}
