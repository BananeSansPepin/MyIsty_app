import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Button, Portal, Dialog, Searchbar } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';

type Absence = {
  id: number;
  student_name: string;
  student_email: string;
  subject: string;
  teacher_email: string;
  date: string;
};

export default function AbsencesScreen() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [filteredAbsences, setFilteredAbsences] = useState<Absence[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteAbsenceId, setDeleteAbsenceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchAbsences();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAbsences(absences);
    } else {
      const filtered = absences.filter(absence => 
        absence.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        absence.student_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAbsences(filtered);
    }
  }, [searchQuery, absences]);

  const fetchAbsences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get('/absences');
      setAbsences(data);
      setFilteredAbsences(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
      setError('Impossible de charger la liste des absences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAbsence = async () => {
    if (!deleteAbsenceId) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/absences/${deleteAbsenceId}`);
      setAbsences(absences.filter(a => a.id !== deleteAbsenceId));
      setFilteredAbsences(filteredAbsences.filter(a => a.id !== deleteAbsenceId));
      setDeleteAbsenceId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Impossible de supprimer l\'absence');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Absences</Text>
      </View>

      <Searchbar
        placeholder="Rechercher un étudiant..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {isLoading && <Text style={styles.message}>Chargement...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      
      <ScrollView style={styles.scrollView}>
        {!isLoading && filteredAbsences.length === 0 && (
          <Text style={styles.message}>
            {searchQuery ? 'Aucun étudiant trouvé' : 'Aucune absence enregistrée'}
          </Text>
        )}

        {filteredAbsences.map((absence) => (
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
            <Text style={styles.absenceSubject}>{absence.subject}</Text>
            <Text style={styles.studentEmail}>
              Étudiant : {absence.student_email}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setDeleteAbsenceId(absence.id)}
              style={styles.deleteButton}
              buttonColor="#ff4444"
            >
              Supprimer
            </Button>
          </Surface>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={!!deleteAbsenceId} onDismiss={() => setDeleteAbsenceId(null)}>
          <Dialog.Title>Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir supprimer cette absence ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteAbsenceId(null)}>Annuler</Button>
            <Button 
              onPress={handleDeleteAbsence} 
              loading={isLoading}
              textColor="#ff4444"
            >
              Supprimer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  searchBar: {
    margin: 16,
    elevation: 2
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  absenceCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2
  },
  absenceDate: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  absenceSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  deleteButton: {
    marginTop: 8
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20
  },
  error: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff4444',
    marginTop: 20
  }
}); 