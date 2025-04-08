import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Bienvenue sur MyIsty</Text>
        <Text style={styles.welcome}>
          {user.firstname}
        </Text>
        <Text style={styles.role}>
          {user.role === 'student' ? 
            `Étudiant en ${user.class}` : 
            `Professeur de ${user.subject}`}
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3'
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  role: {
    fontSize: 18,
    color: '#666'
  }
});
