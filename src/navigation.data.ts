// src/navigation.data.ts (or place directly in main.tsx)

import { DesktopNavItemData } from './features/Navigation/components/NavBar';
import { MobileNavItemData } from './features/Navigation/components/MobileMenu';
import { DropdownItem, MoreDropdownItem } from './features/Navigation/components/DesktopDropdown';

// --- Desktop Menu ---
export const desktopMenuItems: DesktopNavItemData[] = [
    { label: "Motorbikes", hasDropdown: true, url: "#" },
    { label: "Scooter", hasDropdown: true, url: "#" }, // Corrected spelling
    { label: "Micromobility", hasDropdown: false, url: "#" },
    { label: "Fleet", hasDropdown: false, url: "#" },
    { label: "Dealers", hasDropdown: false, url: "#" },
    { label: "Contact", hasDropdown: false, url: "#" },
    { label: "More", hasDropdown: true, url: "#" },
];

// --- Mobile Menu (Root Level) ---
export const mobileMenuItems: MobileNavItemData[] = [
    { label: "Motorbikes", hasChildren: true, icon: "right", variant: "mobile", url: "#" },
    { label: "Scooters", hasChildren: true, icon: "right", variant: "mobile", url: "#" },
    { label: "Micromobility", hasChildren: false, icon: "right", variant: "mobile", url: "#" },
    { label: "Fleet", hasChildren: false, icon: "right", variant: "mobile", url: "#" },
    { label: "Find a Dealer", hasChildren: false, icon: "right", variant: "mobile", url: "#" },
    { label: "Contact Us", hasChildren: false, icon: "right", variant: "mobile", url: "#" },
    { label: "More", hasChildren: true, icon: "more", variant: "mobile", url: "#" },
];

// --- Dropdown Content ---

// Motorbikes
export const motorbikesDropdownItems: DropdownItem[] = [
    { label: "KM5000", type: "model", image: "https://via.placeholder.com/370x208/CCCCCC/404040?text=KM5000", url: "#km5000" },
    { label: "KM4000", type: "model", image: "https://via.placeholder.com/370x208/CCCCCC/404040?text=KM4000", url: "#km4000" },
    { label: "KM3000", type: "model", image: "https://via.placeholder.com/370x208/CCCCCC/404040?text=KM3000", url: "#km3000" },
    // Links (adding 'Compare Models' to match original example structure of 4 links)
    { label: "Test Rides", type: "link", url: "#test-rides" },
    { label: "Book Now", type: "link", url: "#book-now" },
    { label: "Locate a Store", type: "link", url: "#locate-store" },
    { label: "Compare Models", type: "link", url: "#compare-models" },
];

// Scooters (Similar structure, adjust labels/images)
export const scootersDropdownItems: DropdownItem[] = [
    { label: "KS3000", type: "model", image: "https://via.placeholder.com/370x208/DDDDDD/404040?text=KS3000", url: "#ks3000" },
    { label: "KS2000", type: "model", image: "https://via.placeholder.com/370x208/DDDDDD/404040?text=KS2000", url: "#ks2000" },
    { label: "KS1000", type: "model", image: "https://via.placeholder.com/370x208/DDDDDD/404040?text=KS1000", url: "#ks1000" },
    // Links
    { label: "Test Rides", type: "link", url: "#test-rides-scooter" },
    { label: "Book Now", type: "link", url: "#book-now-scooter" },
    { label: "Locate a Store", type: "link", url: "#locate-store-scooter" },
    { label: "Compare Models", type: "link", url: "#compare-models-scooter" },
];

// More (Split into 2 groups as per original example data)
export const moreDropdownItems: MoreDropdownItem[] = [
    // Group 0
    { label: "About Us", type: "link", group: 0, url: "#about" },
    { label: "Press", type: "link", group: 0, url: "#press" },
    { label: "Blog", type: "link", group: 0, url: "#blog" },
    { label: "Become a Dealer", type: "link", group: 0, url: "#become-dealer" },
    // Group 1
    { label: "Support", type: "link", group: 1, url: "#support" },
    { label: "Contact Us", type: "link", group: 1, url: "#contact-more" }, // Different URL to avoid clash
    { label: "FAQ", type: "link", group: 1, url: "#faq" },
    // Added "Compare Models" to make 8 links total, matching original example
    { label: "Compare Models", type: "link", group: 1, url: "#compare-models-more" },
];