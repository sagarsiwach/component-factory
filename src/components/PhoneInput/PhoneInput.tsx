// src/components/PhoneInput/PhoneInput.tsx
import React, { useState, useEffect, CSSProperties, ChangeEvent, FocusEvent } from "react";
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus' | 'onBlur' | 'style' | 'value' | 'defaultValue' | 'type' | 'maxLength'> {
    /** Label text displayed above the input */
    label?: string;
    /** Placeholder text shown inside the input when empty (via floating label) */
    placeholder?: string;
    /** Country code prefix (e.g., +91) */
    countryCode?: string;
    /** Controlled value of the phone number (digits only) */
    value?: string;
    /** Default value (uncontrolled mode, digits only) */
    defaultValue?: string;
    /** Callback function triggered on input value change (passes digits only) */
    onChange?: (value: string) => void;
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
    readOnly?: boolean; // Added readOnly prop
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
    /** Maximum length of the phone number (excluding country code) */
    maxLength?: number; // Default to 10 for India
    /** Custom inline styles for the main container */
    style?: CSSProperties;
    /** HTML 'id' attribute */
    id?: string;
    /** HTML 'name' attribute */
    name?: string;
    /** HTML 'autocomplete' attribute */
    autocomplete?: string;
}


/**
 * Phone Input Component
 *
 * Provides an input field specifically for phone numbers, often with a fixed
 * country code prefix. Uses inline styles and tokens, similar to InputField.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    (
        {
            label = "Mobile Number",
            placeholder = "Phone number",
            countryCode = "+91",
            value: controlledValue,
            defaultValue,
            onChange,
            onFocus,
            onBlur,
            error = "",
            description = "",
            required = false,
            disabled = false,
            readOnly = false,
            borderColor = tokens.colors.neutral[300],
            focusBorderColor = tokens.colors.blue[600],
            errorBorderColor = tokens.colors.red[600],
            labelColor = tokens.colors.neutral[700], // Use darker label from InputField
            placeholderColor = tokens.colors.neutral[400],
            backgroundColor = tokens.colors.neutral[50], // Match InputField background
            maxLength = 10, // Default for India
            style,
            id,
            name,
            autocomplete = "tel", // Default autocomplete for phone
            ...rest
        },
        ref
    ) => {
        const isControlled = controlledValue !== undefined;
        const [internalValue, setInternalValue] = useState(() => {
            const initial = defaultValue ?? controlledValue ?? "";
            return initial.replace(/\D/g, ""); // Store only digits internally
        });
        const [isFocused, setIsFocused] = useState(false);

        const componentId = useId(); // Generate unique ID prefix
        const uniqueId = id || `phone-${componentId}`;
        const labelId = label ? `${uniqueId}-label` : undefined;
        const descriptionId = description ? `${uniqueId}-description` : undefined;
        const errorId = error ? `${uniqueId}-error` : undefined;
        const hasError = !!error;

        // Sync state if controlled value changes
        useEffect(() => {
            if (isControlled) {
                setInternalValue((controlledValue ?? "").replace(/\D/g, ""));
            }
        }, [controlledValue, isControlled]);

        const currentValue = isControlled ? (controlledValue ?? "").replace(/\D/g, "") : internalValue;
        const showFloatingLabel = !isFocused && !currentValue;

        // --- Event Handlers ---

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
            // Allow only digits and respect maxLength
            const newValue = event.target.value.replace(/\D/g, "");
            if (maxLength && newValue.length > maxLength) {
                return; // Prevent exceeding max length
            }

            if (!isControlled) {
                setInternalValue(newValue);
            }
            if (onChange) {
                onChange(newValue); // Pass only digits
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
            marginBottom: tokens.spacing[4],
            width: "100%",
            fontFamily: tokens.fontFamily.sans,
            ...style,
        };

        const labelContainerStyle: CSSProperties = {
            marginBottom: tokens.spacing[2],
            minHeight: '1.5em',
        };

        const labelStyle: CSSProperties = {
            fontSize: "12px",
            fontFamily: tokens.fontFamily.sans,
            fontWeight: tokens.fontWeight.semibold,
            letterSpacing: "0.72px",
            textTransform: "uppercase",
            color: hasError ? errorColor : labelColor,
            display: "block",
        };

        const descriptionStyle: CSSProperties = {
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[1],
        };

        const inputWrapperStyle: CSSProperties = {
            display: "flex",
            alignItems: "center", // Vertically align items
            height: "64px", // Fixed height from Framer
            borderRadius: tokens.borderRadius.lg,
            border: `0.5px solid ${hasError ? errorBorderColor : isFocused ? focusBorderColor : borderColor}`,
            backgroundColor,
            boxShadow: isFocused
                ? `0px 0px 0px 3px ${tokens.colors.blue[400]}`
                : "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            opacity: disabled ? 0.7 : 1,
            overflow: "hidden", // Clip children to rounded border
        };

        const countryCodeStyle: CSSProperties = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `0 ${tokens.spacing[4]}`,
            height: "100%", // Fill height
            backgroundColor: tokens.colors.neutral[100], // Slightly different background
            color: tokens.colors.neutral[900],
            fontWeight: tokens.fontWeight.medium,
            fontSize: "18px", // Match input size
            fontFamily: tokens.fontFamily.sans,
            borderRight: `1px solid ${borderColor}`, // Separator line
            flexShrink: 0, // Prevent shrinking
            userSelect: 'none', // Not selectable
        };

        const inputContainerStyle: CSSProperties = {
             position: 'relative',
             flexGrow: 1,
             height: '100%',
             display: 'flex', // Needed for placeholder positioning
             alignItems: 'center',
             paddingLeft: tokens.spacing[5], // Padding for the input text
             paddingRight: tokens.spacing[5],
        };


        const inputStyle: CSSProperties = {
             width: "100%",
             height: "auto", // Let wrapper control height via align-items
             border: "none",
             outline: "none",
             backgroundColor: "transparent", // Inherit from wrapper
             fontSize: "18px",
             fontFamily: tokens.fontFamily.sans,
             letterSpacing: "-0.03em",
             color: tokens.colors.neutral[900],
             padding: 0, // Remove default padding
             appearance: 'none',
             WebkitAppearance: 'none',
             MozAppearance: 'textfield',
         };


        const floatingLabelStyle: CSSProperties = {
             position: "absolute",
             left: tokens.spacing[5], // Position relative to inputContainerStyle padding
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
             maxWidth: `calc(100% - ${tokens.spacing[2]})`, // Prevent overflow
         };


        const errorStyle: CSSProperties = {
            color: errorColor,
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            marginTop: tokens.spacing[1],
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
                    {countryCode && (
                        <div style={countryCodeStyle} aria-hidden="true">
                            {countryCode}
                        </div>
                    )}
                    <div style={inputContainerStyle}>
                        <input
                            ref={ref}
                            id={uniqueId}
                            type="tel" // Use 'tel' type
                            inputMode="numeric" // Hint for mobile keyboards
                            pattern="[0-9]*" // Allow only digits
                            name={name || uniqueId}
                            value={currentValue}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            disabled={disabled}
                            readOnly={readOnly}
                            required={required}
                            maxLength={maxLength}
                            autoComplete={autocomplete}
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

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;