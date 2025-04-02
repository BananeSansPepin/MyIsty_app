import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}></Text>
      </View>
      <WebView
        source={{ uri: 'https://edt.iut-velizy.uvsq.fr/cal?vt=agendaWeek&dt=2024-08-30&et=group&fid0=IATIC3' }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 33,
    backgroundColor: 'rgb(105, 6 57)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  webview: {
    flex: 1,
  },
});