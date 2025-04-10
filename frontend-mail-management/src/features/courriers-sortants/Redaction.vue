<template>
  <CCard>
    <CCardHeader>
      <h2>Rédaction d’un Courrier Sortant</h2>
    </CCardHeader>
    <CCardBody>
      <CForm @submit.prevent="createMail">
        <CInputGroup class="mb-3">
          <CFormInput v-model="newMail.subject" placeholder="Sujet" required />
        </CInputGroup>
        <CInputGroup class="mb-3">
          <CFormInput v-model="newMail.recipient" placeholder="Destinataire" required />
        </CInputGroup>
        <CInputGroup class="mb-3">
          <CFormSelect v-model="newMail.priority" :options="priorityOptions" />
        </CInputGroup>
        <CInputGroup class="mb-3">
          <CFormSelect v-model="newMail.type" :options="typeOptions" />
        </CInputGroup>
        <CButton color="success" type="submit">Enregistrer comme brouillon</CButton>
      </CForm>
      <hr class="my-4" />
      <h4>Brouillons existants</h4>
      <CTable :items="filteredDrafts" :columns="fields" striped hover>
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
import { defineComponent, computed, reactive } from 'vue';
import { useCourrierStore } from '../../stores/courrier';
import { useRouter } from 'vue-router';
import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton, CInputGroup, CFormInput, CForm, CFormSelect } from '@coreui/vue';

export default defineComponent({
  name: 'Redaction',
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
    store.fetchOutgoingMails();

    const newMail = reactive({
      subject: '',
      recipient: '',
      priority: 'normal',
      type: 'lettre',
    });

    const outgoingMails = computed(() => store.getOutgoingMails);
    const filteredDrafts = computed(() => outgoingMails.value.filter(mail => mail.status === 'brouillon'));

    const createMail = async () => {
      try {
        await store.createOutgoingMail({
          subject: newMail.subject,
          recipient: newMail.recipient,
          status: 'brouillon',
          priority: newMail.priority,
          type: newMail.type,
          created_by: store.currentUser?.id || 1, // Par défaut user_id 1 si pas connecté
        });
        Object.assign(newMail, { subject: '', recipient: '', priority: 'normal', type: 'lettre' });
      } catch (error) {
        console.error('Erreur lors de la création du courrier :', error);
      }
    };

    return {
      newMail,
      filteredDrafts,
      createMail,
      viewDetails: (id) => router.push(`/courriers-sortants/details/${id}`),
      getBadgeColor(status) {
        return status === 'brouillon' ? 'warning' : status === 'validé' ? 'success' : 'secondary';
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