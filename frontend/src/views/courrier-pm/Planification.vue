<template>
  <CRow class="flex-column">
    <!-- Barre de recherche -->
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-plan me-2"></i> Gestion des Planifications</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control outlook-input"
              placeholder="Rechercher par référence ou description"
            />
            <button @click="applySearch" class="btn btn-primary custom-btn ms-2">
              <i class="cil-search me-1"></i> Rechercher
            </button>
          </div>
          <div class="outlook-toolbar d-flex align-items-center">
            <button @click="showAddModal = true" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Ajouter une planification">
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

    <!-- Tableau des planifications -->
    <CCol :xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Planifications</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Description</th>
                <th>Budget Prévisionnel</th>
                <th>Date de Début</th>
                <th>Date de Fin</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="planification in paginatedPlanifications" :key="planification.id">
                <td>{{ planification.reference || 'N/A' }}</td>
                <td>{{ planification.description || 'N/A' }}</td>
                <td>{{ planification.budget ? `${planification.budget} €` : 'N/A' }}</td>
                <td>{{ planification.dateDebut || 'N/A' }}</td>
                <td>{{ planification.dateFin || 'N/A' }}</td>
                <td>{{ planification.statut || 'N/A' }}</td>
                <td class="d-flex align-items-center">
                  <button @click="viewPlanification(planification)" class="btn btn-info btn-sm custom-btn icon-btn me-2" title="Visualiser">
                    <i class="cil-eye"></i>
                  </button>
                  <button @click="editPlanification(planification)" class="btn btn-warning btn-sm custom-btn icon-btn me-2" title="Modifier">
                    <i class="cil-pencil"></i>
                  </button>
                  <button @click="deletePlanification(planification.id)" class="btn btn-danger btn-sm custom-btn icon-btn" title="Supprimer">
                    <i class="cil-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedPlanifications.length === 0">
                <td colspan="7" class="text-center">Aucune planification trouvée</td>
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

    <!-- Modal Ajouter -->
    <CModal :visible="showAddModal" title="Ajouter une Planification" @close="showAddModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="6">
          <form @submit.prevent="submitNewPlanification">
            <div class="mb-3">
              <label for="addReference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="newPlanification.reference"
                type="text"
                class="form-control outlook-input"
                id="addReference"
                placeholder="Référence de la planification"
                required
              />
            </div>
            <div class="mb-3">
              <label for="addDescription" class="form-label"><i class="cil-description me-1"></i> Description</label>
              <textarea
                v-model="newPlanification.description"
                class="form-control outlook-textarea"
                id="addDescription"
                rows="3"
                placeholder="Description de la planification"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="addBudget" class="form-label"><i class="cil-money me-1"></i> Budget Prévisionnel (€)</label>
              <input
                v-model.number="newPlanification.budget"
                type="number"
                class="form-control outlook-input"
                id="addBudget"
                placeholder="Budget estimé"
                min="0"
                required
              />
            </div>
          </form>
        </CCol>
        <CCol :xs="6">
          <div class="mb-3">
            <label for="addDateDebut" class="form-label"><i class="cil-calendar me-1"></i> Date de Début</label>
            <input
              v-model="newPlanification.dateDebut"
              type="date"
              class="form-control outlook-input"
              id="addDateDebut"
              required
            />
          </div>
          <div class="mb-3">
            <label for="addDateFin" class="form-label"><i class="cil-calendar-check me-1"></i> Date de Fin</label>
            <input
              v-model="newPlanification.dateFin"
              type="date"
              class="form-control outlook-input"
              id="addDateFin"
              required
            />
          </div>
          <div class="mb-3">
            <label for="addStatut" class="form-label"><i class="cil-info me-1"></i> Statut</label>
            <select v-model="newPlanification.statut" class="form-control outlook-input" id="addStatut" required>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="addPieceJointe" class="form-label"><i class="cil-paperclip me-1"></i> Pièce Jointe</label>
            <input
              @change="handleFileUpload"
              type="file"
              class="form-control outlook-input"
              id="addPieceJointe"
              accept=".pdf,.doc,.docx,.jpg,.png"
              ref="addFileInput"
            />
          </div>
        </CCol>
      </CRow>
      <template #footer>
        <button @click="validateForm('add')" class="btn btn-info custom-btn me-2">
          <i class="cil-check-circle me-1"></i> Vérifier
        </button>
        <button @click="showAddModal = false" class="btn btn-secondary custom-btn me-2">Annuler</button>
        <button
          @click="submitNewPlanification"
          class="btn btn-primary custom-btn"
          :disabled="!isAddFormValid"
        >
          <i class="cil-check me-1"></i> Ajouter
        </button>
      </template>
    </CModal>

    <!-- Modal Modifier -->
    <CModal :visible="showEditModal" title="Modifier une Planification" @close="showEditModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="6">
          <form @submit.prevent="submitEditPlanification">
            <div class="mb-3">
              <label for="editReference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="editPlanification.reference"
                type="text"
                class="form-control outlook-input"
                id="editReference"
                placeholder="Référence de la planification"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editDescription" class="form-label"><i class="cil-description me-1"></i> Description</label>
              <textarea
                v-model="editPlanification.description"
                class="form-control outlook-textarea"
                id="editDescription"
                rows="3"
                placeholder="Description de la planification"
                required
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="editBudget" class="form-label"><i class="cil-money me-1"></i> Budget Prévisionnel (€)</label>
              <input
                v-model.number="editPlanification.budget"
                type="number"
                class="form-control outlook-input"
                id="editBudget"
                placeholder="Budget estimé"
                min="0"
                required
              />
            </div>
          </form>
        </CCol>
        <CCol :xs="6">
          <div class="mb-3">
            <label for="editDateDebut" class="form-label"><i class="cil-calendar me-1"></i> Date de Début</label>
            <input
              v-model="editPlanification.dateDebut"
              type="date"
              class="form-control outlook-input"
              id="editDateDebut"
              required
            />
          </div>
          <div class="mb-3">
            <label for="editDateFin" class="form-label"><i class="cil-calendar-check me-1"></i> Date de Fin</label>
            <input
              v-model="editPlanification.dateFin"
              type="date"
              class="form-control outlook-input"
              id="editDateFin"
              required
            />
          </div>
          <div class="mb-3">
            <label for="editStatut" class="form-label"><i class="cil-info me-1"></i> Statut</label>
            <select v-model="editPlanification.statut" class="form-control outlook-input" id="editStatut" required>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="editPieceJointe" class="form-label"><i class="cil-paperclip me-1"></i> Pièce Jointe</label>
            <input
              @change="handleEditFileUpload"
              type="file"
              class="form-control outlook-input"
              id="editPieceJointe"
              accept=".pdf,.doc,.docx,.jpg,.png"
              ref="editFileInput"
            />
          </div>
        </CCol>
      </CRow>
      <template #footer>
        <button @click="validateForm('edit')" class="btn btn-info custom-btn me-2">
          <i class="cil-check-circle me-1"></i> Vérifier
        </button>
        <button @click="showEditModal = false" class="btn btn-secondary custom-btn me-2">Annuler</button>
        <button
          @click="submitEditPlanification"
          class="btn btn-primary custom-btn"
          :disabled="!isEditFormValid"
        >
          <i class="cil-check me-1"></i> Modifier
        </button>
      </template>
    </CModal>

    <!-- Modal Visualiser -->
    <CModal :visible="showDetailsModal" title="Détails de la Planification" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedPlanification.reference || 'N/A' }}</p>
      <p><strong>Description :</strong> {{ selectedPlanification.description || 'N/A' }}</p>
      <p><strong>Budget Prévisionnel :</strong> {{ selectedPlanification.budget ? `${selectedPlanification.budget} €` : 'N/A' }}</p>
      <p><strong>Date de Début :</strong> {{ selectedPlanification.dateDebut || 'N/A' }}</p>
      <p><strong>Date de Fin :</strong> {{ selectedPlanification.dateFin || 'N/A' }}</p>
      <p><strong>Statut :</strong> {{ selectedPlanification.statut || 'N/A' }}</p>
      <p v-if="selectedPlanification.piece_jointe">
        <strong>Pièce jointe :</strong>
        <a :href="`http://localhost:3000${selectedPlanification.piece_jointe}`" target="_blank" class="text-primary">Télécharger</a>
      </p>
      <template #footer>
        <button @click="showDetailsModal = false" class="btn btn-secondary custom-btn">Fermer</button>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'Planification',
  data() {
    return {
      newPlanification: {
        reference: '',
        description: '',
        budget: null,
        dateDebut: '',
        dateFin: '',
        statut: 'En cours',
      },
      editPlanification: {
        id: null,
        reference: '',
        description: '',
        budget: null,
        dateDebut: '',
        dateFin: '',
        statut: 'En cours',
      },
      selectedPlanification: {},
      planifications: [],
      searchQuery: '',
      showAddModal: false,
      showEditModal: false,
      showDetailsModal: false,
      currentPage: 1,
      itemsPerPage: 5,
      addPieceJointe: null,
      editPieceJointe: null,
    };
  },
  computed: {
    filteredPlanifications() {
      const query = this.searchQuery.toLowerCase();
      return this.planifications.filter(
        (planification) =>
          (planification.reference && planification.reference.toLowerCase().includes(query)) ||
          (planification.description && planification.description.toLowerCase().includes(query)) ||
          (planification.statut && planification.statut.toLowerCase().includes(query))
      );
    },
    paginatedPlanifications() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPlanifications.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPlanifications.length / this.itemsPerPage);
    },
    isAddFormValid() {
      return (
        this.newPlanification.reference &&
        this.newPlanification.description &&
        this.newPlanification.budget &&
        this.newPlanification.dateDebut &&
        this.newPlanification.dateFin &&
        this.newPlanification.statut &&
        this.newPlanification.dateFin >= this.newPlanification.dateDebut
      );
    },
    isEditFormValid() {
      return (
        this.editPlanification.reference &&
        this.editPlanification.description &&
        this.editPlanification.budget &&
        this.editPlanification.dateDebut &&
        this.editPlanification.dateFin &&
        this.editPlanification.statut &&
        this.editPlanification.dateFin >= this.editPlanification.dateDebut
      );
    },
  },
  methods: {
    async fetchPlanifications() {
      try {
        const response = await fetch('http://localhost:3000/api/planifications');
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        this.planifications = await response.json();
        this.currentPage = 1;
        console.log('Planifications récupérées:', this.planifications);
      } catch (error) {
        console.error('Erreur lors de la récupération des planifications:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    applySearch() {
      console.log('Recherche appliquée:', this.searchQuery);
      this.currentPage = 1;
    },
    openAddModal() {
      this.newPlanification = {
        reference: '',
        description: '',
        budget: null,
        dateDebut: '',
        dateFin: '',
        statut: 'En cours',
      };
      this.addPieceJointe = null;
      if (this.$refs.addFileInput) this.$refs.addFileInput.value = '';
      this.showAddModal = true;
      console.log('Modal d\'ajout ouvert:', this.newPlanification, 'showAddModal:', this.showAddModal);
    },
    validateForm(type) {
      const plan = type === 'add' ? this.newPlanification : this.editPlanification;
      let errors = [];
      if (!plan.reference) errors.push('Référence requise');
      if (!plan.description) errors.push('Description requise');
      if (!plan.budget || plan.budget <= 0) errors.push('Budget requis et doit être supérieur à 0');
      if (!plan.dateDebut) errors.push('Date de début requise');
      if (!plan.dateFin) errors.push('Date de fin requise');
      if (!plan.statut) errors.push('Statut requis');
      if (plan.dateFin && plan.dateDebut && plan.dateFin < plan.dateDebut) {
        errors.push('La date de fin doit être postérieure à la date de début');
      }
      if (errors.length > 0) {
        alert('Erreurs dans le formulaire:\n- ' + errors.join('\n- '));
      } else {
        alert('Tous les champs sont valides !');
      }
    },
    async submitNewPlanification() {
      if (!this.isAddFormValid) {
        alert('Veuillez remplir tous les champs requis correctement');
        return;
      }

      const formData = new FormData();
      formData.append('reference', this.newPlanification.reference);
      formData.append('description', this.newPlanification.description);
      formData.append('budget', this.newPlanification.budget);
      formData.append('dateDebut', this.newPlanification.dateDebut);
      formData.append('dateFin', this.newPlanification.dateFin);
      formData.append('statut', this.newPlanification.statut);
      if (this.addPieceJointe) {
        formData.append('pieceJointe', this.addPieceJointe);
      }

      try {
        const response = await fetch('http://localhost:3000/api/planifications', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert('Planification ajoutée avec succès !');
          this.showAddModal = false;
          this.newPlanification = {
            reference: '',
            description: '',
            budget: null,
            dateDebut: '',
            dateFin: '',
            statut: 'En cours',
          };
          this.addPieceJointe = null;
          if (this.$refs.addFileInput) this.$refs.addFileInput.value = '';
          await this.fetchPlanifications();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de l\'ajout'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la planification:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    editPlanification(planification) {
      this.editPlanification = { ...planification };
      this.editPieceJointe = null;
      if (this.$refs.editFileInput) this.$refs.editFileInput.value = '';
      this.showEditModal = true;
      console.log('Modal d\'édition ouvert:', this.editPlanification, 'showEditModal:', this.showEditModal);
    },
    async submitEditPlanification() {
      if (!this.isEditFormValid) {
        alert('Veuillez remplir tous les champs requis correctement');
        return;
      }

      const formData = new FormData();
      formData.append('reference', this.editPlanification.reference);
      formData.append('description', this.editPlanification.description);
      formData.append('budget', this.editPlanification.budget);
      formData.append('dateDebut', this.editPlanification.dateDebut);
      formData.append('dateFin', this.editPlanification.dateFin);
      formData.append('statut', this.editPlanification.statut);
      if (this.editPieceJointe) {
        formData.append('pieceJointe', this.editPieceJointe);
      }

      try {
        const response = await fetch(`http://localhost:3000/api/planifications/${this.editPlanification.id}`, {
          method: 'PUT',
          body: formData,
        });
        if (response.ok) {
          alert('Planification modifiée avec succès !');
          this.showEditModal = false;
          this.editPlanification = {
            id: null,
            reference: '',
            description: '',
            budget: null,
            dateDebut: '',
            dateFin: '',
            statut: 'En cours',
          };
          this.editPieceJointe = null;
          if (this.$refs.editFileInput) this.$refs.editFileInput.value = '';
          await this.fetchPlanifications();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la modification'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la modification de la planification:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    async deletePlanification(id) {
      if (!confirm('Voulez-vous vraiment supprimer cette planification ?')) return;
      try {
        const response = await fetch(`http://localhost:3000/api/planifications/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Planification supprimée avec succès !');
          await this.fetchPlanifications();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la planification:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    viewPlanification(planification) {
      this.selectedPlanification = { ...planification };
      this.showDetailsModal = true;
      console.log('Modal de visualisation ouvert:', this.selectedPlanification, 'showDetailsModal:', this.showDetailsModal);
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
          this.addPieceJointe = null;
          if (this.$refs.addFileInput) this.$refs.addFileInput.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
          this.addPieceJointe = null;
          if (this.$refs.addFileInput) this.$refs.addFileInput.value = '';
          return;
        }
        this.addPieceJointe = file;
        console.log('Fichier ajouté:', this.addPieceJointe.name);
      } else {
        this.addPieceJointe = null;
      }
    },
    handleEditFileUpload(event) {
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
          this.editPieceJointe = null;
          if (this.$refs.editFileInput) this.$refs.editFileInput.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
          this.editPieceJointe = null;
          if (this.$refs.editFileInput) this.$refs.editFileInput.value = '';
          return;
        }
        this.editPieceJointe = file;
        console.log('Fichier édité:', this.editPieceJointe.name);
      } else {
        this.editPieceJointe = null;
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

          const planifications = json.map((row) => ({
            reference: row['Référence']?.toString() || '',
            description: row['Description']?.toString() || '',
            budget: parseFloat(row['Budget Prévisionnel']) || null,
            dateDebut: row['Date de Début']?.toString() || '',
            dateFin: row['Date de Fin']?.toString() || '',
            statut: row['Statut']?.toString() || 'En cours',
          }));

          const validPlanifications = planifications.filter(
            (p) => p.reference && p.description && p.budget && p.dateDebut && p.dateFin && p.statut
          );

          if (validPlanifications.length === 0) {
            alert('Aucune planification valide trouvée dans le fichier Excel');
            return;
          }

          try {
            const response = await fetch('http://localhost:3000/api/planifications/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(validPlanifications),
            });
            if (response.ok) {
              alert('Planifications importées avec succès !');
              if (this.$refs.importInput) this.$refs.importInput.value = '';
              await this.fetchPlanifications();
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
      if (this.planifications.length === 0) {
        alert('Aucune planification à exporter');
        return;
      }

      const data = this.planifications.map((p) => ({
        Référence: p.reference,
        Description: p.description,
        'Budget Prévisionnel': p.budget ? `${p.budget} €` : 'N/A',
        'Date de Début': p.dateDebut,
        'Date de Fin': p.dateFin,
        Statut: p.statut,
        'Pièce jointe': p.piece_jointe || 'Aucune',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Planifications');
      XLSX.write_file(workbook, 'planifications.xlsx');
    },
    printTable() {
      const printContent = `
        <html>
          <head>
            <title>Impression des Planifications</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f2f1; }
            </style>
          </head>
          <body>
            <h2>Liste des Planifications</h2>
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Description</th>
                  <th>Budget Prévisionnel</th>
                  <th>Date de Début</th>
                  <th>Date de Fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                ${this.planifications
                  .map(
                    (p) => `
                      <tr>
                        <td>${p.reference || 'N/A'}</td>
                        <td>${p.description || 'N/A'}</td>
                        <td>${p.budget ? `${p.budget} €` : 'N/A'}</td>
                        <td>${p.dateDebut || 'N/A'}</td>
                        <td>${p.dateFin || 'N/A'}</td>
                        <td>${p.statut || 'N/A'}</td>
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
    this.fetchPlanifications();
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