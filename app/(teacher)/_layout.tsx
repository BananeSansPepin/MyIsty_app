import { Tabs } from 'expo-router';
import { Calendar, BookOpen, Bell, User, Users } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TeacherTabLayout() {
  const { isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#181818' : '#ffffff', // Couleur dynamique
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#0F0F0F' : '#f1f1f1', // Couleur dynamique
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: isDarkMode ? '#ffffff' : '#000000', // Couleur dynamique
        tabBarInactiveTintColor: isDarkMode ? 'grey' : '#94a3b8', // Couleur dynamique
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Emploi du temps',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}