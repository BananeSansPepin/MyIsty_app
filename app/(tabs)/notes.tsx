import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Surface, Text, Button, SegmentedButtons, TextInput, Portal, Dialog, useTheme, Searchbar } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { theme } from '../../src/theme';

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
  const paperTheme = useTheme();
  
  // États communs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour la vue professeur
  const [selectedClass, setSelectedClass] = useState('IATIC3');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [filteredTeacherNotes, setFilteredTeacherNotes] = useState<TeacherNote[]>([]);
  const [studentAverages, setStudentAverages] = useState<StudentAverage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour la vue étudiant
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [filteredStudentNotes, setFilteredStudentNotes] = useState<StudentNote[]>([]);
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
      setFilteredTeacherNotes(teacherNotes);
      setFilteredStudentNotes(studentNotes);
    } else {
      if (user?.role === 'teacher') {
        const filtered = students.filter(student => 
          student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStudents(filtered);
        
        const filteredNotes = teacherNotes.filter(note =>
          note.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.student_email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTeacherNotes(filteredNotes);
      } else if (user?.role === 'student') {
        const filteredNotes = studentNotes.filter(note =>
          note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStudentNotes(filteredNotes);
      }
    }
  }, [searchQuery, students, teacherNotes, studentNotes, user?.role]);

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
        setFilteredStudents(studentsData);

        const { notes, averages } = await api.get(`/notes/teacher/${selectedClass}`);
        setTeacherNotes(notes);
        setFilteredTeacherNotes(notes);
        setStudentAverages(averages);
      } else if (user.role === 'student') {
        // Récupérer les données pour la vue étudiant
        const { notes, averages } = await api.get('/notes/student');
        setStudentNotes(notes);
        setFilteredStudentNotes(notes);
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
    const notesBySubject = filteredStudentNotes.reduce((acc, note) => {
      if (!acc[note.subject]) {
        acc[note.subject] = [];
      }
      acc[note.subject].push(note);
      return acc;
    }, {} as Record<string, StudentNote[]>);

    return (
      <ScrollView style={styles.container}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>Mes Notes et Moyennes</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Searchbar
            placeholder="Rechercher par matière ou professeur..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          {loading ? (
            <Text style={styles.message}>Chargement...</Text>
          ) : (
            <>
              {Object.entries(notesBySubject).map(([subject, notes]) => {
                const subjectAverage = subjectAverages.find(avg => avg.subject === subject)?.average;
                return (
                  <View key={subject} style={styles.subjectCard}>
                    <Surface style={styles.averageCard}>
                      <Text style={styles.averageLabel}>Matière: {subject}</Text>
                      <Text style={styles.averageText}>
                        Moyenne: {subjectAverage ? Number(subjectAverage).toFixed(2) : 'N/A'}
                      </Text>
                    </Surface>

                    {notes.map((note) => (
                      <Surface key={note.id} style={styles.noteCard}>
                        <Text style={styles.noteValue}>{note.value}</Text>
                        <Text style={styles.noteDate}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </Text>
                        <Text style={styles.teacherInfo}>
                          Professeur: {note.teacher_email}
                        </Text>
                      </Surface>
                    ))}
                  </View>
                );
              })}

              {subjectAverages.length > 0 && (
                <Surface style={styles.generalAverageCard}>
                  <Text style={styles.generalAverageTitle}>Moyenne Générale</Text>
                  <Text style={styles.generalAverageValue}>
                    {(subjectAverages.reduce((acc, curr) => acc + Number(curr.average), 0) / subjectAverages.length).toFixed(2)}
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
                <Surface key={student.id} style={styles.studentItem}>
                  <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.firstname}</Text>
                      <Text style={styles.studentEmail}>{student.email}</Text>
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
                  </View>
                  
                  {filteredTeacherNotes
                    .filter(note => note.student_email === student.email)
                    .map(note => (
                      <View key={note.id} style={styles.noteItem}>
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
                    <Text style={styles.studentAverage}>
                      Moyenne : {Number(studentAverages.find(avg => avg.student_name === student.firstname)?.average).toFixed(2)}/20
                    </Text>
                  )}
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
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  surface: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  subtitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  label: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  segmentedButtons: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  studentItem: {
    flexDirection: 'column',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  studentAverage: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  notesContainer: {
    marginTop: 8,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginTop: 4,
  },
  noteCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noteValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  noteDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  error: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  success: {
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  message: {
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  subjectCard: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  addButton: {
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  dialogStudent: {
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text,
  } as TextStyle,
  input: {
    marginBottom: theme.spacing.md,
  } as ViewStyle & TextStyle,
  generalAverageCard: {
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.lg,
  } as ViewStyle,
  generalAverageTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.surface,
    textAlign: 'center',
  } as TextStyle,
  generalAverageValue: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.surface,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  } as TextStyle,
  averageCard: {
    padding: theme.spacing.md,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  averageLabel: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  averageText: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.colors.surface,
    textAlign: 'center',
  } as TextStyle,
  teacherInfo: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  searchBar: {
    marginVertical: 16,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
});
