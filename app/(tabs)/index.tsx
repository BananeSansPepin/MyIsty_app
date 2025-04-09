import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Surface, Text, Card, Title, Paragraph, ActivityIndicator, Badge, Button } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../../src/services/api';
import { theme, styles as themeStyles } from '../../src/theme/theme';

type Note = {
  id: number;
  value: number;
  subject: string;
  created_at: string;
};

type Student = {
  id: number;
  name: string;
  email: string;
  average: number;
  notes_count: number;
};

type ClassStats = {
  averageClass: number;
  bestAverage: number;
  lowestAverage: number;
  studentsCount: number;
  notesCount: number;
  subjectAverages: {
    subject: string;
    average: number;
    studentsCount: number;
  }[];
};

type DashboardData = {
  recentNotes: Note[];
  averages: { subject: string; average: number }[];
  notesTimeline: { dates: string[]; values: number[] };
  classStats?: ClassStats;
  studentsAtRisk?: Student[];
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentNotes: [],
    averages: [],
    notesTimeline: { dates: [], values: [] }
  });
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'student') {
        // Code existant pour les étudiants
        const response = await api.get('/notes/student');
        const notes = response.notes || [];
        const averages = response.averages || [];

        const sortedNotes = [...notes].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const recentNotes = sortedNotes.slice(0, 3);

        const timelineNotes = [...notes]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(-10);

        const notesTimeline = {
          dates: timelineNotes.map(note => new Date(note.created_at).toLocaleDateString('fr-FR')),
          values: timelineNotes.map(note => note.value)
        };

        setDashboardData({
          recentNotes,
          averages,
          notesTimeline
        });
      } else if (user?.role === 'teacher') {
        // Nouvelles données pour les professeurs
        const response = await api.get('/dashboard/teacher');
        const { classStats, studentsAtRisk, notesTimeline } = response;

        setDashboardData({
          recentNotes: [],
          averages: classStats.subjectAverages,
          notesTimeline,
          classStats,
          studentsAtRisk
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    } else {
      fetchDashboardData();
    }
  }, [user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (!user) return null;

  if (user.role === 'teacher') {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Surface style={styles.surface}>
          <Text style={styles.title}>Tableau de bord professeur</Text>
          <Text style={styles.welcome}>{user.firstname}</Text>
          <Text style={styles.role}>Professeur de {user.subject}</Text>
        </Surface>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#2196F3" />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Statistiques générales */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Statistiques de la classe</Title>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Number(dashboardData.classStats?.averageClass || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Moyenne générale</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Number(dashboardData.classStats?.bestAverage || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Meilleure moyenne</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Number(dashboardData.classStats?.lowestAverage || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Plus basse moyenne</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {dashboardData.classStats?.studentsCount || 0}
                    </Text>
                    <Text style={styles.statLabel}>Étudiants</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Graphique d'évolution */}
            {dashboardData.notesTimeline.values.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Title>Évolution des moyennes</Title>
                  <LineChart
                    data={{
                      labels: dashboardData.notesTimeline.dates,
                      datasets: [{
                        data: dashboardData.notesTimeline.values
                      }]
                    }}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                      style: {
                        borderRadius: 16
                      }
                    }}
                    bezier
                    style={styles.chart}
                  />
                </Card.Content>
              </Card>
            )}

            {/* Liste des étudiants en difficulté */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Étudiants à suivre</Title>
                {dashboardData.studentsAtRisk?.map((student) => (
                  <View key={student.id} style={styles.studentItem}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentAverage}>
                        Moyenne: {student.average.toFixed(2)}
                      </Text>
                    </View>
                    <Badge 
                      size={24} 
                      style={[styles.warningBadge, { 
                        backgroundColor: student.average < 8 ? '#F44336' : '#FFC107' 
                      }]}
                    >
                      !
                    </Badge>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Bouton pour ajouter une note */}
            <Button 
              mode="contained" 
              style={styles.addButton}
              onPress={() => router.push('/notes')}
            >
              Ajouter une note
            </Button>
          </>
        )}
      </ScrollView>
    );
  }

  // Code existant pour la vue étudiant
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Surface style={styles.surface}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.welcome}>{user.firstname}</Text>
        <Text style={styles.role}>Étudiant en {user.class}</Text>
      </Surface>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#2196F3" />
      ) : error ? (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      ) : (
        <>
          {/* Section Notifications */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Dernières notes</Title>
              {dashboardData.recentNotes.length > 0 ? (
                dashboardData.recentNotes.map((note, index) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Badge size={24} style={[styles.noteBadge, { backgroundColor: getColorForNote(note.value) }]}>
                      {note.value}
                    </Badge>
                    <View style={styles.noteInfo}>
                      <Paragraph style={styles.noteSubject}>{note.subject}</Paragraph>
                      <Text style={styles.noteDate}>
                        {new Date(note.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Paragraph>Aucune note récente</Paragraph>
              )}
            </Card.Content>
          </Card>

          {/* Graphique d'évolution */}
          {dashboardData.notesTimeline.values.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title>Évolution des notes</Title>
                <LineChart
                  data={{
                    labels: dashboardData.notesTimeline.dates,
                    datasets: [{
                      data: dashboardData.notesTimeline.values
                    }]
                  }}
                  width={Dimensions.get('window').width - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    style: {
                      borderRadius: 16
                    }
                  }}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          )}

          {/* Moyennes par matière */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Moyennes par matière</Title>
              {dashboardData.averages.map((avg, index) => (
                <View key={index} style={styles.averageItem}>
                  <Text style={styles.averageSubject}>{avg.subject}</Text>
                  <Badge 
                    size={24} 
                    style={[styles.averageBadge, { backgroundColor: getColorForNote(Number(avg.average)) }]}
                  >
                    {Number(avg.average).toFixed(2)}
                  </Badge>
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const getColorForNote = (note: number): string => {
  if (note >= 16) return '#4CAF50'; // Vert
  if (note >= 12) return '#2196F3'; // Bleu
  if (note >= 8) return '#FFC107';  // Orange
  return '#F44336';                 // Rouge
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  surface: {
    ...themeStyles.shadow,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  title: {
    ...themeStyles.title,
    color: theme.colors.primary,
  },
  welcome: {
    ...themeStyles.subtitle,
    color: theme.colors.text,
  },
  role: {
    ...themeStyles.textSecondary,
    color: theme.colors.textSecondary,
  },
  card: {
    ...themeStyles.card,
    ...themeStyles.shadow,
  },
  loader: {
    marginTop: theme.spacing.lg,
  },
  errorCard: {
    ...themeStyles.card,
    backgroundColor: theme.colors.error + '10',
  },
  errorText: {
    color: theme.colors.error,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8
  },
  noteBadge: {
    marginRight: 12
  },
  noteInfo: {
    flex: 1
  },
  noteSubject: {
    fontWeight: 'bold',
    fontSize: 16
  },
  noteDate: {
    color: '#666',
    fontSize: 12
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.roundness,
  },
  averageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8
  },
  averageSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  averageBadge: {
    marginLeft: 12
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  statItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...themeStyles.shadow,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...themeStyles.textSecondary,
    textAlign: 'center',
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    marginVertical: theme.spacing.xs,
    ...themeStyles.shadow,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...themeStyles.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  studentAverage: {
    ...themeStyles.textSecondary,
  },
  warningBadge: {
    marginLeft: theme.spacing.sm,
  },
  addButton: {
    margin: theme.spacing.md,
    marginTop: 0,
  },
});
