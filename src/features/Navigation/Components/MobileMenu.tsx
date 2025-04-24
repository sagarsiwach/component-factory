// src/features/Navigation/components/MobileMenu.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../../../components/Icon/Icon'; // Adjust path as needed
import FocusTrap from 'focus-trap-react';

// Define structure for mobile menu items
export interface MobileNavItemData {
    label: string;
    hasChildren?: boolean;
    icon?: 'right' | 'topRight' | 'more';
    variant?: 'mobile' | 'mobileChild' | 'mobileSubItem';
    url?: string;
    back?: boolean;
}

export interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: MobileNavItemData[]; // Current items (main or sub)
    onItemClick: (item: MobileNavItemData) => void;
    activeSubmenu: string; // Label of the active submenu, or ""
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    navItems = [],
    onItemClick,
    activeSubmenu,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Scroll to top when submenu changes
     useEffect(() => {
        requestAnimationFrame(() => {
             scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        });
    }, [activeSubmenu]);

    // --- Animation Variants ---
    const drawerVariants = {
        hidden: { x: "100%", transition: { type: "tween", duration: 0.3, ease: [0.6, 0.05, 0.01, 0.9] } },
        visible: { x: 0, transition: { type: "tween", duration: 0.4, ease: [0.0, 0.0, 0.2, 1] } },
        // !! Increased delay on drawer exit !!
        exit: { x: "100%", transition: { type: "tween", duration: 0.3, ease: [0.6, 0.05, 0.01, 0.9], delay: 0.35 } }, // <-- ADJUSTED DELAY
    };

    const listContainerVariants = {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
        exit: { opacity: 1, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
    };

    const itemVariants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, x: -30, transition: { duration: 0.2, ease: "easeIn" } },
    };

    // Icon rendering function
    const renderIcon = (item: MobileNavItemData): JSX.Element => {
        const iconColor = "text-neutral-700";
        const iconWrapperClass = "w-8 h-8 flex items-center justify-center flex-shrink-0 relative";
        let iconName: string | null = null;
        let sizeClass = "text-xl";

        if (item.icon === "more") iconName = 'more_horiz';
        else if (item.icon === "topRight") iconName = 'arrow_outward';
        else if (item.hasChildren || item.icon === 'right') {
            iconName = 'arrow_forward_ios';
            sizeClass = "text-lg";
        }

        if (!iconName) return <div className={iconWrapperClass}></div>;

        return (
            <div className={iconWrapperClass}>
                <Icon iconName={iconName} sizeClassName={sizeClass} weight={300} className={iconColor} />
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <FocusTrap active={isOpen} focusTrapOptions={{ initialFocus: false, fallbackFocus: menuRef.current || undefined }}>
                    <motion.div
                        ref={menuRef}
                        key="mobile-menu-drawer"
                        role="dialog" aria-modal="true" aria-label="Main Menu"
                        initial="hidden" animate="visible" exit="exit" variants={drawerVariants}
                        className="fixed w-full h-dvh right-0 top-0 bg-neutral-200 z-[110] overflow-hidden flex flex-col antialiased"
                        tabIndex={-1}
                    >
                        {/* Header */}
                        <div className="p-5 pt-6 box-border flex-shrink-0 relative">
                             <button
                                 className="w-8 h-8 absolute top-6 right-5 z-[130] flex items-center justify-center cursor-pointer text-neutral-900 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                 onClick={onClose}
                                 aria-label="Close menu"
                                 type="button"
                             >
                                <Icon iconName="close" sizeClassName="text-3xl" />
                            </button>
                            {/* Animated Title */}
                            <div className="h-[70px]">
                                <AnimatePresence mode="wait">
                                    {activeSubmenu && (
                                        <motion.div
                                            key={`title-${activeSubmenu}`}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.3 } }}
                                            exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
                                            className="pt-10 pb-2.5 border-b border-neutral-400 mb-5"
                                        >
                                            <h2 className="text-neutral-900 text-[30px] font-semibold tracking-[-0.04em] leading-tight m-0">
                                                {activeSubmenu}
                                            </h2>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div ref={scrollContainerRef} className="flex-grow overflow-y-auto overflow-x-hidden px-5 pb-20 relative">
                            <motion.div
                                key={activeSubmenu || "main"}
                                variants={listContainerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="w-full"
                                role="menu"
                                aria-label={activeSubmenu || "Main menu"}
                            >
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.label + index}
                                        variants={itemVariants}
                                        role="none"
                                    >
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className="py-[15px] px-2.5 border-b border-neutral-400 flex justify-between items-center cursor-pointer w-full box-border bg-transparent text-left focus:outline-none focus-visible:bg-neutral-300 rounded"
                                            onClick={() => onItemClick(item)}
                                        >
                                            <span className={` text-[30px] font-semibold tracking-[-0.04em] leading-snug pr-2.5 ${item.variant === 'mobileSubItem' ? 'text-neutral-500 !text-2xl !font-normal' : ''} ${activeSubmenu && item.variant === 'mobileChild' ? 'text-neutral-700' : ''} ${!activeSubmenu && item.variant !== 'mobileSubItem' ? 'text-neutral-900' : ''} ${activeSubmenu && item.variant !== 'mobileSubItem' && item.variant !== 'mobileChild' ? 'text-neutral-900' : ''} `}>
                                                {item.label}
                                            </span>
                                            {(item.icon || item.hasChildren) && renderIcon(item)}
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Fixed Bottom Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } }}
                            exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
                            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[120]"
                        >
                             <button
                                type="button"
                                className="flex items-center py-2.5 px-5 bg-white rounded-full shadow-lg border border-neutral-300 gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                onClick={activeSubmenu ? () => onItemClick({ back: true }) : onClose}
                                aria-label={activeSubmenu ? "Go back" : "Close menu"}
                            >
                                <span className={`w-5 h-5 flex items-center justify-center text-neutral-700 ${activeSubmenu ? 'transform rotate-180' : ''}`}>
                                    {activeSubmenu ? (<Icon iconName="arrow_forward" sizeClassName="text-xl" />) : (<Icon iconName="close" sizeClassName="text-xl" />)}
                                </span>
                                <span className="text-neutral-700 text-lg font-medium tracking-[-0.02em] leading-none">{activeSubmenu ? "Back" : "Close"}</span>
                            </button>
                        </motion.div>
                    </motion.div>
                 </FocusTrap>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;