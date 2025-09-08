<template>
  <CRow class="flex-column">
    <!-- Barre de recherche -->
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-report me-2"></i> Gestion des Rapports d'Attribution</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control outlook-input"
              placeholder="Rechercher par référence, appel d'offre ou fournisseur"
            />
            <button @click="applySearch" class="btn btn-primary custom-btn ms-2">
              <i class="cil-search me-1"></i> Rechercher
            </button>
          </div>
          <div class="outlook-toolbar d-flex align-items-center">
            <button @click="showAddModal = true" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Ajouter un rapport">
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

    <!-- Tableau des rapports -->
    <CCol :xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Rapports d'Attribution</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Appel d'Offre</th>
                <th>Fournisseur</th>
                <th>Score</th>
                <th>Date d'Attribution</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rapport in paginatedRapports" :key="rapport.id">
                <td>{{ rapport.reference || 'N/A' }}</td>
                <td>{{ rapport.appelReference || 'N/A' }}</td>
                <td>{{ rapport.fournisseur || 'N/A' }}</td>
                <td>{{ rapport.score || 'N/A' }}</td>
                <td>{{ rapport.dateAttribution || 'N/A' }}</td>
                <td>{{ rapport.statut || 'N/A' }}</td>
                <td class="d-flex align-items-center">
                  <button @click="viewRapport(rapport)" class="btn btn-info btn-sm custom-btn icon-btn me-2" title="Visualiser">
                    <i class="cil-eye"></i>
                  </button>
                  <button @click="editRapport(rapport)" class="btn btn-warning btn-sm custom-btn icon-btn me-2" title="Modifier">
                    <i class="cil-pencil"></i>
                  </button>
                  <button @click="deleteRapport(rapport.id)" class="btn btn-danger btn-sm custom-btn icon-btn" title="Supprimer">
                    <i class="cil-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedRapports.length === 0">
                <td colspan="7" class="text-center">Aucun rapport trouvé</td>
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
    <CModal :visible="showAddModal" :title="isEditing ? 'Modifier un Rapport' : 'Ajouter un Rapport'" @close="showAddModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="6">
          <form @submit.prevent="submitRapport">
            <div class="mb-3">
              <label for="reference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="newRapport.reference"
                type="text"
                class="form-control outlook-input"
                id="reference"
                placeholder="Référence du rapport"
                required
              />
            </div>
            <div class="mb-3">
              <label for="appelId" class="form-label"><i class="cil-spreadsheet me-1"></i> Appel d'Offre</label>
              <select v-model="newRapport.appelId" class="form-control outlook-input" id="appelId" required>
                <option value="" disabled>Sélectionnez un appel</option>
                <option v-for="appel in appels" :key="appel.id" :value="appel.id">{{ appel.reference }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="fournisseur" class="form-label"><i class="cil-user me-1"></i> Fournisseur</label>
              <input
                v-model="newRapport.fournisseur"
                type="text"
                class="form-control outlook-input"
                id="fournisseur"
                placeholder="Nom du fournisseur"
                required
              />
            </div>
          </form>
        </CCol>
        <CCol :xs="6">
          <div class="mb-3">
            <label for="score" class="form-label"><i class="cil-star me-1"></i> Score</label>
            <input
              v-model.number="newRapport.score"
              type="number"
              class="form-control outlook-input"
              id="score"
              placeholder="Score du fournisseur (0-100)"
              min="0"
              max="100"
              required
            />
          </div>
          <div class="mb-3">
            <label for="justification" class="form-label"><i class="cil-description me-1"></i> Justification</label>
            <textarea
              v-model="newRapport.justification"
              class="form-control outlook-textarea"
              id="justification"
              rows="3"
              placeholder="Justification de l'attribution"
              required
            ></textarea>
          </div>
          <div class="mb-3">
            <label for="dateAttribution" class="form-label"><i class="cil-calendar me-1"></i> Date d'Attribution</label>
            <input
              v-model="newRapport.dateAttribution"
              type="date"
              class="form-control outlook-input"
              id="dateAttribution"
              required
            />
          </div>
          <div class="mb-3">
            <label for="statut" class="form-label"><i class="cil-info me-1"></i> Statut</label>
            <select v-model="newRapport.statut" class="form-control outlook-input" id="statut" required>
              <option value="Brouillon">Brouillon</option>
              <option value="Validé">Validé</option>
              <option value="Archivé">Archivé</option>
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
          @click="submitRapport"
          class="btn btn-primary custom-btn"
          :disabled="!isFormValid"
        >
          <i class="cil-check me-1"></i> {{ isEditing ? 'Modifier' : 'Valider et Enregistrer' }}
        </button>
      </template>
    </CModal>

    <!-- Modal Visualiser -->
    <CModal :visible="showDetailsModal" title="Détails du Rapport" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedRapport.reference || 'N/A' }}</p>
      <p><strong>Appel d'Offre :</strong> {{ selectedRapport.appelReference || 'N/A' }}</p>
      <p><strong>Fournisseur :</strong> {{ selectedRapport.fournisseur || 'N/A' }}</p>
      <p><strong>Score :</strong> {{ selectedRapport.score || 'N/A' }}</p>
      <p><strong>Justification :</strong> {{ selectedRapport.justification || 'N/A' }}</p>
      <p><strong>Date d'Attribution :</strong> {{ selectedRapport.dateAttribution || 'N/A' }}</p>
      <p><strong>Statut :</strong> {{ selectedRapport.statut || 'N/A' }}</p>
      <p v-if="selectedRapport.piece_jointe">
        <strong>Pièce jointe :</strong>
        <a :href="`http://localhost:3000${selectedRapport.piece_jointe}`" target="_blank" class="text-primary">Télécharger</a>
      </p>
      <template #footer>
        <button @click="showDetailsModal = false" class="btn btn-secondary custom-btn">Fermer</button>
      </template>
    </CModal>
  </CRow>
