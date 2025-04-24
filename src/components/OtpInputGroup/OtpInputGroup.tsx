// src/components/OTPInputGroup/OTPInputGroup.tsx
import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    CSSProperties,
    ChangeEvent,
    KeyboardEvent,
    ClipboardEvent,
    useId,
} from "react";
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface OTPInputGroupProps {
    /** The current OTP value (controlled) */
    value?: string;
    /** Number of OTP input fields */
    length?: number;
    /** Callback function when the OTP value changes */
    onChange?: (otp: string) => void;
    /** Automatically focus the first input on mount */
    autoFocus?: boolean;
    /** Error message to display below the inputs */
    error?: string;
    /** Border color for inactive inputs */
    borderColor?: string;
    /** Border and shadow color for the active input */
    focusBorderColor?: string;
    /** Border color when there's an error */
    errorBorderColor?: string;
    /** Base ID for the input group elements */
    id?: string;
    /** Custom inline styles for the container div */
    style?: CSSProperties;
    /** Should the input be disabled */
    disabled?: boolean;
}

/**
 * OTP Input Group Component
 *
 * Provides a series of input fields for entering a One-Time Password (OTP).
 * Handles input, deletion, pasting, and keyboard navigation between fields.
 */
const OTPInputGroup: React.FC<OTPInputGroupProps> = ({
    value = "",
    length = 6,
    onChange,
    autoFocus = false, // Default to false, parent usually controls focus
    error = "",
    borderColor = tokens.colors.neutral[300],
    focusBorderColor = tokens.colors.blue[600],
    errorBorderColor = tokens.colors.red[600],
    id,
    style,
    disabled = false,
    ...rest
}) => {
    const [otpValues, setOtpValues] = useState<string[]>(() =>
        Array(length).fill("")
    );
    const [activeIndex, setActiveIndex] = useState<number>(autoFocus ? 0 : -1); // Track focused input index

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const componentId = useId(); // Generate unique ID prefix
    const uniqueId = id || `otp-${componentId}`;
    const errorId = error ? `${uniqueId}-error` : undefined;
    const hasError = !!error;

    // --- Effects ---

    // Initialize/Sync OTP values when the value prop changes
    useEffect(() => {
        const propValueArray = value.split("").slice(0, length);
        const newOtpValues = Array(length).fill("");
        propValueArray.forEach((char, index) => {
            if (/^\d$/.test(char)) { // Only fill with digits
                newOtpValues[index] = char;
            }
        });
        setOtpValues(newOtpValues);
    }, [value, length]);

    // Focus the first input on mount if autoFocus is true
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
            setActiveIndex(0);
        }
        // Ensure refs array has correct length
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [autoFocus, length]);

    // --- Event Handlers ---

    const handleChange = useCallback((index: number, inputValue: string) => {
         if (disabled) return;

         // Allow only single digit
         const digit = inputValue.match(/\d$/)?.[0] || ""; // Get last digit entered

         const newOtpValues = [...otpValues];
         newOtpValues[index] = digit;
         setOtpValues(newOtpValues);

         // Notify parent of the complete OTP string
         if (onChange) {
             onChange(newOtpValues.join(""));
         }

         // Auto-move focus to the next input if a digit was entered
         if (digit && index < length - 1) {
             inputRefs.current[index + 1]?.focus();
             // setActiveIndex(index + 1); // Focus handler will set active index
         }
     }, [otpValues, length, onChange, disabled]);


    const handleFocus = useCallback((index: number) => {
        setActiveIndex(index);
        // Select text in the input on focus for easier replacement
        inputRefs.current[index]?.select();
    }, []);

    const handleKeyDown = useCallback((index: number, event: KeyboardEvent<HTMLInputElement>) => {
         if (disabled) return;

         switch (event.key) {
             case "Backspace":
                 event.preventDefault();
                 if (otpValues[index]) {
                     // If current input has value, clear it and stay
                     const newOtpValues = [...otpValues];
                     newOtpValues[index] = "";
                     setOtpValues(newOtpValues);
                     if (onChange) onChange(newOtpValues.join(""));
                 } else if (index > 0) {
                     // If current input is empty, move focus to previous input
                     inputRefs.current[index - 1]?.focus();
                     // setActiveIndex(index - 1); // Focus handler sets active index
                 }
                 break;

             case "Delete": // Handle Delete key similarly to Backspace but without moving focus back
                 event.preventDefault();
                 if (otpValues[index]) {
                     const newOtpValues = [...otpValues];
                     newOtpValues[index] = "";
                     setOtpValues(newOtpValues);
                     if (onChange) onChange(newOtpValues.join(""));
                     // Keep focus on the current input
                 }
                 break;

             case "ArrowLeft":
                 event.preventDefault();
                 if (index > 0) {
                     inputRefs.current[index - 1]?.focus();
                     // setActiveIndex(index - 1);
                 }
                 break;

             case "ArrowRight":
                 event.preventDefault();
                 if (index < length - 1) {
                     inputRefs.current[index + 1]?.focus();
                    // setActiveIndex(index + 1);
                 }
                 break;

             case "Home":
                 event.preventDefault();
                 inputRefs.current[0]?.focus();
                 // setActiveIndex(0);
                 break;

             case "End":
                 event.preventDefault();
                 inputRefs.current[length - 1]?.focus();
                 // setActiveIndex(length - 1);
                 break;

             default:
                 // Allow digit input (handled by onChange)
                 if (!/^\d$/.test(event.key) && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                    event.preventDefault(); // Prevent non-digit characters
                 }
                 break;
         }
     }, [otpValues, length, onChange, disabled]);


    const handlePaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
         if (disabled) return;
         event.preventDefault();
         const pastedData = event.clipboardData.getData("text/plain").trim();
         const digits = pastedData.replace(/\D/g, "").split(""); // Get only digits

         if (digits.length > 0) {
             const newOtpValues = [...otpValues];
             let currentInputIndex = activeIndex >= 0 ? activeIndex : 0; // Start pasting from focused or first input
             let digitsPasted = 0;

             while (currentInputIndex < length && digitsPasted < digits.length) {
                 newOtpValues[currentInputIndex] = digits[digitsPasted];
                 digitsPasted++;
                 currentInputIndex++;
             }

             setOtpValues(newOtpValues);

             // Focus the next empty input or the last pasted input
             const focusIndex = Math.min(currentInputIndex, length - 1);
             inputRefs.current[focusIndex]?.focus();
             // setActiveIndex(focusIndex);

             // Notify parent of the complete OTP string
             if (onChange) {
                 onChange(newOtpValues.join(""));
             }
         }
     }, [activeIndex, length, otpValues, onChange, disabled]);


    // --- Styles ---

    const containerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center the group horizontally
        ...style,
    };

    const inputsWrapperStyle: CSSProperties = {
        display: "flex",
        gap: tokens.spacing[2], // Gap between inputs
        justifyContent: "center",
        width: '100%',
    };

    const getInputStyle = (index: number): CSSProperties => ({
        width: "40px", // Fixed width from Framer
        height: "48px", // Fixed height from Framer
        fontSize: tokens.fontSize.xl,
        textAlign: "center",
        border: `1.5px solid ${
            hasError
                ? errorBorderColor
                : activeIndex === index
                  ? focusBorderColor
                  : borderColor
        }`,
        borderRadius: tokens.borderRadius.DEFAULT, // Consistent radius
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow:
            activeIndex === index
                ? `0px 0px 0px 2px ${tokens.colors.blue[300]}` // Focus ring similar to Framer
                : "none",
        caretColor: focusBorderColor, // Make caret visible
        fontFamily: tokens.fontFamily.sans, // Ensure consistent font
        padding: 0, // Remove default padding
        appearance: 'textfield', // Better behavior for number-like inputs
        MozAppearance: 'textfield',
        WebkitAppearance: 'none', // Remove spinners in WebKit
        opacity: disabled ? 0.7 : 1,
    });

    const errorStyle: CSSProperties = {
        color: errorBorderColor,
        fontSize: tokens.fontSize.sm,
        marginTop: tokens.spacing[2], // Space above error
        textAlign: "center",
        fontFamily: tokens.fontFamily.sans,
        width: '100%', // Ensure error message spans below the inputs
    };

    // --- Render ---

    return (
        <div style={containerStyle} {...rest}>
            <div
                style={inputsWrapperStyle}
                onPaste={handlePaste}
                role="group"
                aria-labelledby={`${uniqueId}-label`} // Assuming a label exists elsewhere
                aria-describedby={errorId}
            >
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text" // Use text for better control, pattern enforces digits
                        inputMode="numeric" // Hint for mobile keyboards
                        pattern="[0-9]*" // Allow only numbers via pattern
                        maxLength={1} // Each input holds one digit
                        value={otpValues[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onFocus={() => handleFocus(index)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        style={getInputStyle(index)}
                        aria-label={`Digit ${index + 1} of ${length}`}
                        id={`${uniqueId}-input-${index}`}
                        autoComplete={index === 0 ? "one-time-code" : "off"} // Help password managers
                        disabled={disabled}
                    />
                ))}
            </div>

            {hasError && (
                <div id={errorId} style={errorStyle} role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

export default OTPInputGroup;