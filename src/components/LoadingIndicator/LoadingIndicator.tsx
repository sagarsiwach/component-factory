// src/components/LoadingIndicator/LoadingIndicator.tsx
import React, { CSSProperties, useEffect, useState } from "react";
import { motion } from "framer-motion"; // Assuming framer-motion is installed
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface LoadingIndicatorProps {
    /** Text displayed below the spinner */
    text?: string;
    /** Whether to show the text */
    showText?: boolean;
    /** Color of the spinning arc */
    color?: string;
    /** Size of the spinner */
    size?: "small" | "medium" | "large";
    /** Custom inline styles for the container */
    style?: CSSProperties;
    /** Aria label for the loading indicator */
    "aria-label"?: string;
}

/**
 * Loading Indicator Component
 *
 * Displays a spinning indicator, optionally with text, to signify a loading state.
 * Uses framer-motion for the animation and inline styles/tokens.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    text = "Loading...",
    showText = true,
    color = tokens.colors.blue[600],
    size = "medium",
    style,
    "aria-label": ariaLabel = "Loading", // Default aria-label
    ...rest
}) => {
    // --- Style Calculation ---

    const getSpinnerSize = (): number => {
        switch (size) {
            case "small":
                return 24;
            case "medium":
                return 32;
            case "large":
                return 48;
            default:
                return 32;
        }
    };

    const spinnerSize = getSpinnerSize();
    const borderWidth = Math.max(2, Math.round(spinnerSize / 10)); // Adjust border width based on size

    const containerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing[4], // Default padding
        fontFamily: tokens.fontFamily.sans,
        ...style,
    };

    const spinnerStyle: CSSProperties = {
        width: spinnerSize,
        height: spinnerSize,
        borderRadius: "50%",
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        borderColor: tokens.colors.neutral[200], // Base border color
        borderTopColor: color, // Active spinner arc color
        flexShrink: 0,
    };

    const textStyle: CSSProperties = {
        marginTop: tokens.spacing[3],
        color: tokens.colors.neutral[600],
        fontSize: tokens.fontSize.sm,
    };

    // --- Render ---

    return (
        <div
            style={containerStyle}
            role="status" // Indicates loading status
            aria-label={ariaLabel}
            {...rest}
        >
            <motion.div
                style={spinnerStyle}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                aria-hidden="true" // Spinner is decorative, status provided by role/aria-label
            />
            {showText && text && <div style={textStyle}>{text}</div>}
        </div>
    );
};

export default LoadingIndicator;