import { Platform, View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function GradesScreen() {
  const data = {
    labels: ['Sept', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      {
        data: [15, 16, 14, 18, 17],
        color: (opacity = 0.5) => `rgba(228, 76, 158, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const renderChart = () => {
    if (Platform.OS === 'web') {
      // For web, render a simple placeholder
      return (
        <View style={styles.webChartPlaceholder}>
          <Text style={styles.webChartText}>Moyenne: 16/20</Text>
          <Text style={styles.webChartSubtext}>
            Consultez vos notes détaillées ci-dessous
          </Text>
        </View>
      );
    }

    return (
      <LineChart
        data={data}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(228, 75, 156, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Évolution des moyennes</Text>
        {renderChart()}
      </View>

      <View style={styles.gradesContainer}>
        <Text style={styles.sectionTitle}>Dernières notes</Text>
        {[
          { subject: 'Mathématiques', grade: '18/20', date: '15 Jan 2024' },
          { subject: 'Physique', grade: '16/20', date: '12 Jan 2024' },
          { subject: 'Anglais', grade: '15/20', date: '10 Jan 2024' },
          { subject: 'Histoire', grade: '17/20', date: '8 Jan 2024' },
        ].map((item, index) => (
          <View key={index} style={styles.gradeCard}>
            <View>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.grade}>{item.grade}</Text>
          </View>
        ))}
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
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  webChartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  webChartText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  webChartSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  gradesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  gradeCard: {
    backgroundColor: '#ffffff',
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
  subject: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  grade: {
    fontSize: 18,
    color: 'blue',
    fontWeight: 'bold',
  },
});