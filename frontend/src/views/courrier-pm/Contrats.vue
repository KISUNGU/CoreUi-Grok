<template>
  <CRow class="flex-column">
    <!-- Barre de recherche -->
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-file me-2"></i> Gestion des Contrats</strong>
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
            <button @click="showAddModal = true" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Ajouter un contrat">
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

    <!-- Tableau des contrats -->
    <CCol :xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Contrats</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Appel d'Offre</th>
                <th>Fournisseur</th>
                <th>Montant</th>
                <th>Date de Signature</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contrat in paginatedContrats" :key="contrat.id">
                <td>{{ contrat.reference || 'N/A' }}</td>
                <td>{{ contrat.appelReference || 'N/A' }}</td>
                <td>{{ contrat.fournisseur || 'N/A' }}</td>
                <td>{{ contrat.montant ? `${contrat.montant} €` : 'N/A' }}</td>
                <td>{{ contrat.dateSignature || 'N/A' }}</td>
                <td>{{ contrat.statut || 'N/A' }}</td>
                <td class="d-flex align-items-center">
                  <button @click="viewContrat(contrat)" class="btn btn-info btn-sm custom-btn icon-btn me-2" title="Visualiser">
                    <i class="cil-eye"></i>
                  </button>
                  <button @click="editContrat(contrat)" class="btn btn-warning btn-sm custom-btn icon-btn me-2" title="Modifier">
                    <i class="cil-pencil"></i>
                  </button>
                  <button @click="deleteContrat(contrat.id)" class="btn btn-danger btn-sm custom-btn icon-btn" title="Supprimer">
                    <i class="cil-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedContrats.length === 0">
                <td colspan="7" class="text-center">Aucun contrat trouvé</td>
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
    <CModal :visible="showAddModal" title="Ajouter un Contrat" @close="showAddModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="6">
          <form @submit.prevent="submitNewContrat">
            <div class="mb-3">
              <label for="addReference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="newContrat.reference"
                type="text"
                class="form-control outlook-input"
                id="addReference"
                placeholder="Référence du contrat"
                required
              />
            </div>
            <div class="mb-3">
              <label for="addAppelId" class="form-label"><i class="cil-spreadsheet me-1"></i> Appel d'Offre</label>
              <select v-model="newContrat.appelId" class="form-control outlook-input" id="addAppelId" required>
                <option value="" disabled>Sélectionnez un appel</option>
                <option v-for="appel in appels" :key="appel.id" :value="appel.id">{{ appel.reference }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="addFournisseur" class="form-label"><i class="cil-user me-1"></i> Fournisseur</label>
              <input
                v-model="newContrat.fournisseur"
                type="text"
                class="form-control outlook-input"
                id="addFournisseur"
                placeholder="Nom du fournisseur"
                required
              />
            </div>
          </form>
        </CCol>
        <CCol :xs="6">
          <div class="mb-3">
            <label for="addMontant" class="form-label"><i class="cil-money me-1"></i> Montant (€)</label>
            <input
              v-model.number="newContrat.montant"
              type="number"
              class="form-control outlook-input"
              id="addMontant"
              placeholder="Montant du contrat"
              min="0"
              required
            />
          </div>
          <div class="mb-3">
            <label for="addDateSignature" class="form-label"><i class="cil-calendar me-1"></i> Date de Signature</label>
            <input
              v-model="newContrat.dateSignature"
              type="date"
              class="form-control outlook-input"
              id="addDateSignature"
              required
            />
          </div>
          <div class="mb-3">
            <label for="addDateFin" class="form-label"><i class="cil-calendar-check me-1"></i> Date de Fin</label>
            <input
              v-model="newContrat.dateFin"
              type="date"
              class="form-control outlook-input"
              id="addDateFin"
              required
            />
          </div>
          <div class="mb-3">
            <label for="addStatut" class="form-label"><i class="cil-info me-1"></i> Statut</label>
            <select v-model="newContrat.statut" class="form-control outlook-input" id="addStatut" required>
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
          @click="submitNewContrat"
          class="btn btn-primary custom-btn"
          :disabled="!isAddFormValid"
        >
          <i class="cil-check me-1"></i> Ajouter
        </button>
      </template>
    </CModal>

    <!-- Modal Modifier -->
    <CModal :visible="showEditModal" title="Modifier un Contrat" @close="showEditModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="6">
          <form @submit.prevent="submitEditContrat">
            <div class="mb-3">
              <label for="editReference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="editContrat.reference"
                type="text"
                class="form-control outlook-input"
                id="editReference"
                placeholder="Référence du contrat"
                required
              />
            </div>
            <div class="mb-3">
              <label for="editAppelId" class="form-label"><i class="cil-spreadsheet me-1"></i> Appel d'Offre</label>
              <select v-model="editContrat.appelId" class="form-control outlook-input" id="editAppelId" required>
                <option value="" disabled>Sélectionnez un appel</option>
                <option v-for="appel in appels" :key="appel.id" :value="appel.id">{{ appel.reference }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="editFournisseur" class="form-label"><i class="cil-user me-1"></i> Fournisseur</label>
              <input
                v-model="editContrat.fournisseur"
                type="text"
                class="form-control outlook-input"
                id="editFournisseur"
                placeholder="Nom du fournisseur"
                required
              />
            </div>
          </form>
        </CCol>
        <CCol :xs="6">
          <div class="mb-3">
            <label for="editMontant" class="form-label"><i class="cil-money me-1"></i> Montant (€)</label>
            <input
              v-model.number="editContrat.montant"
              type="number"
              class="form-control outlook-input"
              id="editMontant"
              placeholder="Montant du contrat"
              min="0"
              required
            />
          </div>
          <div class="mb-3">
            <label for="editDateSignature" class="form-label"><i class="cil-calendar me-1"></i> Date de Signature</label>
            <input
              v-model="editContrat.dateSignature"
              type="date"
              class="form-control outlook-input"
              id="editDateSignature"
              required
            />
          </div>
          <div class="mb-3">
            <label for="editDateFin" class="form-label"><i class="cil-calendar-check me-1"></i> Date de Fin</label>
            <input
              v-model="editContrat.dateFin"
              type="date"
              class="form-control outlook-input"
              id="editDateFin"
              required
            />
          </div>
          <div class="mb-3">
            <label for="editStatut" class="form-label"><i class="cil-info me-1"></i> Statut</label>
            <select v-model="editContrat.statut" class="form-control outlook-input" id="editStatut" required>
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
          @click="submitEditContrat"
          class="btn btn-primary custom-btn"
          :disabled="!isEditFormValid"
        >
          <i class="cil-check me-1"></i> Modifier
        </button>
      </template>
    </CModal>

    <!-- Modal Visualiser -->
    <CModal :visible="showDetailsModal" title="Détails du Contrat" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedContrat.reference || 'N/A' }}</p>
      <p><strong>Appel d'Offre :</strong> {{ selectedContrat.appelReference || 'N/A' }}</p>
      <p><strong>Fournisseur :</strong> {{ selectedContrat.fournisseur || 'N/A' }}</p>
      <p><strong>Montant :</strong> {{ selectedContrat.montant ? `${selectedContrat.montant} €` : 'N/A' }}</p>
      <p><strong>Date de Signature :</strong> {{ selectedContrat.dateSignature || 'N/A' }}</p>
      <p><strong>Date de Fin :</strong> {{ selectedContrat.dateFin || 'N/A' }}</p>
      <p><strong>Statut :</strong> {{ selectedContrat.statut || 'N/A' }}</p>
      <p v-if="selectedContrat.piece_jointe">
        <strong>Pièce jointe :</strong>
        <a :href="`http://localhost:3000${selectedContrat.piece_jointe}`" target="_blank" class="text-primary">Télécharger</a>
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
  name: 'Contrats',
  data() {
    return {
      contrats: [],
      appels: [],
      searchQuery: '',
      showAddModal: false,
      showEditModal: false,
      showDetailsModal: false,
      currentPage: 1,
      itemsPerPage: 5,
      newContrat: {
        reference: '',
        appelId: '',
        appelReference: '',
        fournisseur: '',
        montant: null,
        dateSignature: '',
        dateFin: '',
        statut: 'En cours',
      },
      editContrat: {
        id: null,
        reference: '',
        appelId: '',
        appelReference: '',
        fournisseur: '',
        montant: null,
        dateSignature: '',
        dateFin: '',
        statut: 'En cours',
      },
      selectedContrat: {},
      addPieceJointe: null,
      editPieceJointe: null,
    };
  },
  computed: {
    filteredContrats() {
      const query = this.searchQuery.toLowerCase();
      return this.contrats.filter(
        (contrat) =>
          (contrat.reference && contrat.reference.toLowerCase().includes(query)) ||
          (contrat.appelReference && contrat.appelReference.toLowerCase().includes(query)) ||
          (contrat.fournisseur && contrat.fournisseur.toLowerCase().includes(query)) ||
          (contrat.statut && contrat.statut.toLowerCase().includes(query))
      );
    },
    paginatedContrats() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredContrats.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredContrats.length / this.itemsPerPage);
    },
    isAddFormValid() {
      return (
        this.newContrat.reference &&
        this.newContrat.appelId &&
        this.newContrat.fournisseur &&
        this.newContrat.montant &&
        this.newContrat.dateSignature &&
        this.newContrat.dateFin &&
        this.newContrat.statut &&
        this.newContrat.dateFin >= this.newContrat.dateSignature
      );
    },
    isEditFormValid() {
      return (
        this.editContrat.reference &&
        this.editContrat.appelId &&
        this.editContrat.fournisseur &&
        this.editContrat.montant &&
        this.editContrat.dateSignature &&
        this.editContrat.dateFin &&
        this.editContrat.statut &&
        this.editContrat.dateFin >= this.editContrat.dateSignature
      );
    },
  },
  methods: {
    async fetchContrats() {
      try {
        const response = await fetch('http://localhost:3000/api/contrats');
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        this.contrats = await response.json();
        this.currentPage = 1;
        console.log('Contrats récupérés:', this.contrats);
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats:', error);
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
    validateForm(type) {
      const contrat = type === 'add' ? this.newContrat : this.editContrat;
      let errors = [];
      if (!contrat.reference) errors.push('Référence requise');
      if (!contrat.appelId) errors.push('Appel d\'offre requis');
      if (!contrat.fournisseur) errors.push('Fournisseur requis');
      if (!contrat.montant || contrat.montant <= 0) errors.push('Montant requis et doit être supérieur à 0');
      if (!contrat.dateSignature) errors.push('Date de signature requise');
      if (!contrat.dateFin) errors.push('Date de fin requise');
      if (!contrat.statut) errors.push('Statut requis');
      if (contrat.dateFin && contrat.dateSignature && contrat.dateFin < contrat.dateSignature) {
        errors.push('La date de fin doit être postérieure à la date de signature');
      }
      if (errors.length > 0) {
        alert('Erreurs dans le formulaire:\n- ' + errors.join('\n- '));
      } else {
        alert('Tous les champs sont valides !');
      }
    },
    async submitNewContrat() {
      if (!this.isAddFormValid) {
        alert('Veuillez remplir tous les champs requis correctement');
        return;
      }
      const selectedAppel = this.appels.find((appel) => appel.id === this.newContrat.appelId);
      const formData = new FormData();
      formData.append('reference', this.newContrat.reference);
      formData.append('appelId', this.newContrat.appelId);
      formData.append('appelReference', selectedAppel ? selectedAppel.reference : '');
      formData.append('fournisseur', this.newContrat.fournisseur);
      formData.append('montant', this.newContrat.montant);
      formData.append('dateSignature', this.newContrat.dateSignature);
      formData.append('dateFin', this.newContrat.dateFin);
      formData.append('statut', this.newContrat.statut);
      if (this.addPieceJointe) {
        formData.append('pieceJointe', this.addPieceJointe);
      }

      try {
        const response = await fetch('http://localhost:3000/api/contrats', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert('Contrat ajouté avec succès !');
          this.showAddModal = false;
          this.newContrat = {
            reference: '',
            appelId: '',
            appelReference: '',
            fournisseur: '',
            montant: null,
            dateSignature: '',
            dateFin: '',
            statut: 'En cours',
          };
          this.addPieceJointe = null;
          if (this.$refs.addFileInput) this.$refs.addFileInput.value = '';
          await this.fetchContrats();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de l\'ajout'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout du contrat:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    editContrat(contrat) {
      this.editContrat = { ...contrat };
      this.editPieceJointe = null;
      if (this.$refs.editFileInput) this.$refs.editFileInput.value = '';
      this.showEditModal = true;
      console.log('Modal d\'édition ouvert:', this.editContrat, 'showEditModal:', this.showEditModal);
    },
    async submitEditContrat() {
      if (!this.isEditFormValid) {
        alert('Veuillez remplir tous les champs requis correctement');
        return;
      }
      const selectedAppel = this.appels.find((appel) => appel.id === this.editContrat.appelId);
      const formData = new FormData();
      formData.append('reference', this.editContrat.reference);
      formData.append('appelId', this.editContrat.appelId);
      formData.append('appelReference', selectedAppel ? selectedAppel.reference : '');
      formData.append('fournisseur', this.editContrat.fournisseur);
      formData.append('montant', this.editContrat.montant);
      formData.append('dateSignature', this.editContrat.dateSignature);
      formData.append('dateFin', this.editContrat.dateFin);
      formData.append('statut', this.editContrat.statut);
      if (this.editPieceJointe) {
        formData.append('pieceJointe', this.editPieceJointe);
      }

      try {
        const response = await fetch(`http://localhost:3000/api/contrats/${this.editContrat.id}`, {
          method: 'PUT',
          body: formData,
        });
        if (response.ok) {
          alert('Contrat modifié avec succès !');
          this.showEditModal = false;
          this.editContrat = {
            id: null,
            reference: '',
            appelId: '',
            appelReference: '',
            fournisseur: '',
            montant: null,
            dateSignature: '',
            dateFin: '',
            statut: 'En cours',
          };
          this.editPieceJointe = null;
          if (this.$refs.editFileInput) this.$refs.editFileInput.value = '';
          await this.fetchContrats();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la modification'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la modification du contrat:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    async deleteContrat(id) {
      if (!confirm('Voulez-vous vraiment supprimer ce contrat ?')) return;
      try {
        const response = await fetch(`http://localhost:3000/api/contrats/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Contrat supprimé avec succès !');
          await this.fetchContrats();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du contrat:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    viewContrat(contrat) {
      this.selectedContrat = { ...contrat };
      this.showDetailsModal = true;
      console.log('Modal de visualisation ouvert:', this.selectedContrat, 'showDetailsModal:', this.showDetailsModal);
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

          const contrats = json.map((row) => ({
            reference: row['Référence']?.toString() || '',
            appelReference: row['Appel d\'Offre']?.toString() || '',
            fournisseur: row['Fournisseur']?.toString() || '',
            montant: parseFloat(row['Montant']) || null,
            dateSignature: row['Date de Signature']?.toString() || '',
            dateFin: row['Date de Fin']?.toString() || '',
            statut: row['Statut']?.toString() || 'En cours',
          }));

          const validContrats = contrats.filter(
            (c) =>
              c.reference &&
              c.appelReference &&
              c.fournisseur &&
              c.montant &&
              c.dateSignature &&
              c.dateFin &&
              c.statut
          );

          if (validContrats.length === 0) {
            alert('Aucun contrat valide trouvé dans le fichier Excel');
            return;
          }

          try {
            const response = await fetch('http://localhost:3000/api/contrats/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(validContrats),
            });
            if (response.ok) {
              alert('Contrats importés avec succès !');
              if (this.$refs.importInput) this.$refs.importInput.value = '';
              await this.fetchContrats();
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
      if (this.contrats.length === 0) {
        alert('Aucun contrat à exporter');
        return;
      }

      const data = this.contrats.map((c) => ({
        Référence: c.reference,
        'Appel d\'Offre': c.appelReference,
        Fournisseur: c.fournisseur,
        Montant: c.montant ? `${c.montant} €` : 'N/A',
        'Date de Signature': c.dateSignature,
        'Date de Fin': c.dateFin,
        Statut: c.statut,
        'Pièce jointe': c.piece_jointe || 'Aucune',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contrats');
      XLSX.write_file(workbook, 'contrats.xlsx');
    },
    printTable() {
      const printContent = `
        <html>
          <head>
            <title>Impression des Contrats</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f2f1; }
            </style>
          </head>
          <body>
            <h2>Liste des Contrats</h2>
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Appel d'Offre</th>
                  <th>Fournisseur</th>
                  <th>Montant</th>
                  <th>Date de Signature</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                ${this.contrats
                  .map(
                    (c) => `
                      <tr>
                        <td>${c.reference || 'N/A'}</td>
                        <td>${c.appelReference || 'N/A'}</td>
                        <td>${c.fournisseur || 'N/A'}</td>
                        <td>${c.montant ? `${c.montant} €` : 'N/A'}</td>
                        <td>${c.dateSignature || 'N/A'}</td>
                        <td>${c.statut || 'N/A'}</td>
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
    this.fetchContrats();
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