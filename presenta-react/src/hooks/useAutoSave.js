import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'slidewindr_presentation_autosave';
const AUTOSAVE_DELAY = 2000; // 2 seconds

/**
 * Custom hook for auto-saving presentation data to localStorage
 * @param {*} data - Data to auto-save
 * @param {number} delay - Debounce delay in milliseconds (default: 2000ms)
 * @returns {object} - { saveStatus, clearSave, loadSave }
 */
export const useAutoSave = (data, delay = AUTOSAVE_DELAY) => {
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const timeoutRef = useRef(null);
    const lastSavedRef = useRef(null);

    // Save data to localStorage
    const saveToStorage = useCallback((dataToSave) => {
        try {
            setSaveStatus('saving');
            const serialized = JSON.stringify(dataToSave);
            localStorage.setItem(STORAGE_KEY, serialized);
            localStorage.setItem(`${STORAGE_KEY}_timestamp`, new Date().toISOString());
            lastSavedRef.current = dataToSave;
            setSaveStatus('saved');

            // Reset to idle after 2 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            setSaveStatus('error');

            // Reset to idle after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        }
    }, []);

    // Load data from localStorage
    const loadSave = useCallback(() => {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            const timestamp = localStorage.getItem(`${STORAGE_KEY}_timestamp`);

            if (serialized) {
                const data = JSON.parse(serialized);
                return {
                    data,
                    timestamp: timestamp ? new Date(timestamp) : null
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }, []);

    // Clear saved data
    const clearSave = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
            lastSavedRef.current = null;
            setSaveStatus('idle');
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }, []);

    // Auto-save effect with debouncing
    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Only save if data has changed
        if (JSON.stringify(data) !== JSON.stringify(lastSavedRef.current)) {
            timeoutRef.current = setTimeout(() => {
                saveToStorage(data);
            }, delay);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, delay, saveToStorage]);

    return {
        saveStatus,
        clearSave,
        loadSave
    };
};
