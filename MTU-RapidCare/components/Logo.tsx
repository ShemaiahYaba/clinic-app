import React from 'react';
import Svg, { Rect, Path, Circle, SvgProps } from 'react-native-svg';

interface LogoProps extends SvgProps {
  size?: number;
  primaryColor?: string;
  foregroundColor?: string;
  accentColor?: string;
}

export const AppLogo: React.FC<LogoProps> = ({ 
  size = 48, 
  primaryColor = '#2563eb',
  foregroundColor = '#ffffff',
  accentColor = '#3b82f6',
  ...props 
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    aria-label="MTU-RAPIDCARE Logo"
    {...props}
  >
    <Rect width="200" height="200" rx="30" fill={primaryColor} />
    <Path
      d="M100 40 L100 160 M60 100 L140 100"
      stroke={foregroundColor}
      strokeWidth={20}
      strokeLinecap="round"
    />
    <Circle cx="100" cy="100" r="25" fill={accentColor} />
  </Svg>
);
