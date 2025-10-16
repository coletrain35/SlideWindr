import { useEffect, useMemo, useRef } from 'react';

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Hook version of debounce for React components.
 * Returns a memoized debounced callback that won't change unless delay changes.
 *
 * @param {Function} callback - The callback to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced callback
 *
 * @example
 * const debouncedSave = useDebouncedCallback((value) => {
 *   saveToServer(value);
 * }, 300);
 */
export function useDebouncedCallback(callback, delay) {
    const callbackRef = useRef(callback);

    // Update the callback ref whenever callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Memoize the debounced function
    return useMemo(() => {
        return debounce((...args) => callbackRef.current(...args), delay);
    }, [delay]);
}
