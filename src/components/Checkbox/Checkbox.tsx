// src/components/Checkbox/Checkbox.tsx
import React, { useState, useEffect, CSSProperties, ChangeEvent } from "react";
import tokens from "../../styles/tokens"; // Adjust import path as necessary

// --- Component Props Interface ---

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked' | 'type' | 'style'> {
    /** Label text displayed next to the checkbox */
    label?: React.ReactNode; // Allow complex labels (e.g., with links)
    /** Optional description text displayed below the label */
    description?: string;
    /** Controlled checked state */
    checked?: boolean;
    /** Callback function triggered when the checked state changes */
    onChange?: (checked: boolean) => void;
    /** Error message to display below the checkbox */
    error?: string;
    /** Mark the checkbox as required */
    required?: boolean;
    /** Disable the checkbox */
    disabled?: boolean;
    /** Color of the checkbox when checked */
    checkboxColor?: string;
    /** Color of the border when unchecked */
    borderColor?: string;
    /** Color of the border and label asterisk when there's an error */
    errorColor?: string;
    /** Custom inline styles for the main container */
    style?: CSSProperties;
    /** HTML 'id' attribute for the input element */
    id?: string;
    /** HTML 'name' attribute for the input element */
    name?: string;
}

// --- Checkmark Icon ---

const CheckmarkIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" // Decorative icon
    >
        <path
            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
            stroke="white" // Always white against the colored background
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/**
 * Checkbox Component
 *
 * An accessible checkbox component with custom styling using inline styles
 * based on provided tokens. Supports labels, descriptions, error states,
 * and disabled states.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label = "Checkbox Label",
            description = "",
            checked = false,
            onChange,
            error = "",
            required = false,
            disabled = false,
            checkboxColor = tokens.colors.blue[600],
            borderColor = tokens.colors.neutral[300],
            errorColor = tokens.colors.red[600],
            id,
            name,
            style,
            ...rest // Pass rest props like aria-labelledby, etc.
        },
        ref
    ) => {
        const [internalChecked, setInternalChecked] = useState(checked);
        const uniqueId = id || `checkbox-${React.useId()}`; // Use React's useId for unique IDs
        const descriptionId = description ? `${uniqueId}-description` : undefined;
        const errorId = error ? `${uniqueId}-error` : undefined;
        const hasError = !!error;

        // Sync internal state with prop changes (for controlled component behavior)
        useEffect(() => {
            setInternalChecked(checked);
        }, [checked]);

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;

            const newChecked = event.target.checked;
            setInternalChecked(newChecked); // Update internal state

            if (onChange) {
                onChange(newChecked); // Call the callback prop
            }
        };

        // --- Styles ---

        const containerStyle: CSSProperties = {
            display: "flex",
            alignItems: "flex-start", // Align items to the top
            gap: tokens.spacing[3],
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.7 : 1,
            position: "relative", // For error message positioning
            ...style,
        };

        const checkboxWrapperStyle: CSSProperties = {
            position: "relative", // For absolute positioning of the input
            width: "20px",
            height: "20px",
            flexShrink: 0,
            marginTop: "2px", // Slight adjustment for better vertical alignment with text
        };

        const hiddenInputStyle: CSSProperties = {
            position: "absolute",
            opacity: 0,
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            cursor: "inherit", // Inherit cursor from container
        };

        const customCheckboxStyle: CSSProperties = {
            width: "20px",
            height: "20px",
            border: `1.5px solid ${hasError ? errorColor : internalChecked ? checkboxColor : borderColor}`,
            borderRadius: tokens.borderRadius.DEFAULT,
            backgroundColor: internalChecked ? checkboxColor : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            pointerEvents: "none", // The hidden input handles interaction
        };

        const labelContainerStyle: CSSProperties = {
            display: "flex",
            flexDirection: "column",
            paddingTop: "1px", // Align baseline better with checkbox center
        };

        const labelStyle: CSSProperties = {
            fontSize: tokens.fontSize.sm,
            fontFamily: tokens.fontFamily.sans,
            color: hasError ? errorColor : tokens.colors.neutral[900], // Use error color if error
            lineHeight: tokens.lineHeight.relaxed,
            fontWeight: tokens.fontWeight.light, // As per Framer code
            userSelect: "none", // Prevent text selection on click
        };

        const descriptionStyle: CSSProperties = {
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[1],
        };

        const errorStyle: CSSProperties = {
            color: errorColor,
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            marginTop: tokens.spacing[1], // Spacing below the checkbox+label group
            width: '100%', // Ensure it takes full width below
        };

        const requiredIndicatorStyle: CSSProperties = {
            color: hasError ? errorColor : tokens.colors.red[600], // Use error color if error exists
            marginLeft: tokens.spacing[1],
            fontWeight: tokens.fontWeight.medium,
        };

        // Calculate aria-describedby
        const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

        return (
            <div> {/* Wrap in a div to contain the error message */}
                <div style={containerStyle} onClick={disabled ? undefined : () => hiddenInputRef.current?.click()}>
                    <div style={checkboxWrapperStyle}>
                        <input
                            ref={ref} // Forward ref to the actual input
                            type="checkbox"
                            id={uniqueId}
                            name={name || uniqueId}
                            checked={internalChecked}
                            onChange={handleChange}
                            disabled={disabled}
                            required={required}
                            aria-invalid={hasError}
                            aria-describedby={describedBy}
                            aria-errormessage={errorId}
                            style={hiddenInputStyle}
                            {...rest}
                        />
                        {/* Visual checkbox representation */}
                        <div style={customCheckboxStyle} aria-hidden="true">
                            {internalChecked && <CheckmarkIcon />}
                        </div>
                    </div>
                    {(label || description) && (
                        <div style={labelContainerStyle}>
                            {label && (
                                <label htmlFor={uniqueId} style={labelStyle} onClick={(e) => e.stopPropagation()}> {/* Prevent double trigger */}
                                    {label}
                                    {required && !disabled && (
                                        <span style={requiredIndicatorStyle} aria-hidden="true">
                                            *
                                        </span>
                                    )}
                                </label>
                            )}
                            {description && (
                                <div id={descriptionId} style={descriptionStyle}>
                                    {description}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Error Message */}
                {hasError && (
                     <div id={errorId} style={errorStyle} role="alert">
                        {error}
                     </div>
                 )}
            </div>
        );
    }
);

// Helper ref for clicking the hidden input
const hiddenInputRef = React.createRef<HTMLInputElement>();

Checkbox.displayName = "Checkbox";

export default Checkbox;