// src/features/Navigation/NavigationContainer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Keep for potential top-level animations if needed

// Import child components
import NavBar, { DesktopNavItemData } from './components/NavBar';
import MobileMenu, { MobileNavItemData } from './components/MobileMenu';
import DesktopDropdown, { DropdownItem, MoreDropdownItem } from './components/DesktopDropdown';

// Import Types
type AnyDropdownItem = DropdownItem | MoreDropdownItem;

// --- Interfaces for Props (Define the data structures expected) ---
interface NavigationContainerProps {
    logoColor?: string; // Pass down to NavBar
    initialActiveItem?: string; // Label of initially active item
    showDropdowns?: boolean; // Toggle dropdowns globally
    desktopMenuItems: DesktopNavItemData[];
    mobileMenuItems: MobileNavItemData[];
    motorbikesDropdownItems: DropdownItem[];
    scootersDropdownItems: DropdownItem[];
    moreDropdownItems: MoreDropdownItem[];
    // Add any other props needed, e.g., functions for actual navigation/routing
    onNavigate?: (url: string) => void;
}

// --- Hook for Responsive Check (Example using ResizeObserver) ---
const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

        // Set initial state
        setMatches(mediaQueryList.matches);

        // Use addEventListener for modern browsers
        mediaQueryList.addEventListener('change', listener);

        // Cleanup
        return () => mediaQueryList.removeEventListener('change', listener);
    }, [query]);

    return matches;
};


