<template>
    <CRow>
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <strong><CIcon icon="cil-file" class="me-2"/> Gestion des Contrats</strong>
            <CButton @click="openAddModal" color="primary" size="sm">
              <CIcon icon="cil-plus" class="me-1"/> Ajouter un Contrat
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div class="d-flex mb-3">
              <CFormInput
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par employé ou type de contrat"
                class="me-2"
              />
              <CButton @click="applySearch" color="primary">
                <CIcon icon="cil-search" class="me-1"/> Rechercher
              </CButton>
            </div>
  
            <CTable striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Employé</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Type de Contrat</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Date de Début</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Date de Fin</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="contrat in filteredContrats" :key="contrat.id">
                  <CTableDataCell>{{ contrat.employee }}</CTableDataCell>
                  <CTableDataCell>{{ contrat.type }}</CTableDataCell>
                  <CTableDataCell>{{ contrat.start_date }}</CTableDataCell>
                  <CTableDataCell>{{ contrat.end_date }}</CTableDataCell>
                  <CTableDataCell>
                    <CButton @click="downloadContract(contrat)" color="success" size="sm" class="me-1">
                      <CIcon icon="cil-cloud-download" class="me-1"/> Télécharger
                    </CButton>
                    <CButton @click="deleteContract(contrat)" color="danger" size="sm">
                      <CIcon icon="cil-trash" class="me-1"/> Supprimer
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="filteredContrats.length === 0">
                  <CTableDataCell colspan="5" class="text-center">Aucun contrat trouvé</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
  
      <CModal v-model="showAddModal" title="Ajouter un Nouveau Contrat">
        <form @submit.prevent="addContract">
            <!-- Formulaire à l'intérieur de la modal -->
            <div class="mb-3">
            <label for="employee" class="form-label">Nom de l'Employé</label>
            <input v-model="newContract.employee" type="text" id="employee" class="form-control" required />
            </div>
            <div class="mb-3">
            <label for="type" class="form-label">Type de Contrat</label>
            <input v-model="newContract.type" type="text" id="type" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
        </form>
        </CModal>

    </CRow>
  </template>
  
  <script>
  import {
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CButton,
    CFormInput,
    CFormLabel,
    CForm, // Importez CForm à la place de CFormGroup
    CModal,
    CModalBody,
    CModalFooter,
    CTable,
    CTableHead,
    CTableBody,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
  } from '@coreui/vue';
  import { cilFile, cilPlus, cilSearch, cilCloudDownload, cilTrash } from '@coreui/icons';
  import CIcon from '@coreui/icons-vue';
  
  export default {
    components: {
      CRow,
      CCol,
      CCard,
      CCardHeader,
      CCardBody,
      CButton,
      CFormInput,
      CFormLabel,
      CForm, // Utilisez CForm ici
      CModal,
      CModalBody,
      CModalFooter,
      CTable,
      CTableHead,
      CTableBody,
      CTableRow,
      CTableHeaderCell,
      CTableDataCell,
      CIcon,
    },
    data() {
      return {
        contrats: [],
        searchQuery: '',
        showAddModal: false,
        newContract: {
          employee: '',
          type: '',
          start_date: '',
          end_date: '',
        },
        uploadedFile: null,
      };
    },
    computed: {
      filteredContrats() {
        const query = this.searchQuery.toLowerCase();
        return this.contrats.filter((contrat) =>
          contrat.employee.toLowerCase().includes(query) ||
          contrat.type.toLowerCase().includes(query)
        );
      },
    },
    methods: {
      fetchContrats() {
        fetch('http://localhost:3000/api/contrats')
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Erreur HTTP ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            this.contrats = data;
            console.log('Contrats récupérés :', this.contrats);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des contrats :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      downloadContract(contrat) {
        if (!contrat.file_path) {
          return alert("Ce contrat n'a pas de fichier associé.");
        }
        window.open(`http://localhost:3000${contrat.file_path}`, '_blank');
      },
      deleteContract(contrat) {
        fetch(`http://localhost:3000/api/contrats/${contrat.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de la suppression');
            }
            console.log('Contrat supprimé avec succès');
            this.fetchContrats();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du contrat :', error);
          });
      },
      openAddModal() {
        console.log('Modal pour ajout de contrat ouverte');
        this.showAddModal = true;
      },
      handleFileUpload(event) {
        this.uploadedFile = event.target.files[0];
      },
      addContract() {
        const formData = new FormData();
        formData.append('employee', this.newContract.employee);
        formData.append('type', this.newContract.type);
        formData.append('start_date', this.newContract.start_date);
        formData.append('end_date', this.newContract.end_date);
        formData.append('file', this.uploadedFile);
  
        fetch('http://localhost:3000/api/contrats', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de l\'ajout du contrat');
            }
            console.log('Contrat ajouté avec succès');
            this.showAddModal = false;
            this.fetchContrats();
            this.newContract = { employee: '', type: '', start_date: '', end_date: '' }; // Réinitialiser le formulaire
            this.uploadedFile = null;
          })
          .catch((error) => {
            console.error('Erreur lors de l\'ajout du contrat :', error);
          });
      },
    },
    mounted() {
      this.fetchContrats();
    },
  };
  </script>
  
  <style scoped>
  .text-center {
    text-align: center;
  }
  </style>