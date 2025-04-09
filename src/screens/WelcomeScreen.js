import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenue sur MyIsty</Text>
        
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          Se connecter
        </Button>

        <Button
          mode="outlined"
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          S'inscrire
        </Button>
      </Surface>
    </View>
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
    elevation: 4,
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30
  },
  button: {
    width: '100%',
    marginVertical: 10
  }
});

export default WelcomeScreen;
