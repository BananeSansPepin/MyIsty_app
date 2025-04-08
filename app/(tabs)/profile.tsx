import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { User, Moon, Bell, Lock, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Notifications from 'expo-notifications';

async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  }
  return true;
}

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const styles = createStyles(isDarkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={40} color="#ffffff" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Moon size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : 'black'} />
            <Text style={styles.settingText}>Mode sombre</Text>
          </View>
          <Switch
            trackColor={{ false: '#cbd5e1', true: 'rgba(105, 6, 57, 0.52)' }}
            thumbColor="#ffffff"
            value={isDarkMode}
            onValueChange={toggleTheme}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : 'black'} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: '#cbd5e1', true: 'rgba(105, 6, 57, 0.52)' }}
            thumbColor="#ffffff"
            value={true} 
            onValueChange={async (value) => {
              if (value) {
                const granted = await requestNotificationPermissions();
                if (granted) {
                  console.log('Notifications activées');
                } else {
                  console.log('Permissions refusées');
                }
              } else {
                console.log('Notifications désactivées');
              }
            }}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Lock size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : 'black'} />
            <Text style={styles.settingText}>Changer le mot de passe</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutButton]} onPress={logout}>
          <View style={styles.settingLeft}>
            <LogOut size={24} color="rgb(105, 6, 57)" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#181818' : '#f8fafc',
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: isDarkMode ? '#0F0F0F' : 'rgb(105, 6 57)',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDarkMode ? 'grey' : 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? 'white' : '#ffffff',
    },
    email: {
      fontSize: 16,
      color: isDarkMode ? '#9ca3af' : '#e0e7ff',
      marginTop: 4,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: 16,
    },
    settingItem: {
      backgroundColor: isDarkMode ? 'grey' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingText: {
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginLeft: 12,
    },
    logoutButton: {
      marginTop: 24,
    },
    logoutText: {
      fontSize: 16,
      color: 'rgb(105, 6, 57)',
      fontWeight: 'bold',
      marginLeft: 12,
    },
  });