// src/components/Dropdown/Dropdown.tsx
import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    CSSProperties,
    ReactNode,
    useId, // Use React's useId for generating unique IDs
} from "react";
import tokens from "../../styles/tokens"; // Adjust path as needed

// --- Component Props Interface ---

interface DropdownOption {
    label: string;
    value: string | number;
    disabled?: boolean; // Allow disabling specific options
}

interface DropdownProps {
    /** Label text displayed above the dropdown */
    label?: string;
    /** Array of options for the dropdown */
    options?: DropdownOption[];
    /** Currently selected value */
    value?: string | number | null;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /** Callback function triggered when the value changes */
    onChange?: (value: string | number) => void;
    /** Optional description text displayed below the label */
    description?: string;
    /** Error message to display below the dropdown */
    error?: string;
    /** Mark the dropdown as required */
    required?: boolean;
    /** Disable the dropdown */
    disabled?: boolean;
    /** Border color for the trigger */
    borderColor?: string;
    /** Border and shadow color when focused/open */
    focusBorderColor?: string;
    /** Border color when there's an error */
    errorBorderColor?: string;
    /** Color of the label text */
    labelColor?: string;
    /** HTML 'id' attribute for the trigger button */
    id?: string;
    /** HTML 'name' attribute (useful if used in a native form) */
    name?: string;
    /** Custom inline styles for the main container */
    style?: CSSProperties;
    /** Optional icon to display left of the text */
    leftIcon?: ReactNode;
}

// --- Helper Components ---

/** Chevron Icon */
const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0, // Prevent icon from shrinking
            color: tokens.colors.neutral[500], // Use token for color
        }}
        aria-hidden="true"
    >
        <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor" // Inherit color from parent style
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/**
 * Dropdown Component
 *
 * An accessible dropdown/select component using inline styles and tokens.
 * Supports keyboard navigation, error states, and descriptions.
 */
