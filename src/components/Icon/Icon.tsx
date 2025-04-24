// src/components/Icon/Icon.tsx
import * as React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The name of the Material Symbols icon */
  iconName: string;
  /** Use 'outlined' (default), 'rounded', or 'sharp' */
  variant?: 'outlined' | 'rounded' | 'sharp';
  /** Optional size class override (e.g., 'text-xl') */
  sizeClassName?: string;
  /** Fill state for the icon (0 or 1) */
  fill?: 0 | 1;
  /** Weight (100-700) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Grade (-25, 0, 200) */
  grade?: -25 | 0 | 200;
  /** Optical size (20, 24, 40, 48) */
  opticalSize?: 20 | 24 | 40 | 48;
}

export const Icon: React.FC<IconProps> = ({
  iconName,
  variant = 'outlined',
  className = '',
  sizeClassName = 'text-2xl', // Default size (adjust as needed) ~32px
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  style, // Allow passing style object
  ...props
}) => {
  // Construct the font variation settings string
  const fontVariationSettings = `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`;

  return (
    <span
      className={`material-symbols-${variant} ${sizeClassName} ${className} align-middle leading-none`} // align-middle helps alignment
      style={{ fontVariationSettings, ...style }} // Apply variation settings
      aria-hidden="true" // Hide decorative icons from screen readers
      {...props}
    >
      {iconName}
    </span>
  );
};

export default Icon;