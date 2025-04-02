import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { UserCheck, GraduationCap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TeacherHomeScreen() {
  const { isDarkMode } = useTheme();

  const classes = [
    {
      name: 'Mathématiques - 1ère année',
      time: '10:00 - 12:00',
      room: 'Salle B204',
      attendance: 25,
      total: 30,
    },
    {
      name: 'Physique - 2ème année',
      time: '14:00 - 16:00',
      room: 'Salle A102',
      attendance: 28,
      total: 28,
    },
  ];

  const styles = createStyles(isDarkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, Prof. Martin</Text>
        <Text style={styles.subGreeting}>Bienvenue sur MyIsty</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cours d'aujourd'hui</Text>
        {classes.map((classItem, index) => (
          <View key={index} style={styles.classCard}>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{classItem.name}</Text>
              <Text style={styles.classTime}>{classItem.time}</Text>
              <Text style={styles.classRoom}>{classItem.room}</Text>
            </View>
            <View style={styles.attendanceContainer}>
              <Text style={styles.attendanceText}>
                {classItem.attendance}/{classItem.total}
              </Text>
              <Text style={styles.attendanceLabel}>Présents</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <UserCheck size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : '#000000'} />
          <Text style={styles.actionText}>Faire l'appel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <GraduationCap size={24} color={isDarkMode ? 'rgba(105, 6, 57, 0.52)' : '#000000'} />
          <Text style={styles.actionText}>Saisir les notes</Text>
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
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: 12,
    },
    classCard: {
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
    classInfo: {
      flex: 1,
    },
    className: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
    },
    classTime: {
      fontSize: 14,
      color: isDarkMode ? '#d1d5db' : 'black',
      fontWeight: 'bold',
      marginTop: 4,
    },
    classRoom: {
      fontSize: 14,
      color: isDarkMode ? 'white' : '#64748b',
      marginTop: 2,
    },
    attendanceContainer: {
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(106, 103, 103, 0.76)' : '#f1f5f9',
      padding: 8,
      borderRadius: 8,
    },
    attendanceText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? 'rgba(105, 6, 57, 0.52)' : 'blue',
    },
    attendanceLabel: {
      fontSize: 12,
      color: isDarkMode ? '#d1d5db' : '#64748b',
      marginTop: 2,
    },
    quickActions: {
      flexDirection: 'row',
      padding: 16,
      gap: 16,
    },
    actionCard: {
      flex: 1,
      backgroundColor: isDarkMode ? 'grey' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
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
  });