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
  }),
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('http://localhost:3000/api/login', { username, password });
        this.currentUser = response.data.user;
        this.isAuthenticated = true;
      } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        this.isAuthenticated = false;
      }
    },
    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;
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

    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      }
    },

    async createIncomingMail(mailData) {
      try {
        const response = await axios.post('http://localhost:3000/api/mails/incoming', {
          ...mailData,
          assigned_to: this.currentUser?.id,
        });
        await this.fetchIncomingMails();
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création du courrier entrant :', error);
      }
    },

    async createOutgoingMail(mailData) {
      try {
        const response = await axios.post('http://localhost:3000/api/mails/create', {
          ...mailData,
          created_by: this.currentUser?.id,
        });
        await this.fetchOutgoingMails();
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création du courrier sortant :', error);
      }
    },

    async updateMail({ id, status, archived, assigned_to }) {
      try {
        await axios.put(`http://localhost:3000/api/mails/update/${id}`, { status, archived, assigned_to });
        if (status) {
          await axios.post('http://localhost:3000/api/actions', { mail_id: id, mail_type: 'incoming', action: status, user_id: this.currentUser?.id });
        }
        await this.fetchIncomingMails();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du courrier entrant :', error);
      }
    },

    async updateOutgoingMail({ id, status }) {
      try {
        await axios.put(`http://localhost:3000/api/mails/outgoing/update/${id}`, { status });
        if (status) {
          await axios.post('http://localhost:3000/api/actions', { mail_id: id, mail_type: 'outgoing', action: status, user_id: this.currentUser?.id });
        }
        await this.fetchOutgoingMails();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du courrier sortant :', error);
      }
    },

    async deleteMail(id) {
      try {
        await axios.delete(`http://localhost:3000/api/mails/incoming/${id}`);
        await this.fetchIncomingMails();
      } catch (error) {
        console.error('Erreur lors de la suppression du courrier entrant :', error);
      }
    },

    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      }
    },

    async fetchActionsLog(mailId, mailType) {
      try {
        const response = await axios.get(`http://localhost:3000/api/actions?mail_id=${mailId}&mail_type=${mailType}`);
        this.actionsLog = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération du journal d’actions :', error);
      }
    },

    async fetchRecentActions() {
      try {
        const response = await axios.get('http://localhost:3000/api/actions');
        this.recentActions = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des actions récentes :', error);
      }
    },

    clearRecentActions() {
      this.recentActions = [];
    },
  },

  getters: {
    getIncomingMails: (state) => state.incomingMails,
    getOutgoingMails: (state) => state.outgoingMails,
    getUsers: (state) => state.users,
    getActionsLog: (state) => state.actionsLog,
    hasRole: (state) => (role) => state.currentUser?.role === role,
  },
});
