import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  RadioButton,
  SegmentedButtons
} from 'react-native-paper';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [className, setClassName] = useState('IATIC3');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }

      const userData = {
        email,
        password,
        role,
        ...(role === 'student' ? { class: className } : { subject })
      };

      // TODO: Appel API pour l'inscription
      console.log('Données d\'inscription:', userData);
      
      navigation.replace('Login');
    } catch (err) {
      setError(err.message);
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
              <RadioButton.Item label="Étudiant" value="student" />
              <RadioButton.Item label="Professeur" value="teacher" />
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
          >
            S'inscrire
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
          >
            Déjà inscrit ? Se connecter
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  surface: {
    margin: 20,
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
  label: {
    fontSize: 16,
    marginBottom: 10
  },
  radioContainer: {
    marginBottom: 15
  },
  segmentedButtons: {
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
  }
});

export default RegisterScreen;
