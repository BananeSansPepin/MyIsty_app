import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';

const ScheduleScreen = () => {
  const { user } = useAuth();
  
  const getScheduleUrl = () => {
    if (user.role === 'student') {
      return `https://edt.iut-velizy.uvsq.fr/cal?vt=agendaWeek&dt=2025-04-07&et=group&fid0=${user.class}`;
    } else {
      // Pour les professeurs, on pourrait avoir une URL différente ou des filtres spécifiques
      return 'https://edt.iut-velizy.uvsq.fr/cal?vt=agendaWeek&dt=2025-04-07';
    }
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webview: {
    flex: 1
  }
});

export default ScheduleScreen;
