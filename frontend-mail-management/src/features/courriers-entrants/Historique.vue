<template>
  <CCard>
    <CCardHeader>
      <h2>Historique des Courriers Entrants</h2>
    </CCardHeader>
    <CCardBody>
      <div v-if="allIncomingMails.length === 0">
        <p>Aucun courrier dans l’historique.</p>
      </div>
      <CTable v-else :items="allIncomingMails" :columns="fields" striped hover>
        <template #status="{ item }">
          <td>
            <CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge>
          </td>
        </template>
        <template #archived="{ item }">
          <td>
            <CBadge :color="item.archived ? 'danger' : 'success'">{{ item.archived ? 'Oui' : 'Non' }}</CBadge>
          </td>
        </template>
      </CTable>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { CCard, CCardHeader, CCardBody, CTable, CBadge } from '@coreui/vue';

export default defineComponent({
  name: 'Historique',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CTable,
    CBadge,
  },
  setup() {
    const store = useCourrierStore();
    store.fetchAllIncomingMails(); // Nouvelle action pour tout récupérer

    const allIncomingMails = computed(() => store.getAllIncomingMails);

    return {
      allIncomingMails,
      getBadgeColor(status) {
        return status === 'nouveau' ? 'success' : status === 'en cours' ? 'warning' : 'secondary';
      },
    };
  },
  data() {
    return {
      fields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'sender', label: 'Expéditeur' },
        { key: 'status', label: 'Statut' },
        { key: 'archived', label: 'Archivé' },
      ],
    };
  },
});
</script>