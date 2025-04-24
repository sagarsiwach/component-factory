// src/components/SectionTitle/SectionTitle.tsx
import React, { CSSProperties } from "react";
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface SectionTitleProps {
    /** The title text to display */
    title?: string;
    /** Text color */
    color?: string;
    /** Whether to transform the text to uppercase */
    uppercase?: boolean;
    /** HTML heading level (h1-h6) or 'div' */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
    /** Custom inline styles */
    style?: CSSProperties;
}

/**
 * Section Title Component
 *
 * Displays a styled title, typically used to head sections within a form or page.
 * Uses inline styles and tokens.
 */
const SectionTitle: React.FC<SectionTitleProps> = ({
    title = "Section Title",
    color = tokens.colors.neutral[600], // Default neutral color
    uppercase = true,
    as: Component = "div", // Default to 'div' for less semantic impact, allow override
    style,
    ...rest
}) => {
    // --- Styles ---

    const titleStyle: CSSProperties = {
        fontSize: tokens.fontSize.sm, // Small font size
        fontWeight: tokens.fontWeight.medium, // Medium weight
        color,
        textTransform: uppercase ? "uppercase" : "none",
        marginBottom: tokens.spacing[3], // Default bottom margin
        letterSpacing: "0.04em", // From Framer code
        fontFamily: tokens.fontFamily.sans, // Ensure consistent font
        ...style,
    };

    // --- Render ---

    // Use the 'as' prop to render the correct HTML element
    return (
        <Component style={titleStyle} {...rest}>
            {title}
        </Component>
    );
};

export default SectionTitle;