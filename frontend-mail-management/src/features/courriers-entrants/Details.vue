<template>
    <CCard>
      <CCardHeader>
        <h2>Détails du Courrier</h2>
      </CCardHeader>
      <CCardBody>
        <div v-if="mail">
          <p><strong>Sujet :</strong> {{ mail.subject }}</p>
          <p><strong>Expéditeur :</strong> {{ mail.sender }}</p>
          <p><strong>Statut :</strong> <CBadge :color="getBadgeColor(mail.status)">{{ mail.status }}</CBadge></p>
          <p><strong>Priorité :</strong> <CBadge :color="getPriorityColor(mail.priority)">{{ mail.priority }}</CBadge></p>
          <p><strong>Type :</strong> {{ mail.type }}</p>
          <p><strong>Date de réception :</strong> {{ mail.received_date }}</p>
          <p><strong>Affecté à :</strong> {{ mail.assigned_to_name || 'Non affecté' }}</p>
          <p><strong>Archivé :</strong> {{ mail.archived ? 'Oui' : 'Non' }}</p>
          <hr />
          <h4>Historique des actions</h4>
          <CTable :items="actionsLog" :columns="logFields" striped hover />
          <CButton color="secondary" @click="$router.go(-1)">Retour</CButton>
        </div>
        <div v-else>
          <p>Courrier non trouvé.</p>
        </div>
      </CCardBody>
    </CCard>
  </template>
  
  <script>
  import { defineComponent, computed } from 'vue';
  import { useCourrierStore } from '../../stores/courrier';
  import { useRoute } from 'vue-router';
  import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton } from '@coreui/vue';
  
  export default defineComponent({
    name: 'Details',
    components: {
      CCard,
      CCardHeader,
      CCardBody,
      CTable,
      CBadge,
      CButton,
    },
    setup() {
      const store = useCourrierStore();
      const route = useRoute();
      store.fetchAllIncomingMails();
  
      const mail = computed(() => {
        const id = parseInt(route.params.id);
        store.fetchActionsLog(id, 'incoming');
        return store.getAllIncomingMails.find(m => m.id === id);
      });
  
      const actionsLog = computed(() => store.getActionsLog);
  
      return {
        mail,
        actionsLog,
        getBadgeColor(status) {
          return status === 'nouveau' ? 'success' : status === 'en cours' ? 'warning' : 'secondary';
        },
        getPriorityColor(priority) {
          return priority === 'haute' ? 'danger' : priority === 'normale' ? 'info' : 'secondary';
        },
      };
    },
    data() {
      return {
        logFields: [
          { key: 'action', label: 'Action' },
          { key: 'user_id', label: 'Utilisateur' }, // À améliorer avec le nom
          { key: 'action_date', label: 'Date' },
        ],
      };
    },
  });
  </script>