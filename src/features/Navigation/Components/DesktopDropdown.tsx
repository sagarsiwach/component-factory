// src/features/Navigation/components/DesktopDropdown.tsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../../../components/Icon/Icon'; // Adjust path as needed

// Interfaces (DropdownItemBase, ModelItem, LinkItem, MoreLinkItem, AnyDropdownItem)
interface DropdownItemBase { label: string; url?: string; }
interface ModelItem extends DropdownItemBase { type: 'model'; image?: string; }
interface LinkItem extends DropdownItemBase { type: 'link'; group?: number; }
interface MoreLinkItem extends LinkItem { type: 'link'; group: number; }
export type DropdownItem = ModelItem | LinkItem;
export type MoreDropdownItem = MoreLinkItem;
type AnyDropdownItem = DropdownItem | MoreDropdownItem;


export interface DesktopDropdownProps {
    id: string;
    triggerId: string;
    isOpen: boolean; // From parent AnimatePresence logic
    type: 'motorbikes' | 'scooters' | 'more';
    items: AnyDropdownItem[];
    onItemClick: (item: AnyDropdownItem) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

// Focus management helper
const focusFirstItem = (element: HTMLElement | null) => {
     if (!element) return;
     const firstFocusable = element.querySelector<HTMLElement>(
         'a[role="menuitem"], button[role="menuitem"]'
     );
     firstFocusable?.focus();
 };

export const DesktopDropdown: React.FC<DesktopDropdownProps> = ({
    id,
    triggerId,
    isOpen, // Use for focus effect dependency
    type,
    items = [],
    onItemClick,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Focus first item when opening
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => focusFirstItem(dropdownRef.current), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // --- Animation Variants ---

    // 1. Outer Container Variants (Handles height, overall fade, slide)
    const dropdownVariants = {
        hidden: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }, // Faster collapse
        visible: { opacity: 1, height: 'var(--size-dropdown-h, 392px)', y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        // Exit only handles container collapse/fade, *after* inner content exits
        exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2, ease: "easeIn", delay: 0.25 } }, // Add delay to wait for items
    };

    // 2. Inner Content Container Variants (Handles stagger)
    const contentVariants = {
        initial: { opacity: 1 }, // Starts visible immediately
        animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }, // Stagger items IN
        // Exit defines how children are staggered OUT
        exit: { opacity: 1, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
    };

