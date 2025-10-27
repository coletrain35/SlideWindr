import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Lazy loading wrapper for React components using Intersection Observer
 * Only renders component when it's visible in the viewport
 * Significantly improves performance when many components are on a slide
 */
const LazyComponent = ({ children, threshold = 0.1, rootMargin = '50px', fallback = null }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasRendered, setHasRendered] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: render immediately if not supported
            setIsVisible(true);
            setHasRendered(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        setHasRendered(true);
                        // Once rendered, keep it rendered to maintain state
                        // (we only lazy-load initial render)
                    } else {
                        setIsVisible(false);
                    }
                });
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin]);

    return (
        <div ref={ref} className="w-full h-full">
            {hasRendered ? children : (fallback || <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
    );
};

LazyComponent.propTypes = {
    children: PropTypes.node.isRequired,
    threshold: PropTypes.number,
    rootMargin: PropTypes.string,
    fallback: PropTypes.node
};

export default React.memo(LazyComponent);
