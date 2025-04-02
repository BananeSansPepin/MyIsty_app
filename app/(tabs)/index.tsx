import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, UserCheck, GraduationCap, Bell } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { isDarkMode } = useTheme();

  const styles = createStyles(isDarkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, Thomas</Text>
        <Text style={styles.subGreeting}>Bienvenue sur MyIsty</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <Clock size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : '#000000'} />
          <Text style={styles.actionText}>Emploi du temps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <UserCheck size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : '#000000'} />
          <Text style={styles.actionText}>Absences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <GraduationCap size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : '#000000'} />
          <Text style={styles.actionText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Bell size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : '#000000'} />
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochains cours</Text>
        <View style={styles.courseCard}>
          <Text style={styles.courseTime}>10:00 - 12:00</Text>
          <Text style={styles.courseName}>Mathématiques</Text>
          <Text style={styles.courseRoom}>Salle B204</Text>
        </View>
        <View style={styles.courseCard}>
          <Text style={styles.courseTime}>14:00 - 16:00</Text>
          <Text style={styles.courseName}>Physique</Text>
          <Text style={styles.courseRoom}>Salle A102</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dernières notes</Text>
        <View style={styles.gradeCard}>
          <Text style={styles.gradeName}>Mathématiques</Text>
          <Text style={styles.gradeValue}>18/20</Text>
        </View>
        <View style={styles.gradeCard}>
          <Text style={styles.gradeName}>Physique</Text>
          <Text style={styles.gradeValue}>16/20</Text>
        </View>
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
      backgroundColor: isDarkMode ? '#0F0F0F' : 'rgb(105, 6, 57)',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#ffffff',
    },
    subGreeting: {
      fontSize: 16,
      color: isDarkMode ? '#d1d5db' : '#e0e7ff',
      marginTop: 4,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 16,
    },
    actionCard: {
      backgroundColor: isDarkMode ? 'grey' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      width: '45%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionText: {
      marginTop: 8,
      color: isDarkMode ? '#ffffff' : '#1f2937',
      fontSize: 14,
      fontWeight: '500',
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: 12,
    },
    courseCard: {
      backgroundColor: isDarkMode ? 'grey' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    courseTime: {
      fontSize: 14,
      color: isDarkMode ? '#d1d5db' : 'black',
      fontWeight: '500',
    },
    courseName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginTop: 4,
    },
    courseRoom: {
      fontSize: 14,
      color: isDarkMode ? 'white' : '#64748b',
      marginTop: 4,
    },
    gradeCard: {
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
    gradeName: {
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#1f2937',
      fontWeight: '500',
    },
    gradeValue: {
      fontSize: 16,
      color: isDarkMode ? 'rgba(105, 6, 57, 0.52)' : 'blue',
      fontWeight: 'bold',
    },
  });