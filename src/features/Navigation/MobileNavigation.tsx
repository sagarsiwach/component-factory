// src/features/Navigation/MobileNavigation.tsx
import React, { useState, useCallback, useEffect } from 'react';
import NavBar from './components/NavBar';
import MobileMenu, { MobileNavItemData } from './components/MobileMenu';
import { DropdownItem, MoreDropdownItem, AnyDropdownItem } from './components/DesktopDropdown'; // Use types from DesktopDropdown

interface MobileNavigationProps {
    logoColorClass?: string;
    mobileMenuItems: MobileNavItemData[]; // Root items
    // Data sources for submenus
    motorbikesDropdownItems: DropdownItem[];
    scootersDropdownItems: DropdownItem[];
    moreDropdownItems: MoreDropdownItem[];
    onNavigate?: (url: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
    logoColorClass,
    mobileMenuItems = [],
    motorbikesDropdownItems = [],
    scootersDropdownItems = [],
    moreDropdownItems = [],
    onNavigate = (url) => console.log(`Mobile navigate to: ${url}`),
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState("");
    const [submenuItems, setSubmenuItems] = useState<MobileNavItemData[]>([]);

    // --- Callbacks ---
    // Generate submenu items for Mobile Menu
    const getSubmenuItemsForCategory = useCallback((categoryLabel: string): MobileNavItemData[] => {
        const categoryLower = categoryLabel.toLowerCase();
        let sourceItems: AnyDropdownItem[] = [];

        if (categoryLower === "motorbikes") sourceItems = motorbikesDropdownItems;
        else if (categoryLower === "scooters") sourceItems = scootersDropdownItems; // Corrected key check
        else if (categoryLower === "more") {
            return (moreDropdownItems as MoreDropdownItem[]).map((item) => ({
                label: item.label, hasChildren: false, icon: "topRight", variant: "mobileChild", url: item.url,
            }));
        } else return [];

        return sourceItems.map((item) => ({
            label: item.label, hasChildren: false, icon: item.type === "model" ? "right" : "topRight", variant: item.type === "model" ? "mobileChild" : "mobileSubItem", url: item.url,
        }));
    }, [motorbikesDropdownItems, scootersDropdownItems, moreDropdownItems]); // Corrected dependency


    const handleMenuToggle = useCallback(() => {
        const closing = mobileMenuOpen; // Check state before toggle
        setMobileMenuOpen(prev => !prev);
        if (closing) { // If it was open and is now closing
            // Delay reset slightly to allow exit animation
            setTimeout(() => {
                 setActiveSubmenu("");
                 setSubmenuItems([]);
            }, 300) // Match exit animation duration
        }
    }, [mobileMenuOpen]);

    const handleMobileItemClick = useCallback((item: MobileNavItemData) => {
        if (item.back) {
            setActiveSubmenu(""); // State change triggers animation
            // Submenu items will update based on activeSubmenu state change
            return;
        }
        if (item.hasChildren) {
            const newSubmenuItems = getSubmenuItemsForCategory(item.label);
            setActiveSubmenu(item.label); // State change triggers animation
            setSubmenuItems(newSubmenuItems);
        } else {
            // Close menu immediately, then navigate
            setMobileMenuOpen(false);
            // Reset submenu state after a delay to allow closing animation
             setTimeout(() => {
                 setActiveSubmenu("");
                 setSubmenuItems([]);
                 if (item.url && item.url !== '#') onNavigate(item.url);
            }, 300) // Match exit animation duration
        }
    }, [getSubmenuItemsForCategory, onNavigate]);

     // Derived state for current items
    const currentMobileNavItems = activeSubmenu ? submenuItems : mobileMenuItems;

    return (
        <div className="w-full relative z-50 antialiased">
            {/* NavBar now only needs the toggle handler for mobile */}
            <NavBar
                isMobile={true} // Explicitly true
                logoColorClass={logoColorClass}
                onMenuToggle={handleMenuToggle}
                // No desktop nav items or handlers needed here
            />

            {/* Mobile Menu Component */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={handleMenuToggle} // Pass the toggle handler to close button/logic
                navItems={currentMobileNavItems}
                activeSubmenu={activeSubmenu}
                onItemClick={handleMobileItemClick}
            />
        </div>
    );
};

export default MobileNavigation;