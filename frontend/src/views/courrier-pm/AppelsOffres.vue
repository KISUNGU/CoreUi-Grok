<template>
  <CRow class="flex-column">
    <!-- Barre de recherche -->
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-spreadsheet me-2"></i> Gestion des Appels d'Offres</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control outlook-input"
              placeholder="Rechercher par référence, statut ou description"
            />
            <button @click="applySearch" class="btn btn-primary custom-btn ms-2">
              <i class="cil-search me-1"></i> Rechercher
            </button>
          </div>
          <div class="outlook-toolbar d-flex align-items-center">
            <button @click="showAddModal = true" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Ajouter un appel d'offre">
              <i class="cil-plus"></i>
            </button>
            <button @click="$refs.importInput.click()" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Importer depuis Excel">
              <i class="cil-cloud-upload"></i>
            </button>
            <input
              type="file"
              style="display: none;"
              ref="importInput"
              accept=".xlsx,.xls,.csv"
              @change="importFromExcel"
            />
            <button @click="exportToExcel" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Exporter vers Excel">
              <i class="cil-cloud-download"></i>
            </button>
            <button @click="printTable" class="btn btn-outline-primary custom-btn icon-btn" title="Imprimer">
              <i class="cil-print"></i>
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Tableau des appels d'offres -->
    <CCol :xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Appels d'Offres</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Description</th>
                <th>Budget</th>
                <th>Date de Publication</th>
                <th>Date de Clôture</th>
                <th>Statut</th>
                <th>Étape</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appel in paginatedAppels" :key="appel.id">
                <td>{{ appel.reference || 'N/A' }}</td>
                <td>{{ appel.description || 'N/A' }}</td>
                <td>{{ appel.budget ? `${appel.budget} €` : 'N/A' }}</td>
                <td>{{ appel.datePublication || 'N/A' }}</td>
                <td>{{ appel.dateCloture || 'N/A' }}</td>
                <td>{{ appel.statut || 'N/A' }}</td>
                <td>{{ appel.etape || 'N/A' }}</td>
                <td class="d-flex align-items-center">
                  <button @click="viewAppel(appel)" class="btn btn-info btn-sm custom-btn icon-btn me-2" title="Visualiser">
                    <i class="cil-eye"></i>
                  </button>
                  <button @click="editAppel(appel)" class="btn btn-warning btn-sm custom-btn icon-btn me-2" title="Modifier">
                    <i class="cil-pencil"></i>
                  </button>
                  <button @click="deleteAppel(appel.id)" class="btn btn-danger btn-sm custom-btn icon-btn" title="Supprimer">
                    <i class="cil-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedAppels.length === 0">
                <td colspan="8" class="text-center">Aucun appel d'offre trouvé</td>
              </tr>
            </tbody>
          </table>
          <!-- Pagination -->
          <div class="d-flex justify-content-center mt-3">
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">Précédent</button>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">Suivant</button>
                </li>
              </ul>
            </nav>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal Ajouter/Modifier -->
    <CModal :visible="showAddModal" :title="isEditing ? 'Modifier un Appel d\'Offre' : 'Ajouter un Appel d\'Offre'" @close="showAddModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="6">
          <form @submit.prevent="submitAppel">
            <div class="mb-3">
              <label for="reference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="newAppel.reference"
                type="text"
                class="form-control outlook-input"
                id="reference"
                placeholder="Référence de l'appel"
                required
              />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label"><i class="cil-description me-1"></i> Description</label>
              <textarea
                v-model="newAppel.description"
                class="form-control outlook-textarea"
                id="description"
                rows="3"
                placeholder="Description de l'appel"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="budget" class="form-label"><i class="cil-money me-1"></i> Budget (€)</label>
              <input
                v-model.number="newAppel.budget"
                type="number"
                class="form-control outlook-input"
                id="budget"
                placeholder="Budget estimé"
                min="0"
                required
              />
            </div>
          </form>
        </CCol>
        <CCol :xs="6">
          <div class="mb-3">
            <label for="datePublication" class="form-label"><i class="cil-calendar me-1"></i> Date de Publication</label>
            <input
              v-model="newAppel.datePublication"
              type="date"
              class="form-control outlook-input"
              id="datePublication"
              required
            />
          </div>
          <div class="mb-3">
            <label for="dateCloture" class="form-label"><i class="cil-calendar-check me-1"></i> Date de Clôture</label>
            <input
              v-model="newAppel.dateCloture"
              type="date"
              class="form-control outlook-input"
              id="dateCloture"
              required
            />
          </div>
          <div class="mb-3">
            <label for="statut" class="form-label"><i class="cil-info me-1"></i> Statut</label>
            <select v-model="newAppel.statut" class="form-control outlook-input" id="statut" required>
              <option value="Ouvert">Ouvert</option>
              <option value="Fermé">Fermé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="etape" class="form-label"><i class="cil-task me-1"></i> Étape</label>
            <select v-model="newAppel.etape" class="form-control outlook-input" id="etape" required>
              <option value="Planifié">Planifié</option>
              <option value="Publié">Publié</option>
              <option value="En évaluation">En évaluation</option>
              <option value="Attribué">Attribué</option>
              <option value="Clôturé">Clôturé</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="pieceJointe" class="form-label"><i class="cil-paperclip me-1"></i> Pièce Jointe</label>
            <input
              @change="handleFileUpload"
              type="file"
              class="form-control outlook-input"
              id="pieceJointe"
              accept=".pdf,.doc,.docx,.jpg,.png"
              ref="fileInput"
            />
          </div>
        </CCol>
      </CRow>
      <template #footer>
        <button @click="validateForm" class="btn btn-info custom-btn me-2">
          <i class="cil-check-circle me-1"></i> Vérifier
        </button>
        <button @click="showAddModal = false" class="btn btn-secondary custom-btn me-2">Annuler</button>
        <button
          @click="submitAppel"
          class="btn btn-primary custom-btn"
          :disabled="!isFormValid"
        >
          <i class="cil-check me-1"></i> {{ isEditing ? 'Modifier' : 'Valider et Enregistrer' }}
        </button>
      </template>
    </CModal>

    <!-- Modal Visualiser -->
    <CModal :visible="showDetailsModal" title="Détails de l'Appel d'Offre" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedAppel.reference || 'N/A' }}</p>
      <p><strong>Description :</strong> {{ selectedAppel.description || 'N/A' }}</p>
      <p><strong>Budget :</strong> {{ selectedAppel.budget ? `${selectedAppel.budget} €` : 'N/A' }}</p>
      <p><strong>Date de Publication :</strong> {{ selectedAppel.datePublication || 'N/A' }}</p>
      <p><strong>Date de Clôture :</strong> {{ selectedAppel.dateCloture || 'N/A' }}</p>
      <p><strong>Statut :</strong> {{ selectedAppel.statut || 'N/A' }}</p>
      <p><strong>Étape :</strong> {{ selectedAppel.etape || 'N/A' }}</p>
      <p v-if="selectedAppel.piece_jointe">
        <strong>Pièce jointe :</strong>
        <a :href="`http://localhost:3000${selectedAppel.piece_jointe}`" target="_blank" class="text-primary">Télécharger</a>
      </p>
      <template #footer>
        <button @click="showDetailsModal = false" class="btn btn-secondary custom-btn">Fermer</button>
      </template>
    </CModal>
  </CRow>
