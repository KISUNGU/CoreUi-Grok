import { defineStore } from 'pinia';
import axios from 'axios';

export const useCourrierStore = defineStore('courrier', {
  state: () => ({
    currentUser: null,
    incomingMails: [],
    outgoingMails: [],
    archivedMails: [],
    tracking: [],
    users: [],
    settings: {},
    isAuthenticated: false,
    recentActions: [], // Ajouté pour cohérence avec Dashboard.vue
  }),
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('http://localhost:3000/api/login', { username, password });
        this.currentUser = response.data.user; // { id, username }
        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        localStorage.setItem('isAuthenticated', 'true');
      } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        this.isAuthenticated = false;
        throw error; // Pour permettre au composant appelant de gérer l'erreur
      }
    },
    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    },
    restoreSession() {
      const user = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (user && isAuthenticated === 'true') {
        try {
          this.currentUser = JSON.parse(user);
          this.isAuthenticated = true;
        } catch (error) {
          console.error('Erreur lors de la restauration de la session :', error);
          this.logout(); // Nettoyage complet en cas d'erreur
        }
      }
    },
    async fetchRecentActions() {
      try {
        const response = await axios.get('http://localhost:3000/api/recent-actions');
        this.recentActions = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des actions récentes :', error);
      }
    },
    async fetchIncomingMails() {
      try {
        const response = await axios.get('http://localhost:3000/api/mails/incoming');
        this.incomingMails = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des courriers entrants :', error);
      }
    },
    async fetchOutgoingMails() {
      try {
        const response = await axios.get('http://localhost:3000/api/mails/outgoing');
        this.outgoingMails = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des courriers sortants :', error);
      }
    },
  },
  getters: {
    getIncomingMails: (state) => state.incomingMails,
    getOutgoingMails: (state) => state.outgoingMails,
    getUsers: (state) => state.users,
    getRecentActions: (state) => state.recentActions,
    getUsername: (state) => state.currentUser?.username || 'Utilisateur', // Simplifié car username est garanti
  },
});