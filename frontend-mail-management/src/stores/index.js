import { defineStore } from 'pinia';
import axios from 'axios';

export const useCourrierStore = defineStore('courrier', {
  state: () => ({
    currentUser: { id: 1, role: 'admin' },
    incomingMails: [],
    outgoingMails: [],
    archivedMails: [],
    tracking: [],
  }),
  actions: {
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
    async fetchArchivedMails() {
      try {
        const response = await axios.get('http://localhost:3000/api/mails/archived');
        this.archivedMails = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des courriers archivés :', error);
      }
    },
    async fetchTracking(mailId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/mails/tracking/${mailId}`);
        this.tracking = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération du suivi :', error);
      }
    },
    async updateMail({ id, status, archived }) {
      try {
        await axios.put(`http://localhost:3000/api/mails/update/${id}`, { status, archived });
        this.fetchIncomingMails();
        this.fetchOutgoingMails();
        this.fetchArchivedMails();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du courrier :', error);
      }
    },
    async createMail(mailData) {
      try {
        await axios.post('http://localhost:3000/api/mails/create', mailData);
        this.fetchIncomingMails();
        this.fetchOutgoingMails();
      } catch (error) {
        console.error('Erreur lors de la création du courrier :', error);
      }
    },
  },
  getters: {
    hasRole: (state) => (role) => state.currentUser.role === role,
    getIncomingMails: (state) => state.incomingMails,
    getOutgoingMails: (state) => state.outgoingMails,
    getArchivedMails: (state) => state.archivedMails,
    getTracking: (state) => state.tracking,
  },
});