</template>

<script>
export default {
  name: 'AppelsOffres',
  data() {
    return {
      appels: [],
      searchQuery: '',
      showAddModal: false,
      showDetailsModal: false,
      isEditing: false,
      currentPage: 1,
      itemsPerPage: 5,
      newAppel: {
        id: null,
        reference: '',
        description: '',
        budget: null,
        datePublication: '',
        dateCloture: '',
        statut: 'Ouvert',
        etape: 'Planifié',
      },
      selectedAppel: {},
      pieceJointe: null,
    };
  },
  computed: {
    filteredAppels() {
      const query = this.searchQuery.toLowerCase();
      return this.appels.filter(
        (appel) =>
          (appel.reference && appel.reference.toLowerCase().includes(query)) ||
          (appel.description && appel.description.toLowerCase().includes(query)) ||
          (appel.statut && appel.statut.toLowerCase().includes(query)) ||
          (appel.etape && appel.etape.toLowerCase().includes(query))
      );
    },
    paginatedAppels() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAppels.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredAppels.length / this.itemsPerPage);
    },
    isFormValid() {
      return (
        this.newAppel.reference &&
        this.newAppel.description &&
        this.newAppel.budget !== null &&
        this.newAppel.budget > 0 &&
        this.newAppel.datePublication &&
        this.newAppel.dateCloture &&
        this.newAppel.dateCloture >= this.newAppel.datePublication &&
        this.newAppel.statut &&
        this.newAppel.etape
      );
    },
  },
  methods: {
    async fetchAppels() {
      try {
        const response = await fetch('http://localhost:3000/api/appels');
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        this.appels = await response.json();
        this.currentPage = 1;
        console.log('Appels d\'offres récupérés:', this.appels);
      } catch (error) {
        console.error('Erreur lors de la récupération des appels d\'offres:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    applySearch() {
      console.log('Recherche appliquée:', this.searchQuery);
      this.currentPage = 1;
    },
    validateForm() {
      let errors = [];
      if (!this.newAppel.reference) errors.push('Référence requise');
      if (!this.newAppel.description) errors.push('Description requise');
      if (this.newAppel.budget === null || this.newAppel.budget <= 0) errors.push('Budget requis et doit être supérieur à 0');
      if (!this.newAppel.datePublication) errors.push('Date de publication requise');
      if (!this.newAppel.dateCloture) errors.push('Date de clôture requise');
      if (this.newAppel.dateCloture && this.newAppel.datePublication && this.newAppel.dateCloture < this.newAppel.datePublication) {
        errors.push('La date de clôture doit être postérieure à la date de publication');
      }
      if (!this.newAppel.statut) errors.push('Statut requis');
      if (!this.newAppel.etape) errors.push('Étape requise');
      if (errors.length > 0) {
        alert('Erreurs dans le formulaire:\n- ' + errors.join('\n- '));
      } else {
        alert('Tous les champs sont valides !');
      }
    },
    async submitAppel() {
      if (!this.isFormValid) {
        alert('Veuillez remplir tous les champs requis correctement');
        return;
      }

      const formData = new FormData();
      formData.append('reference', this.newAppel.reference);
      formData.append('description', this.newAppel.description);
      formData.append('budget', this.newAppel.budget);
      formData.append('datePublication', this.newAppel.datePublication);
      formData.append('dateCloture', this.newAppel.dateCloture);
      formData.append('statut', this.newAppel.statut);
      formData.append('etape', this.newAppel.etape);
      if (this.pieceJointe) {
        formData.append('pieceJointe', this.pieceJointe);
      }

      try {
        const url = this.isEditing ? `http://localhost:3000/api/appels/${this.newAppel.id}` : 'http://localhost:3000/api/appels';
        const method = this.isEditing ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          body: formData,
        });
        if (response.ok) {
          alert(this.isEditing ? 'Appel d\'offre modifié avec succès !' : 'Appel d\'offre validé et enregistré avec succès !');
          this.showAddModal = false;
          this.isEditing = false;
          this.newAppel = {
            id: null,
            reference: '',
            description: '',
            budget: null,
            datePublication: '',
            dateCloture: '',
            statut: 'Ouvert',
            etape: 'Planifié',
          };
          this.pieceJointe = null;
          if (this.$refs.fileInput) this.$refs.fileInput.value = '';
          await this.fetchAppels();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de l\'opération'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'appel d\'offre:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    editAppel(appel) {
      this.isEditing = true;
      this.newAppel = { ...appel };
      this.pieceJointe = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
      this.showAddModal = true;
      console.log('Modal d\'édition ouvert:', this.newAppel, 'showAddModal:', this.showAddModal);
    },
    async deleteAppel(id) {
      if (!confirm('Voulez-vous vraiment supprimer cet appel d\'offre ?')) return;
      try {
        const response = await fetch(`http://localhost:3000/api/appels/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Appel d\'offre supprimé avec succès !');
          await this.fetchAppels();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'appel d\'offre:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    viewAppel(appel) {
      this.selectedAppel = { ...appel };
      this.showDetailsModal = true;
      console.log('Modal de visualisation ouvert:', this.selectedAppel, 'showDetailsModal:', this.showDetailsModal);
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (!allowedTypes.includes(file.type)) {
          alert('Type de fichier non supporté. Utilisez .pdf, .doc, .docx, .jpg ou .png');
          this.pieceJointe = null;
          if (this.$refs.fileInput) this.$refs.fileInput.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
          this.pieceJointe = null;
          if (this.$refs.fileInput) this.$refs.fileInput.value = '';
          return;
        }
        this.pieceJointe = file;
        console.log('Fichier chargé:', this.pieceJointe.name);
      } else {
        this.pieceJointe = null;
      }
    },
    async importFromExcel(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
        if (this.$refs.importInput) this.$refs.importInput.value = '';
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);

          const appels = json.map((row) => ({
            reference: row['Référence']?.toString() || '',
            description: row['Description']?.toString() || '',
            budget: parseFloat(row['Budget']) || null,
            datePublication: row['Date de Publication']?.toString() || '',
            dateCloture: row['Date de Clôture']?.toString() || '',
            statut: row['Statut']?.toString() || 'Ouvert',
            etape: row['Étape']?.toString() || 'Planifié',
          }));

          const validAppels = appels.filter(
            (a) =>
              a.reference &&
              a.description &&
              a.budget &&
              a.budget > 0 &&
              a.datePublication &&
              a.dateCloture &&
              a.dateCloture >= a.datePublication &&
              a.statut &&
              a.etape
          );

          if (validAppels.length === 0) {
            alert('Aucun appel d\'offre valide trouvé dans le fichier Excel');
            return;
          }

          try {
            const response = await fetch('http://localhost:3000/api/appels/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(validAppels),
            });
            if (response.ok) {
              alert('Appels d\'offres importés avec succès !');
              if (this.$refs.importInput) this.$refs.importInput.value = '';
              await this.fetchAppels();
            } else {
              const errorData = await response.json();
              alert(`Erreur: ${errorData.error || 'Échec de l’importation'}`);
            }
          } catch (error) {
            console.error('Erreur lors de l’importation:', error);
            alert(`Erreur: ${error.message}`);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier Excel:', error);
        alert('Erreur lors de la lecture du fichier Excel');
      }
    },
    exportToExcel() {
      if (this.appels.length === 0) {
        alert('Aucun appel d\'offre à exporter');
        return;
      }

      const data = this.appels.map((a) => ({
        Référence: a.reference,
        Description: a.description,
        Budget: a.budget ? `${a.budget} €` : 'N/A',
        'Date de Publication': a.datePublication,
        'Date de Clôture': a.dateCloture,
        Statut: a.statut,
        Étape: a.etape,
        'Pièce jointe': a.piece_jointe || 'Aucune',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Appels d\'Offres');
      XLSX.write_file(workbook, 'appels_offres.xlsx');
    },
    printTable() {
      const printContent = `
        <html>
          <head>
            <title>Impression des Appels d'Offres</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f2f1; }
            </style>
          </head>
          <body>
            <h2>Liste des Appels d'Offres</h2>
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Description</th>
                  <th>Budget</th>
                  <th>Date de Publication</th>
                  <th>Date de Clôture</th>
                  <th>Statut</th>
                  <th>Étape</th>
                </tr>
              </thead>
              <tbody>
                ${this.appels
                  .map(
                    (a) => `
                      <tr>
                        <td>${a.reference || 'N/A'}</td>
                        <td>${a.description || 'N/A'}</td>
                        <td>${a.budget ? `${a.budget} €` : 'N/A'}</td>
                        <td>${a.datePublication || 'N/A'}</td>
                        <td>${a.dateCloture || 'N/A'}</td>
                        <td>${a.statut || 'N/A'}</td>
                        <td>${a.etape || 'N/A'}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    },
  },
  mounted() {
    this.fetchAppels();
  },
};
</script>

<style scoped>
/* Style général inspiré d'Outlook */
.text-center {
  text-align: center;
}
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
.outlook-toolbar {
  background-color: #f3f2f1;
  border-bottom: 1px solid #e1dfdd;
  padding: 8px 16px;
}
.icon-btn {
  padding: 6px 10px;
  font-size: 16px;
  line-height: 1;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
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
  min-height: 80px;
}
.form-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}
.custom-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
}
.custom-table th,
.custom-table td {
  padding: 12px 15px;
  vertical-align: middle;
}
.custom-table th {
  background-color: #f3f2f1;
  font-weight: 600;
  color: #333;
}
.custom-table tr:hover {
  background-color: #e1dfdd;
}
.pagination {
  margin: 0;
}
.page-item .page-link {
  border-radius: 4px;
  margin: 0 4px;
  color: #0078d4;
  border: 1px solid #d1d1d1;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.page-item.active .page-link {
  background-color: #0078d4;
  color: white;
  border-color: #0078d4;
}
.page-item.disabled .page-link {
  color: #a0a0a0;
  cursor: not-allowed;
}
.page-item .page-link:hover:not(.disabled) {
  background-color: #e6f0fa;
}
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
.btn-outline-primary {
  border-color: #0078d4;
  color: #0078d4;
}
.btn-outline-primary:hover {
  background-color: #e6f0fa;
  border-color: #005a9e;
}
.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}
.btn-info:hover {
  background-color: #138496;
  border-color: #138496;
}
.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
}
.btn-warning:hover {
  background-color: #e0a800;
  border-color: #e0a800;
}
.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
.btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}
.btn-secondary {
  background-color: #8e8e8e;
  border-color: #8e8e8e;
}
.btn-secondary:hover {
  background-color: #707070;
  border-color: #707070;
}
.btn-primary:disabled {
  background-color: #a0a0a0;
  border-color: #a0a0a0;
  cursor: not-allowed;
}
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
.custom-modal .modal-footer {
  border-top: none;
  padding: 0 16px 16px;
  justify-content: flex-end;
}
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
  max-width: 600px;
}
.text-primary {
  color: #0078d4 !important;
  text-decoration: none;
  transition: color 0.2s ease;
}
.text-primary:hover {
  color: #005a9e !important;
  text-decoration: underline;
}
</style>