</template>

<script>
export default {
  name: 'RapportsAttributions',
  data() {
    return {
      rapports: [],
      appels: [],
      searchQuery: '',
      showAddModal: false,
      showDetailsModal: false,
      isEditing: false,
      currentPage: 1,
      itemsPerPage: 5,
      newRapport: {
        id: null,
        reference: '',
        appelId: '',
        appelReference: '',
        fournisseur: '',
        score: null,
        justification: '',
        dateAttribution: '',
        statut: 'Brouillon',
      },
      selectedRapport: {},
      pieceJointe: null,
    };
  },
  computed: {
    filteredRapports() {
      const query = this.searchQuery.toLowerCase();
      return this.rapports.filter(
        (rapport) =>
          (rapport.reference && rapport.reference.toLowerCase().includes(query)) ||
          (rapport.appelReference && rapport.appelReference.toLowerCase().includes(query)) ||
          (rapport.fournisseur && rapport.fournisseur.toLowerCase().includes(query)) ||
          (rapport.statut && rapport.statut.toLowerCase().includes(query))
      );
    },
    paginatedRapports() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRapports.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRapports.length / this.itemsPerPage);
    },
    isFormValid() {
      return (
        this.newRapport.reference &&
        this.newRapport.appelId &&
        this.newRapport.fournisseur &&
        this.newRapport.score !== null &&
        this.newRapport.score >= 0 &&
        this.newRapport.score <= 100 &&
        this.newRapport.justification &&
        this.newRapport.dateAttribution &&
        this.newRapport.statut
      );
    },
  },
  methods: {
    async fetchRapports() {
      try {
        const response = await fetch('http://localhost:3000/api/rapports');
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        this.rapports = await response.json();
        this.currentPage = 1;
        console.log('Rapports récupérés:', this.rapports);
      } catch (error) {
        console.error('Erreur lors de la récupération des rapports:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    async fetchAppels() {
      try {
        const response = await fetch('http://localhost:3000/api/appels');
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        this.appels = await response.json();
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
      if (!this.newRapport.reference) errors.push('Référence requise');
      if (!this.newRapport.appelId) errors.push('Appel d\'offre requis');
      if (!this.newRapport.fournisseur) errors.push('Fournisseur requis');
      if (this.newRapport.score === null || this.newRapport.score < 0 || this.newRapport.score > 100) errors.push('Score requis (0-100)');
      if (!this.newRapport.justification) errors.push('Justification requise');
      if (!this.newRapport.dateAttribution) errors.push('Date d\'attribution requise');
      if (!this.newRapport.statut) errors.push('Statut requis');
      if (errors.length > 0) {
        alert('Erreurs dans le formulaire:\n- ' + errors.join('\n- '));
      } else {
        alert('Tous les champs sont valides !');
      }
    },
    async submitRapport() {
      if (!this.isFormValid) {
        alert('Veuillez remplir tous les champs requis correctement');
        return;
      }

      const selectedAppel = this.appels.find((appel) => appel.id === this.newRapport.appelId);
      const formData = new FormData();
      formData.append('reference', this.newRapport.reference);
      formData.append('appelId', this.newRapport.appelId);
      formData.append('appelReference', selectedAppel ? selectedAppel.reference : '');
      formData.append('fournisseur', this.newRapport.fournisseur);
      formData.append('score', this.newRapport.score);
      formData.append('justification', this.newRapport.justification);
      formData.append('dateAttribution', this.newRapport.dateAttribution);
      formData.append('statut', this.newRapport.statut);
      if (this.pieceJointe) {
        formData.append('pieceJointe', this.pieceJointe);
      }

      try {
        const url = this.isEditing ? `http://localhost:3000/api/rapports/${this.newRapport.id}` : 'http://localhost:3000/api/rapports';
        const method = this.isEditing ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          body: formData,
        });
        if (response.ok) {
          alert(this.isEditing ? 'Rapport modifié avec succès !' : 'Rapport validé et enregistré avec succès !');
          this.showAddModal = false;
          this.isEditing = false;
          this.newRapport = {
            id: null,
            reference: '',
            appelId: '',
            appelReference: '',
            fournisseur: '',
            score: null,
            justification: '',
            dateAttribution: '',
            statut: 'Brouillon',
          };
          this.pieceJointe = null;
          if (this.$refs.fileInput) this.$refs.fileInput.value = '';
          await this.fetchRapports();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de l\'opération'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du rapport:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    editRapport(rapport) {
      this.isEditing = true;
      this.newRapport = { ...rapport };
      this.pieceJointe = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
      this.showAddModal = true;
      console.log('Modal d\'édition ouvert:', this.newRapport, 'showAddModal:', this.showAddModal);
    },
    async deleteRapport(id) {
      if (!confirm('Voulez-vous vraiment supprimer ce rapport ?')) return;
      try {
        const response = await fetch(`http://localhost:3000/api/rapports/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Rapport supprimé avec succès !');
          await this.fetchRapports();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du rapport:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    viewRapport(rapport) {
      this.selectedRapport = { ...rapport };
      this.showDetailsModal = true;
      console.log('Modal de visualisation ouvert:', this.selectedRapport, 'showDetailsModal:', this.showDetailsModal);
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

          const rapports = json.map((row) => ({
            reference: row['Référence']?.toString() || '',
            appelReference: row['Appel d\'Offre']?.toString() || '',
            fournisseur: row['Fournisseur']?.toString() || '',
            score: parseFloat(row['Score']) || null,
            justification: row['Justification']?.toString() || '',
            dateAttribution: row['Date d\'Attribution']?.toString() || '',
            statut: row['Statut']?.toString() || 'Brouillon',
          }));

          const validRapports = rapports.filter(
            (r) =>
              r.reference &&
              r.appelReference &&
              r.fournisseur &&
              r.score !== null &&
              r.score >= 0 &&
              r.score <= 100 &&
              r.justification &&
              r.dateAttribution &&
              r.statut
          );

          if (validRapports.length === 0) {
            alert('Aucun rapport valide trouvé dans le fichier Excel');
            return;
          }

          try {
            const response = await fetch('http://localhost:3000/api/rapports/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(validRapports),
            });
            if (response.ok) {
              alert('Rapports importés avec succès !');
              if (this.$refs.importInput) this.$refs.importInput.value = '';
              await this.fetchRapports();
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
      if (this.rapports.length === 0) {
        alert('Aucun rapport à exporter');
        return;
      }

      const data = this.rapports.map((r) => ({
        Référence: r.reference,
        'Appel d\'Offre': r.appelReference,
        Fournisseur: r.fournisseur,
        Score: r.score,
        Justification: r.justification,
        'Date d\'Attribution': r.dateAttribution,
        Statut: r.statut,
        'Pièce jointe': r.piece_jointe || 'Aucune',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapports');
      XLSX.write_file(workbook, 'rapports_attribution.xlsx');
    },
    printTable() {
      const printContent = `
        <html>
          <head>
            <title>Impression des Rapports d'Attribution</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f2f1; }
            </style>
          </head>
          <body>
            <h2>Liste des Rapports d'Attribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Appel d'Offre</th>
                  <th>Fournisseur</th>
                  <th>Score</th>
                  <th>Date d'Attribution</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                ${this.rapports
                  .map(
                    (r) => `
                      <tr>
                        <td>${r.reference || 'N/A'}</td>
                        <td>${r.appelReference || 'N/A'}</td>
                        <td>${r.fournisseur || 'N/A'}</td>
                        <td>${r.score || 'N/A'}</td>
                        <td>${r.dateAttribution || 'N/A'}</td>
                        <td>${r.statut || 'N/A'}</td>
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
    this.fetchRapports();
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