    // 3. Individual Item Variants (How each item animates during stagger)
    const itemVariants = {
        initial: { opacity: 0, y: -10 }, // Start slightly up and faded
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } }, // Fade out, slide up slightly
    };

    // Menu item props helper (includes ARIA, event handlers, focus style)
    const createMenuItemProps = (item: AnyDropdownItem) => ({
        href: item.url || '#',
        role: "menuitem",
        tabIndex: -1, // Focus managed by container
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); onItemClick(item); },
        onKeyDown: (e: React.KeyboardEvent<HTMLAnchorElement>) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick(item); }
            // Let dropdown container handle arrow keys etc.
        },
         className: "focus:outline-none focus-visible:bg-neutral-100 focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
    });

    // --- RENDER LOGIC ---
    const renderDropdownContent = () => {
        // Add console logs for debugging if needed
        // console.log(`Rendering Dropdown Type: ${type}, Items:`, items);

        let contentToRender: JSX.Element | null = null;

        switch (type) {
            case 'motorbikes':
            case 'scooters':
                const models = items.filter((item): item is ModelItem => item.type === 'model');
                const links = items.filter((item): item is LinkItem => item.type === 'link');
                if (models.length === 0 && links.length === 0) {
                    contentToRender = <div className="p-4 text-neutral-500">No items available.</div>;
                } else {
                    contentToRender = (
                        <div className="flex justify-start items-stretch gap-2.5 max-w-7xl mx-auto w-full pb-10 h-full">
                            {/* Models Section */}
                            <div className="flex flex-auto justify-start items-stretch gap-2.5 h-full">
                                {models.map((item) => (
                                    <motion.div key={item.label} variants={itemVariants} className="flex-1 basis-0 min-w-[280px] flex flex-col justify-end h-full group">
                                        <div className="w-full h-[240px] relative overflow-hidden mb-0 bg-neutral-100"> {/* Image BG */}
                                            {item.image ? <img src={item.image} alt={item.label} className="w-full h-full object-contain absolute top-0 left-0" loading="lazy"/> : <div className="w-full h-full flex items-center justify-center text-neutral-400 italic">Image</div>}
                                        </div>
                                        <motion.a {...createMenuItemProps(item)} className={`w-full p-5 bg-white flex justify-between items-center cursor-pointer box-border transition-colors duration-150 group-hover:bg-neutral-100 ${createMenuItemProps(item).className}`}>
                                            <span className="text-neutral-700 text-[30px] font-semibold tracking-[-0.04em]">{item.label}</span>
                                            <span className="w-8 h-8 relative overflow-hidden flex-shrink-0 text-neutral-700"><Icon iconName="arrow_forward" sizeClassName="text-2xl absolute top-1 left-1"/></span>
                                        </motion.a>
                                    </motion.div>
                                ))}
                            </div>
                            {/* Links Section */}
                            <div className="w-80 flex-shrink-0 flex flex-col justify-end items-start h-full">
                                {links.map((item) => (
                                    <motion.a key={item.label} variants={itemVariants} {...createMenuItemProps(item)} className={`self-stretch p-4 flex justify-between items-center cursor-pointer transition-colors duration-150 hover:bg-neutral-100 ${createMenuItemProps(item).className}`}>
                                        <span className="text-neutral-500 text-2xl font-normal tracking-[-0.04em]">{item.label}</span>
                                        <span className="w-8 h-8 relative overflow-hidden flex-shrink-0 text-neutral-700"><Icon iconName="arrow_outward" sizeClassName="text-xl absolute top-1.5 left-1.5"/></span>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    );
                }
                break; // Added missing break

            case 'more':
                 const moreItems = items.filter((item): item is MoreLinkItem => item.type === 'link' && typeof item.group === 'number');
                 const groupedItems = moreItems.reduce((acc, item) => { const groupKey = item.group; acc[groupKey] = acc[groupKey] || []; acc[groupKey].push(item); return acc; }, {} as Record<number, MoreLinkItem[]>);
                 const groupKeys = Object.keys(groupedItems).map(Number).sort();

                 if (moreItems.length === 0) {
                     contentToRender = <div className="p-4 text-neutral-500">No items available.</div>;
                 } else {
                    contentToRender = (
                        <div className="flex justify-start items-stretch gap-10 max-w-7xl mx-auto w-full pb-10 h-full">
                            {groupKeys.map((groupIndex) => (
                                <div key={`more-group-${groupIndex}`} className="flex-1 basis-auto max-w-xs min-w-[280px] flex flex-col justify-end items-start h-full">
                                    {groupedItems[groupIndex].map((item) => (
                                        <motion.a key={item.label} variants={itemVariants} {...createMenuItemProps(item)} className={`self-stretch p-4 flex justify-between items-center cursor-pointer transition-colors duration-150 hover:bg-neutral-100 ${createMenuItemProps(item).className}`}>
                                            <span className="text-neutral-700 text-[30px] font-semibold tracking-[-0.04em]">{item.label}</span>
                                            <span className="w-8 h-8 relative overflow-hidden flex-shrink-0 text-neutral-700"><Icon iconName="arrow_outward" sizeClassName="text-xl absolute top-1.5 left-1.5"/></span>
                                        </motion.a>
                                    ))}
                                </div>
                            ))}
                             {/* Placeholders */}
                             {[...Array(Math.max(0, 2 - groupKeys.length))].map((_, i) => (<div key={`placeholder-${i}`} className="flex-1 basis-auto max-w-xs min-w-[280px]"></div>))}
                        </div>
                    );
                 }
                 break; // Added missing break

            default:
                 contentToRender = <div className="p-4 text-neutral-500">Invalid dropdown type.</div>;
                 break; // Added missing break
        }

        // Wrap the actual content in the staggering container
        return (
             <motion.div
                variants={contentVariants} // Apply stagger control variants
                initial="initial"
                animate="animate"
                exit="exit" // This exit will trigger the item stagger out
             >
                {contentToRender}
             </motion.div>
        );
    };


    return (
        // This outer motion.div handles the main container animation (height, opacity, y-offset)
         <motion.div
            ref={dropdownRef}
            id={id} role="menu" aria-labelledby={triggerId}
            initial="hidden" animate="visible" exit="exit" // Apply animation states
            variants={dropdownVariants} // Use container variants
            // Use custom shadow CSS variable, fallback to shadow-lg
            className={`w-full absolute left-0 top-[81px] bg-white overflow-hidden px-4 lg:px-16 z-40 focus:outline-none shadow-[var(--shadow-dropdown,theme(boxShadow.lg))]`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={onKeyDown} // Attach keyboard handler for arrows/esc/tab within menu
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
            {/* Render the inner container which handles item staggering */}
            {renderDropdownContent()}
        </motion.div>
    );
};

export default DesktopDropdown;