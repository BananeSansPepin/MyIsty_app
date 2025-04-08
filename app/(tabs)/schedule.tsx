import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';

export default function ScheduleScreen() {
  const { user } = useAuth();
  
  // Rediriger vers login si non connecté
  React.useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  if (!user) return null;

  const getScheduleUrl = () => {
    if (user.role === 'student') {
      return `https://edt.iut-velizy.uvsq.fr/cal?vt=agendaWeek&dt=2025-04-07&et=group&fid0=${user.class}`;
    }
    return 'https://edt.iut-velizy.uvsq.fr/cal?vt=agendaWeek&dt=2025-04-07';
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: getScheduleUrl() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webview: {
    flex: 1
  }
});
