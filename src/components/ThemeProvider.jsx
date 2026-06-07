import React, { useEffect } from 'react';
import { useCheckoutStore } from '../store/stepStore';

// Helper to convert Hex color to HSL values
function hexToHsl(hex) {
  // Remove hash if exists
  hex = hex.replace(/^#/, '');

  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export default function ThemeProvider({ children }) {
  const sessionData = useCheckoutStore((state) => state.sessionData);

  useEffect(() => {
    // If merchant has customized the primary color, inject it into CSS variables
    const customBrandColor = sessionData?.merchant?.themeColor || sessionData?.theme?.primaryColor;
    
    if (customBrandColor && /^#[0-9A-F]{6}$/i.test(customBrandColor)) {
      try {
        const { h, s, l } = hexToHsl(customBrandColor);
        document.documentElement.style.setProperty('--primary-hue', h.toString());
        document.documentElement.style.setProperty('--primary-sat', `${s}%`);
        document.documentElement.style.setProperty('--primary-light', `${l}%`);
      } catch (err) {
        console.error('Error applying custom brand colors', err);
      }
    } else {
      // Fallback/Reset to default indigo theme
      document.documentElement.style.removeProperty('--primary-hue');
      document.documentElement.style.removeProperty('--primary-sat');
      document.documentElement.style.removeProperty('--primary-light');
    }
  }, [sessionData]);

  return <>{children}</>;
}
