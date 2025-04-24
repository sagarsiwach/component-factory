// src/features/Navigation/components/NavItem.tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface NavItemProps {
    id: string;
    label: string;
    isActive?: boolean;
    hasPopup?: boolean;
    isExpanded?: boolean;
    controlsId?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLAnchorElement>) => void;
    href?: string;
    role?: string;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>((
    props,
    ref
) => {
    const {
        id,
        label,
        isActive = false,
        hasPopup = false,
        isExpanded = false,
        controlsId,
        onClick,
        onMouseEnter,
        onMouseLeave,
        onFocus,
        onBlur,
        onKeyDown,
        href = "#",
        role,
    } = props;

    // Base classes with consistent font weight and padding/rounding
    const baseClasses = `
        flex items-center justify-center cursor-pointer relative ${/* No isolate needed */''}
        tracking-[-0.02em] font-sans font-medium
        px-3 py-1.5 rounded-md
        transition-colors, background-color duration-150 ease-out ${/* Transition color & bg */''}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500
    `;

    // State-specific classes including background hover/focus
    const stateClasses = isActive
        ? 'text-neutral-900' // Active text color (no background needed if dropdown open?)
        : `
            text-neutral-700
            hover:text-neutral-900 hover:bg-neutral-100 ${/* Added hover bg */''}
            focus-visible:text-neutral-900 focus-visible:bg-neutral-100 ${/* Added focus bg */''}
        `;

    return (
        <motion.a
            ref={ref}
            id={id}
            href={href}
            role={role}
            aria-haspopup={hasPopup ? "menu" : undefined}
            aria-expanded={hasPopup ? isExpanded : undefined}
            aria-controls={hasPopup ? controlsId : undefined}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className={`${baseClasses} ${stateClasses}`}
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
            // No whileHover needed for simple background change
        >
            {/* Span is less critical now but harmless */}
            <span>{label}</span>
        </motion.a>
    );
});

NavItem.displayName = 'NavItem';

export default NavItem;