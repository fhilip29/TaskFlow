import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map Tailwind class names to our CSS custom properties
        chalk: {
          // Background colors
          bg: "var(--chalk-bg)",
          panel: "var(--chalk-panel)",
          subtle: "var(--chalk-subtle)",
          border: "var(--chalk-border)",
          hover: "var(--chalk-primary-50)",

          // Text colors
          text: "var(--chalk-text)",
          "text-2": "var(--chalk-text-2)",
          "text-3": "var(--chalk-text-3)",

          // Primary colors
          primary50: "var(--chalk-primary-50)",
          primary100: "var(--chalk-primary-100)",
          primary200: "var(--chalk-primary-200)",
          primary300: "var(--chalk-primary-300)",
          primary400: "var(--chalk-primary-400)",
          primary500: "var(--chalk-primary-500)",
          primary600: "var(--chalk-primary-600)",
          primary700: "var(--chalk-primary-700)",
          primary800: "var(--chalk-primary-800)",
          primary900: "var(--chalk-primary-900)",

          // Accent colors
          accent: "var(--chalk-accent)",
          "accent-hover": "var(--chalk-accent-hover)",

          // Status colors
          info: "var(--chalk-info)",
          success: "var(--chalk-success)",
          warning: "var(--chalk-warning)",
          danger: "var(--chalk-danger)",
        },

        // Background shorthand
        background: "var(--chalk-bg)",
        foreground: "var(--chalk-text)",

        // Card
        card: {
          DEFAULT: "var(--chalk-panel)",
          foreground: "var(--chalk-text)",
        },

        // Primary shorthand
        primary: {
          DEFAULT: "var(--chalk-primary-600)",
          foreground: "white",
          50: "var(--chalk-primary-50)",
          100: "var(--chalk-primary-100)",
          200: "var(--chalk-primary-200)",
          300: "var(--chalk-primary-300)",
          400: "var(--chalk-primary-400)",
          500: "var(--chalk-primary-500)",
          600: "var(--chalk-primary-600)",
          700: "var(--chalk-primary-700)",
          800: "var(--chalk-primary-800)",
          900: "var(--chalk-primary-900)",
        },

        // Secondary
        secondary: {
          DEFAULT: "var(--chalk-subtle)",
          foreground: "var(--chalk-text)",
        },

        // Muted
        muted: {
          DEFAULT: "var(--chalk-subtle)",
          foreground: "var(--chalk-text-2)",
        },

        // Accent
        accent: {
          DEFAULT: "var(--chalk-accent)",
          foreground: "white",
        },

        // Destructive
        destructive: {
          DEFAULT: "var(--chalk-danger)",
          foreground: "white",
        },

        // Border
        border: "var(--chalk-border)",
        input: "var(--chalk-border)",
        ring: "var(--chalk-primary-400)",

        // Popover
        popover: {
          DEFAULT: "var(--chalk-panel)",
          foreground: "var(--chalk-text)",
        },

        // Chart colors
        chart: {
          "1": "var(--chalk-primary-600)",
          "2": "var(--chalk-primary-400)",
          "3": "var(--chalk-accent)",
          "4": "var(--chalk-info)",
          "5": "var(--chalk-success)",
        },
      },

      fontFamily: {
        serif: "var(--font-serif)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },

      fontSize: {
        // Typography sizes matching our CSS
        "chalk-xs": "0.75rem",
        "chalk-sm": "0.875rem",
        "chalk-base": "1rem",
        "chalk-lg": "1.125rem",
        "chalk-xl": "1.25rem",
        "chalk-2xl": "1.5rem",
        "chalk-3xl": "1.875rem",
        "chalk-4xl": "2.25rem",

        // Body text mappings
        "chalk-body": "1rem",
        "chalk-small": "0.875rem",
        "chalk-h1": "2.25rem",
        "chalk-h2": "1.875rem",
        "chalk-h3": "1.5rem",
        "chalk-h4": "1.25rem",
        "chalk-h5": "1.125rem",
        "chalk-h6": "1rem",
      },

      borderRadius: {
        "chalk-sm": "0.375rem",
        "chalk-md": "0.5rem",
        "chalk-lg": "0.75rem",
        "chalk-xl": "1rem",
      },

      boxShadow: {
        "chalk-sm": "var(--chalk-shadow-sm)",
        "chalk-md": "var(--chalk-shadow-md)",
        "chalk-lg": "var(--chalk-shadow-lg)",
        "chalk-xl": "var(--chalk-shadow-xl)",
      },

      animation: {
        "fade-in": "fadeIn var(--animation-duration) var(--animation-easing)",
        "slide-up": "slideUp var(--animation-duration) var(--animation-easing)",
        "slide-down":
          "slideDown var(--animation-duration) var(--animation-easing)",
        "chalk-shimmer": "chalkShimmer 400ms ease-out",
      },

      transitionTimingFunction: {
        chalk: "var(--animation-easing)",
      },

      transitionDuration: {
        chalk: "var(--animation-duration)",
      },
    },
  },
  plugins: [],
};

export default config;
