import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Surface, Text, RadioButton, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [className, setClassName] = useState('IATIC3');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [firstname, setFirstname] = useState('');

  const handleRegister = async () => {
    try {
      setError('');
      setLoading(true);

      // Validation des champs
      if (!email || !password) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }

      if (role === 'teacher' && !subject) {
        setError('Veuillez spécifier la matière enseignée');
        return;
      }

      const userData = {
        email,
        firstname,
        password,
        role,
        ...(role === 'student' ? { class: className } : { subject })
      };

      console.log('Tentative d\'inscription avec:', userData);
      await register(userData);
      console.log('Inscription réussie');
      router.replace('/auth/login');
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Inscription</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Prénom"
            value={firstname}
            onChangeText={setFirstname}
            mode="outlined"
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />

          <TextInput
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />

          <Text style={styles.label}>Rôle :</Text>
          <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
            <View style={styles.radioContainer}>
              <RadioButton.Item 
                label="Étudiant" 
                value="student" 
                color="rgb(105, 6, 57)"
                uncheckedColor="rgb(105, 6, 57)"
              />
              <RadioButton.Item 
                label="Professeur" 
                value="teacher" 
                color="rgb(105, 6, 57)"
                uncheckedColor="rgb(105, 6, 57)"
              />
            </View>
          </RadioButton.Group>

          {role === 'student' ? (
            <>
              <Text style={styles.label}>Classe :</Text>
              <SegmentedButtons
                value={className}
                onValueChange={setClassName}
                buttons={[
                  { value: 'IATIC3', label: 'IATIC3' },
                  { value: 'IATIC4', label: 'IATIC4' },
                  { value: 'IATIC5', label: 'IATIC5' },
                ]}
                style={styles.segmentedButtons}
              />
            </>
          ) : (
            <TextInput
              label="Matière enseignée"
              value={subject}
              onChangeText={setSubject}
              mode="outlined"
              style={styles.input}
            />
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={loading}
          >
            S'inscrire
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('../auth/login')}
          >
            Déjà inscrit ? Se connecter
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  input: {
    marginBottom: 15
  },
  button: {
    marginTop: 10,
    marginBottom: 15
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 10
  },
  segmentedButtons: {
    marginBottom: 10
  }
});