export const NavigationContainer: React.FC<NavigationContainerProps> = ({
    logoColor, // Pass down
    initialActiveItem = "",
    showDropdowns = true,
    desktopMenuItems = [], // Default to empty arrays
    mobileMenuItems = [],
    motorbikesDropdownItems = [],
    scootersDropdownItems = [],
    moreDropdownItems = [],
    onNavigate = (url) => console.log(`Simulating navigation to: ${url}`), // Default log action
}) => {

    // State Management
    const isMobile = useMediaQuery("(max-width: 1023px)"); // Tailwind's lg breakpoint is 1024px
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(""); // Label of mobile submenu
    const [submenuItems, setSubmenuItems] = useState<MobileNavItemData[]>([]); // Items for mobile submenu
    const [activeDropdown, setActiveDropdown] = useState(""); // Stores LOWERCASE label of active desktop dropdown
    const [isHoveringNav, setIsHoveringNav] = useState(false);
    const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);

    const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Derived State ---
    const currentMobileNavItems = activeSubmenu ? submenuItems : mobileMenuItems;

    // --- Callbacks ---

    // Generate submenu items for Mobile Menu
    const getSubmenuItemsForCategory = useCallback(
        (categoryLabel: string): MobileNavItemData[] => {
            const categoryLower = categoryLabel.toLowerCase();
            let sourceItems: AnyDropdownItem[] = [];

            if (categoryLower === "motorbikes") sourceItems = motorbikesDropdownItems;
            else if (categoryLower === "scooters") sourceItems = scootersDropdownItems;
            else if (categoryLower === "more") {
                // Map 'more' items structure to mobile item structure
                return (moreDropdownItems as MoreDropdownItem[]).map((item) => ({
                    label: item.label,
                    hasChildren: false, // 'More' links don't have further children here
                    icon: "topRight", // Use outward arrow for links
                    variant: "mobileChild", // Treat as child level
                    url: item.url,
                }));
            } else return [];

            // Map source items (models/links) to mobile structure
            return sourceItems.map((item) => ({
                label: item.label,
                hasChildren: false, // Individual items don't have further submenus here
                icon: item.type === "model" ? "right" : "topRight",
                variant: item.type === "model" ? "mobileChild" : "mobileSubItem",
                url: item.url,
            }));
        },
        [motorbikesDropdownItems, scootersDropdownItems, moreDropdownItems]
    );

    // Close timer logic for desktop dropdowns
    const startCloseTimer = useCallback(() => {
        if (mouseLeaveTimeoutRef.current) clearTimeout(mouseLeaveTimeoutRef.current);
        mouseLeaveTimeoutRef.current = setTimeout(() => {
            if (!isHoveringNav && !isHoveringDropdown) {
                setActiveDropdown("");
            }
        }, 200); // 200ms delay
    }, [isHoveringNav, isHoveringDropdown]);

    const clearCloseTimer = useCallback(() => {
        if (mouseLeaveTimeoutRef.current) clearTimeout(mouseLeaveTimeoutRef.current);
        mouseLeaveTimeoutRef.current = null;
    }, []);


    // --- Event Handlers ---

    const handleItemHover = useCallback((itemLabel: string) => {
        if (isMobile || !showDropdowns) return;
        setIsHoveringNav(true);
        clearCloseTimer();
        const itemConfig = desktopMenuItems.find(item => item.label === itemLabel);
        setActiveDropdown(itemConfig?.hasDropdown ? itemLabel.toLowerCase() : "");
    }, [isMobile, showDropdowns, clearCloseTimer, desktopMenuItems]);

    const handleNavLeave = useCallback(() => {
        if (!isMobile) {
            setIsHoveringNav(false);
            startCloseTimer();
        }
    }, [isMobile, startCloseTimer]);

    const handleDropdownEnter = useCallback(() => {
        if (!isMobile) {
            setIsHoveringDropdown(true);
            clearCloseTimer();
        }
    }, [isMobile, clearCloseTimer]);

    const handleDropdownLeave = useCallback(() => {
        if (!isMobile) {
            setIsHoveringDropdown(false);
            startCloseTimer();
        }
    }, [isMobile, startCloseTimer]);

    const handleDesktopItemClick = useCallback((item: DesktopNavItemData) => {
        if (isMobile) return; // Should not happen if NavBar hides items, but good practice
        if (!item.hasDropdown || !showDropdowns) {
            setActiveDropdown(""); // Close any open dropdown
            if (item.url) onNavigate(item.url); // Navigate if it's a direct link
        } else {
            // Toggle dropdown on click
            const lowerLabel = item.label.toLowerCase();
            setActiveDropdown(prev => prev === lowerLabel ? "" : lowerLabel);
            clearCloseTimer(); // Keep it open if clicked
        }
    }, [isMobile, showDropdowns, clearCloseTimer, onNavigate]);

    const handleDropdownItemClick = useCallback((item: AnyDropdownItem) => {
        setActiveDropdown(""); // Close dropdown on item click
        if (item.url) onNavigate(item.url); // Navigate
    }, [onNavigate]);

    const handleMenuToggle = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
        // Reset submenu state when closing the menu
        if (mobileMenuOpen) {
            setActiveSubmenu("");
            setSubmenuItems([]);
        }
    }, [mobileMenuOpen]); // Dependency ensures correct toggle behavior

    const handleMobileItemClick = useCallback((item: MobileNavItemData) => {
        if (item.back) { // Handle "Back" button click
            setActiveSubmenu("");
            setSubmenuItems([]);
            return;
        }

        if (item.hasChildren) {
            const newSubmenuItems = getSubmenuItemsForCategory(item.label);
            setActiveSubmenu(item.label);
            setSubmenuItems(newSubmenuItems);
        } else {
            // Close menu and navigate
            setMobileMenuOpen(false);
            setActiveSubmenu("");
            setSubmenuItems([]);
            if (item.url) onNavigate(item.url);
        }
    }, [getSubmenuItemsForCategory, onNavigate]);

    // --- Effect to reset mobile menu state if screen resizes to desktop ---
    useEffect(() => {
        if (!isMobile) {
            setMobileMenuOpen(false);
            setActiveSubmenu("");
            setSubmenuItems([]);
        } else {
            // Reset desktop dropdown state if switching to mobile
            setActiveDropdown("");
        }
    }, [isMobile]);

     // --- Effect to clean up timer on unmount ---
     useEffect(() => {
        return () => {
            if (mouseLeaveTimeoutRef.current) {
                clearTimeout(mouseLeaveTimeoutRef.current);
            }
        };
    }, []);

    // --- Render ---
    return (
        <div className="w-full relative z-50 antialiased"> {/* Container for positioning context */}
            <NavBar
                logoColor={logoColor}
                // Pass isMobile state to NavBar? No, NavBar uses CSS media queries now
                navItems={desktopMenuItems}
                activeItemLabel={initialActiveItem} // Pass initial active state if needed
                onMenuToggle={handleMenuToggle}
                onItemHover={handleItemHover}
                onItemLeave={handleNavLeave} // Pass container leave handler
                onItemClick={handleDesktopItemClick}
            />

            {/* Desktop Dropdowns (Conditionally rendered based on state) */}
            {/* Render only if not mobile and dropdowns are enabled */}
            {!isMobile && showDropdowns && (
                <>
                    <DesktopDropdown
                        isOpen={activeDropdown === "motorbikes"}
                        type="motorbikes"
                        items={motorbikesDropdownItems}
                        onItemClick={handleDropdownItemClick}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                    />
                     <DesktopDropdown
                        isOpen={activeDropdown === "scooters"}
                        type="scooters"
                        items={scootersDropdownItems}
                        onItemClick={handleDropdownItemClick}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                    />
                     <DesktopDropdown
                        isOpen={activeDropdown === "more"}
                        type="more"
                        items={moreDropdownItems as MoreDropdownItem[]} // Ensure correct type
                        onItemClick={handleDropdownItemClick}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                    />
                    {/* Add other dropdowns here if needed */}
                </>
            )}

            {/* Mobile Menu (Conditionally rendered and animated) */}
             <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={handleMenuToggle} // Use the toggle handler for closing
                navItems={currentMobileNavItems}
                activeSubmenu={activeSubmenu}
                onItemClick={handleMobileItemClick}
            />
        </div>
    );
};

export default NavigationContainer;