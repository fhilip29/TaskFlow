import { Variants } from "framer-motion";

// Chalkboard Harmony Motion System
// Easing: cubic-bezier(0.2, 0.8, 0.2, 1) - reassuring and predictable
// Durations: 120ms (micro), 200-240ms (default), 300ms (page)

const chalkEasing = [0.2, 0.8, 0.2, 1] as const;

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: chalkEasing },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: chalkEasing },
  },
};

export const slideUp: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: chalkEasing },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.12, ease: chalkEasing },
  },
};

export const slideDown: Variants = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: chalkEasing },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.12, ease: chalkEasing },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03, // 30ms stagger for task list reveals
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: chalkEasing },
  },
};

// Input focus glow effect
export const focusGlow: Variants = {
  initial: {
    boxShadow: "0 0 0 0px rgba(75, 184, 169, 0)",
  },
  animate: {
    boxShadow: "0 0 0 2px rgba(75, 184, 169, 0.2)",
    transition: { duration: 0.16, ease: chalkEasing },
  },
};

// Success chalk dust shimmer
export const chalkShimmer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.12, 0],
    transition: { duration: 0.4, ease: chalkEasing },
  },
};

// Page transitions
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: chalkEasing },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: chalkEasing },
  },
};
