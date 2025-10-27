import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to monitor React component performance impact
 * Tracks component count, render times, and provides warnings
 */
export const useComponentPerformance = (slides, currentSlideId) => {
    const [metrics, setMetrics] = useState({
        totalComponents: 0,
        currentSlideComponents: 0,
        estimatedImpact: 'low', // low, medium, high, critical
        shouldWarn: false,
        renderTime: 0
    });

    useEffect(() => {
        const startTime = performance.now();

        // Count total components across all slides
        const totalComponents = slides.reduce((count, slide) => {
            return count + slide.elements.filter(el => el.type === 'component' && el.reactComponent?.code).length;
        }, 0);

        // Count components on current slide
        const currentSlide = slides.find(s => s.id === currentSlideId);
        const currentSlideComponents = currentSlide
            ? currentSlide.elements.filter(el => el.type === 'component' && el.reactComponent?.code).length
            : 0;

        // Estimate performance impact based on thresholds
        let estimatedImpact = 'low';
        let shouldWarn = false;
        let warningType = 'slide'; // 'slide' or 'deck'

        // Check current slide component count
        if (currentSlideComponents >= 10) {
            estimatedImpact = 'critical';
            shouldWarn = true;
            warningType = 'slide';
        } else if (currentSlideComponents >= 6) {
            estimatedImpact = 'high';
            shouldWarn = true;
            warningType = 'slide';
        } else if (currentSlideComponents >= 3) {
            estimatedImpact = 'medium';
            shouldWarn = false; // Warn only at high/critical
            warningType = 'slide';
        }

        // Deck-wide warning: only show if total is very high AND current slide contributes to the problem
        // This prevents showing warnings on slides with just 1-2 components when other slides have many
        if (totalComponents >= 30 && currentSlideComponents >= 3) {
            if (!shouldWarn) {
                shouldWarn = true;
                estimatedImpact = 'medium';
            }
            warningType = 'deck';
        }

        const renderTime = performance.now() - startTime;

        setMetrics({
            totalComponents,
            currentSlideComponents,
            estimatedImpact,
            shouldWarn,
            warningType,
            renderTime
        });
    }, [slides, currentSlideId]);

    return metrics;
};

/**
 * Get performance warning message based on metrics
 */
export const getPerformanceWarning = (metrics) => {
    if (!metrics.shouldWarn) return null;

    // Critical: 10+ components on THIS slide
    if (metrics.estimatedImpact === 'critical') {
        return {
            level: 'critical',
            title: 'Critical Performance Impact',
            message: `${metrics.currentSlideComponents} React components on this slide may cause significant lag. Consider reducing to 5 or fewer.`,
            color: 'red'
        };
    }

    // High: 6-9 components on THIS slide
    else if (metrics.estimatedImpact === 'high') {
        return {
            level: 'high',
            title: 'High Performance Impact',
            message: `${metrics.currentSlideComponents} React components detected on this slide. Performance may degrade with more than 5 components per slide.`,
            color: 'orange'
        };
    }

    // Medium: Either 3-5 components OR deck-wide warning
    else if (metrics.estimatedImpact === 'medium' && metrics.warningType === 'deck') {
        return {
            level: 'high',
            title: 'High Presentation Complexity',
            message: `This presentation has ${metrics.totalComponents} React components total. Consider optimizing or splitting into multiple presentations for better performance.`,
            color: 'orange'
        };
    }

    return null;
};

/**
 * Hook to track component render performance
 * Wraps around individual component renders to measure time
 */
export const useComponentRenderTime = (componentId) => {
    const [renderTime, setRenderTime] = useState(0);

    const startRender = useCallback(() => {
        return performance.now();
    }, []);

    const endRender = useCallback((startTime) => {
        const duration = performance.now() - startTime;
        setRenderTime(duration);

        // Log slow renders (over 100ms)
        if (duration > 100) {
            console.warn(`Slow component render detected (${componentId}): ${duration.toFixed(2)}ms`);
        }
    }, [componentId]);

    return { renderTime, startRender, endRender };
};
