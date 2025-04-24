// src/components/LocationSearch/LocationSearch.tsx
import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    CSSProperties,
    FocusEvent,
    ChangeEvent,
    KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import tokens from "../../styles/tokens"; // Adjust path
import { formatLocationString } from "../../utils/formatting"; // Use shared formatter

// --- Types and Interfaces ---

interface LocationResult {
    id: string;
    place_name: string;
    // Add other potential properties from your search results
    [key: string]: any;
}

type LocationStatus = "idle" | "searching" | "success" | "error";

interface LocationSearchProps {
    /** Controlled input value */
    value: string;
    /** Callback for value changes */
    onChange: (value: string) => void; // Simplified onChange
    /** Placeholder text for the input */
    placeholder?: string;
    /** Label for the input field */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Whether to visually show the error */
    showError?: boolean;
    /** Callback function to perform the location search */
    searchLocation: (query: string) => Promise<LocationResult[] | null>;
    /** Callback function to get current location (optional) */
    getCurrentLocation?: () => void;
    /** Whether location services (like getting current location) are enabled */
    enableLocationServices?: boolean;
    /** Custom inline styles for the container */
    style?: CSSProperties;
    /** Input field name */
    name?: string;
    /** Input field id */
    id?: string;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Required flag */
    required?: boolean;
    /** Callback for focus events */
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
     /** Callback for blur events */
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

// --- Location Icon Helper ---

const LocationIcon: React.FC<{ status: LocationStatus }> = ({ status }) => {
    const iconSize = 20;
    const iconColor =
        status === "success"
            ? tokens.colors.green[600]
            : status === "error"
              ? tokens.colors.red[500]
              : tokens.colors.neutral[700]; // Default color

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            height={`${iconSize}px`}
            viewBox="0 -960 960 960"
            width={`${iconSize}px`}
            fill={iconColor}
            animate={status === "searching" ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={
                status === "searching"
                    ? { repeat: Infinity, duration: 1.5, ease: "linear" }
                    : { duration: 0.2 }
            }
            style={{ display: "block" }}
            aria-hidden="true"
        >
            <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z" /> {/* Updated path for standard location pin */}
        </motion.svg>
    );
};


/**
 * Location Search Input Component
 *
 * Provides an input field with location searching capabilities,
 * displaying results in a dropdown portal. Requires a `searchLocation` prop
 * to fetch results and optionally `getCurrentLocation`.
 */
const LocationSearch = React.forwardRef<HTMLInputElement, LocationSearchProps>(
    (
        {
            value,
            onChange,
            placeholder = "Area / Pincode / City",
            label = "Location",
            error = "",
            showError = false,
            searchLocation, // Required prop
            getCurrentLocation,
            enableLocationServices = false,
            style,
            name = "location",
            id,
            disabled = false,
            required = false,
            onFocus,
            onBlur,
            ...rest
        },
        ref
    ) => {
        const [internalStatus, setInternalStatus] = useState<LocationStatus>("idle");
        const [results, setResults] = useState<LocationResult[]>([]);
        const [showResultsDropdown, setShowResultsDropdown] = useState(false);
        const [activeIndex, setActiveIndex] = useState(-1); // For keyboard nav in dropdown
        const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
        const [isFocused, setIsFocused] = useState(false);

        const inputRefInternal = useRef<HTMLInputElement>(null);
        const inputRef = (ref || inputRefInternal) as React.RefObject<HTMLInputElement>; // Use forwarded ref or internal
        const resultsRef = useRef<HTMLDivElement>(null); // Ref for the dropdown list
        const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const isSelectingResult = useRef(false); // Flag to prevent blur hiding dropdown during selection

        const componentId = useId();
        const uniqueId = id || `location-${componentId}`;
        const listboxId = `${uniqueId}-listbox`;
        const labelId = label ? `${uniqueId}-label` : undefined;
        const errorId = error && showError ? `${uniqueId}-error` : undefined;
        const hasError = !!error && showError;

        // --- Portal Setup ---
        useEffect(() => {
            if (typeof document !== "undefined") {
                let container = document.getElementById("location-dropdown-portal");
                if (!container) {
                    container = document.createElement("div");
                    container.id = "location-dropdown-portal";
                    // Basic portal styling (positioning done dynamically)
                    container.style.position = "absolute";
                    container.style.top = "0";
                    container.style.left = "0";
                    container.style.zIndex = "9999"; // High z-index
                    container.style.pointerEvents = "none"; // Don't intercept mouse events by default
                    document.body.appendChild(container);
                }
                setPortalContainer(container);
            }
        }, []);

        // --- Dropdown Positioning ---
        const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

        useEffect(() => {
            const updatePosition = () => {
                if (inputRef.current && portalContainer && showResultsDropdown) {
                    const rect = inputRef.current.getBoundingClientRect();
                    setDropdownPosition({
                        top: rect.bottom + window.scrollY + 4, // Position below input + gap
                        left: rect.left + window.scrollX,
                        width: rect.width,
                    });
                }
            };

            if (showResultsDropdown) {
                 updatePosition(); // Initial position
                 window.addEventListener("resize", updatePosition);
                 window.addEventListener("scroll", updatePosition, true); // Use capture phase for scroll
                 return () => {
                     window.removeEventListener("resize", updatePosition);
                     window.removeEventListener("scroll", updatePosition, true);
                 };
            }
        }, [showResultsDropdown, inputRef, portalContainer]);


        // --- Event Handlers ---

        const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
             setIsFocused(true);
             if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current); // Clear any pending blur timeout
             // Optionally show results if input has value and results exist
             if (value && results.length > 0) {
                setShowResultsDropdown(true);
             }
             if (onFocus) onFocus(event);
        };

