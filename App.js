// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator();

// Import screens (to be created)
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import GradesScreen from './src/screens/GradesScreen';
import AbsencesScreen from './src/screens/AbsencesScreen';
import MessagesScreen from './src/screens/MessagesScreen';

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar />
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Connexion' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Inscription' }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Tableau de bord' }}
            />
            <Stack.Screen 
              name="Schedule" 
              component={ScheduleScreen}
              options={{ title: 'Emploi du temps' }}
            />
            <Stack.Screen name="Grades" component={GradesScreen} />
            <Stack.Screen name="Absences" component={AbsencesScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}