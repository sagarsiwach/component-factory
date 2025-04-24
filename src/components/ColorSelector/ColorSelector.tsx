// src/components/ColorSelector/ColorSelector.tsx
import React, { useState, useEffect, CSSProperties } from "react";
import tokens from "../../styles/tokens"; // Adjust import path

// --- Component Props Interface ---

interface ColorOption {
    id: string | number;
    name: string;
    /** Primary color value (hex, rgb, etc.) */
    value: string;
    /** Optional second color for gradient effects */
    endValue?: string;
}

interface ColorSelectorProps {
    /** Optional label displayed above the selector */
    label?: string;
    /** Array of color options to display */
    colors?: ColorOption[];
    /** The ID of the currently selected color */
    selectedColorId?: string | number | null;
    /** Callback function triggered when a color is selected */
    onChange?: (selectedId: string | number) => void;
    /** Custom inline styles for the main container */
    style?: CSSProperties;
    /** HTML 'id' attribute for associating label */
    id?: string;
}

/**
 * Color Selector Component
 *
 * Displays a set of color options for selection, often used for product variants.
 * Uses inline styles and tokens for consistency. Implements basic accessibility
 * for keyboard navigation and screen readers.
 */
const ColorSelector: React.FC<ColorSelectorProps> = ({
    label,
    colors = [], // Default to empty array
    selectedColorId = null,
    onChange,
    style,
    id,
    ...rest // Pass rest props like data-testid etc.
}) => {
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const uniqueId = id || `color-selector-${React.useId()}`;
    const labelId = label ? `${uniqueId}-label` : undefined;

    // --- Event Handlers ---

    const handleSelect = (colorId: string | number) => {
        if (onChange) {
            onChange(colorId);
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
        index: number
    ) => {
        let newIndex = focusedIndex;

        switch (event.key) {
            case "Enter":
            case " ": // Spacebar
                event.preventDefault();
                if (index >= 0 && index < colors.length) {
                    handleSelect(colors[index].id);
                }
                break;
            case "ArrowRight":
            case "ArrowDown": // Treat down same as right for horizontal layout
                event.preventDefault();
                newIndex = index < colors.length - 1 ? index + 1 : 0; // Loop to start
                break;
            case "ArrowLeft":
            case "ArrowUp": // Treat up same as left
                event.preventDefault();
                newIndex = index > 0 ? index - 1 : colors.length - 1; // Loop to end
                break;
            case "Home":
                 event.preventDefault();
                 newIndex = 0;
                 break;
            case "End":
                 event.preventDefault();
                 newIndex = colors.length - 1;
                 break;
            default:
                return; // Exit if not a navigation key
        }

        if (newIndex !== focusedIndex) {
             setFocusedIndex(newIndex);
             // Focus the newly active element
             const nextElement = document.getElementById(`${uniqueId}-color-${newIndex}`);
             nextElement?.focus();
        }
    };

    // --- Styles ---

    const containerStyle: CSSProperties = {
        marginBottom: tokens.spacing[6],
        ...style,
    };

    const labelStyle: CSSProperties = {
        display: "block", // Make it a block element
        fontSize: tokens.fontSize.sm,
        fontFamily: tokens.fontFamily.sans,
        fontWeight: tokens.fontWeight.medium,
        letterSpacing: "-0.03em",
        color: tokens.colors.neutral[700], // Adjusted color for better contrast potentially
        marginBottom: tokens.spacing[3],
    };

    // Style for displaying the selected color name (optional)
    const selectedColorNameStyle: CSSProperties = {
        fontFamily: tokens.fontFamily.sans,
        fontSize: tokens.fontSize.xl, // From Framer code
        fontWeight: tokens.fontWeight.semibold,
        letterSpacing: "-0.03em",
        color: tokens.colors.neutral[900],
        marginBottom: tokens.spacing[4],
        minHeight: '1.5em', // Prevent layout shift if name disappears
    };


    const colorsContainerStyle: CSSProperties = {
        display: "flex",
        flexWrap: "wrap", // Allow wrapping if many colors
        gap: tokens.spacing[3], // Gap between color options
    };

    const getColorOptionStyle = (
        color: ColorOption,
        isSelected: boolean,
        isFocused: boolean
    ): CSSProperties => {
        // Use the conic gradient from Framer code if endValue exists
        const colorGradient =
            color.endValue
                ? `conic-gradient(from 174.33deg at 46.25% 0%, ${color.endValue} -179.01deg, ${color.value} 180deg, ${color.endValue} 180.99deg, ${color.value} 540deg)`
                : color.value; // Fallback to solid color

        const base: CSSProperties = {
            width: 48, // Using fixed size from Framer code analysis
            height: 48,
            borderRadius: '50%', // Circular options are common
            background: colorGradient,
            cursor: "pointer",
            border: `2px solid transparent`, // Base border
            transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
            position: "relative",
            outline: 'none', // Remove default outline
        };

        const selectedStyle: CSSProperties = isSelected
            ? {
                  borderColor: primaryColor, // Use primary color for selected border
                  transform: "scale(1.1)", // Scale up selected
                  boxShadow: `0 0 0 2px ${tokens.colors.white}, 0 0 0 4px ${primaryColor}`, // Ring effect
              }
            : {};

        // Visible focus style using boxShadow (more robust than outline)
         const focusStyle: CSSProperties = isFocused
             ? {
                   boxShadow: `0 0 0 3px ${tokens.colors.white}, 0 0 0 5px ${tokens.colors.blue[400]}`, // Focus ring
                   zIndex: 1, // Bring focused item above others slightly
               }
             : {};


        return { ...base, ...selectedStyle, ...focusStyle };
    };

    // --- Render ---

    const selectedColor = colors.find((color) => color.id === selectedColorId);
    const selectedColorName = selectedColor ? selectedColor.name : "";
    const primaryColor = tokens.colors.blue[600]; // Define primary color for selection border

    return (
        <div style={containerStyle} {...rest}>
            {label && (
                <label id={labelId} style={labelStyle}>
                    {label}
                </label>
            )}

            {/* Display selected color name if a color is selected */}
            <div style={selectedColorNameStyle}>
                 {selectedColorName || ""} {/* Ensure it's always a string */}
            </div>

            {/* Use div with role="radiogroup" for accessibility */}
            <div
                style={colorsContainerStyle}
                role="radiogroup"
                aria-labelledby={labelId}
                aria-activedescendant={focusedIndex >= 0 ? `${uniqueId}-color-${focusedIndex}` : undefined}
            >
                {colors.map((color, index) => {
                    const isSelected = color.id === selectedColorId;
                    const isFocused = index === focusedIndex;

                    return (
                        <div
                            key={color.id}
                            id={`${uniqueId}-color-${index}`}
                            style={getColorOptionStyle(color, isSelected, isFocused)}
                            onClick={() => handleSelect(color.id)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(-1)} // Reset focus index on blur
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={color.name} // Use name for screen readers
                            tabIndex={0} // Make each option focusable
                            title={color.name} // Tooltip for mouse users
                        />
                    );
                })}
            </div>
            {colors.length === 0 && (
                 <div style={{ fontSize: tokens.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[2] }}>
                     No colors available.
                 </div>
            )}
        </div>
    );
};

export default ColorSelector;