        const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
             // If we are not clicking on a result, hide the dropdown after a short delay
             if (!isSelectingResult.current) {
                 blurTimeoutRef.current = setTimeout(() => {
                    setShowResultsDropdown(false);
                 }, 150); // Delay to allow click on result
             }
             isSelectingResult.current = false; // Reset flag after potential click is handled
             if (onBlur) onBlur(event);
        };


        const handleInputChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
             const query = event.target.value;
             onChange(query); // Update parent state

             if (query.length >= 3) {
                 setInternalStatus("searching");
                 setShowResultsDropdown(false); // Hide old results while searching
                 try {
                     const apiResults = await searchLocation(query);
                     if (apiResults && apiResults.length > 0) {
                         setResults(apiResults);
                         setShowResultsDropdown(true);
                         setInternalStatus("idle"); // Or 'success' if needed
                         setActiveIndex(0); // Highlight first result
                     } else {
                         setResults([]);
                         setShowResultsDropdown(false);
                         setInternalStatus("error"); // No results found status
                     }
                 } catch (err) {
                     console.error("Location search failed:", err);
                     setInternalStatus("error");
                     setResults([]);
                     setShowResultsDropdown(false);
                 }
             } else {
                 setResults([]);
                 setShowResultsDropdown(false);
                 setInternalStatus("idle"); // Reset status if query is too short
             }
         }, [onChange, searchLocation]);

        const handleResultSelect = useCallback((feature: LocationResult) => {
             const formattedValue = formatLocationString(feature);
             onChange(formattedValue); // Update parent state with formatted value
             setResults([]); // Clear internal results
             setShowResultsDropdown(false); // Hide dropdown
             setInternalStatus("success"); // Mark as selection success
             inputRef.current?.focus(); // Return focus to input
         }, [onChange, inputRef]);


        const handleResultMouseDown = useCallback((feature: LocationResult) => {
            isSelectingResult.current = true; // Set flag to prevent blur hiding dropdown
            handleResultSelect(feature);
        }, [handleResultSelect]);

        // Keyboard navigation for dropdown results
        const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
            if (!showResultsDropdown || results.length === 0) return;

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setActiveIndex((prev) => (prev + 1) % results.length);
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
                    break;
                 case "Home":
                     event.preventDefault();
                     setActiveIndex(0);
                     break;
                 case "End":
                     event.preventDefault();
                     setActiveIndex(results.length - 1);
                     break;
                case "Enter":
                    event.preventDefault();
                    if (activeIndex >= 0 && activeIndex < results.length) {
                        handleResultSelect(results[activeIndex]);
                    }
                    break;
                case "Escape":
                    event.preventDefault();
                    setShowResultsDropdown(false);
                    break;
                default:
                    break;
            }
        };

        // --- Styles ---

        const containerStyle: CSSProperties = {
            display: "flex",
            flexDirection: "column",
            marginBottom: tokens.spacing[4],
            width: "100%",
            position: "relative", // Needed for dropdown positioning fallback if portal fails
            fontFamily: tokens.fontFamily.sans,
            ...style,
        };

        const labelStyle: CSSProperties = {
             display: "block",
             fontSize: "12px",
             fontWeight: "600",
             color: hasError ? errorColor : tokens.colors.neutral[700],
             textTransform: "uppercase",
             letterSpacing: "0.06em",
             marginBottom: tokens.spacing[2], // Adjusted margin
             fontFamily: "'Geist', sans-serif", // Keep Geist as per Framer
         };


        const inputWrapperStyle: CSSProperties = {
             position: "relative",
             width: "100%",
             height: "64px", // Match InputField
             borderRadius: tokens.borderRadius.lg, // Match InputField
             backgroundColor: tokens.colors.neutral[50],
             border: `0.5px solid ${
                 hasError
                     ? errorBorderColor
                     : isFocused
                       ? focusBorderColor
                       : borderColor
             }`,
             boxShadow:
                 isFocused
                     ? `0px 0px 0px 3px ${tokens.colors.blue[400]}` // Match InputField focus
                     : "none",
             transition: "box-shadow 0.2s, border-color 0.2s",
             display: "flex",
             alignItems: "center",
             paddingRight: '50px', // Space for the icon
             paddingLeft: tokens.spacing[5],
             opacity: disabled ? 0.7 : 1,
         };

        const inputStyle: CSSProperties = {
             width: "100%",
             height: "100%",
             border: "none",
             outline: "none",
             fontSize: "16px", // Slightly smaller than InputField? Let's keep 16px
             letterSpacing: "-0.02em",
             fontFamily: "'Geist', sans-serif",
             fontWeight: value ? "500" : "400",
             color: value
                 ? tokens.colors.neutral[700]
                 : tokens.colors.neutral[400],
             backgroundColor: "transparent",
             padding: 0, // Padding handled by wrapper
         };

        const iconButtonStyle: CSSProperties = {
             position: "absolute",
             right: tokens.spacing[4], // Position inside the input wrapper
             top: "50%",
             transform: "translateY(-50%)",
             cursor:
                 enableLocationServices && internalStatus !== "searching" && !disabled
                     ? "pointer"
                     : "default",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             padding: "5px", // Clickable area
             opacity:
                 enableLocationServices && internalStatus !== "searching" && !disabled
                     ? 1
                     : 0.5,
             border: 'none',
             background: 'none',
         };

        const dropdownListStyle: CSSProperties = {
            position: "absolute", // Will be positioned by effect
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: "240px",
            overflowY: "auto",
            background: tokens.colors.white,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.lg, // Match input border radius
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
            zIndex: 99999, // High z-index
            fontFamily: "'Geist', sans-serif",
            pointerEvents: "auto", // Allow clicks within the portal content
            listStyle: 'none',
            margin: 0,
            padding: tokens.spacing[1], // Padding around options
        };

        const dropdownItemStyle = (isActive: boolean): CSSProperties => ({
            padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            cursor: "pointer",
            color: tokens.colors.neutral[700],
            fontSize: "14px",
            letterSpacing: "-0.02em",
            fontWeight: "400",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "background-color 0.1s ease",
            backgroundColor: isActive
                ? tokens.colors.neutral[100]
                : tokens.colors.white,
            borderRadius: tokens.borderRadius.DEFAULT,
            marginBottom: tokens.spacing[1],
            outline: 'none',
        });

        const errorStyle: CSSProperties = {
             color: errorColor,
             fontSize: "12px",
             margin: "5px 0 0 0",
             fontFamily: "'Geist', sans-serif",
        };

        const requiredIndicatorStyle: CSSProperties = {
            color: hasError ? errorColor : tokens.colors.red[600],
            marginLeft: tokens.spacing[1],
        };

        const errorBorderColor = tokens.colors.red[500]; // Consistent error color
        const focusBorderColor = tokens.colors.blue[500]; // Consistent focus color
        const borderColor = tokens.colors.neutral[700]; // Darker base border? Framer uses 700


        return (
            <div style={containerStyle} {...rest}>
                 {label && (
                     <label htmlFor={uniqueId} id={labelId} style={labelStyle}>
                         {label}
                         {required && !disabled && (
                            <span style={requiredIndicatorStyle} aria-hidden="true"> *</span>
                         )}
                     </label>
                 )}
                 <div style={inputWrapperStyle}>
                     <input
                         ref={inputRef}
                         type="text"
                         name={name}
                         id={uniqueId}
                         placeholder={placeholder}
                         value={value}
                         onChange={handleInputChange}
                         onFocus={handleFocus}
                         onBlur={handleBlur}
                         onKeyDown={handleInputKeyDown}
                         disabled={disabled}
                         required={required}
                         autoComplete="off"
                         style={inputStyle}
                         role="combobox"
                         aria-controls={listboxId}
                         aria-expanded={showResultsDropdown}
                         aria-autocomplete="list"
                         aria-activedescendant={activeIndex >= 0 ? `${uniqueId}-option-${activeIndex}` : undefined}
                         aria-invalid={hasError}
                         aria-errormessage={errorId}
                         aria-labelledby={labelId}
                     />
                     {/* Location Icon / Button */}
                     <button
                        type="button"
                        style={iconButtonStyle}
                        onClick={
                            enableLocationServices && internalStatus !== "searching" && !disabled && getCurrentLocation
                                ? getCurrentLocation
                                : undefined
                        }
                        disabled={!enableLocationServices || internalStatus === "searching" || disabled}
                        title={
                            enableLocationServices
                                ? "Use current location"
                                : "Location services unavailable"
                        }
                        aria-label="Use current location"
                     >
                         <LocationIcon status={internalStatus} />
                     </button>
                 </div>

                {/* Validation Error Message */}
                 {hasError && (
                     <p id={errorId} style={errorStyle} role="alert">
                         {error}
                     </p>
                 )}

                {/* Location Results Dropdown (Portal) */}
                {portalContainer && showResultsDropdown && results.length > 0 &&
                    createPortal(
                        <AnimatePresence>
                            <motion.ul // Use ul for semantic list
                                ref={resultsRef}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                style={dropdownListStyle}
                                role="listbox"
                                id={listboxId}
                                tabIndex={-1} // Not tabbable itself, navigation is via input
                                aria-labelledby={labelId}
                             >
                                {results.map((feature, index) => (
                                    <li
                                        key={feature.id || index}
                                        id={`${uniqueId}-option-${index}`}
                                        role="option"
                                        aria-selected={activeIndex === index}
                                        style={dropdownItemStyle(activeIndex === index)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        // Use onMouseDown to allow blur prevention logic
                                        onMouseDown={() => handleResultMouseDown(feature)}
                                        title={feature.place_name} // Tooltip for long names
                                    >
                                        {feature.place_name}
                                    </li>
                                ))}
                            </motion.ul>
                         </AnimatePresence>,
                         portalContainer
                     )}
            </div>
        );
    }
);

LocationSearch.displayName = "LocationSearch";
export default LocationSearch;