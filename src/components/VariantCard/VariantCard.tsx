// src/components/VariantCard/VariantCard.tsx
import React, { CSSProperties, MouseEventHandler } from "react";
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface VariantCardProps {
    /** Main title of the variant */
    title?: string;
    /** Subtitle or secondary information */
    subtitle?: string;
    /** Additional description line */
    description?: string;
    /** Formatted price string (e.g., "+₹999") or empty if included */
    price?: string;
    /** Text displayed when price is empty (e.g., "Included") */
    includedText?: string;
    /** Prefix shown before the price (e.g., "+") */
    pricePrefix?: string; // Note: price prop includes this in Framer code, adjusted here
    /** Whether the card is currently selected */
    isSelected?: boolean;
    /** Callback function triggered when the card is clicked */
    onClick?: MouseEventHandler<HTMLDivElement>;
    /** Border color for the unselected state */
    borderColor?: string;
    /** Border color for the selected state */
    selectedBorderColor?: string;
    /** Background color of the card */
    backgroundColor?: string;
    /** Custom inline styles for the container */
    style?: CSSProperties;
    /** If the variant is mandatory/required (used for styling) */
    isMandatory?: boolean;
    // Allow other div attributes
    [key: string]: any;
}

/**
 * Variant Card Component
 *
 * Displays details about a product variant (e.g., battery size, feature package).
 * Used in selection lists, supports titles, descriptions, price/included text,
 * and selection state styling.
 */
const VariantCard: React.FC<VariantCardProps> = ({
    title = "Standard Variant",
    subtitle = "Details about the variant",
    description = "", // Optional description
    price = "", // Empty string means 'included'
    includedText = "Included",
    pricePrefix = "+", // Framer code had this separate, but price often includes it
    isSelected = false,
    onClick,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.white,
    style,
    isMandatory = false, // Add flag for required/mandatory items
    ...rest
}) => {
    // --- Styles ---

    const containerStyle: CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: tokens.spacing[5], // Consistent padding
        borderRadius: tokens.borderRadius.lg, // Consistent radius
        border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
        backgroundColor,
        cursor: onClick && !isMandatory ? "pointer" : "default", // Pointer only if clickable and not mandatory
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
        marginBottom: tokens.spacing[2], // Consistent margin
        boxShadow: isSelected
            ? `0 0 0 3px ${tokens.colors.blue[400]}` // Selection ring
            : "none",
        fontFamily: tokens.fontFamily.sans,
        userSelect: 'none',
        opacity: isMandatory ? 0.8 : 1, // Dim mandatory items slightly if needed
        ...style,
    };

    const contentStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing[2], // Consistent gap for text elements
        marginRight: tokens.spacing[4], // Space between text and price
    };

    const titleStyle: CSSProperties = {
        fontSize: tokens.fontSize.xl, // Use XL size from Framer (24px)
        fontWeight: tokens.fontWeight.semibold,
        letterSpacing: "-0.03em",
        color: isSelected
            ? tokens.colors.blue[700] // Accent color when selected
            : tokens.colors.neutral[900],
        lineHeight: 1.2,
    };

    const subtitleStyle: CSSProperties = {
        fontSize: tokens.fontSize.base, // Use base size (16px)
        fontWeight: tokens.fontWeight.medium,
        letterSpacing: "-0.03em", // Consistent spacing
        color: tokens.colors.neutral[500], // Lighter color
        lineHeight: 1.4,
    };

    const descriptionStyle: CSSProperties = {
        fontSize: tokens.fontSize.sm, // Smaller size for description
        fontWeight: tokens.fontWeight.normal,
        letterSpacing: "-0.03em",
        color: tokens.colors.neutral[500],
        lineHeight: 1.4,
    };

    const priceContainerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column", // Stack price/included text
        alignItems: 'flex-end', // Align to the right
        textAlign: 'right',
        fontSize: tokens.fontSize.lg, // Slightly larger price text
        fontWeight: tokens.fontWeight.medium,
        letterSpacing: "-0.03em",
        color: isSelected ? primaryColor : tokens.colors.neutral[700], // Use primary color for price when selected
        flexShrink: 0, // Prevent price from shrinking
    };

    const includedTextStyle: CSSProperties = {
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.medium,
        color: isSelected ? primaryColor : tokens.colors.green[700], // Green for included? Or neutral?
    };

    // --- Render ---
    const primaryColor = tokens.colors.blue[600]; // Define primary color

    // Determine what to display in the price area
    const priceDisplayContent = price ? (
        // If price exists, show it (assuming prefix might be part of price string)
        <span>{price}</span>
    ) : isMandatory ? (
         <span style={{...includedTextStyle, color: tokens.colors.neutral[600]}}>Mandatory</span>
    ) : (
        // If no price, show included text
        <span style={includedTextStyle}>{includedText}</span>
    );

    return (
        <div
            style={containerStyle}
            onClick={!isMandatory ? onClick : undefined} // Only allow click if not mandatory
            role={onClick && !isMandatory ? "button" : undefined}
            tabIndex={onClick && !isMandatory ? 0 : undefined}
            onKeyDown={onClick && !isMandatory ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); } : undefined}
            aria-pressed={onClick && !isMandatory ? isSelected : undefined}
            {...rest}
        >
            {/* Left side: Title, Subtitle, Description */}
            <div style={contentStyle}>
                {title && <div style={titleStyle}>{title}</div>}
                {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
                {description && <div style={descriptionStyle}>{description}</div>}
            </div>

            {/* Right side: Price or Included Text */}
            <div style={priceContainerStyle}>
                {priceDisplayContent}
            </div>
        </div>
    );
};

export default VariantCard;