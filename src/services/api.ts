import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(async (config) => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('Token trouvé:', userData.token);
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
  }
  return config;
});

export const apiService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        throw new Error(error.response.data.message || 'Erreur de connexion');
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        throw new Error('Impossible de contacter le serveur');
      } else {
        // Erreur lors de la configuration de la requête
        throw new Error('Erreur de connexion');
      }
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'inscription');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw new Error('Erreur lors de l\'inscription');
      }
    }
  },

  get: async (endpoint: string) => {
    try {
      console.log('Appel API GET:', endpoint);
      const response = await api.get(endpoint);
      console.log('Réponse reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    const response = await api.delete(endpoint);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors du changement de mot de passe');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw new Error('Erreur lors du changement de mot de passe');
      }
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      console.log('Appel API POST:', endpoint, data);
      const response = await api.post(endpoint, data);
      console.log('Réponse reçue:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la requête');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw new Error('Erreur lors de la requête');
      }
    }
  }
};

export { apiService as api };
