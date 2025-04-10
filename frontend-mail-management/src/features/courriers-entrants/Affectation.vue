<template>
  <CCard>
    <CCardHeader>
      <h2>Affectation des Courriers Entrants</h2>
    </CCardHeader>
    <CCardBody>
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
        <template #assigned_to_name="{ item }">
          <td>
            <CFormSelect v-model="item.assigned_to" @change="assignMail(item.id, $event.target.value)">
              <option value="">Non affecté</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }} ({{ user.service }})</option>
            </CFormSelect>
          </td>
        </template>
        <template #actions="{ item }">
          <td>
            <CButton color="info" size="sm" @click="viewDetails(item.id)">Détails</CButton>
          </td>
        </template>
      </CTable>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent, computed, reactive } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { useRouter } from 'vue-router';
import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton, CInputGroup, CFormInput, CForm, CFormSelect } from '@coreui/vue';

export default defineComponent({
  name: 'Affectation',
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
    store.fetchUsers();

    const incomingMails = computed(() => store.getIncomingMails);
    const users = computed(() => store.getUsers);
    const filters = reactive({ subject: '', sender: '' });

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

    const assignMail = (id, assigned_to) => {
      store.updateMail({ id, assigned_to: assigned_to || null });
    };

    return {
      filteredMails,
      users,
      filters,
      resetFilters,
      assignMail,
      viewDetails: (id) => router.push(`/courriers-entrants/details/${id}`),
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
        { key: 'assigned_to_name', label: 'Affecté à' },
        { key: 'actions', label: 'Actions' },
      ],
    };
  },
});
</script>