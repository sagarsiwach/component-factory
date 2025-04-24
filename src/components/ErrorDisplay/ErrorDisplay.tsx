// src/components/ErrorDisplay/ErrorDisplay.tsx
import React, { CSSProperties } from "react";
import tokens from "../../styles/tokens"; // Adjust import path
import Button from "../Button/Button"; // Use the local Button component

// --- Component Props Interface ---

interface ErrorDisplayProps {
    /** The error message string to display */
    error?: string | null;
    /** Whether to show the retry button */
    showRetry?: boolean;
    /** Text for the retry button */
    retryText?: string;
    /** Callback function for the retry button */
    onRetry?: () => void;
    /** Custom inline styles for the container */
    style?: CSSProperties;
    /** Component Role (e.g., 'alert' for assertive announcements) */
    role?: string;
}

/**
 * Error Display Component
 *
 * Shows an error message, often within forms or data loading states.
 * Optionally includes a retry button. Uses inline styles and tokens.
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error = "",
    showRetry = false,
    retryText = "Retry",
    onRetry,
    style,
    role = "alert", // Default to 'alert' for accessibility
    ...rest
}) => {
    // Don't render if there's no error message
    if (!error) {
        return null;
    }

    // --- Styles ---

    const containerStyle: CSSProperties = {
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4], // Default margin
        backgroundColor: tokens.colors.red[50], // Light red background
        color: tokens.colors.red[700], // Darker red text
        borderRadius: tokens.borderRadius.DEFAULT,
        fontSize: tokens.fontSize.sm,
        fontFamily: tokens.fontFamily.sans,
        border: `1px solid ${tokens.colors.red[200]}}`, // Subtle border
        ...style,
    };

    // No separate button style needed, using Button component

    // --- Render ---

    return (
        <div style={containerStyle} role={role} {...rest}>
            {/* Error message text */}
            <span>{error}</span>

            {/* Retry Button (conditional) */}
            {showRetry && onRetry && (
                <div style={{ marginTop: tokens.spacing[3] }}> {/* Add space above button */}
                    <Button
                        text={retryText}
                        onClick={onRetry}
                        variant="destructive" // Use destructive variant for retry in error context
                        size="small"
                        // Use destructive colors from Button's defaults or customize here
                        // primaryColor={tokens.colors.red[600]}
                        // textColor="#FFFFFF"
                        width="auto" // Don't force full width unless needed
                    />
                </div>
            )}
        </div>
    );
};

export default ErrorDisplay;