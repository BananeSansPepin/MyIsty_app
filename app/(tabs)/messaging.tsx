import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Assurez-vous que ce package est installé: npm install @react-native-picker/picker
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api'; // Utilisation de l'import nommé
import { SegmentedButtons } from 'react-native-paper';
import { theme } from '../../src/theme';

type Message = {
  id: number;
  message_content: string;
  created_at: string;
  sender_name: string;
  sender_role: string; // 'student' or 'teacher'
};

const MessagingScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('IATIC3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const allowedClasses = ['IATIC3', 'IATIC4', 'IATIC5'];

  // Définir la classe par défaut ou sélectionnable
  useEffect(() => {
    if (user) {
      if (user.role === 'student' && user.class && allowedClasses.includes(user.class)) {
        setSelectedClass(user.class);
      } else if (user.role === 'teacher') {
        // Pour les profs, on pourrait sélectionner la première classe par défaut
         setSelectedClass(allowedClasses[0]);
      } else if (user.role === 'student' && (!user.class || !allowedClasses.includes(user.class))) {
           setError("Votre classe n'est pas configurée pour la messagerie ou est invalide.");
      }
    }
  }, [user]);

  // Fonction pour récupérer les messages
  const fetchMessages = useCallback(async (className: string) => {
    if (!className) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedMessages = await api.get(`/messages/${className}`);
      setMessages(fetchedMessages || []);
       // Scroll to bottom after fetching
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      console.error("Erreur fetchMessages:", err);
      setError(err.message || 'Erreur lors du chargement des messages.');
      setMessages([]); // Vider les messages en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les messages quand la classe sélectionnée change
  useEffect(() => {
    if (selectedClass) {
      fetchMessages(selectedClass);
    } else {
      setMessages([]); // Vider si aucune classe n'est sélectionnée
    }
  }, [selectedClass, fetchMessages]);

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClass || sending) return;

    setSending(true);
    setError(null);
    const contentToSend = newMessage.trim();

    try {
      const sentMessage: Message = await api.post('/messages', {
        className: selectedClass,
        messageContent: contentToSend,
      });
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage(''); // Vider l'input après envoi
       // Scroll to bottom after sending
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      console.error("Erreur handleSendMessage:", err);
      setError(err.response?.data?.message || err.message || "Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
        styles.messageBubble,
        // Optionnel: aligner différemment les messages de l'utilisateur connecté
        // item.sender_name === user?.name ? styles.myMessage : styles.otherMessage
      ]}>
      <Text style={[
        styles.senderName,
        item.sender_role === 'student' ? styles.studentName : styles.teacherName
      ]}>{item.sender_name} ({item.sender_role})</Text>
      <Text style={styles.messageContent}>{item.message_content}</Text>
      <Text style={styles.messageDate}>
        {new Date(item.created_at).toLocaleString('fr-FR')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Ajustez si nécessaire
    >
      {user?.role === 'teacher' && (
        <View style={styles.pickerContainer}>
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
        </View>
      )}

      {user?.role === 'student' && selectedClass && (
           <Text style={styles.classHeader}>Messagerie - Classe {selectedClass}</Text>
      )}


      {loading && <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />}

      {!loading && error && <Text style={styles.errorText}>{error}</Text>}

       {!loading && !error && messages.length === 0 && selectedClass && (
         <View style={styles.centeredMessage}><Text>Aucun message dans cette conversation.</Text></View>
       )}
       {!loading && !error && !selectedClass && (
          <View style={styles.centeredMessage}><Text>Veuillez sélectionner une classe (professeur) ou vérifier votre configuration (étudiant).</Text></View>
       )}


      {!loading && !error && messages.length > 0 && (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messageList}
            contentContainerStyle={{ paddingBottom: 10 }} // Espace en bas
             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })} // Essayer de scroller à la fin au chargement
             onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })} // Et à la mise en page
          />
      )}


      { selectedClass && ( // Afficher l'input seulement si une classe est sélectionnée/valide
           <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Écrire un message..."
                multiline
                editable={!sending && !loading} // Désactiver pendant l'envoi/chargement
              />
              <TouchableOpacity onPress={handleSendMessage} disabled={sending || loading || !newMessage.trim()} style={[styles.sendButton, (sending || loading || !newMessage.trim()) && styles.sendButtonDisabled]}>
                    {sending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <MaterialIcons name="send" size={24} color="#fff" />
                    )}
              </TouchableOpacity>
            </View>
      )}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   safeArea: {
       flex: 1,
       backgroundColor: '#f0f0f0',
   },
  container: {
    flex: 1,
     backgroundColor: '#f0f0f0', // Couleur de fond générale
  },
   pickerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
   },
  picker: {
    height: 50,
    width: '100%',
  },
  classHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#e0e0e0',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageBubble: {
    backgroundColor: '#fff', // Bulle de message blanche
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '80%', // Limiter la largeur des bulles
    alignSelf: 'flex-start', // Messages des autres à gauche par défaut
    elevation: 1, // Ombre légère (Android)
     shadowColor: '#000', // Ombre (iOS)
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 1,
  },
//   myMessage: { // Style optionnel pour ses propres messages
//     alignSelf: 'flex-end',
//     backgroundColor: '#DCF8C6', // Couleur différente pour ses messages
//   },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 13,
  },
  studentName: {
    color: '#2196F3', // Bleu pour les étudiants
  },
  teacherName: {
    color: '#FF0000', // Rouge pour les professeurs
  },
  messageContent: {
    fontSize: 15,
    color: '#000', // Texte principal en noir
  },
  messageDate: {
    fontSize: 10,
    color: '#888', // Date/heure en gris
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff', // Fond blanc pour la zone d'input
    alignItems: 'center', // Aligner verticalement
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Fond légèrement différent pour l'input
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100, // Limiter la hauteur en cas de texte long
    marginRight: 10,
  },
  sendButton: {
     backgroundColor: '#2196F3', // Bleu
     borderRadius: 25, // Bouton rond
     padding: 10,
     justifyContent: 'center',
     alignItems: 'center',
  },
  sendButtonDisabled: {
       backgroundColor: '#a0a0a0', // Gris quand désactivé
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
    padding: 10,
    backgroundColor: '#ffe0e0',
    borderRadius: 5,
  },
   centeredMessage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   segmentedButtons: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  label: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
});

export default MessagingScreen;
