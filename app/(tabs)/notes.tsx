import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Button, SegmentedButtons, TextInput, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';

// Types pour la vue professeur
type Student = {
  id: number;
  email: string;
  firstname: string;
};

type TeacherNote = {
  id: number;
  value: number;
  student_name: string;
  student_email: string;
  created_at: string;
};

type StudentAverage = {
  student_name: string;
  average: number;
};

// Types pour la vue étudiant
type StudentNote = {
  id: number;
  value: number;
  teacher_name: string;
  teacher_email: string;
  subject: string;
  created_at: string;
};

type SubjectAverage = {
  subject: string;
  average: number;
};

export default function NotesScreen() {
  const { user } = useAuth();
  
  // États communs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour la vue professeur
  const [selectedClass, setSelectedClass] = useState('IATIC3');
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [studentAverages, setStudentAverages] = useState<StudentAverage[]>([]);
  
  // États pour la vue étudiant
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<SubjectAverage[]>([]);

  // États pour les dialogues
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

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
        // Récupérer les données pour la vue professeur
        const studentsData = await api.get(`/students/${selectedClass}`);
        setStudents(studentsData);

        const { notes, averages } = await api.get(`/notes/teacher/${selectedClass}`);
        setTeacherNotes(notes);
        setStudentAverages(averages);
      } else if (user.role === 'student') {
        // Récupérer les données pour la vue étudiant
        const { notes, averages } = await api.get('/notes/student');
        setStudentNotes(notes);
        setSubjectAverages(averages);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      setError('');
      
      const value = parseFloat(noteValue);
      if (isNaN(value) || value < 0 || value > 20) {
        setError('La note doit être comprise entre 0 et 20');
        return;
      }

      await api.post('/notes', {
        studentId: selectedStudent.id,
        value,
        class: selectedClass
      });

      setSuccess('Note ajoutée avec succès');
      setShowAddNoteDialog(false);
      setNoteValue('');
      setSelectedStudent(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout de la note');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteDialog(true);
  };

  const handleDeleteNote = async () => {
    if (noteToDelete === null) return;
    
    try {
      setLoading(true);
      setError('');
      
      await api.delete(`/notes/${noteToDelete}`);
      setSuccess('Note supprimée avec succès');
      setShowDeleteDialog(false);
      setNoteToDelete(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la note');
    } finally {
      setLoading(false);
    }
  };

  // Vue étudiant
  const renderStudentView = () => {
    // Grouper les notes par matière
    const notesBySubject = studentNotes.reduce((acc, note) => {
      if (!acc[note.subject]) {
        acc[note.subject] = [];
      }
      acc[note.subject].push(note);
      return acc;
    }, {} as Record<string, StudentNote[]>);

    return (
      <ScrollView style={styles.container}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Mes Notes</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <Text style={styles.message}>Chargement...</Text>
          ) : (
            <>
              {Object.entries(notesBySubject).map(([subject, notes]) => (
                <Surface key={subject} style={styles.subjectCard}>
                  <Text style={styles.subjectTitle}>{subject}</Text>
                  
                  {notes.map(note => (
                    <View key={note.id} style={styles.noteContainer}>
                      <Text style={styles.noteValue}>{note.value}/20</Text>
                      <Text style={styles.noteDate}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.teacherInfo}>
                        {note.teacher_name}
                      </Text>
                    </View>
                  ))}
                  
                  {subjectAverages.find(avg => avg.subject === subject) && (
                    <Text style={styles.average}>
                      Moyenne : {Number(subjectAverages.find(avg => avg.subject === subject)?.average).toFixed(2)}/20
                    </Text>
                  )}
                </Surface>
              ))}

              {/* Moyenne générale */}
              {subjectAverages.length > 0 && (
                <Surface style={styles.generalAverageCard}>
                  <Text style={styles.generalAverageTitle}>Moyenne Générale</Text>
                  <Text style={styles.generalAverageValue}>
                    {(subjectAverages.reduce((sum, avg) => sum + Number(avg.average), 0) / subjectAverages.length).toFixed(2)}/20
                  </Text>
                </Surface>
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
          <Text style={styles.title}>Gestion des Notes</Text>

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
                    
                    {teacherNotes
                      .filter(note => note.student_email === student.email)
                      .map(note => (
                        <View key={note.id} style={styles.noteContainer}>
                          <Text style={styles.noteValue}>{note.value}/20</Text>
                          <Text style={styles.noteDate}>
                            {new Date(note.created_at).toLocaleDateString()}
                          </Text>
                          <Button
                            mode="text"
                            textColor="#ff4444"
                            onPress={() => confirmDeleteNote(note.id)}
                            loading={loading}
                          >
                            Supprimer
                          </Button>
                        </View>
                      ))
                    }
                    
                    {studentAverages
                      .find(avg => avg.student_name === student.firstname) && (
                      <Text style={styles.average}>
                        Moyenne : {Number(studentAverages.find(avg => avg.student_name === student.firstname)?.average).toFixed(2)}/20
                      </Text>
                    )}
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      setSelectedStudent(student);
                      setShowAddNoteDialog(true);
                    }}
                    style={styles.addButton}
                  >
                    Ajouter une note
                  </Button>
                </Surface>
              ))}
            </>
          )}
        </Surface>

        {/* Dialog pour ajouter une note */}
        <Portal>
          <Dialog visible={showAddNoteDialog} onDismiss={() => setShowAddNoteDialog(false)}>
            <Dialog.Title>Ajouter une note</Dialog.Title>
            <Dialog.Content>
              {selectedStudent && (
                <Text style={styles.dialogStudent}>
                  Pour : {selectedStudent.firstname} ({selectedStudent.email})
                </Text>
              )}
              <TextInput
                label="Note sur 20"
                value={noteValue}
                onChangeText={setNoteValue}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowAddNoteDialog(false)}>Annuler</Button>
              <Button 
                onPress={handleAddNote}
                loading={loading}
                disabled={loading || !noteValue}
              >
                Ajouter
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Dialog de confirmation de suppression */}
        <Portal>
          <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
            <Dialog.Title>Confirmer la suppression</Dialog.Title>
            <Dialog.Content>
              <Text>Êtes-vous sûr de vouloir supprimer cette note ?</Text>
              <Text>Cette action est irréversible.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeleteDialog(false)}>Annuler</Button>
              <Button 
                onPress={handleDeleteNote}
                loading={loading}
                textColor="#ff4444"
              >
                Supprimer
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
    elevation: 2
  },
  subjectCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196F3'
  },
  studentInfo: {
    marginBottom: 10
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  noteValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 50
  },
  noteDate: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  teacherInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  average: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 8
  },
  generalAverageCard: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#2196F3'
  },
  generalAverageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  generalAverageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 8
  },
  addButton: {
    marginTop: 8
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
  },
  dialogStudent: {
    marginBottom: 16,
    fontSize: 16
  },
  input: {
    marginBottom: 10
  }
});
