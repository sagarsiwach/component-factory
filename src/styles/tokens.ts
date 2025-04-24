// src/styles/tokens.ts

/**
 * Design Tokens
 * Replicated from Framer's DesignTokens module based on usage in components.
 * Adjust values as needed to match the precise Framer theme.
 */

const neutral = {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
}

const blue = {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB", // Common primary color default
    700: "#1D4ED8",
}

const red = {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444", // Common error text/icon color
    600: "#DC2626", // Common error border/bg color
    700: "#B91C1C", // Darker error text color
}

const green = {
    100: "#D1FAE5", // Success icon background
    600: "#16A34A", // Success icon/border color
}

export const tokens = {
    colors: {
        neutral,
        blue,
        red,
        green,
        white: "#FFFFFF", // Explicit white if needed
    },
    spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px", // Common padding/gap
        5: "20px", // Common padding
        6: "24px", // Common padding/margin
        8: "32px", // Common margin
    },
    fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px", // Default
        lg: "18px",
        xl: "20px",
        "2xl": "24px", // Large headings/prices
    },
    fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
    },
    borderRadius: {
        DEFAULT: "8px", // Default border radius
        lg: "10px", // Larger border radius
        md: "6px", // Medium border radius (used in some card styles)
    },
    lineHeight: {
        relaxed: "1.625",
    },
    boxShadow: {
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    // Assuming standard sans-serif fonts based on Framer defaults and Geist usage
    fontFamily: {
        sans: "'Geist', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        mono: "'JetBrains Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
}

// Default export for convenience
export default tokens