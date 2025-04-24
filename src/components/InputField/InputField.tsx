// src/components/InputField/InputField.tsx
import React, { useState, useEffect, CSSProperties, ChangeEvent, FocusEvent } from "react";
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus' | 'onBlur' | 'style' | 'value' | 'defaultValue'> {
    /** Label text displayed above the input */
    label?: string;
    /** Placeholder text shown inside the input when empty (via floating label) */
    placeholder?: string;
    /** Input type attribute (text, email, password, etc.) */
    type?: React.HTMLInputTypeAttribute;
    /** Controlled value of the input */
    value?: string | number;
    /** Default value (uncontrolled mode) */
    defaultValue?: string | number;
    /** Callback function triggered on input value change */
    onChange?: (value: string) => void; // Pass only the value
    /** Callback function triggered on input focus */
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    /** Callback function triggered on input blur */
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    /** Error message to display below the input */
    error?: string;
    /** Optional description text displayed below the label */
    description?: string;
    /** Mark the input as required */
    required?: boolean;
    /** Disable the input */
    disabled?: boolean;
    /** Make the input read-only */
    readOnly?: boolean;
    /** Automatically focus the input on mount */
    autoFocus?: boolean;
    /** Border color */
    borderColor?: string;
    /** Border and shadow color on focus */
    focusBorderColor?: string;
    /** Border color on error */
    errorBorderColor?: string;
    /** Color of the label text */
    labelColor?: string;
    /** Color of the placeholder/floating label */
    placeholderColor?: string;
    /** Background color of the input */
    backgroundColor?: string;
    /** Custom inline styles for the main container */
    style?: CSSProperties;
    /** HTML 'id' attribute */
    id?: string;
    /** HTML 'name' attribute */
    name?: string;
    /** HTML 'autocomplete' attribute */
    autocomplete?: string;
    /** Maximum input length */
    maxLength?: number;
    /** Minimum input length */
    minLength?: number;
    /** Input regex pattern */
    pattern?: string;
    /** Optional icon to display left of the input text */
    leftIcon?: React.ReactNode;
    /** Optional icon or element to display right of the input text */
    rightElement?: React.ReactNode; // More flexible than just icon
}


