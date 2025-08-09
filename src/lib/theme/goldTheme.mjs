/**
 * @fileoverview Gold-black gradient theme system
 * @module @har2lolicode/ui
 */

export const goldTheme = {
  colors: {
    gold: {
      primary: '#D4AF37',
      secondary: '#B8860B', 
      tertiary: '#8B7500',
      light: '#F4E4BC',
      dark: '#6B5600'
    },
    black: {
      pure: '#000000',
      soft: '#0A0A0A',
      medium: '#1A1A1A',
      light: '#2A2A2A'
    },
    status: {
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },
  
  gradients: {
    // Primary gradients
    primary: 'radial-gradient(circle at 10% 20%, #D4AF37 0%, #B8860B 40%, #000000 100%)',
    secondary: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #000000 100%)',
    subtle: 'linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    
    // Interactive gradients
    hover: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
    active: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3) 0%, rgba(0, 0, 0, 0) 60%)',
    
    // Dynamic confidence gradient
    confidence: 'linear-gradient(90deg, #ff4d4d var(--low), #ffa64d var(--medium), #d4af37 var(--high))',
    
    // Background gradients
    backgroundRadial: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.05) 0%, #000000 50%)',
    backgroundLinear: 'linear-gradient(180deg, #000000 0%, rgba(212, 175, 55, 0.02) 100%)'
  },
  
  animations: {
    // Pulse animations
    pulse: 'goldPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    pulseSlow: 'goldPulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    pulseFast: 'goldPulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    
    // Shimmer effect
    shimmer: 'goldShimmer 3s linear infinite',
    
    // Glow effect
    glow: 'goldGlow 2s ease-in-out infinite alternate'
  },
  
  shadows: {
    // Gold glow shadows
    glow: '0 0 15px rgba(212, 175, 55, 0.5)',
    glowStrong: '0 0 30px rgba(212, 175, 55, 0.7)',
    glowSubtle: '0 0 8px rgba(212, 175, 55, 0.3)',
    
    // Layered shadows
    elevated: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.2)',
    card: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(212, 175, 55, 0.1)',
    
    // Inset shadows
    inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
    insetGold: 'inset 0 0 10px rgba(212, 175, 55, 0.2)'
  },
  
  borders: {
    // Border styles
    default: '1px solid rgba(212, 175, 55, 0.3)',
    strong: '2px solid rgba(212, 175, 55, 0.5)',
    subtle: '1px solid rgba(212, 175, 55, 0.15)',
    gradient: 'double 3px transparent',
    
    // Border radius
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px'
    }
  },
  
  typography: {
    // Font families
    fonts: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      display: ['Bebas Neue', 'sans-serif']
    },
    
    // Text shadows
    textShadows: {
      glow: '0 0 10px rgba(212, 175, 55, 0.7)',
      subtle: '0 1px 2px rgba(0, 0, 0, 0.8)',
      strong: '0 2px 4px rgba(0, 0, 0, 1)'
    }
  }
};

// CSS custom properties for dynamic theming
export const cssVariables = `
  :root {
    --gold-primary: ${goldTheme.colors.gold.primary};
    --gold-secondary: ${goldTheme.colors.gold.secondary};
    --gold-tertiary: ${goldTheme.colors.gold.tertiary};
    --black-pure: ${goldTheme.colors.black.pure};
    --black-soft: ${goldTheme.colors.black.soft};
    
    /* Animation keyframes */
    @keyframes goldPulse {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
      }
      50% {
        opacity: 0.8;
        box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
      }
    }
    
    @keyframes goldShimmer {
      0% {
        background-position: -200% center;
      }
      100% {
        background-position: 200% center;
      }
    }
    
    @keyframes goldGlow {
      from {
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
      }
      to {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
      }
    }
  }
`;

// Tailwind config extension
export const tailwindExtension = {
  colors: goldTheme.colors,
  backgroundImage: goldTheme.gradients,
  boxShadow: goldTheme.shadows,
  animation: goldTheme.animations,
  fontFamily: goldTheme.typography.fonts
};