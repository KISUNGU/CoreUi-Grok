<template>
  <CRow>
    <CCol :xs="6">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Enregistrement des Courriers Entrants</strong>
        </CCardHeader>
        <CCardBody>
          <CForm @submit.prevent="submitCourrier">
            <CForm class="mb-3">
              <CFormLabel for="reference">Référence</CFormLabel>
              <CFormInput
                v-model="courrier.reference"
                type="text"
                id="reference"
                placeholder="Référence du courrier"
                required
              />
            </CForm>
            <CForm class="mb-3">
              <CFormLabel for="expediteur">Expéditeur</CFormLabel>
              <CFormInput
                v-model="courrier.expediteur"
                type="text"
                id="expediteur"
                placeholder="Nom de l'expéditeur"
                required
              />
            </CForm>
            <CForm class="mb-3">
              <CFormLabel for="objet">Objet</CFormLabel>
              <CFormTextarea
                v-model="courrier.objet"
                id="objet"
                rows="3"
                placeholder="Objet du courrier"
                required
              ></CFormTextarea>
            </CForm>
            <CForm class="mb-3">
              <CFormLabel for="date">Date</CFormLabel>
              <CFormInput
                v-model="courrier.date"
                type="date"
                id="date"
                required
              />
            </CForm>
            <CForm class="mb-3">
              <CFormLabel for="pieceJointe">Pièce Jointe</CFormLabel>
              <CFormInput
                @change="handleFileUpload"
                type="file"
                id="pieceJointe"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </CForm>
            <CButton type="submit" color="primary">Enregistrer</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol :xs="6">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Visualisation de la Pièce Jointe</strong>
        </CCardHeader>
        <CCardBody>
          <div v-if="pieceJointeURL">
            <p><strong>Nom du fichier :</strong> {{ pieceJointe.name }}</p>
            <p><strong>Taille :</strong> {{ (pieceJointe.size / 1024).toFixed(2) }} Ko</p>
            <div class="preview">
              <img v-if="isImage" :src="pieceJointeURL" alt="Aperçu de la pièce jointe" class="img-fluid" />

              <embed v-if="isPDF" :src="pieceJointeURL" width="100%" height="400" type="application/pdf" />

              <p v-if="!isImage && !isPDF">Le format de la pièce jointe ne peut pas être prévisualisé.</p>
            </div>
          </div>
          <div v-else>
            <p>Aucune pièce jointe disponible pour visualisation.</p>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
} from '@coreui/vue';

export default {
  components: {
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CForm,
    CForm,
    CFormLabel,
    CFormInput,
    CFormTextarea,
    CButton,
  },
  data() {
    return {
      courrier: {
        reference: '',
        expediteur: '',
        objet: '',
        date: '',
      },
      pieceJointe: null,
      pieceJointeURL: '',
    };
  },
  computed: {
    isImage() {
      return this.pieceJointe && this.pieceJointe.type.startsWith('image/');
    },
    isPDF() {
      return this.pieceJointe && this.pieceJointe.type === 'application/pdf';
    },
  },
  methods: {
    submitCourrier() {
      console.log('Courrier enregistré :', this.courrier);
      console.log('Pièce jointe :', this.pieceJointe);

      // Requête adaptée pour le backend existant (en conservant le formData pour le fichier)
      const formData = new FormData();
      formData.append('subject', this.courrier.objet); // Objet -> subject
      formData.append('sender', this.courrier.expediteur); // Expediteur -> sender
      formData.append('type', 'courrier entrant'); // Ajout du type
      formData.append('priority', 'normal'); // Ajout de priorité par défaut
      formData.append('mail_date', this.courrier.date); // Date
      formData.append('arrival_date', new Date().toISOString()); // Date d'arrivée actuelle
      formData.append('entity', 'Entité par défaut'); // Entité fixe
      formData.append('ref_code', this.courrier.reference); // Remplace 'references' par 'ref_code'
      formData.append('summary', ''); // Résumé vide
      formData.append('annexes', ''); // Annexes vides
      if (this.pieceJointe) {
        formData.append('file', this.pieceJointe); // Pièce jointe
      }

      fetch('http://localhost:3000/api/mails/incoming', {
        method: 'POST',
        body: formData, // Utilisation de formData pour l'envoi du fichier
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur d'enregistrement du courrier");
          }
          return response.json();
        })
        .then((data) => {
          alert('Courrier enregistré avec succès !');
          this.resetForm();
        })
        .catch((error) => {
          console.error('Erreur :', error);
          alert("Une erreur est survenue lors de l'enregistrement.");
        });
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.pieceJointe = file;
      this.pieceJointeURL = URL.createObjectURL(file);
    },
    resetForm() {
      this.courrier = { reference: '', expediteur: '', objet: '', date: '' };
      this.pieceJointe = null;
      this.pieceJointeURL = '';
    },
  },
};
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
.preview img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
}
</style>