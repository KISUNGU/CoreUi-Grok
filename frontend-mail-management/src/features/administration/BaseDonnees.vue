<template>
  <CCard>
    <CCardHeader>
      <h2>Gestion de la Base de Données</h2>
    </CCardHeader>
    <CCardBody>
      <h4>Courriers Entrants</h4>
      <CTable :items="incomingMails" :columns="incomingFields" striped hover />
      <hr />
      <h4>Courriers Sortants</h4>
      <CTable :items="outgoingMails" :columns="outgoingFields" striped hover />
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { CCard, CCardHeader, CCardBody, CTable } from '@coreui/vue';

export default defineComponent({
  name: 'BaseDonnees',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CTable,
  },
  setup() {
    const store = useCourrierStore();
    store.fetchAllIncomingMails(); // Récupère tous les courriers entrants
    store.fetchOutgoingMails();

    const incomingMails = computed(() => store.getAllIncomingMails);
    const outgoingMails = computed(() => store.getOutgoingMails);

    return {
      incomingMails,
      outgoingMails,
    };
  },
  data() {
    return {
      incomingFields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'sender', label: 'Expéditeur' },
        { key: 'status', label: 'Statut' },
        { key: 'archived', label: 'Archivé' },
      ],
      outgoingFields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'recipient', label: 'Destinataire' },
        { key: 'status', label: 'Statut' },
      ],
    };
  },
});
</script>