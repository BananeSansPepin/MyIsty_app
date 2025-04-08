import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Button, TextInput, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Tous les champs sont requis');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Les nouveaux mots de passe ne correspondent pas');
        return;
      }

      if (newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
      }

      await api.changePassword(currentPassword, newPassword);
      setSuccess('Mot de passe modifié avec succès');
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Profil</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nom:</Text>
          <Text style={styles.value}>{user.firstname}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Rôle:</Text>
          <Text style={styles.value}>
            {user.role === 'student' ? `Étudiant - ${user.class}` :
             user.role === 'teacher' ? `Professeur - ${user.subject}` :
             'Administrateur'}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => setShowPasswordDialog(true)}
          style={styles.button}
        >
          Changer le mot de passe
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.button, styles.logoutButton]}
          buttonColor="#ff4444"
        >
          Se déconnecter
        </Button>
      </Surface>

      <Portal>
        <Dialog visible={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)}>
          <Dialog.Title>Changer le mot de passe</Dialog.Title>
          <Dialog.Content>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TextInput
              label="Mot de passe actuel"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)}>Annuler</Button>
            <Button 
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
            >
              Confirmer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
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
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  infoContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4
  },
  value: {
    fontSize: 18,
    marginBottom: 16
  },
  button: {
    marginTop: 10
  },
  logoutButton: {
    marginTop: 20
  },
  input: {
    marginBottom: 10
  },
  error: {
    color: '#ff4444',
    marginBottom: 10
  },
  success: {
    color: '#00C851',
    marginBottom: 10
  }
});
