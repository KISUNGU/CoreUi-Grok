<template>
  <CCard>
    <CCardHeader>
      <h2>Validation des Courriers Sortants</h2>
    </CCardHeader>
    <CCardBody>
      <CForm class="mb-3">
        <CInputGroup class="mb-2">
          <CFormInput v-model="filters.subject" placeholder="Filtrer par sujet" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormInput v-model="filters.recipient" placeholder="Filtrer par destinataire" />
        </CInputGroup>
        <CButton color="secondary" @click="resetFilters">Réinitialiser</CButton>
      </CForm>
      <CTable :items="filteredMails" :columns="fields" striped hover>
        <template #status="{ item }">
          <td><CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge></td>
        </template>
        <template #actions="{ item }">
          <td>
            <CButton 
              color="success" 
              size="sm" 
              @click="validateMail(item.id)" 
              :disabled="item.status !== 'brouillon'"
            >
              Valider
            </CButton>
            <CButton 
              color="warning" 
              size="sm" 
              class="ms-2" 
              @click="showArchiveModal(item.id)" 
              :disabled="item.status === 'validé'"
            >
              Archiver
            </CButton>
            <CButton color="info" size="sm" class="ms-2" @click="viewDetails(item.id)">Détails</CButton>
          </td>
        </template>
      </CTable>
      <CModal :visible="archiveModal" @close="archiveModal = false">
        <CModalHeader>
          <h5>Archiver le courrier</h5>
        </CModalHeader>
        <CModalBody>
          <CFormInput v-model="archiveReason" placeholder="Raison de l’archivage (facultatif)" />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" @click="archiveModal = false">Annuler</CButton>
          <CButton color="warning" @click="archiveMail(selectedMailId)">Confirmer</CButton>
        </CModalFooter>
      </CModal>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent, computed, reactive, ref } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { useRouter } from 'vue-router';
import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton, CInputGroup, CFormInput, CForm, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/vue';

export default defineComponent({
  name: 'Validation',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CTable,
    CBadge,
    CButton,
    CInputGroup,
    CFormInput,
    CForm,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
  },
  setup() {
    const store = useCourrierStore();
    const router = useRouter();
    store.fetchOutgoingMails();

    const outgoingMails = computed(() => store.getOutgoingMails);
    const filters = reactive({ subject: '', recipient: '' });
    const archiveModal = ref(false);
    const archiveReason = ref('');
    const selectedMailId = ref(null);

    const filteredMails = computed(() => {
      return outgoingMails.value.filter(mail => {
        const matchSubject = !filters.subject || mail.subject.toLowerCase().includes(filters.subject.toLowerCase());
        const matchRecipient = !filters.recipient || mail.recipient.toLowerCase().includes(filters.recipient.toLowerCase());
        return matchSubject && matchRecipient;
      });
    });

    const resetFilters = () => {
      filters.subject = '';
      filters.recipient = '';
    };

    const validateMail = (id) => {
      store.updateOutgoingMail({ id, status: 'validé' });
    };

    const showArchiveModal = (id) => {
      selectedMailId.value = id;
      archiveModal.value = true;
    };

    const archiveMail = (id) => {
      store.archiveOutgoingMail(id, archiveReason.value);
      archiveModal.value = false;
      archiveReason.value = '';
    };

    return {
      filteredMails,
      filters,
      archiveModal,
      archiveReason,
      selectedMailId,
      resetFilters,
      validateMail,
      showArchiveModal,
      archiveMail,
      viewDetails: (id) => router.push(`/courriers-sortants/details/${id}`),
      getBadgeColor(status) {
        return status === 'brouillon' ? 'warning' : status === 'validé' ? 'success' : 'secondary';
      },
    };
  },
  data() {
    return {
      fields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'recipient', label: 'Destinataire' },
        { key: 'status', label: 'Statut' },
        { key: 'created_by_name', label: 'Créé par' },
        { key: 'created_date', label: 'Date de création' },
        { key: 'actions', label: 'Actions' },
      ],
    };
  },
});
</script>