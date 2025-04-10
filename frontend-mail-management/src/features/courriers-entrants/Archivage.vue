<template>
  <CCard>
    <CCardHeader>
      <h2>Archivage des Courriers</h2>
      <CNav variant="tabs" class="mt-2">
        <CNavItem>
          <CNavLink :active="activeTab === 'incoming'" @click="activeTab = 'incoming'">Courriers Entrants</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink :active="activeTab === 'outgoing'" @click="activeTab = 'outgoing'">Courriers Sortants</CNavLink>
        </CNavItem>
      </CNav>
    </CCardHeader>
    <CCardBody>
      <CForm class="mb-3">
        <CInputGroup class="mb-2">
          <CFormInput v-model="filters.subject" placeholder="Filtrer par sujet" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormInput v-model="filters[activeTab === 'incoming' ? 'sender' : 'recipient']" :placeholder="`Filtrer par ${activeTab === 'incoming' ? 'expéditeur' : 'destinataire'}`" />
        </CInputGroup>
        <CInputGroup class="mb-2">
          <CFormSelect v-model="filters.status" :options="statusOptions" />
        </CInputGroup>
        <CButton color="secondary" @click="resetFilters">Réinitialiser</CButton>
        <CButton color="primary" class="ms-2" @click="applyFilters">Rechercher</CButton>
      </CForm>
      <CTable :items="filteredMails" :columns="fields" striped hover>
        <template #status="{ item }">
          <td><CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge></td>
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
import { defineComponent, computed, reactive, ref } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { useRouter } from 'vue-router';
import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton, CInputGroup, CFormInput, CForm, CFormSelect, CNav, CNavItem, CNavLink } from '@coreui/vue';

export default defineComponent({
  name: 'Archivage',
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
    CNav,
    CNavItem,
    CNavLink,
  },
  setup() {
    const store = useCourrierStore();
    const router = useRouter();
    const activeTab = ref('incoming');
    const filters = reactive({ subject: '', sender: '', recipient: '', status: '' });

    store.fetchArchivedIncomingMails();

    const filteredMails = computed(() => {
      return activeTab.value === 'incoming' ? store.getArchivedIncomingMails : store.getArchivedOutgoingMails;
    });

    const applyFilters = () => {
      const filterParams = {
        subject: filters.subject,
        [activeTab.value === 'incoming' ? 'sender' : 'recipient']: filters[activeTab.value === 'incoming' ? 'sender' : 'recipient'],
        status: filters.status,
      };
      if (activeTab.value === 'incoming') {
        store.fetchArchivedIncomingMails(filterParams);
      } else {
        store.fetchArchivedOutgoingMails(filterParams);
      }
    };

    const resetFilters = () => {
      filters.subject = '';
      filters.sender = '';
      filters.recipient = '';
      filters.status = '';
      applyFilters();
    };

    return {
      activeTab,
      filters,
      filteredMails,
      applyFilters,
      resetFilters,
      viewDetails: (id) => router.push(`/${activeTab.value === 'incoming' ? 'courriers-entrants' : 'courriers-sortants'}/details/${id}`),
      getBadgeColor(status) {
        return status === 'nouveau' ? 'success' : status === 'en cours' ? 'warning' : status === 'validé' ? 'success' : 'secondary';
      },
      statusOptions: [
        { label: 'Tous', value: '' },
        { label: 'Nouveau', value: 'nouveau' },
        { label: 'En cours', value: 'en cours' },
        { label: 'Validé', value: 'validé' },
        { label: 'Brouillon', value: 'brouillon' },
      ],
    };
  },
  computed: {
    fields() {
      return this.activeTab === 'incoming' ? [
        { key: 'subject', label: 'Sujet' },
        { key: 'sender', label: 'Expéditeur' },
        { key: 'status', label: 'Statut' },
        { key: 'archived_date', label: 'Date d’archivage' },
        { key: 'archived_reason', label: 'Raison' },
        { key: 'actions', label: 'Actions' },
      ] : [
        { key: 'subject', label: 'Sujet' },
        { key: 'recipient', label: 'Destinataire' },
        { key: 'status', label: 'Statut' },
        { key: 'archived_date', label: 'Date d’archivage' },
        { key: 'archived_reason', label: 'Raison' },
        { key: 'actions', label: 'Actions' },
      ];
    },
  },
});
</script>