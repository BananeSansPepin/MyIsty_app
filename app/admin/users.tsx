import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Surface, Text, Button, Portal, Dialog, Searchbar } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { User } from '../../src/types/user';
import { theme } from '../../src/theme';

type UserData = Omit<User, 'token'>;

export default function UsersScreen() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.class && user.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.subject && user.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Tentative de récupération des utilisateurs...');
      const data = await api.get('/users');
      console.log('Données reçues:', data);
      const sortedUsers = [...data].sort((a, b) => 
        a.firstname.localeCompare(b.firstname, 'fr', { sensitivity: 'base' })
      );
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError('Impossible de charger la liste des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/users/${deleteUserId}`);
      setUsers(users.filter(u => u.id !== deleteUserId));
      setFilteredUsers(filteredUsers.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Impossible de supprimer l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des utilisateurs</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Rechercher un utilisateur..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {isLoading && <Text style={styles.message}>Chargement...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      
      <ScrollView style={styles.scrollView}>
        {!isLoading && filteredUsers.length === 0 && (
          <Text style={styles.message}>
            {searchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur enregistré'}
          </Text>
        )}

        {filteredUsers.map((userData) => (
          <Surface key={userData.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{userData.firstname}</Text>
              <Text style={styles.email}>{userData.email}</Text>
              <Text style={styles.role}>
                {userData.role === 'student' ? `Étudiant - ${userData.class}` :
                 userData.role === 'teacher' ? `Professeur - ${userData.subject}` :
                 'Administrateur'}
              </Text>
              <Text style={styles.date}>
                Créé le: {new Date(userData.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {userData.role !== 'admin' && (
              <Button 
                mode="contained" 
                onPress={() => setDeleteUserId(userData.id)}
                style={styles.deleteButton}
                buttonColor="#ff4444"
              >
                Supprimer
              </Button>
            )}
          </Surface>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={!!deleteUserId} onDismiss={() => setDeleteUserId(null)}>
          <Dialog.Title>Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteUserId(null)}>Annuler</Button>
            <Button 
              onPress={handleDeleteUser} 
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  searchBar: {
    margin: 16,
    elevation: 2
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  userCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2
  },
  userInfo: {
    marginBottom: 10
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4
  },
  role: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4
  },
  date: {
    fontSize: 12,
    color: '#999'
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