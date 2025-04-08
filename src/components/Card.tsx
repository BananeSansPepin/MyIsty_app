import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { COLORS, SPACING, SCREEN_SIZES } from '../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: number;
}

export const Card = ({ children, style, elevation = 2, ...props }: CardProps) => {
  return (
    <View style={[styles.card, { elevation }, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    padding: SCREEN_SIZES.small ? SPACING.md : SPACING.lg,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 