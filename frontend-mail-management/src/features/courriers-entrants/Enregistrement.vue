<template>
    <CRow>
      <!-- Formulaire à gauche -->
      <CCol md="6">
        <CCard>
          <CCardHeader>
            <h2>Enregistrement d'un courrier</h2>
          </CCardHeader>
          <CCardBody>
            <CForm @submit.prevent="registerMail">
              <!-- Section Courrier -->
              <h4 class="section-title">Courrier</h4>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Document physique</CFormLabel>
                  <CFormInput type="file" @change="handleFileUpload" accept="image/*,application/pdf" required />
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Type de courrier</CFormLabel>
                  <CFormSelect v-model="form.type" required>
                    <option value="Recours gracieux et réclamation">Recours gracieux et réclamation</option>
                    <option value="Demande d'information">Demande d'information</option>
                    <option value="Plainte">Plainte</option>
                    <option value="Autre">Autre</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Priorité</CFormLabel>
                  <CFormSelect v-model="form.priority" required>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Très urgent">Très urgent</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Date du courrier</CFormLabel>
                  <CFormInput type="date" v-model="form.mailDate" required />
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Date d'arrivée</CFormLabel>
                  <CFormInput type="date" v-model="form.arrivalDate" required />
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Expéditeur</CFormLabel>
                  <CInputGroup>
                    <CFormInput v-model="form.sender" placeholder="Rechercher un contact" required />
                    <CButton color="primary" @click="openSearchModal">Rechercher</CButton>
                  </CInputGroup>
                  <div v-if="form.sender" class="selected-contact mt-2">
                    <span>{{ form.sender }}</span>
                    <CButton color="danger" size="sm" class="ms-2" @click="form.sender = ''">X</CButton>
                  </div>
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Sujet</CFormLabel>
                  <CFormInput v-model="form.subject" placeholder="Saisir le sujet du courrier" required />
                </CCol>
              </CRow>
  
              <!-- Section Traitement -->
              <h4 class="section-title mt-4">Traitement</h4>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Entité traitante</CFormLabel>
                  <CFormSelect v-model="form.entity" required>
                    <option value="Pôle Technique">Pôle Technique</option>
                    <option value="Pôle Administratif">Pôle Administratif</option>
                    <option value="Pôle Financier">Pôle Financier</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol md="12">
                  <CFormLabel>Envoyer courrier en validation</CFormLabel>
                  <CFormSelect v-model="form.validation">
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </CFormSelect>
                </CCol>
              </CRow>
  
              <!-- Boutons d'action -->
              <CRow class="mt-4">
                <CCol class="text-end">
                  <CButton color="secondary" class="me-2" @click="$router.push('/courriers-entrants/reception')">Annuler</CButton>
                  <CButton color="primary" type="submit">Valider</CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Prévisualisation à droite -->
      <CCol md="6" v-if="previewUrl">
        <CCard>
          <CCardHeader>
            <h2>Prévisualisation</h2>
          </CCardHeader>
          <CCardBody>
            <div class="preview-controls mb-3">
              <CButton color="primary" size="sm" @click="zoomIn" class="me-2">Zoom +</CButton>
              <CButton color="primary" size="sm" @click="zoomOut" class="me-2">Zoom -</CButton>
              <CButton color="secondary" size="sm" @click="downloadFile">Télécharger</CButton>
            </div>
            <div v-if="isImage" class="preview-container">
              <img :src="previewUrl" alt="Prévisualisation du document" :style="{ transform: `scale(${zoomLevel})` }" />
            </div>
            <div v-else-if="isPDF" class="preview-container">
              <iframe :src="previewUrl" :style="{ transform: `scale(${zoomLevel})`, width: '100%', height: '500px' }" frameborder="0"></iframe>
            </div>
            <div v-else>
              <p>Format de fichier non pris en charge pour la prévisualisation.</p>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  
    <!-- Modale de recherche de contact -->
    <CModal :visible="showSearchModal" @close="showSearchModal = false">
      <CModalHeader>
        <CModalTitle>Rechercher un contact</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput v-model="searchQuery" placeholder="Entrez le nom du contact" @input="searchContact" class="mb-3" />
        <CTable v-if="searchResults.length">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nom</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Entité</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="contact in searchResults" :key="contact.id">
              <CTableDataCell>{{ contact.name }}</CTableDataCell>
              <CTableDataCell>{{ contact.email }}</CTableDataCell>
              <CTableDataCell>{{ contact.entity }}</CTableDataCell>
              <CTableDataCell>
                <CButton color="primary" size="sm" @click="selectContact(contact)">Sélectionner</CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
        <p v-else>Aucun contact trouvé.</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showSearchModal = false">Fermer</CButton>
      </CModalFooter>
    </CModal>
  </template>
  
  <script>
  import { reactive, ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCourrierStore } from '../../stores/courrier';
  import {
    CCard,
    CCardHeader,
    CCardBody,
    CForm,
    CFormLabel,
    CFormInput,
    CFormSelect,
    CInputGroup,
    CButton,
    CRow,
    CCol,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
  } from '@coreui/vue';
  
  export default {
    name: 'Enregistrement',
    components: {
      CCard,
      CCardHeader,
      CCardBody,
      CForm,
      CFormLabel,
      CFormInput,
      CFormSelect,
      CInputGroup,
      CButton,
      CRow,
      CCol,
      CModal,
      CModalHeader,
      CModalTitle,
      CModalBody,
      CModalFooter,
      CTable,
      CTableHead,
      CTableRow,
      CTableHeaderCell,
      CTableBody,
      CTableDataCell,
    },
    setup() {
      const router = useRouter();
      const store = useCourrierStore();
  
      const form = reactive({
        type: 'Recours gracieux et réclamation',
        priority: 'Normal',
        mailDate: '',
        arrivalDate: '',
        sender: '',
        subject: '',
        entity: 'Pôle Technique',
        validation: 'Oui',
        file: null,
      });
  
      const previewUrl = ref(null);
      const isImage = computed(() => form.file && form.file.type.startsWith('image/'));
      const isPDF = computed(() => form.file && form.file.type === 'application/pdf');
      const zoomLevel = ref(1); // Niveau de zoom initial
  
      const showSearchModal = ref(false);
      const searchQuery = ref('');
      const searchResults = ref([]);
  
      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          form.file = file;
          previewUrl.value = URL.createObjectURL(file);
          zoomLevel.value = 1; // Réinitialiser le zoom lors d'un nouvel upload
        }
      };
  
      const zoomIn = () => {
        if (zoomLevel.value < 3) {
          zoomLevel.value += 0.2;
        }
      };
  
      const zoomOut = () => {
        if (zoomLevel.value > 0.5) {
          zoomLevel.value -= 0.2;
        }
      };
  
      const downloadFile = () => {
        if (form.file) {
          const url = URL.createObjectURL(form.file);
          const link = document.createElement('a');
          link.href = url;
          link.download = form.file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      };
  
      const openSearchModal = () => {
        showSearchModal.value = true;
        searchQuery.value = form.sender;
        searchContact();
      };
  
      const searchContact = async () => {
        if (!searchQuery.value) {
          searchResults.value = [];
          return;
        }
        try {
          const response = await fetch(`http://localhost:3000/api/contacts/search?query=${encodeURIComponent(searchQuery.value)}`);
          if (response.ok) {
            searchResults.value = await response.json();
          } else {
            searchResults.value = [];
          }
        } catch (error) {
          console.error('Erreur lors de la recherche de contact :', error);
          searchResults.value = [];
        }
      };
  
      const selectContact = (contact) => {
        form.sender = contact.name;
        showSearchModal.value = false;
      };
  
      const registerMail = async () => {
        try {
          const formData = new FormData();
          formData.append('subject', form.subject);
          formData.append('sender', form.sender);
          formData.append('status', form.validation === 'Oui' ? 'en attente de validation' : 'nouveau');
          formData.append('type', form.type);
          formData.append('priority', form.priority);
          formData.append('mail_date', form.mailDate);
          formData.append('arrival_date', form.arrivalDate);
          formData.append('entity', form.entity);
          if (form.file) {
            formData.append('file', form.file);
          }
  
          const response = await fetch('http://localhost:3000/api/mails/incoming', {
            method: 'POST',
            body: formData,
          });
  
          if (response.ok) {
            const newMail = await response.json();
            await fetch('http://localhost:3000/api/actions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mail_id: newMail.id,
                mail_type: 'incoming',
                action: 'courrier enregistré',
                user_id: 1,
              }),
            });
  
            store.fetchIncomingMails();
            router.push('/courriers-entrants/reception');
          } else {
            alert('Erreur lors de l’enregistrement du courrier.');
          }
        } catch (error) {
          console.error('Erreur :', error);
          alert('Une erreur est survenue lors de l’enregistrement.');
        }
      };
  
      return {
        form,
        previewUrl,
        isImage,
        isPDF,
        zoomLevel,
        showSearchModal,
        searchQuery,
        searchResults,
        handleFileUpload,
        zoomIn,
        zoomOut,
        downloadFile,
        openSearchModal,
        searchContact,
        selectContact,
        registerMail,
      };
    },
  };
  </script>
  
  <style scoped>
  .section-title {
    color: #007bff;
    border-bottom: 2px solid #007bff;
    padding-bottom: 5px;
    margin-bottom: 20px;
  }
  
  .selected-contact {
    background-color: #e9ecef;
    padding: 5px 10px;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
  }
  
  .preview-container {
    overflow: auto;
    max-height: 500px;
  }
  
  .preview-container img,
  .preview-container iframe {
    transform-origin: top left;
    transition: transform 0.3s ease;
  }
  </style>