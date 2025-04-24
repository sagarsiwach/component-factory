// src/features/Navigation/components/NavBar.tsx
import React, { useRef } from 'react';
// Removed motion import as bubble is gone
import { KMFullLogo } from '../../../components/Logo/Logo';
import { Icon } from '../../../components/Icon/Icon';
import NavItem from './NavItem';

export interface DesktopNavItemData {
    id: string;
    label: string;
    hasDropdown: boolean;
    url?: string;
}
// Removed BubbleRect interface

export interface NavBarProps {
    isMobile?: boolean;
    logoColorClass?: string;
    navItems?: DesktopNavItemData[];
    activeItemLabel?: string;
    onMenuToggle?: () => void;
    // Simplified Hover/Focus handlers
    onItemHover: (item: DesktopNavItemData) => void;
    onItemLeave: () => void;
    onItemFocus: (item: DesktopNavItemData) => void;
    onItemBlur: () => void;
    onItemClick?: (item: DesktopNavItemData, event: React.MouseEvent<HTMLAnchorElement>) => void;
    onItemKeyDown?: (item: DesktopNavItemData, event: React.KeyboardEvent<HTMLAnchorElement>) => void;
    activeDropdownLabel?: string;
    getDropdownId?: (label: string) => string;
    // Removed bubbleRect prop
    navItemRefs: React.MutableRefObject<(HTMLAnchorElement | null)[]>; // Still needed for keyboard nav focus
}

export const NavBar: React.FC<NavBarProps> = ({
    isMobile = false,
    logoColorClass = 'text-neutral-700',
    navItems = [],
    activeItemLabel = "",
    onMenuToggle,
    onItemHover, // Simplified
    onItemLeave,
    onItemFocus, // Simplified
    onItemBlur,
    onItemClick = () => {},
    onItemKeyDown = () => {},
    activeDropdownLabel = "",
    getDropdownId = (label) => `dropdown-${label.toLowerCase()}`,
    // bubbleRect removed
    navItemRefs, // Still needed
}) => {
    const navContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className={` w-full bg-white border-b border-neutral-300 px-4 lg:px-16 py-5 flex justify-between items-center relative z-50 box-border antialiased `}>
            {/* Logo */}
            <div className={`w-[177px] h-[40px] flex-shrink-0`}>
                 <a href="/" aria-label="Homepage" className={`${logoColorClass} hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded`}>
                     <KMFullLogo className="block" />
                 </a>
             </div>


            {/* Desktop Navigation */}
            {!isMobile && (
                <nav ref={navContainerRef} aria-label="Main Navigation" role="menubar" className="flex justify-center items-center gap-5 relative">
                    {/* Bubble Rendering Removed */}

                    {/* Navigation Items */}
                    {navItems.map((item, index) => (
                        <NavItem
                            ref={el => navItemRefs.current[index] = el}
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            isActive={activeItemLabel === item.label}
                            hasPopup={item.hasDropdown}
                            isExpanded={item.hasDropdown && activeDropdownLabel.toLowerCase() === item.label.toLowerCase()}
                            controlsId={item.hasDropdown ? getDropdownId(item.label) : undefined}
                            onClick={(e) => onItemClick(item, e)}
                            // Pass simplified handlers
                            onMouseEnter={() => onItemHover(item)}
                            onMouseLeave={onItemLeave}
                            onFocus={() => onItemFocus(item)}
                            onBlur={onItemBlur}
                            onKeyDown={(e) => onItemKeyDown(item, e)}
                            href={item.url}
                            role="menuitem"
                        />
                    ))}
                </nav>
            )}

            {/* Mobile Menu Toggle */}
             {isMobile && (
                 <div className="lg:hidden">
                    <button /* ... mobile toggle button ... */ >
                        <Icon iconName="menu" sizeClassName="text-3xl" />
                    </button>
                </div>
             )}
        </div>
    );
};

export default NavBar;