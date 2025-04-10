<template>
    <CCard>
      <CCardHeader>
        <h2>Détails du Courrier Sortant</h2>
      </CCardHeader>
      <CCardBody>
        <div v-if="mail">
          <p><strong>Sujet :</strong> {{ mail.subject }}</p>
          <p><strong>Destinataire :</strong> {{ mail.recipient }}</p>
          <p><strong>Statut :</strong> <CBadge :color="getBadgeColor(mail.status)">{{ mail.status }}</CBadge></p>
          <p><strong>Créé par :</strong> {{ mail.created_by_name }}</p>
          <p><strong>Date de création :</strong> {{ mail.created_date }}</p>
          <p><strong>Date d’envoi :</strong> {{ mail.sent_date || 'Non envoyé' }}</p>
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
    name: 'DetailsOutgoing',
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
      store.fetchOutgoingMails();
  
      const mail = computed(() => {
        const id = parseInt(route.params.id);
        store.fetchActionsLog(id, 'outgoing');
        return store.getOutgoingMails.find(m => m.id === id);
      });
  
      const actionsLog = computed(() => store.getActionsLog);
  
      return {
        mail,
        actionsLog,
        getBadgeColor(status) {
          return status === 'brouillon' ? 'warning' : status === 'validé' ? 'success' : 'secondary';
        },
      };
    },
    data() {
      return {
        logFields: [
          { key: 'action', label: 'Action' },
          { key: 'user_name', label: 'Utilisateur' },
          { key: 'action_date', label: 'Date' },
        ],
      };
    },
  });
  </script>