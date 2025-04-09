import { DefaultTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',      // Bleu principal
    secondary: '#03A9F4',    // Bleu pour les informations
    accent: '#00BCD4',       // Bleu clair pour les accents
    error: '#F44336',        // Rouge pour les erreurs
    background: '#F5F5F5',   // Fond clair
    surface: '#FFFFFF',      // Surface blanche
    text: '#212121',         // Texte principal
    textSecondary: '#757575', // Texte secondaire
    border: '#E0E0E0',       // Bordures
    success: '#4CAF50',      // Vert pour les succès
    warning: '#FFC107',      // Jaune pour les avertissements
    info: '#2196F3',         // Bleu pour les informations
    noteColors: {
      excellent: '#4CAF50',  // ≥ 16
      good: '#2196F3',       // ≥ 12
      average: '#FFC107',    // ≥ 8
      poor: '#F44336',       // < 8
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export const styles = StyleSheet.create({
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    margin: theme.spacing.md,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.text,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  button: {
    marginVertical: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  input: {
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  listItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  badge: {
    marginLeft: theme.spacing.sm,
  },
}); 