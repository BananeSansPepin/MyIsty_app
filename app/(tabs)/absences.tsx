import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Button, SegmentedButtons, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';

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
  
  // États communs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour la vue professeur
  const [selectedClass, setSelectedClass] = useState('IATIC3');
  const [students, setStudents] = useState<Student[]>([]);
  
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
        setStudents(studentsData);
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
      
      await api.post('/absences', {
        studentId: selectedStudent.id,
        subjectId: subjectResponse.id,
        date: new Date().toISOString().split('T')[0] // Date du jour
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
                      {new Date(absence.date).toLocaleDateString()}
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

          {loading ? (
            <Text style={styles.message}>Chargement...</Text>
          ) : (
            <>
              <Text style={styles.subtitle}>Liste des Étudiants</Text>
              {students.map((student) => (
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
    backgroundColor: '#f5f5f5'
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  segmentedButtons: {
    marginBottom: 20
  },
  studentCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  studentInfo: {
    flex: 1
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  studentEmail: {
    fontSize: 14,
    color: '#666'
  },
  absentButton: {
    marginLeft: 16
  },
  absenceCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2
  },
  absenceDate: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  absenceSubject: {
    fontSize: 16,
    marginVertical: 4
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 10
  },
  success: {
    color: '#00C851',
    textAlign: 'center',
    marginBottom: 10
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20
  }
});
