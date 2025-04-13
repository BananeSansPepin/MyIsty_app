import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { theme } from '../src/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgb(105, 6, 57)', 'rgb(155, 26, 87)']}
        style={styles.gradient}
      >
        <Surface style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Bienvenue sur MyIsty</Text>
            <Text style={styles.subtitle}>
              Votre application de gestion de la filière IATIC de l'ISTY
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => router.push('/auth/login')}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Se connecter
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/auth/register')}
              style={[styles.button, styles.registerButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.registerButtonLabel}
            >
              S'inscrire
            </Button>
          </View>
        </Surface>
      </LinearGradient>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: width * 0.9,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 4,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgb(105, 6, 57)',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    borderColor: 'rgb(105, 6, 57)',
    borderWidth: 2,
  },
  registerButtonLabel: {
    color: 'rgb(105, 6, 57)',
  },
}); 