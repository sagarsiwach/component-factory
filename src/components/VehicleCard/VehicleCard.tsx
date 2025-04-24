// src/components/VehicleCard/VehicleCard.tsx
import React, { CSSProperties, MouseEventHandler } from "react";
import tokens from "../../styles/tokens"; // Adjust path

// --- Component Props Interface ---

interface VehicleCardProps {
    /** Name of the vehicle */
    vehicleName?: string;
    /** URL of the vehicle image */
    vehicleImage?: string;
    /** Unique code or model identifier for the vehicle */
    vehicleCode?: string;
    /** Formatted price string (e.g., "₹1.9 Lakhs") or other info */
    price?: string;
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
    // Allow other div attributes like data-testid
    [key: string]: any;
}

/**
 * Vehicle Card Component
 *
 * Displays a summary of a vehicle, typically used in a selection list.
 * Includes image, name, code, and selection state styling.
 */
const VehicleCard: React.FC<VehicleCardProps> = ({
    vehicleName = "KM3000",
    vehicleImage = "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM4000_fk2pkn.png", // Default image
    vehicleCode = "B10-0001",
    price = "Price on request", // Keep price prop as string for flexibility
    isSelected = false,
    onClick,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.white, // Default white background
    style,
    ...rest
}) => {
    // --- Styles ---

    const containerStyle: CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: tokens.borderRadius.lg, // Large radius
        border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
        backgroundColor,
        cursor: onClick ? "pointer" : "default", // Pointer only if clickable
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        marginBottom: tokens.spacing[2], // Reduced margin from 5px to token value
        boxShadow: isSelected
            ? `0 0 0 3px ${tokens.colors.blue[400]}` // Focus/selection ring
            : "none",
        overflow: "hidden", // Ensure image corners are clipped
        fontFamily: tokens.fontFamily.sans,
        userSelect: 'none', // Prevent text selection
        ...style,
    };

    const imageContainerStyle: CSSProperties = {
        width: "160px", // Fixed width from Framer
        height: "120px", // Fixed height from Framer
        position: "relative",
        overflow: "hidden",
        flexShrink: 0, // Prevent image container from shrinking
    };

    const imageStyle: CSSProperties = {
        display: 'block', // Remove extra space below image
        width: "100%",
        height: "100%",
        objectFit: "cover", // Cover the container area
        // aspectRatio: "4/3", // Handled by fixed width/height
    };

    const contentStyle: CSSProperties = {
        flex: 1, // Take remaining space
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end", // Align text to the right
        padding: tokens.spacing[5], // Padding for text content
        textAlign: 'right',
    };

    const nameStyle: CSSProperties = {
        fontSize: "30px", // Large font size from Framer
        fontWeight: isSelected
            ? tokens.fontWeight.bold // Bold when selected
            : tokens.fontWeight.semibold, // Semibold otherwise
        letterSpacing: "-0.03em",
        color: isSelected
            ? tokens.colors.blue[700] // Accent color when selected
            : tokens.colors.neutral[900], // Default text color
        marginBottom: tokens.spacing[1],
        lineHeight: 1.1, // Tighten line height for large font
    };

    const codeStyle: CSSProperties = {
        fontSize: "14px",
        fontFamily: tokens.fontFamily.mono, // Monospace font for code
        color: tokens.colors.neutral[500], // Lighter color for code
        marginTop: tokens.spacing[1], // Space between name and code
    };

    // Price display style (optional, as price prop is string)
    const priceStyle: CSSProperties = {
        fontSize: tokens.fontSize.sm,
        color: tokens.colors.neutral[600],
        marginTop: tokens.spacing[2],
        fontWeight: tokens.fontWeight.medium,
    }

    // --- Render ---

    return (
        <div
            style={containerStyle}
            onClick={onClick}
            role={onClick ? "button" : undefined} // Role button if clickable
            tabIndex={onClick ? 0 : undefined} // Make clickable cards focusable
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); } : undefined}
            aria-pressed={onClick ? isSelected : undefined} // Indicate selection state if clickable
            {...rest}
        >
            {/* Image Section */}
            <div style={imageContainerStyle}>
                {vehicleImage ? (
                    <img src={vehicleImage} alt={vehicleName} style={imageStyle} />
                ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.neutral[400] }}>
                        {/* Placeholder for missing image */}
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"></path></svg>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div style={contentStyle}>
                {vehicleName && <div style={nameStyle}>{vehicleName}</div>}
                {vehicleCode && <div style={codeStyle}>{vehicleCode}</div>}
                {/* Optionally display the price string */}
                {/* {price && <div style={priceStyle}>{price}</div>} */}
            </div>
        </div>
    );
};

export default VehicleCard;