const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
    (
        {
            label,
            options = [],
            value = null, // Use null for no selection
            onChange,
            placeholder = "Select an option",
            description = "",
            error = "",
            required = false,
            disabled = false,
            borderColor = tokens.colors.neutral[300],
            focusBorderColor = tokens.colors.blue[600], // Primary focus color
            errorBorderColor = tokens.colors.red[600],
            labelColor = tokens.colors.neutral[700],
            id,
            name,
            style,
            leftIcon,
            ...rest // Pass other button attributes like aria-label
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        // Store index of highlighted option for keyboard nav
        const [activeIndex, setActiveIndex] = useState<number>(-1);

        const componentId = useId(); // Generate a unique ID prefix
        const uniqueId = id || `dropdown-${componentId}`;
        const listboxId = `${uniqueId}-listbox`;
        const labelId = label ? `${uniqueId}-label` : undefined;
        const descriptionId = description ? `${uniqueId}-description` : undefined;
        const errorId = error ? `${uniqueId}-error` : undefined;
        const hasError = !!error;

        const dropdownRef = useRef<HTMLDivElement>(null);
        const listboxRef = useRef<HTMLUListElement>(null);
        // Use the forwarded ref or create an internal one for the button
        const triggerRefInternal = useRef<HTMLButtonElement>(null);
        const triggerRef = (ref || triggerRefInternal) as React.RefObject<HTMLButtonElement>;


        // --- State and Effects ---

        // Find the selected option object for display text
        const selectedOption = options.find((option) => option.value === value);
        const displayText = selectedOption ? selectedOption.label : placeholder;

        // Close dropdown when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                }
            };
            if (isOpen) {
                document.addEventListener("mousedown", handleClickOutside);
            }
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [isOpen]);

        // Reset active index when opening or options change
        useEffect(() => {
            if (isOpen) {
                const currentSelectedIndex = options.findIndex(opt => opt.value === value);
                // Start at selected item or first non-disabled item
                let initialIndex = currentSelectedIndex >= 0 ? currentSelectedIndex : 0;
                while (options[initialIndex]?.disabled && initialIndex < options.length -1) {
                    initialIndex++;
                }
                if (options[initialIndex]?.disabled) initialIndex = -1; // No non-disabled options?

                setActiveIndex(initialIndex);
            } else {
                setActiveIndex(-1); // Reset when closed
            }
        }, [isOpen, options, value]);


        // Scroll active option into view
        useEffect(() => {
            if (isOpen && activeIndex >= 0 && listboxRef.current) {
                const listElement = listboxRef.current;
                const activeOptionElement = listElement.children[activeIndex] as HTMLElement;
                if (activeOptionElement) {
                     activeOptionElement.scrollIntoView({ block: "nearest" });
                }
            }
        }, [isOpen, activeIndex]);

         // --- Event Handlers ---

        const toggleDropdown = useCallback(() => {
             if (!disabled) {
                 setIsOpen((prevOpen) => !prevOpen);
             }
         }, [disabled]);


        const handleOptionClick = useCallback(
            (optionValue: string | number) => {
                if (onChange) {
                    onChange(optionValue);
                }
                setIsOpen(false); // Close dropdown on selection
                triggerRef.current?.focus(); // Return focus to the button
            },
            [onChange, triggerRef]
        );

        // Find next/previous non-disabled option index
        const findNonDisabledIndex = (startIndex: number, direction: 'down' | 'up'): number => {
            const numOptions = options.length;
            if (numOptions === 0) return -1;

            let currentIndex = startIndex;
            let attempts = 0;

            while (attempts < numOptions) {
                if (direction === 'down') {
                    currentIndex = (currentIndex + 1) % numOptions;
                } else {
                    currentIndex = (currentIndex - 1 + numOptions) % numOptions;
                }

                if (!options[currentIndex]?.disabled) {
                    return currentIndex;
                }
                attempts++;
            }
            return -1; // No non-disabled options found
        };


        // Handle keyboard navigation within trigger and listbox
        const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
            if (disabled) return;

            switch (event.key) {
                case "Enter":
                case " ": // Spacebar
                    event.preventDefault();
                    if (!isOpen) {
                        setIsOpen(true); // Open dropdown
                    } else {
                        // If open and an option is highlighted, select it
                        if (activeIndex >= 0 && activeIndex < options.length) {
                            const selected = options[activeIndex];
                            if (!selected.disabled) {
                                handleOptionClick(selected.value);
                            }
                        } else {
                            setIsOpen(false); // Close if no option selected/highlighted
                        }
                    }
                    break;
                case "Escape":
                    if (isOpen) {
                        event.preventDefault();
                        event.stopPropagation(); // Prevent potential parent handlers
                        setIsOpen(false);
                        triggerRef.current?.focus(); // Return focus
                    }
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    if (!isOpen) setIsOpen(true);
                    setActiveIndex(prev => findNonDisabledIndex(prev, 'down'));
                    break;
                case "ArrowUp":
                    event.preventDefault();
                     if (!isOpen) setIsOpen(true);
                     setActiveIndex(prev => findNonDisabledIndex(prev, 'up'));
                    break;
                 case "Home":
                     event.preventDefault();
                     if (!isOpen) setIsOpen(true);
                     setActiveIndex(findNonDisabledIndex(-1, 'down')); // Find first enabled
                     break;
                 case "End":
                     event.preventDefault();
                      if (!isOpen) setIsOpen(true);
                      setActiveIndex(findNonDisabledIndex(options.length, 'up')); // Find last enabled
                     break;
                // Type-ahead could be added here by tracking key presses
                default:
                    break;
            }
        }, [disabled, isOpen, activeIndex, options, handleOptionClick, triggerRef]);

        // --- Styles ---

        const containerStyle: CSSProperties = {
            display: "flex",
            flexDirection: "column",
            marginBottom: tokens.spacing[4], // Default bottom margin
            width: "100%", // Default to full width
            position: "relative", // For positioning the dropdown menu
            fontFamily: tokens.fontFamily.sans,
            ...style,
        };

        const labelContainerStyle: CSSProperties = {
            marginBottom: tokens.spacing[2],
        };

        const labelStyle: CSSProperties = {
            fontSize: "12px", // Smaller label as per InputField
            fontFamily: tokens.fontFamily.sans,
            fontWeight: tokens.fontWeight.semibold, // Bold label
            letterSpacing: "0.72px", // Uppercase style letter spacing
            textTransform: "uppercase",
            color: hasError ? errorColor : labelColor, // Use error color if error
            display: "block", // Ensure it takes its own line
        };

        const descriptionStyle: CSSProperties = {
            fontSize: tokens.fontSize.xs,
            fontFamily: tokens.fontFamily.sans,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[1], // Space below label
        };

        // Style the trigger button to look like an input
        const dropdownTriggerStyle: CSSProperties = {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "64px", // Match InputField height
            paddingLeft: leftIcon ? tokens.spacing[3] : tokens.spacing[5], // Adjust padding if icon
            paddingRight: tokens.spacing[5],
            borderRadius: tokens.borderRadius.lg, // Match InputField radius
            border: `0.5px solid ${hasError ? errorBorderColor : isOpen ? focusBorderColor : borderColor}`,
            backgroundColor: tokens.colors.neutral[50], // Match InputField background (#FAFAFA)
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.7 : 1,
            boxShadow: isOpen
                ? `0px 0px 0px 3px ${tokens.colors.blue[400]}` // Match InputField focus ring
                : "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            textAlign: 'left', // Ensure text aligns left
            width: '100%',
            outline: 'none', // Remove default button outline
            fontFamily: 'inherit', // Inherit font
            position: 'relative', // For positioning icon/text
            gap: tokens.spacing[3], // Gap between icon and text
        };

        const dropdownValueStyle: CSSProperties = {
            fontSize: "18px", // Match InputField text size
            fontFamily: tokens.fontFamily.sans,
            letterSpacing: "-0.03em",
            color: selectedOption
                ? tokens.colors.neutral[900] // Color for selected value
                : tokens.colors.neutral[400], // Color for placeholder
            flexGrow: 1, // Allow text to take available space
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        };

        const dropdownMenuStyle: CSSProperties = {
            position: "absolute",
            top: "calc(100% + 4px)", // Position below the trigger with a small gap
            left: 0,
            width: "100%",
            maxHeight: "240px", // Limit height and enable scroll
            overflowY: "auto",
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            zIndex: 10, // Ensure it appears above other content
            display: isOpen ? "block" : "none", // Toggle visibility
            listStyle: "none",
            margin: 0,
            padding: tokens.spacing[1], // Small padding around options
            boxSizing: 'border-box',
        };

        const getOptionStyle = (isSelected: boolean, isActive: boolean, isDisabled?: boolean): CSSProperties => ({
            padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            fontSize: tokens.fontSize.base,
            fontFamily: tokens.fontFamily.sans,
            cursor: isDisabled ? "not-allowed" : "pointer",
            backgroundColor: isActive
                ? tokens.colors.neutral[100] // Highlight for active/hover
                : "transparent", // Use transparent default
            color: isDisabled ? tokens.colors.neutral[400] : tokens.colors.neutral[900],
            borderRadius: tokens.borderRadius.DEFAULT, // Rounded corners for options
            marginBottom: tokens.spacing[1], // Space between options
            fontWeight: isSelected ? tokens.fontWeight.medium : tokens.fontWeight.normal,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            outline: 'none', // Remove outline on list items
        });

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
            <div style={containerStyle} ref={dropdownRef} {...rest}>
                {/* Label and Description */}
                <div style={labelContainerStyle}>
                    {label && (
                        <label
                            id={labelId}
                            htmlFor={uniqueId} // Associates label with the button trigger
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

                {/* Trigger Button */}
                <button
                    ref={triggerRef}
                    id={uniqueId}
                    name={name} // Include name if provided
                    type="button" // Explicitly button type
                    style={dropdownTriggerStyle}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-labelledby={labelId} // Reference the label
                    aria-invalid={hasError}
                    aria-required={required}
                    aria-disabled={disabled}
                    aria-describedby={describedBy}
                    aria-errormessage={errorId}
                >
                     {leftIcon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{leftIcon}</span>}
                    <span style={dropdownValueStyle}>{displayText}</span>
                    <ChevronIcon isOpen={isOpen} />
                </button>

                {/* Dropdown Menu (Listbox) */}
                 <ul
                     ref={listboxRef}
                     id={listboxId}
                     role="listbox"
                     aria-labelledby={labelId}
                     tabIndex={-1} // Make listbox programmatically focusable but not via tab
                     style={dropdownMenuStyle}
                     hidden={!isOpen} // Use hidden attribute for better semantics
                 >
                     {options.map((option, index) => (
                         <li
                             key={option.value}
                             id={`${uniqueId}-option-${index}`} // Consistent ID format
                             role="option"
                             aria-selected={option.value === value}
                             aria-disabled={option.disabled}
                             style={getOptionStyle(
                                 option.value === value,
                                 index === activeIndex,
                                 option.disabled
                             )}
                             onClick={() => !option.disabled && handleOptionClick(option.value)}
                             onMouseEnter={() => !option.disabled && setActiveIndex(index)} // Highlight on hover if not disabled
                         >
                             {option.label}
                         </li>
                     ))}
                     {options.length === 0 && (
                         <li style={{...getOptionStyle(false, false, true), textAlign: 'center'}}>
                             No options available
                         </li>
                     )}
                 </ul>


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

Dropdown.displayName = "Dropdown";

export default Dropdown;