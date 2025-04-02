import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Bell, Calendar, BookOpen, UserCheck } from 'lucide-react-native';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      type: 'schedule',
      title: 'Changement d\'emploi du temps',
      message: 'Le cours de mathématiques de demain est déplacé à 14h',
      time: 'Il y a 1 heure',
      icon: Calendar,
    },
    {
      id: 2,
      type: 'grade',
      title: 'Nouvelle note',
      message: 'Note de physique : 16/20',
      time: 'Il y a 2 heures',
      icon: BookOpen,
    },
    {
      id: 3,
      type: 'absence',
      title: 'Absence signalée',
      message: 'Absence en histoire le 10/01/2024',
      time: 'Il y a 1 jour',
      icon: UserCheck,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.notificationsContainer}>
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.iconContainer}>
                <Icon size={24} color="red" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgb(105, 6 57)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationsContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});