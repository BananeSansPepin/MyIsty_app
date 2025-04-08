import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints pour la responsivité
export const SCREEN_SIZES = {
  small: width < 375,
  medium: width >= 375 && width < 768,
  large: width >= 768,
};

// Échelle de taille responsive
const scale = width / 375; // Base sur iPhone 8
export const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(newSize);
};

// Thème de couleurs
export const COLORS = {
  primary: '#2196F3',
  secondary: '#1976D2',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#757575',
  error: '#FF4444',
  success: '#4CAF50',
  warning: '#FFC107',
  border: '#E0E0E0',
};

// Espacement
export const SPACING = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
};

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: normalize(32),
    fontWeight: 'bold',
  },
  h2: {
    fontSize: normalize(24),
    fontWeight: 'bold',
  },
  h3: {
    fontSize: normalize(20),
    fontWeight: 'bold',
  },
  body: {
    fontSize: normalize(16),
  },
  caption: {
    fontSize: normalize(14),
  },
}; 