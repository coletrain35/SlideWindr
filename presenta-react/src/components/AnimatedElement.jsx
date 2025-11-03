import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Animation presets for element entrance, emphasis, and exit animations
 */
const animationPresets = {
    // Entrance animations
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    slideInLeft: {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
    },
    slideInRight: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 100, opacity: 0 }
    },
    slideInUp: {
        initial: { y: 100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 100, opacity: 0 }
    },
    slideInDown: {
        initial: { y: -100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 }
    },
    zoomIn: {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 }
    },
    bounceIn: {
        initial: { scale: 0, opacity: 0 },
        animate: {
            scale: [0, 1.2, 1],
            opacity: 1,
            transition: { duration: 0.6, times: [0, 0.6, 1] }
        },
        exit: { scale: 0, opacity: 0 }
    },
    rotateIn: {
        initial: { rotate: -180, scale: 0, opacity: 0 },
        animate: { rotate: 0, scale: 1, opacity: 1 },
        exit: { rotate: 180, scale: 0, opacity: 0 }
    },
    flipIn: {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: 90, opacity: 0 }
    },

    // Emphasis animations (loop or trigger)
    pulse: {
        animate: {
            scale: [1, 1.05, 1],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
        }
    },
    shake: {
        animate: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
        }
    },
    swing: {
        animate: {
            rotate: [0, 15, -15, 10, -10, 0],
            transition: { duration: 0.8 }
        }
    },

    // No animation
    none: {
        initial: {},
        animate: {},
        exit: {}
    }
};

/**
 * AnimatedElement - Wrapper component that applies framer-motion animations to elements
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element to animate
 * @param {Object} props.animation - Animation configuration
 * @param {string} props.animation.type - Animation type (fadeIn, slideInLeft, etc.)
 * @param {number} props.animation.duration - Animation duration in seconds
 * @param {number} props.animation.delay - Animation delay in seconds
 * @param {string} props.animation.easing - Easing function (linear, easeIn, easeOut, easeInOut)
 * @param {boolean} props.isInPresentationMode - Whether we're in presentation mode
 * @param {boolean} props.shouldAnimate - Whether the animation should play (based on fragmentOrder)
 */
const AnimatedElement = ({
    children,
    animation,
    isInPresentationMode = false,
    shouldAnimate = true
}) => {
    const [animate, setAnimate] = useState(false);

    // Trigger animation when preview mode is enabled or animation type changes
    useEffect(() => {
        if (isInPresentationMode) {
            // Reset to initial state
            setAnimate(false);
            // Then animate after a tick to ensure initial state is rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimate(true);
                });
            });
        } else {
            // Reset animation state when preview is off
            setAnimate(false);
        }
    }, [isInPresentationMode, animation?.type]);

    // If no animation or not in presentation mode, render without animation
    if (!animation || !animation.type || animation.type === 'none' || !isInPresentationMode) {
        return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
    }

    const preset = animationPresets[animation.type] || animationPresets.none;

    // Default values
    const duration = animation.duration || 0.5;
    const delay = animation.delay || 0;
    const easing = animation.easing || 'easeOut';

    // Map easing names to framer-motion easing arrays
    const easingMap = {
        linear: [0, 0, 1, 1],
        easeIn: [0.42, 0, 1, 1],
        easeOut: [0, 0, 0.58, 1],
        easeInOut: [0.42, 0, 0.58, 1],
        spring: 'spring'
    };

    const transition = {
        duration,
        delay,
        ease: easingMap[easing] || easingMap.easeOut
    };

    // Don't show if not yet time to animate (fragment control)
    if (!shouldAnimate && isInPresentationMode) {
        return null;
    }

    const animateValue = animate ? preset.animate : preset.initial;

    return (
        <motion.div
            initial={preset.initial}
            animate={animateValue}
            transition={{
                ...transition,
                ...(preset.animate?.transition || {})
            }}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

AnimatedElement.propTypes = {
    children: PropTypes.node.isRequired,
    animation: PropTypes.shape({
        type: PropTypes.string,
        duration: PropTypes.number,
        delay: PropTypes.number,
        easing: PropTypes.string
    }),
    isInPresentationMode: PropTypes.bool,
    shouldAnimate: PropTypes.bool
};

export default AnimatedElement;
export { animationPresets };
