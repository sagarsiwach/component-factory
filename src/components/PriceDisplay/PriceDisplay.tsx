// src/components/PriceDisplay/PriceDisplay.tsx
import React, { CSSProperties } from "react";
import tokens from "../../styles/tokens"; // Adjust path
import { formatPrice as formatPriceUtil } from "../../utils/formatting"; // Use shared formatter

// --- Component Props Interface ---

type FontWeight = "normal" | "medium" | "semibold" | "bold";
type FontSize = "small" | "medium" | "large";

interface PriceDisplayProps {
    /** The numeric price value */
    price?: number | null;
    /** Currency prefix (e.g., '₹', '$') */
    prefix?: string;
    /** Whether to show the currency prefix */
    showPrefix?: boolean;
    /** Controls the font size */
    size?: FontSize;
    /** Controls the font weight */
    fontWeight?: FontWeight;
    /** Whether to show decimal places (e.g., .00) */
    showDecimal?: boolean;
    /** Custom inline styles for the container */
    style?: CSSProperties;
    /** Fallback text if price is null or invalid */
    fallbackText?: string;
}

/**
 * Price Display Component
 *
 * Formats and displays a numeric price value with currency symbols and customizable styling.
 * Uses a shared formatting utility and inline styles/tokens.
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price = 0, // Default to 0 if undefined
    prefix = "₹",
    showPrefix = true,
    size = "medium",
    fontWeight = "semibold",
    showDecimal = false,
    style,
    fallbackText = "N/A", // Default fallback
    ...rest
}) => {
    // --- Style Calculation ---

    const getFontSize = (): string => {
        switch (size) {
            case "small":
                return tokens.fontSize.base; // 16px
            case "medium":
                return tokens.fontSize.xl; // 20px
            case "large":
                return tokens.fontSize["2xl"]; // 24px
            default:
                return tokens.fontSize.xl;
        }
    };

    const getFontWeight = (): string => {
        switch (fontWeight) {
            case "normal":
                return tokens.fontWeight.normal; // 400
            case "medium":
                return tokens.fontWeight.medium; // 500
            case "semibold":
                return tokens.fontWeight.semibold; // 600
            case "bold":
                return tokens.fontWeight.bold; // 700
            default:
                return tokens.fontWeight.semibold;
        }
    };

    const priceStyle: CSSProperties = {
        fontSize: getFontSize(),
        fontWeight: getFontWeight(),
        fontFamily: tokens.fontFamily.sans, // Use standard sans font
        letterSpacing: "-0.03em", // Common style from Framer examples
        color: tokens.colors.neutral[900], // Default text color
        lineHeight: 1.2, // Prevent excessive line height for large fonts
        ...style,
    };

    // --- Formatting ---

    const isValidPrice = typeof price === 'number' && !isNaN(price);
    const formattedPrice = isValidPrice
        ? formatPriceUtil(price, showDecimal, showPrefix ? prefix : "")
        : fallbackText;

    // --- Render ---

    return (
        <div style={priceStyle} {...rest}>
            {formattedPrice}
        </div>
    );
};

export default PriceDisplay;