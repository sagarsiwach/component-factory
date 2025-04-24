// src/components/Button/Button.tsx
import React, { useState, useEffect, CSSProperties, ReactNode } from "react";
import tokens from "../../styles/tokens"; // Adjusted import path

// --- Component Props Interface ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button display text */
    text?: string;
    /** Show right arrow icon */
    rightIcon?: boolean;
    /** Custom icon element to display on the left */
    leftIcon?: ReactNode; // Allow passing custom icon components/elements
    /** Primary color used for background or border */
    primaryColor?: string;
    /** Text color (primarily for primary variant) */
    textColor?: string;
    /** Button width (CSS value) */
    width?: string | number;
    /** Button height (CSS value) */
    height?: string | number;
    /** If true, the button is disabled */
    disabled?: boolean;
    /** If true, shows a loading spinner */
    loading?: boolean;
    /** Button style variant */
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
    /** Button size */
    size?: "small" | "default" | "large";
    /** Button type attribute */
    type?: "button" | "submit" | "reset";
    /** Custom inline styles */
    style?: CSSProperties;
    /** Click handler */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    // Allow any other standard button attributes
}

// --- Helper Components ---

/** Loading Spinner SVG */
const Spinner: React.FC = () => {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        // Basic animation loop for inline style rotation
        let animationFrameId: number;
        const animate = () => {
            setRotation((r) => (r + 6) % 360); // Adjust speed as needed
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                transform: `rotate(${rotation}deg)`,
            }}
            aria-hidden="true" // Hide decorative spinner from assistive tech
        >
            {/* Use two paths or arcs for better spinner appearance */}
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
        </svg>
    );
};

/** Default Right Arrow Icon */
const ArrowIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M4.16669 10H15.8334"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 4.16669L15.8333 10L10 15.8334"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/**
 * Primary UI Button Component
 *
 * A versatile button component supporting different variants, sizes,
 * icons, loading states, and accessibility features. Uses inline styles
 * based on provided tokens for consistency between React and Framer.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            text = "Button",
            rightIcon = false,
            leftIcon = null,
            primaryColor = tokens.colors.blue[600],
            textColor = "#FFFFFF",
            width = "auto", // Default to auto width
            height = "auto",
            disabled = false,
            loading = false,
            variant = "primary",
            size = "default",
            type = "button",
            style,
            onClick,
            ...rest // Pass rest props like aria-label, etc.
        },
        ref
    ) => {
        // --- Style Calculation ---

        const getSizeStyles = (): CSSProperties => {
            switch (size) {
                case "small":
                    return {
                        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                        fontSize: tokens.fontSize.sm,
                        height: height === "auto" ? "36px" : height, // Example default height
                    };
                case "large":
                    return {
                        padding: `${tokens.spacing[5]} ${tokens.spacing[8]}`,
                        fontSize: tokens.fontSize.lg,
                        height: height === "auto" ? "56px" : height, // Example default height
                    };
                default: // default size
                    return {
                        padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
                        fontSize: tokens.fontSize.base,
                        height: height === "auto" ? "48px" : height, // Example default height
                    };
            }
        };

        const getVariantStyles = (): CSSProperties => {
            const baseStyle: CSSProperties = {
                display: "inline-flex", // Changed from flex to inline-flex
                alignItems: "center",
                justifyContent: "center",
                gap: tokens.spacing[2], // Standard gap
                borderRadius: tokens.borderRadius.DEFAULT,
                fontFamily: tokens.fontFamily.sans,
                fontWeight: tokens.fontWeight.medium,
                letterSpacing: "-0.03em", // Common style
                cursor: disabled || loading ? "not-allowed" : "pointer",
                transition:
                    "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
                width,
                border: "1px solid transparent", // Base border for layout consistency
                outline: "none", // Remove default outline
                position: "relative",
                opacity: disabled || loading ? 0.7 : 1,
                WebkitFontSmoothing: "antialiased", // Smoother fonts
                MozOsxFontSmoothing: "grayscale",
                ...getSizeStyles(),
            };

            // Apply variant-specific styles
            switch (variant) {
                case "primary":
                    return {
                        ...baseStyle,
                        backgroundColor: primaryColor,
                        color: textColor,
                        borderColor: primaryColor, // Match border to bg
                    };
                case "secondary":
                    return {
                        ...baseStyle,
                        backgroundColor: tokens.colors.neutral[100],
                        color: tokens.colors.neutral[900],
                        borderColor: tokens.colors.neutral[200], // Subtle border
                    };
                case "outline":
                    return {
                        ...baseStyle,
                        backgroundColor: "transparent",
                        color: primaryColor,
                        borderColor: primaryColor,
                    };
                case "ghost":
                    return {
                        ...baseStyle,
                        backgroundColor: "transparent",
                        color: tokens.colors.neutral[900], // Use a neutral color
                        borderColor: "transparent", // No border for ghost
                    };
                case "destructive":
                    return {
                        ...baseStyle,
                        backgroundColor: tokens.colors.red[600],
                        color: "#FFFFFF",
                        borderColor: tokens.colors.red[600], // Match border to bg
                    };
                default:
                    return baseStyle;
            }
        };

        // Combine base, variant, and custom styles
        const combinedStyle = {
            ...getVariantStyles(),
            ...style, // Allow overriding via props
        };

        // --- Render ---

        return (
            <button
                ref={ref}
                style={combinedStyle}
                onClick={!disabled && !loading ? onClick : undefined}
                disabled={disabled || loading}
                type={type}
                aria-disabled={disabled || loading}
                aria-live={loading ? "polite" : undefined} // Announce loading state change
                {...rest} // Spread remaining props
            >
                {loading && (
                    <span
                        style={{
                            marginRight: text || leftIcon || rightIcon ? tokens.spacing[2] : "0",
                            display: "flex",
                            alignItems: "center",
                        }}
                        aria-label="Loading" // Accessibility for spinner
                    >
                        <Spinner />
                    </span>
                )}

                {leftIcon && !loading && (
                    <span
                        style={{ display: "flex", alignItems: "center" }}
                        aria-hidden="true" // Hide decorative icon
                    >
                        {leftIcon}
                    </span>
                )}

                {text && <span>{text}</span>}

                {rightIcon && !loading && (
                    <span
                        style={{ display: "flex", alignItems: "center" }}
                        aria-hidden="true" // Hide decorative icon
                    >
                        <ArrowIcon />
                    </span>
                )}
            </button>
        );
    }
);

Button.displayName = "Button"; // Add display name for React DevTools

export default Button;