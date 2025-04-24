// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// Import ONE of the navigation containers for testing
import DesktopNavigation from './features/Navigation/DesktopNavigation';
// import MobileNavigation from './features/Navigation/MobileNavigation';
import './index.css';

// Import the navigation data (ensure IDs are in desktopMenuItems)
import {
    desktopMenuItems, mobileMenuItems, motorbikesDropdownItems,
    scootersDropdownItems, moreDropdownItems
} from './navigation.data';

const handleNavigation = (url: string) => {
    console.log(`Navigating to: ${url}`);
    // Implement actual routing here
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Render EITHER Desktop OR Mobile for testing in Vite */}
    <DesktopNavigation
        desktopMenuItems={desktopMenuItems}
        motorbikesDropdownItems={motorbikesDropdownItems}
        scootersDropdownItems={scootersDropdownItems} // Pass scooter data
        moreDropdownItems={moreDropdownItems}
        onNavigate={handleNavigation}
        // logoColorClass="text-red-600" // Example: Test color override
    />
    
     {/* <MobileNavigation
        mobileMenuItems={mobileMenuItems}
        motorbikesDropdownItems={motorbikesDropdownItems}
        scootersDropdownItems={scootersDropdownItems} // Pass scooter data
        moreDropdownItems={moreDropdownItems}
        onNavigate={handleNavigation}
    /> */}
   

    {/* --- Your Page Content Would Go Here --- */}
    <div className="p-10 mt-5 font-sans container mx-auto"> {/* Added container */}
      <h1 className="text-2xl font-bold mb-4">Page Content Area</h1>
      <p className="text-neutral-700">
        Testing the Navigation Component. Use dev tools to simulate different screen sizes or switch between Desktop/MobileNavigation import in main.tsx.
      </p>
       <button className="p-2 border rounded bg-blue-100 text-blue-800 mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Focusable Element</button>
    </div>
  </React.StrictMode>,
);