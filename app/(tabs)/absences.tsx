import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Surface, Text, Button, SegmentedButtons, Portal, Dialog, useTheme, Searchbar } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { theme } from '../../src/theme';

// Types
type Student = {
  id: number;
  email: string;
  firstname: string;
  subject_id?: number;
};

type Absence = {
  id: number;
  student_name: string;
  student_email: string;
  subject_name: string;
  teacher_email: string;
  date: string;
};

export default function AbsencesScreen() {
  const { user } = useAuth();
  const paperTheme = useTheme();
  
  // États communs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour la vue professeur
  const [selectedClass, setSelectedClass] = useState('IATIC3');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour la vue étudiant
  const [absences, setAbsences] = useState<Absence[]>([]);

  // États pour le dialogue de confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    fetchData();
  }, [selectedClass]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student: Student) => 
        student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }

      if (user.role === 'teacher') {
        // Récupérer la liste des étudiants de la classe sélectionnée
        const studentsData = await api.get(`/students/${selectedClass}`);
        // Trier les étudiants par ordre alphabétique
        const sortedStudents = studentsData.sort((a: Student, b: Student) => 
          a.firstname.localeCompare(b.firstname, 'fr', { sensitivity: 'base' })
        );
        setStudents(sortedStudents);
        setFilteredStudents(sortedStudents);
      } else if (user.role === 'student') {
        // Récupérer l'historique des absences de l'étudiant
        const absencesData = await api.get('/absences/student');
        setAbsences(absencesData);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async () => {
    if (!selectedStudent || !user) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Récupérer d'abord l'ID de la matière associée au professeur
      const subjectResponse = await api.get(`/subjects/teacher/${user.id}`);
      
      if (!subjectResponse || !subjectResponse.id) {
        setError('Aucune matière associée à ce professeur');
        return;
      }
      
      // Créer une date en heure locale
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      
      await api.post('/absences', {
        studentId: selectedStudent.id,
        subjectId: subjectResponse.id,
        date: localDate.toISOString()
      });

      setSuccess('Absence enregistrée avec succès');
      setShowConfirmDialog(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'absence');
    } finally {
      setLoading(false);
    }
  };

  // Vue étudiant
  const renderStudentView = () => {
    return (
      <ScrollView style={styles.container}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Mes Absences</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <Text style={styles.message}>Chargement...</Text>
          ) : (
            <>
              {absences.length === 0 ? (
                <Text style={styles.message}>Aucune absence enregistrée</Text>
              ) : (
                absences.map((absence) => (
                  <Surface key={absence.id} style={styles.absenceCard}>
                    <Text style={styles.absenceDate}>
                      {new Date(absence.date).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Europe/Paris'
                      })}
                    </Text>
                    <Text style={styles.absenceSubject}>{absence.subject_name}</Text>
                    <Text style={styles.teacherEmail}>
                      Professeur : {absence.teacher_email}
                    </Text>
                  </Surface>
                ))
              )}
            </>
          )}
        </Surface>
      </ScrollView>
    );
  };

  // Vue professeur
  const renderTeacherView = () => {
    return (
      <ScrollView style={styles.container}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Gestion des Absences</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Text style={styles.label}>Classe :</Text>
          <SegmentedButtons
            value={selectedClass}
            onValueChange={setSelectedClass}
            buttons={[
              { value: 'IATIC3', label: 'IATIC3' },
              { value: 'IATIC4', label: 'IATIC4' },
              { value: 'IATIC5', label: 'IATIC5' },
            ]}
            style={styles.segmentedButtons}
          />

          <Searchbar
            placeholder="Rechercher un étudiant..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          {loading ? (
            <Text style={styles.message}>Chargement...</Text>
          ) : (
            <>
              <Text style={styles.subtitle}>Liste des Étudiants</Text>
              {filteredStudents.map((student) => (
                <Surface key={student.id} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.firstname}</Text>
                    <Text style={styles.studentEmail}>{student.email}</Text>
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      setSelectedStudent(student);
                      setShowConfirmDialog(true);
                    }}
                    style={styles.absentButton}
                    buttonColor="#ff4444"
                  >
                    Marquer absent
                  </Button>
                </Surface>
              ))}
            </>
          )}
        </Surface>

        {/* Dialog de confirmation */}
        <Portal>
          <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
            <Dialog.Title>Confirmer l'absence</Dialog.Title>
            <Dialog.Content>
              <Text>
                Voulez-vous vraiment marquer {selectedStudent?.firstname} comme absent ?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowConfirmDialog(false)}>Annuler</Button>
              <Button 
                onPress={handleMarkAbsent}
                loading={loading}
                textColor="#ff4444"
              >
                Confirmer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    );
  };

  if (!user) return null;

  return user.role === 'teacher' ? renderTeacherView() : renderStudentView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  surface: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
    elevation: 4,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } as ViewStyle,
  title: {
    ...theme.typography.h2,
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  subtitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  label: {
    ...theme.typography.body1,
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  segmentedButtons: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  searchBar: {
    marginVertical: 16,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
  studentCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
    elevation: 2,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  studentInfo: {
    flex: 1,
  } as ViewStyle,
  studentName: {
    ...theme.typography.h3,
    color: theme.colors.text,
  } as TextStyle,
  studentEmail: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  } as TextStyle,
  absentButton: {
    marginLeft: theme.spacing.md,
    borderRadius: theme.roundness,
  } as ViewStyle,
  absenceCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
    elevation: 2,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  } as ViewStyle,
  absenceDate: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  absenceSubject: {
    ...theme.typography.body1,
    color: theme.colors.text,
    marginVertical: theme.spacing.xs,
  } as TextStyle,
  teacherEmail: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    fontStyle: 'italic' as const,
  } as TextStyle,
  error: {
    ...theme.typography.body1,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  } as TextStyle,
  success: {
    ...theme.typography.body1,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  } as TextStyle,
  message: {
    ...theme.typography.body1,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  } as TextStyle,
});
