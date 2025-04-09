import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme
} from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // TODO: Implémenter l'appel API pour l'authentification
      // const response = await authService.login(email, password);
      
      // Si connexion réussie, naviguer vers le tableau de bord
      navigation.replace('Dashboard');
    } catch (err) {
      setError('Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Surface style={styles.surface}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>MyIsty</Text>
        
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

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

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
        >
          Se connecter
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          Mot de passe oublié ?
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
};

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
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20
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
  }
});

export default LoginScreen;
