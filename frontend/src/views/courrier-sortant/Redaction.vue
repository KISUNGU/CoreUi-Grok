<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-pencil me-2"></i> Nouveau Courrier</strong>
        </CCardHeader>
        <CCardBody class="p-0">
          <!-- Barre d'outils -->
          <div class="outlook-toolbar d-flex align-items-center p-2">
            <button @click="saveDraft" class="btn btn-primary custom-btn me-2" :disabled="!form.recipient || !form.subject">
              <i class="cil-save me-1"></i> Enregistrer
            </button>
            <button @click="validateCourrier" class="btn btn-success custom-btn me-2" :disabled="!form.recipient || !form.subject">
              <i class="cil-check me-1"></i> Valider
            </button>
            <button @click="openFileModal" class="btn btn-outline-secondary custom-btn me-2">
              <i class="cil-paperclip me-1"></i> Joindre
            </button>
            <button @click="resetForm" class="btn btn-outline-secondary custom-btn">
              <i class="cil-trash me-1"></i> Annuler
            </button>
          </div>
          <!-- Formulaire -->
          <div class="p-3">
            <div class="mb-3">
              <label for="recipient" class="form-label">À</label>
              <input
                v-model="form.recipient"
                type="text"
                class="form-control outlook-input"
                id="recipient"
                placeholder="Entrer le destinataire"
                required
              />
            </div>
            <div class="mb-3">
              <label for="cc" class="form-label">Cc</label>
              <input
                v-model="form.cc"
                type="text"
                class="form-control outlook-input"
                id="cc"
                placeholder="Entrer les destinataires en copie"
              />
            </div>
            <div class="mb-3">
              <label for="subject" class="form-label">Objet</label>
              <input
                v-model="form.subject"
                type="text"
                class="form-control outlook-input"
                id="subject"
                placeholder="Entrer l'objet du courrier"
                required
              />
            </div>
            <div class="mb-3">
              <textarea
                v-model="form.content"
                class="form-control outlook-textarea"
                id="content"
                rows="10"
                placeholder="Rédiger votre courrier..."
              ></textarea>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal pour joindre un fichier -->
    <CModal :visible="showFileModal" title="Joindre un Document" @close="closeFileModal" class="custom-modal">
      <div class="mb-3">
        <label for="fileInput" class="form-label">Sélectionner un fichier (.doc, .docx, .pdf)</label>
        <input
          type="file"
          class="form-control outlook-input"
          id="fileInput"
          accept=".doc,.docx,application/pdf"
          @change="handleFileChange"
          ref="fileInput"
        />
      </div>
      <div v-if="fileForm.file" class="mb-3">
        <p><strong>Fichier sélectionné :</strong> {{ fileForm.file.name }}</p>
      </div>
      <button @click="uploadFile('Brouillon')" class="btn btn-primary custom-btn me-2" :disabled="!fileForm.file">
        <i class="cil-cloud-upload me-1"></i> Enregistrer comme brouillon
      </button>
      <button @click="uploadFile('Validé')" class="btn btn-success custom-btn me-2" :disabled="!fileForm.file">
        <i class="cil-check me-1"></i> Valider
      </button>
      <button @click="closeFileModal" class="btn btn-secondary custom-btn">Annuler</button>
    </CModal>
  </CRow>
</template>

<script>
export default {
  data() {
    return {
      form: {
        recipient: '',
        cc: '',
        subject: '',
        content: '',
      },
      fileForm: {
        file: null,
      },
      showFileModal: false,
    };
  },
  methods: {
    async saveDraft() {
      await this.saveCourrier('Brouillon');
    },
    async validateCourrier() {
      await this.saveCourrier('Validé');
    },
    async saveCourrier(status) {
      if (!this.form.recipient || !this.form.subject) {
        alert('Veuillez remplir les champs "À" et "Objet"');
        return;
      }
      console.log(`Enregistrement du courrier avec statut : ${status}`, this.form);
      try {
        const response = await fetch('http://localhost:3000/api/mails/outgoing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...this.form,
            mail_date: new Date().toISOString().split('T')[0],
            status,
          }),
        });
        if (response.ok) {
          alert(`Courrier ${status.toLowerCase()} avec succès`);
          this.resetForm();
        } else {
          const errorData = await response.json();
          alert(`Erreur : ${errorData.error || 'Échec de l’enregistrement du courrier'}`);
        }
      } catch (error) {
        console.error(`Erreur lors de l’enregistrement du courrier (statut: ${status}) :`, error);
        alert(`Erreur lors de l’enregistrement du courrier : ${error.message}`);
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = [
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
        ];
        if (!allowedTypes.includes(file.type)) {
          alert('Type de fichier non supporté. Veuillez sélectionner un fichier .doc, .docx ou .pdf');
          this.fileForm.file = null;
          this.$refs.fileInput.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
          this.fileForm.file = null;
          this.$refs.fileInput.value = '';
          return;
        }
        this.fileForm.file = file;
      } else {
        this.fileForm.file = null;
      }
    },
    async uploadFile(status) {
      if (!this.form.recipient || !this.form.subject) {
        alert('Veuillez remplir les champs "À" et "Objet" dans le formulaire principal avant de téléverser');
        this.closeFileModal();
        return;
      }
      if (!this.fileForm.file) {
        alert('Veuillez sélectionner un fichier à téléverser');
        return;
      }
      console.log(`Téléversement du fichier avec statut : ${status}`, this.fileForm.file.name);
      try {
        const formData = new FormData();
        formData.append('recipient', this.form.recipient);
        formData.append('cc', this.form.cc || '');
        formData.append('subject', this.form.subject);
        formData.append('content', this.form.content || '');
        formData.append('file', this.fileForm.file);
        formData.append('mail_date', new Date().toISOString().split('T')[0]);
        formData.append('status', status);

        const response = await fetch('http://localhost:3000/api/mails/outgoing', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert(`Fichier téléversé et courrier ${status.toLowerCase()} avec succès`);
          this.closeFileModal();
          this.resetForm();
        } else {
          const errorData = await response.json();
          alert(`Erreur : ${errorData.error || 'Échec du téléversement du fichier'}`);
        }
      } catch (error) {
        console.error(`Erreur lors du téléversement du fichier (statut: ${status}) :`, error);
        alert(`Erreur lors du téléversement du fichier : ${error.message}`);
      }
    },
    openFileModal() {
      this.fileForm.file = null;
      this.$refs.fileInput.value = '';
      this.showFileModal = true;
      this.$nextTick(() => {
        this.$refs.fileInput.focus();
      });
    },
    closeFileModal() {
      this.showFileModal = false;
      this.fileForm.file = null;
      this.$refs.fileInput.value = '';
    },
    resetForm() {
      this.form.recipient = '';
      this.form.cc = '';
      this.form.subject = '';
      this.form.content = '';
    },
  },
};
</script>

