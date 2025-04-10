<template>
  <CCard>
    <CCardHeader>
      <h2>Envoi des Courriers Sortants</h2>
    </CCardHeader>
    <CCardBody>
      <div v-if="outgoingMails.length === 0">
        <p>Aucun courrier sortant disponible.</p>
      </div>
      <CTable v-else :items="outgoingMails" :columns="fields" striped hover>
        <template #status="{ item }">
          <td>
            <CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge>
          </td>
        </template>
        <template #actions="{ item }">
          <td>
            <CButton color="success" size="sm" @click="updateStatus(item.id, 'envoyé')">Envoyer</CButton>
          </td>
        </template>
      </CTable>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton } from '@coreui/vue';

export default defineComponent({
  name: 'Envoi',
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
    store.fetchOutgoingMails();

    const outgoingMails = computed(() => store.getOutgoingMails);

    return {
      outgoingMails,
      updateStatus: (id, status) => store.updateMail({ id, status }),
      getBadgeColor(status) {
        return status === 'brouillon' ? 'warning' : status === 'envoyé' ? 'success' : 'secondary';
      },
    };
  },
  data() {
    return {
      fields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'recipient', label: 'Destinataire' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' },
      ],
    };
  },
});
</script>