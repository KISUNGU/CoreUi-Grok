<!-- src/views/IncomingMails.vue -->
<template>
  <div class="incoming-mails">
    <!-- En-tête -->
    <CRow class="mb-4">
      <CCol>
        <h1>Courriers Entrants</h1>
        <p>Liste des courriers entrants non archivés</p>
      </CCol>
    </CRow>

    <!-- Tableau des courriers -->
    <CCard>
      <CCardHeader>
        <h4>Courriers Entrants</h4>
      </CCardHeader>
      <CCardBody>
        <CDataTable
          :items="incomingMails"
          :fields="fields"
          hover
          striped
          border
          :items-per-page="10"
          pagination
        >
          <!-- Colonne pour les actions -->
          <template #actions="{ item }">
            <td>
              <CButton color="primary" size="sm" class="mr-2" @click="updateStatus(item, 'en attente de validation')">
                Mettre en attente
              </CButton>
              <CButton color="success" size="sm" class="mr-2" @click="updateStatus(item, 'validé')">
                Valider
              </CButton>
              <CButton color="danger" size="sm" @click="archiveMail(item)">
                Archiver
              </CButton>
            </td>
          </template>
          <!-- Colonne pour le fichier -->
          <template #file_path="{ item }">
            <td>
              <a v-if="item.file_path" :href="item.file_path" target="_blank">Télécharger</a>
              <span v-else>Aucun fichier</span>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <!-- Modal pour l'archivage -->
    <CModal
      title="Archiver le courrier"
      :show.sync="showArchiveModal"
      @update:show="closeModal"
    >
      <CForm>
        <CFormGroup>
          <CFormLabel>Raison de l'archivage</CFormLabel>
          <CInput v-model="archiveReason" placeholder="Entrez la raison de l'archivage" />
        </CFormGroup>
      </CForm>
      <template #footer>
        <CButton color="secondary" @click="closeModal">Annuler</CButton>
        <CButton color="danger" @click="confirmArchive">Archiver</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { useCourrierStore } from '../stores/courrier';
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CDataTable,
  CButton,
  CModal,
  CForm,
  CFormGroup,
  CFormLabel,
  CInput,
} from '@coreui/vue';

export default {
  name: 'IncomingMails',
  components: {
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CDataTable,
    CButton,
    CModal,
    CForm,
    CFormGroup,
    CFormLabel,
    CInput,
  },
  setup() {
    const courrierStore = useCourrierStore();
    return { courrierStore };
  },
  data() {
    return {
      fields: [
        { key: 'subject', label: 'Sujet' },
        { key: 'sender', label: 'Expéditeur' },
        { key: 'status', label: 'Statut' },
        { key: 'type', label: 'Type' },
        { key: 'priority', label: 'Priorité' },
        { key: 'mail_date', label: 'Date du courrier' },
        { key: 'arrival_date', label: 'Date d’arrivée' },
        { key: 'entity', label: 'Entité' },
        { key: 'assigned_to_name', label: 'Assigné à' },
        { key: 'file_path', label: 'Pièce jointe' },
        { key: 'actions', label: 'Actions' },
      ],
      showArchiveModal: false,
      selectedMail: null,
      archiveReason: '',
    };
  },
  computed: {
    incomingMails() {
      return this.courrierStore.getIncomingMails;
    },
  },
  async created() {
    try {
      await this.courrierStore.fetchIncomingMails();
    } catch (error) {
      console.error('Erreur lors du chargement des courriers entrants :', error);
    }
  },
  methods: {
    async updateStatus(mail, newStatus) {
      try {
        await this.courrierStore.updateMail({
          id: mail.id,
          status: newStatus,
          archived: mail.archived,
          assigned_to: mail.assigned_to,
        });
        this.$toast.success(`Statut mis à jour : ${newStatus}`);
      } catch (error) {
        this.$toast.error('Erreur lors de la mise à jour du statut');
      }
    },
    archiveMail(mail) {
      this.selectedMail = mail;
      this.showArchiveModal = true;
    },
    async confirmArchive() {
      if (this.selectedMail) {
        try {
          await this.courrierStore.updateMail({
            id: this.selectedMail.id,
            status: this.selectedMail.status,
            archived: 1,
            assigned_to: this.selectedMail.assigned_to,
            archived_reason: this.archiveReason,
          });
          this.$toast.success('Courrier archivé avec succès');
          this.closeModal();
        } catch (error) {
          this.$toast.error('Erreur lors de l’archivage du courrier');
        }
      }
    },
    closeModal() {
      this.showArchiveModal = false;
      this.selectedMail = null;
      this.archiveReason = '';
    },
  },
};
</script>

<style scoped>
.incoming-mails {
  padding: 20px;
}
</style>