<style scoped>
/* Style général inspiré d'Outlook */
.outlook-card {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.outlook-header {
  background-color: #0078d4;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
}

/* Barre d'outils */
.outlook-toolbar {
  background-color: #f3f2f1;
  border-bottom: 1px solid #e1dfdd;
  padding: 8px 16px;
}
.outlook-toolbar .custom-btn {
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.outlook-toolbar .btn-primary {
  background-color: #0078d4;
  border-color: #0078d4;
}
.outlook-toolbar .btn-primary:hover {
  background-color: #005a9e;
  border-color: #005a9e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.outlook-toolbar .btn-success {
  background-color: #2ecc71;
  border-color: #2ecc71;
}
.outlook-toolbar .btn-success:hover {
  background-color: #27ae60;
  border-color: #27ae60;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.outlook-toolbar .btn-outline-secondary {
  border-color: #8e8e8e;
  color: #333;
}
.outlook-toolbar .btn-outline-secondary:hover {
  background-color: #e1dfdd;
  border-color: #8e8e8e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.outlook-toolbar .btn-primary:disabled,
.outlook-toolbar .btn-success:disabled {
  background-color: #a0a0a0;
  border-color: #a0a0a0;
  cursor: not-allowed;
}

/* Formulaire */
.outlook-input,
.outlook-textarea {
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.outlook-input:focus,
.outlook-textarea:focus {
  border-color: #0078d4;
  box-shadow: 0 0 5px rgba(0, 120, 212, 0.3);
  outline: none;
}
.outlook-textarea {
  resize: vertical;
  min-height: 100px;
}
.form-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

/* Modal */
.custom-modal .modal-content {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
}
.custom-modal .modal-header {
  background-color: #0078d4;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 12px 16px;
  border-bottom: none;
}
.custom-modal .modal-title {
  font-weight: 600;
  font-size: 16px;
}
.custom-modal .modal-body {
  padding: 16px;
  color: #333;
}
.custom-modal .modal-body p {
  margin-bottom: 10px;
  font-size: 14px;
}
.custom-modal .form-control {
  border-radius: 4px;
  border: 1px solid #d1d1d1;
  padding: 8px 12px;
}
.custom-modal .form-control:focus {
  border-color: #0078d4;
  box-shadow: 0 0 5px rgba(0, 120, 212, 0.3);
}
.custom-modal .modal-footer {
  border-top: none;
  padding: 0 16px 16px;
  justify-content: flex-end;
}

/* Animation pour le modal */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.custom-modal .modal-dialog {
  animation: fadeInScale 0.3s ease;
  max-width: 500px;
}

/* Boutons du modal */
.custom-btn {
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.custom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-primary {
  background-color: #0078d4;
  border-color: #0078d4;
}
.btn-primary:hover {
  background-color: #005a9e;
  border-color: #005a9e;
}
.btn-success {
  background-color: #2ecc71;
  border-color: #2ecc71;
}
.btn-success:hover {
  background-color: #27ae60;
  border-color: #27ae60;
}
.btn-secondary {
  background-color: #8e8e8e;
  border-color: #8e8e8e;
}
.btn-secondary:hover {
  background-color: #707070;
  border-color: #707070;
}
.btn-primary:disabled,
.btn-success:disabled {
  background-color: #a0a0a0;
  border-color: #a0a0a0;
  cursor: not-allowed;
}
</style>