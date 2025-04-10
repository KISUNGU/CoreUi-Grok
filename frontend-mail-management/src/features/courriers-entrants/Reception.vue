
<template>
  <CCard>
    <CCardHeader>
      <h2>Courriers Entrants - Réception</h2>
    </CCardHeader>
    <CCardBody>
      <CForm class="mb-3">
        <CInputGroup class="mb-2">
          <CFormInput v-model="newMail.subject" placeholder="Sujet" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormInput v-model="newMail.sender" placeholder="Expéditeur" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormSelect v-model="newMail.priority" :options="priorityOptions" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormSelect v-model="newMail.type" :options="typeOptions" />
        </CInputGroup>
        <CButton color="success" @click="registerMail">Enregistrer</CButton>
      </CForm>
      <hr />
      <CForm class="mb-3">
        <CInputGroup class="mb-2">
          <CFormInput v-model="filters.subject" placeholder="Filtrer par sujet" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormInput v-model="filters.sender" placeholder="Filtrer par expéditeur" />
        </CInputGroup>
        <CButton color="secondary" @click="resetFilters">Réinitialiser</CButton>
      </CForm>
      <CTable :items="filteredMails" :columns="fields" striped hover>
        <template #status="{ item }">
          <td><CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge></td>
        </template>
        <template #priority="{ item }">
          <td><CBadge :color="getPriorityColor(item.priority)">{{ item.priority }}</CBadge></td>
        </template>
        <template #actions="{ item }">
          <td>
            <CButton color="primary" size="sm" @click="updateStatus(item.id, 'en cours')">Traiter</CButton>
            <CButton color="warning" size="sm" class="ms-2" @click="archiveMail(item.id)">Archiver</CButton>
            <CButton color="info" size="sm" class="ms-2" @click="viewDetails(item.id)">Détails</CButton>
          </td>
        </template>
      </CTable>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent, computed, reactive, ref } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { useRouter } from 'vue-router';
import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton, CInputGroup, CFormInput, CForm, CFormSelect } from '@coreui/vue';

export default defineComponent({
  name: 'Reception',
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
    CFormSelect,
  },
  setup() {
    const store = useCourrierStore();
    const router = useRouter();
    store.fetchIncomingMails();

    const incomingMails = computed(() => store.getIncomingMails);
    const filters = reactive({ subject: '', sender: '' });
    const newMail = reactive({ subject: '', sender: '', priority: 'normal', type: 'lettre' });

    const filteredMails = computed(() => {
      return incomingMails.value.filter(mail => {
        const matchSubject = !filters.subject || mail.subject.toLowerCase().includes(filters.subject.toLowerCase());
        const matchSender = !filters.sender || mail.sender.toLowerCase().includes(filters.sender.toLowerCase());
        return matchSubject && matchSender;
      });
    });

    const resetFilters = () => {
      filters.subject = '';
      filters.sender = '';
    };

    const registerMail = () => {
      store.createIncomingMail(newMail);
      Object.assign(newMail, { subject: '', sender: '', priority: 'normal', type: 'lettre' });
    };

    return {
      filteredMails,
      filters,
      newMail,
      resetFilters,
      registerMail,
      updateStatus: (id, status) => store.updateMail({ id, status }),
      archiveMail: (id) => store.updateMail({ id, archived: true }),
      viewDetails: (id) => router.push(`/courriers-entrants/details/${id}`),
      getBadgeColor(status) {
        return status === 'nouveau' ? 'success' : status === 'en cours' ? 'warning' : 'secondary';
      },
      getPriorityColor(priority) {
        return priority === 'haute' ? 'danger' : priority === 'normale' ? 'info' : 'secondary';
      },
      priorityOptions: [
        { label: 'Haute', value: 'haute' },
        { label: 'Normale', value: 'normale' },
        { label: 'Basse', value: 'basse' },
      ],
      typeOptions: [
        { label: 'Lettre', value: 'lettre' },
        { label: 'Email', value: 'email' },
        { label: 'Colis', value: 'colis' },
      ],
    };
  },
  data() {
    return {
      fields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'sender', label: 'Expéditeur' },
        { key: 'status', label: 'Statut' },
        { key: 'priority', label: 'Priorité' },
        { key: 'type', label: 'Type' },
        { key: 'received_date', label: 'Date de réception' },
        { key: 'assigned_to_name', label: 'Affecté à' },
        { key: 'actions', label: 'Actions' },
      ],
    };
  },
});
</script>