/**
 * Input Field Component
 *
 * An accessible text input component with custom styling, floating label effect,
 * error/description display, and support for icons. Uses inline styles and tokens.
 */
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    (
        {
            label,
            placeholder = "Enter value",
            type = "text",
            value: controlledValue, // Rename to avoid conflict with internal state
            defaultValue,
            onChange,
            onFocus,
            onBlur,
            error = "",
            description = "",
            required = false,
            disabled = false,
            readOnly = false,
            autoFocus = false,
            borderColor = tokens.colors.neutral[300],
            focusBorderColor = tokens.colors.blue[600],
            errorBorderColor = tokens.colors.red[600],
            labelColor = tokens.colors.neutral[700], // Darker label
            placeholderColor = tokens.colors.neutral[400],
            backgroundColor = tokens.colors.neutral[50], // Default to #FAFAFA
            style,
            id,
            name,
            autocomplete,
            maxLength,
            minLength,
            pattern,
            leftIcon,
            rightElement,
            ...rest
        },
        ref
    ) => {
        const isControlled = controlledValue !== undefined;
        const [internalValue, setInternalValue] = useState(defaultValue ?? controlledValue ?? "");
        const [isFocused, setIsFocused] = useState(false);

        const componentId = useId(); // Generate unique ID prefix
        const uniqueId = id || `input-${componentId}`;
        const labelId = label ? `${uniqueId}-label` : undefined;
        const descriptionId = description ? `${uniqueId}-description` : undefined;
        const errorId = error ? `${uniqueId}-error` : undefined;
        const hasError = !!error;

        // Sync state if controlled value changes
        useEffect(() => {
            if (isControlled) {
                setInternalValue(controlledValue ?? "");
            }
        }, [controlledValue, isControlled]);

        const currentValue = isControlled ? controlledValue ?? "" : internalValue;
        const showFloatingLabel = !isFocused && !currentValue; // Show placeholder only when empty and not focused

        // --- Event Handlers ---

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            if (!isControlled) {
                setInternalValue(newValue);
            }
            if (onChange) {
                onChange(newValue); // Pass the string value
            }
        };

        const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            if (onFocus) {
                onFocus(event);
            }
        };

        const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            if (onBlur) {
                onBlur(event);
            }
        };

        // --- Styles ---

        const containerStyle: CSSProperties = {
            display: "flex",
            flexDirection: "column",
            marginBottom: tokens.spacing[4], // Default bottom margin
            width: "100%", // Default to full width
            position: "relative", // For error message positioning if needed
            fontFamily: tokens.fontFamily.sans,
            ...style,
        };

        const labelContainerStyle: CSSProperties = {
            marginBottom: tokens.spacing[2], // Space between label and input box
            minHeight: '1.5em', // Reserve space even if no label/description
        };

        const labelStyle: CSSProperties = {
            fontSize: "12px",
            fontFamily: tokens.fontFamily.sans,
            fontWeight: tokens.fontWeight.semibold,
            letterSpacing: "0.72px", // From Framer
            textTransform: "uppercase",
            color: hasError ? errorColor : labelColor,
            display: "block", // Ensure it takes its own line
        };

        const descriptionStyle: CSSProperties = {
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[1], // Space below label
        };

        const inputWrapperStyle: CSSProperties = {
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "64px", // Fixed height from Framer
            borderRadius: tokens.borderRadius.lg,
            border: `0.5px solid ${hasError ? errorBorderColor : isFocused ? focusBorderColor : borderColor}`,
            backgroundColor,
            boxShadow: isFocused
                ? `0px 0px 0px 3px ${tokens.colors.blue[400]}` // Adjusted alpha/color from Framer
                : "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            opacity: disabled ? 0.7 : 1,
            paddingLeft: leftIcon ? tokens.spacing[3] : tokens.spacing[5],
            paddingRight: rightElement ? tokens.spacing[3] : tokens.spacing[5],
            gap: tokens.spacing[3], // Gap between icon and input
        };

        const iconStyle: CSSProperties = {
             display: 'flex',
             alignItems: 'center',
             flexShrink: 0,
             color: tokens.colors.neutral[500], // Default icon color
        };


        const inputStyle: CSSProperties = {
            flexGrow: 1, // Take remaining space
            width: '100%', // Needed for flexGrow to work well
            height: "100%", // Fill the wrapper height
            border: "none",
            outline: "none",
            backgroundColor: "transparent", // Inherit from wrapper
            fontSize: "18px", // From Framer
            fontFamily: tokens.fontFamily.sans,
            letterSpacing: "-0.03em", // From Framer
            color: tokens.colors.neutral[900], // Text color
            padding: 0, // Remove default padding, handled by wrapper
            appearance: 'none', // Remove platform-specific styling
            WebkitAppearance: 'none',
            MozAppearance: 'textfield', // For number inputs
        };

        const floatingLabelStyle: CSSProperties = {
            position: "absolute",
            // Adjust left based on whether there's a left icon
            left: leftIcon ? `calc(${tokens.spacing[3]} + 20px + ${tokens.spacing[3]})` : tokens.spacing[5], // Approx icon width + gap
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: placeholderColor,
            fontSize: "18px", // Match input font size
            fontFamily: tokens.fontFamily.sans,
            transition: "opacity 0.2s ease",
            opacity: showFloatingLabel ? 1 : 0, // Control visibility
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: `calc(100% - ${tokens.spacing[5]} * 2)`, // Prevent overlap with borders/icons
        };

        const errorStyle: CSSProperties = {
            color: errorColor,
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            marginTop: tokens.spacing[1], // Space below input wrapper
        };

        const requiredIndicatorStyle: CSSProperties = {
             color: hasError ? errorColor : tokens.colors.red[600],
             marginLeft: tokens.spacing[1],
             fontWeight: tokens.fontWeight.medium,
         };

        // Calculate aria-describedby
        const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

        return (
            <div style={containerStyle}>
                {/* Label and Description */}
                <div style={labelContainerStyle}>
                     {label && (
                         <label
                             id={labelId}
                             htmlFor={uniqueId}
                             style={labelStyle}
                         >
                             {label}
                             {required && !disabled && (
                                 <span style={requiredIndicatorStyle} aria-hidden="true"> *</span>
                             )}
                         </label>
                     )}
                     {description && (
                         <div id={descriptionId} style={descriptionStyle}>
                             {description}
                         </div>
                     )}
                 </div>

                {/* Input Wrapper */}
                <div style={inputWrapperStyle}>
                    {leftIcon && <span style={iconStyle}>{leftIcon}</span>}
                    <div style={{ position: 'relative', flexGrow: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
                        <input
                            ref={ref}
                            id={uniqueId}
                            type={type}
                            name={name || uniqueId}
                            value={currentValue}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            disabled={disabled}
                            readOnly={readOnly}
                            required={required}
                            maxLength={maxLength}
                            minLength={minLength}
                            pattern={pattern}
                            autoComplete={autocomplete}
                            autoFocus={autoFocus}
                            aria-invalid={hasError}
                            aria-labelledby={labelId}
                            aria-describedby={describedBy}
                            aria-errormessage={errorId}
                            placeholder={isFocused ? placeholder : undefined} // Show native placeholder only when focused
                            style={inputStyle}
                            {...rest}
                        />
                        {/* Floating Label / Placeholder Text */}
                        <div style={floatingLabelStyle} aria-hidden="true">
                            {placeholder}
                        </div>
                    </div>
                     {rightElement && <span style={iconStyle}>{rightElement}</span>}
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

InputField.displayName = "InputField";

export default InputField;