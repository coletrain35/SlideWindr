import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing undo/redo history
 * @param {*} initialState - Initial state value
 * @param {number} maxHistory - Maximum number of history states to keep (default: 50)
 * @returns {object} - { state, setState, undo, redo, canUndo, canRedo, clear }
 */
export const useHistory = (initialState, maxHistory = 50) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const isUpdatingRef = useRef(false);
    const currentIndexRef = useRef(0);

    // Keep ref in sync with state
    currentIndexRef.current = currentIndex;

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const setState = useCallback((newState) => {
        // Prevent setting state during undo/redo operations
        if (isUpdatingRef.current) return;

        setHistory(prev => {
            const index = currentIndexRef.current;
            // Remove any future history if we're not at the end
            const newHistory = prev.slice(0, index + 1);

            // Resolve the new state (handle function updates)
            const currentState = newHistory[newHistory.length - 1];
            const resolvedState = typeof newState === 'function' ? newState(currentState) : newState;

            // Add new state
            newHistory.push(resolvedState);

            // Update index
            const newIndex = newHistory.length - 1;
            currentIndexRef.current = newIndex;
            setCurrentIndex(newIndex);

            // Limit history size by removing oldest entries
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                const adjustedIndex = newIndex - 1;
                currentIndexRef.current = adjustedIndex;
                setCurrentIndex(adjustedIndex);
                return newHistory;
            }

            return newHistory;
        });
    }, [maxHistory]);

    const undo = useCallback(() => {
        if (canUndo) {
            isUpdatingRef.current = true;
            setCurrentIndex(prev => prev - 1);
            // Reset flag after state update
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) {
            isUpdatingRef.current = true;
            setCurrentIndex(prev => prev + 1);
            // Reset flag after state update
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
    }, [canRedo]);

    const clear = useCallback(() => {
        setHistory([initialState]);
        setCurrentIndex(0);
    }, [initialState]);

    const currentState = history[currentIndex];

    return {
        state: currentState,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        clear
    };
};
