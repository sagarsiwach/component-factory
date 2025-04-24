// src/features/Navigation/DesktopNavigation.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import NavBar, { DesktopNavItemData } from './components/NavBar'; // Ensure correct import path
import DesktopDropdown, { DropdownItem, MoreDropdownItem, AnyDropdownItem } from './components/DesktopDropdown'; // Ensure correct import path
import { useId } from 'react';
import { AnimatePresence } from 'framer-motion';

interface DesktopNavigationProps {
    logoColorClass?: string;
    initialActiveItem?: string;
    desktopMenuItems: DesktopNavItemData[];
    motorbikesDropdownItems: DropdownItem[];
    scootersDropdownItems: DropdownItem[];
    moreDropdownItems: MoreDropdownItem[];
    onNavigate?: (url: string) => void;
}

// Helper to focus the first menu item in a dropdown
const focusFirstItem = (element: HTMLElement | null) => {
    if (!element) return;
    const firstFocusable = element.querySelector<HTMLElement>(
        'a[role="menuitem"], button[role="menuitem"]'
    );
    firstFocusable?.focus();
};

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
    logoColorClass,
    initialActiveItem = "",
    desktopMenuItems = [],
    motorbikesDropdownItems = [],
    scootersDropdownItems = [],
    moreDropdownItems = [],
    onNavigate = (url) => console.log(`Desktop navigate to: ${url}`), // Default console log action
}) => {
    // State for the currently open dropdown (using lowercase label as key)
    const [activeDropdown, setActiveDropdown] = useState<string>("");
    // State tracking mouse position for hover intent logic
    const [isHoveringNavItem, setIsHoveringNavItem] = useState(false);     // Tracks mouse over ANY NavItem
    const [isHoveringDropdown, setIsHoveringDropdown] = useState(false); // Tracks mouse over the open Dropdown panel

    // Refs
    const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timer for hover intent
    const navRef = useRef<HTMLDivElement>(null); // Ref for the main container div (for outside click detection)
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]); // Array to hold refs of NavItem anchors for focus mgmt

    // --- ID Generation ---
    const navId = useId(); // Unique ID for the navigation instance
    const getNavItemId = useCallback((baseId: string) => `${navId}-item-${baseId.toLowerCase().replace(/\s+/g, '-')}`, [navId]);
    const getDropdownId = useCallback((baseId: string) => `${navId}-dropdown-${baseId.toLowerCase().replace(/\s+/g, '-')}`, [navId]);

    // Effect to keep the itemRefs array synchronized with the menu items
    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, desktopMenuItems.length);
     }, [desktopMenuItems]);


    // --- Timer Logic for Closing Dropdown on Mouse Leave ---
    // Starts a timer to close the dropdown if the mouse isn't over interactive areas
    const startCloseTimer = useCallback(() => {
        clearTimeout(mouseLeaveTimeoutRef.current!); // Clear any previous timer
        mouseLeaveTimeoutRef.current = setTimeout(() => {
            // Execute only if mouse is not over a NavItem AND not over the Dropdown panel
            if (!isHoveringNavItem && !isHoveringDropdown) {
                setActiveDropdown(""); // Close dropdown (triggers AnimatePresence exit)
            }
        }, 250); // Delay in milliseconds (adjust for desired hover intent duration)
    }, [isHoveringNavItem, isHoveringDropdown]); // Re-run if hover states change

    // Clears the closing timer (used when mouse enters interactive areas)
    const clearCloseTimer = useCallback(() => {
        clearTimeout(mouseLeaveTimeoutRef.current!);
    }, []);

    // --- Event Handlers ---

    // Mouse enters a specific NavItem
    const handleItemHover = useCallback((item: DesktopNavItemData) => {
        setIsHoveringNavItem(true);    // Indicate mouse is over a nav item
        clearCloseTimer();             // Prevent closing while hovering
        const dropdownKey = item.hasDropdown ? item.label.toLowerCase() : "";
        setActiveDropdown(dropdownKey); // Open relevant dropdown
    }, [clearCloseTimer, desktopMenuItems]); // Added dependencies

    // Mouse leaves a specific NavItem (or the entire NavBar area via the parent div)
    const handleItemLeave = useCallback(() => {
        setIsHoveringNavItem(false);   // Indicate mouse left the nav item area
        startCloseTimer();             // Start timer to potentially close dropdown
    }, [startCloseTimer]);

    // Keyboard focus enters a NavItem
    const handleItemFocus = useCallback((item: DesktopNavItemData) => {
        setIsHoveringNavItem(true); // Treat focus like hover to prevent timer closing dropdown
        clearCloseTimer();
        // We don't necessarily open the dropdown on focus alone, user needs to press Down/Enter/Space
    }, [clearCloseTimer]);

    // Keyboard focus leaves a NavItem
    const handleItemBlur = useCallback(() => {
        setIsHoveringNavItem(false); // Focus left
        startCloseTimer();           // Start timer to potentially close if focus moves outside entirely
    }, [startCloseTimer]);

    // Mouse enters the Dropdown panel itself
    const handleDropdownEnter = useCallback(() => {
        setIsHoveringDropdown(true); // Indicate mouse is over the dropdown panel
        clearCloseTimer();          // Prevent closing while mouse is here
    }, [clearCloseTimer]);

    // Mouse leaves the Dropdown panel
    const handleDropdownLeave = useCallback(() => {
        setIsHoveringDropdown(false); // Indicate mouse left the dropdown panel
        startCloseTimer();           // Start timer to potentially close
    }, [startCloseTimer]);


    // --- Action Handlers ---

    // Closes the currently active dropdown and handles returning focus
    const closeDropdown = useCallback((returnFocusToLabel?: string) => {
         const currentActive = activeDropdown; // Store which dropdown was open
         if (!currentActive) return; // Don't do anything if nothing is open

         setActiveDropdown(""); // Trigger exit animation via AnimatePresence
         const focusLabel = returnFocusToLabel || currentActive; // Determine which trigger to focus

         // Find the trigger element corresponding to the label
         const triggerItem = desktopMenuItems.find(item => item.label.toLowerCase() === focusLabel.toLowerCase());
         if (triggerItem) {
             const triggerElement = document.getElementById(triggerItem.id);
             // Use setTimeout to allow state update and animation to potentially start
             setTimeout(() => triggerElement?.focus(), 50);
         }
    }, [activeDropdown, desktopMenuItems]); // Dependencies are correct

    // Handles click on a top-level NavItem (either navigates or toggles dropdown)
    const handleDesktopItemClick = useCallback((item: DesktopNavItemData, event: React.MouseEvent<HTMLAnchorElement>) => {
         const lowerLabel = item.label.toLowerCase();
         if (!item.hasDropdown) {
             closeDropdown(); // Close any open dropdown first
             if (item.url && item.url !== '#') {
                 onNavigate(item.url); // Perform navigation if it's a real link
             } else {
                 event.preventDefault(); // Prevent default action for '#' links
             }
         } else {
             // If it has a dropdown, toggle its state
             setActiveDropdown(prev => (prev === lowerLabel ? "" : lowerLabel));
             clearCloseTimer(); // Ensure timer is cleared if we just clicked to open/close
             event.preventDefault(); // Prevent the link's default navigation
         }
    }, [closeDropdown, clearCloseTimer, onNavigate]); // Correct dependencies

    // Handles click on an item INSIDE a dropdown - closes with animation, then navigates
    const handleDropdownItemClick = useCallback((item: AnyDropdownItem) => {
        const triggerLabel = activeDropdown; // Remember which dropdown trigger was active
        const urlToNavigate = item.url;

        setActiveDropdown(""); // Close dropdown immediately (starts exit animation)

        const navigationDelay = 600; // Match slower animation exit (adjust if needed)

        // Perform navigation after a delay to allow animation to finish
        if (urlToNavigate && urlToNavigate !== '#') {
            setTimeout(() => {
                onNavigate(urlToNavigate);
                // Attempt to return focus to the original trigger after navigation
                const triggerItem = desktopMenuItems.find(navItem => navItem.label.toLowerCase() === triggerLabel.toLowerCase());
                if(triggerItem) document.getElementById(triggerItem.id)?.focus();
            }, navigationDelay);
        } else {
             // If no URL (e.g., just an action), still return focus after delay
             setTimeout(() => {
                 const triggerItem = desktopMenuItems.find(navItem => navItem.label.toLowerCase() === triggerLabel.toLowerCase());
                 if(triggerItem) document.getElementById(triggerItem.id)?.focus();
             }, navigationDelay);
        }
    }, [activeDropdown, onNavigate, desktopMenuItems]); // Correct dependencies


    // --- Keyboard Navigation Handlers ---

    // Handler for keydown events on top-level NavItems
    const handleItemKeyDown = useCallback((item: DesktopNavItemData, event: React.KeyboardEvent<HTMLAnchorElement>) => {
        const lowerLabel = item.label.toLowerCase();
        const currentIndex = desktopMenuItems.findIndex(i => i.id === item.id);
        let nextFocusTarget: HTMLElement | null = null; // Element to focus after handling
        let handled = false; // Flag to prevent default browser actions

        switch (event.key) {
            case 'Enter':
            case ' ': // Space activates items/dropdowns
                if (item.hasDropdown) {
                    event.preventDefault(); // Prevent page scroll on Space
                    const newState = activeDropdown === lowerLabel ? "" : lowerLabel; // Toggle state
                    setActiveDropdown(newState);
                    clearCloseTimer();
                    if (newState !== "") { // If opening dropdown
                        // Focus first item inside after a delay
                        setTimeout(() => focusFirstItem(document.getElementById(getDropdownId(item.label))), 50);
                    } else { // If closing dropdown
                        nextFocusTarget = event.currentTarget; // Refocus the trigger
                    }
                } else {
                    // If it's a regular link, allow Enter to activate default behavior
                    if (event.key === ' ') event.preventDefault(); // Prevent scroll on space
                    if (item.url && item.url !== '#') onNavigate(item.url); // Navigate on Space/Enter
                }
                handled = true; // Handled activation
                break;
            case 'ArrowDown':
                if (item.hasDropdown) {
                    event.preventDefault();
                    if (activeDropdown !== lowerLabel) { // If dropdown isn't open, open it
                        setActiveDropdown(lowerLabel);
                        clearCloseTimer();
                        // Focus first item inside after opening
                        setTimeout(() => focusFirstItem(document.getElementById(getDropdownId(item.label))), 50);
                    } else { // If dropdown is already open, just focus the first item
                         focusFirstItem(document.getElementById(getDropdownId(item.label)));
                    }
                    handled = true;
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                const prevIndex = (currentIndex - 1 + desktopMenuItems.length) % desktopMenuItems.length;
                nextFocusTarget = itemRefs.current[prevIndex]; // Target previous item
                handled = true;
                break;
            case 'ArrowRight':
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % desktopMenuItems.length;
                nextFocusTarget = itemRefs.current[nextIndex]; // Target next item
                handled = true;
                break;
            case 'Escape':
                if (activeDropdown) { // If a dropdown is open anywhere
                    event.preventDefault();
                    closeDropdown(item.label); // Close it and return focus to current item
                    nextFocusTarget = event.currentTarget; // Ensure focus returns here
                    handled = true;
                }
                break;
            case 'Tab':
                // When tabbing away from a nav item, if a dropdown is open, close it.
                if(activeDropdown){
                    closeDropdown(); // Close without specific focus return
                }
                // Allow default tab behavior to proceed
                break;
        }

         if (handled && event.key !== 'Enter') { // Prevent default except for Enter on actual links
             event.preventDefault();
             event.stopPropagation();
         }
          // Apply focus after potential state updates settle down
         if (nextFocusTarget) {
            setTimeout(() => nextFocusTarget?.focus(), 0);
         }
    }, [activeDropdown, clearCloseTimer, closeDropdown, desktopMenuItems, getDropdownId, onNavigate]); // Added dependencies


    // Handler for keydown events within an open Dropdown panel
    const handleDropdownKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!activeDropdown) return; // Should not happen if called correctly

        const dropdownElement = event.currentTarget;
        // Get all focusable items within the current dropdown
        const focusableElements = Array.from(
            dropdownElement.querySelectorAll<HTMLElement>('a[role="menuitem"], button[role="menuitem"]')
        );

        if (focusableElements.length === 0) return; // No items to navigate

        const currentIndex = focusableElements.findIndex(el => el === document.activeElement);

        let handled = false; // Flag to prevent default browser actions
        let nextFocusTarget: HTMLElement | null = null; // Element to focus next

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                const move = event.key === 'ArrowDown' ? 1 : -1;
                // Calculate next index with wrapping
                const nextIndex = (currentIndex + move + focusableElements.length) % focusableElements.length;
                nextFocusTarget = focusableElements[nextIndex];
                handled = true;
                break;
            case 'Home':
                // Focus the first item
                nextFocusTarget = focusableElements[0];
                handled = true;
                break;
            case 'End':
                // Focus the last item
                nextFocusTarget = focusableElements[focusableElements.length - 1];
                handled = true;
                break;
            case 'Tab':
                 // Trap Tab within the dropdown - close it and focus trigger
                 event.preventDefault();
                 closeDropdown(activeDropdown); // Close and return focus to trigger
                 handled = true;
                break;
            case 'Escape':
                 // Escape closes dropdown and returns focus to trigger
                 closeDropdown(activeDropdown);
                 handled = true;
                break;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
            // Apply focus after a minimal delay
            if(nextFocusTarget) {
                 setTimeout(() => nextFocusTarget?.focus(), 0);
            }
        }
    }, [activeDropdown, closeDropdown]); // Correct dependencies


    // --- Effects ---
    // Effect for handling clicks outside the main navigation container
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close dropdown if click is outside the navRef element
            if (activeDropdown && navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveDropdown(""); // Close directly, don't return focus
            }
        };
        // Use mousedown to catch clicks early
        document.addEventListener('mousedown', handleClickOutside);
        // Cleanup listener on component unmount
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]); // Rerun only if activeDropdown changes


    // --- Data Mapping for Dropdowns ---
    // Defines which dropdown component corresponds to which key/type/data
    const dropdowns = [
        { key: "motorbikes", type: "motorbikes", items: motorbikesDropdownItems },
        { key: "scooter", type: "scooters", items: scootersDropdownItems },
        { key: "more", type: "more", items: moreDropdownItems },
    ];

    return (
        // Main container div with ref and mouse leave handler for timer logic
        <div ref={navRef} className="w-full relative z-50 antialiased" onMouseLeave={handleItemLeave}>
            <NavBar
                isMobile={false} // Explicitly for desktop
                logoColorClass={logoColorClass}
                navItems={desktopMenuItems} // Data including IDs
                activeItemLabel={initialActiveItem}
                // Pass all necessary handlers down to NavBar and its children (NavItem)
                onItemHover={handleItemHover}
                onItemLeave={handleItemLeave} // For NavItem internal use if needed
                onItemFocus={handleItemFocus}
                onItemBlur={handleItemBlur}
                onItemClick={handleDesktopItemClick}
                onItemKeyDown={handleItemKeyDown}
                activeDropdownLabel={activeDropdown} // For ARIA states in NavItem
                getDropdownId={getDropdownId} // For ARIA states in NavItem
                // Bubble props removed
                navItemRefs={itemRefs} // Pass refs array for NavBar to populate
            />

            {/* AnimatePresence manages mounting/unmounting of dropdowns */}
             <AnimatePresence>
                 {dropdowns.map(({ key, type, items }) =>
                     // Render dropdown only if its key matches the activeDropdown state
                     activeDropdown === key && (
                         <DesktopDropdown
                            key={key} // Essential for AnimatePresence to track component instances
                            id={getDropdownId(key)}
                            // Find the trigger item's ID for aria-labelledby
                            triggerId={desktopMenuItems.find(i => i.label.toLowerCase() === key)?.id || ""}
                            isOpen={true} // Prop indicating it's being rendered because it's open
                            type={type as any} // Cast type as needed
                            items={items} // Pass data
                            onItemClick={handleDropdownItemClick} // Handler for item clicks (delayed nav)
                            onMouseEnter={handleDropdownEnter} // Handler for mouse entering dropdown panel
                            onMouseLeave={handleDropdownLeave} // Handler for mouse leaving dropdown panel
                            onKeyDown={handleDropdownKeyDown} // Handler for keyboard nav within dropdown
                        />
                    )
                 )}
             </AnimatePresence>
        </div>
    );
};

export default DesktopNavigation;