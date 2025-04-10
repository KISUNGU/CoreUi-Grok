<template>
  <CCard>
    <CCardHeader>
      <h2>Tri des Courriers Entrants</h2>
    </CCardHeader>
    <CCardBody>
      <div v-if="incomingMails.length === 0">
        <p>Aucun courrier entrant disponible.</p>
      </div>
      <CTable v-else :items="incomingMails" :columns="fields" striped hover>
        <template #status="{ item }">
          <td>
            <CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge>
          </td>
        </template>
        <template #actions="{ item }">
          <td>
            <CButton color="primary" size="sm" @click="updateStatus(item.id, 'trié')">Trié</CButton>
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
  name: 'Tri',
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
    store.fetchIncomingMails();

    const incomingMails = computed(() => store.getIncomingMails);

    return {
      incomingMails,
      updateStatus: (id, status) => store.updateMail({ id, status }),
      getBadgeColor(status) {
        return status === 'nouveau' ? 'success' : status === 'trié' ? 'info' : 'secondary';
      },
    };
  },
  data() {
    return {
      fields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'sender', label: 'Expéditeur' },
        { key: 'status', label: 'Statut' },
        { key: 'actions', label: 'Actions' },
      ],
    };
  },
});
</script>