import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TeacherGradesScreen() {
  const { isDarkMode } = useTheme();
  const [selectedClass, setSelectedClass] = useState('Mathématiques - 1ère année');
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [newGrade, setNewGrade] = useState('');

  const students = [
    { id: 1, name: 'Alice Martin', grades: ['16/20', '18/20'] },
    { id: 2, name: 'Bob Wilson', grades: ['15/20', '17/20'] },
    { id: 3, name: 'Charlie Brown', grades: ['14/20', '16/20'] },
    { id: 4, name: 'David Miller', grades: ['18/20', '19/20'] },
  ];

  const handleSaveGrade = (studentId: number) => {
    if (newGrade) {
      // Add validation and save logic here
      setEditingStudent(null);
      setNewGrade('');
    }
  };

  const styles = createStyles(isDarkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des notes</Text>
      </View>

      <View style={styles.classSelector}>
        <Text style={styles.sectionTitle}>Classe sélectionnée</Text>
        <TouchableOpacity style={styles.classSelectorButton}>
          <Text style={styles.selectedClass}>{selectedClass}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.studentsContainer}>
        <Text style={styles.sectionTitle}>Liste des élèves</Text>
        {students.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <View style={styles.gradesContainer}>
                {student.grades.map((grade, index) => (
                  <Text key={index} style={styles.grade}>
                    {grade}
                  </Text>
                ))}
              </View>
            </View>
            {editingStudent === student.id ? (
              <View style={styles.gradeEditContainer}>
                <TextInput
                  style={styles.gradeInput}
                  value={newGrade}
                  onChangeText={setNewGrade}
                  placeholder="Note/20"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSaveGrade(student.id)}>
                  <Check size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingStudent(null)}>
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addGradeButton}
                onPress={() => setEditingStudent(student.id)}>
                <Text style={styles.addGradeText}>Ajouter une note</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#181818' : '#f8fafc',
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: isDarkMode ? '#0F0F0F' : 'rgb(105, 6, 57)',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#ffffff',
    },
    classSelector: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: 12,
    },
    classSelectorButton: {
      backgroundColor: isDarkMode ? 'grey' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedClass: {
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#1f2937',
      fontWeight: '500',
    },
    studentsContainer: {
      padding: 16,
    },
    studentCard: {
      backgroundColor: isDarkMode ? 'grey' : '#ffffff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    studentInfo: {
      marginBottom: 12,
    },
    studentName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: 8,
    },
    gradesContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    grade: {
      backgroundColor: isDarkMode ? '#6b7280' : '#f1f5f9',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      color: isDarkMode ? 'white' : 'blue',
      fontWeight: '500',
    },
    gradeEditContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    gradeInput: {
      flex: 1,
      backgroundColor: isDarkMode ? '#6b7280' : '#f1f5f9',
      padding: 8,
      borderRadius: 8,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    saveButton: {
      backgroundColor: '#22c55e',
      padding: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#ef4444',
      padding: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addGradeButton: {
      backgroundColor: isDarkMode ? 'rgba(105, 6, 57, 0.52)' : 'rgba(105, 6, 57, 0.8)',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    addGradeText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },
  });