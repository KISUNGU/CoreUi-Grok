<template>
  <CRow class="flex-column">
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-user me-2"></i> Gestion des Fournisseurs</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control outlook-input"
              placeholder="Rechercher par nom ou contact"
            />
            <button @click="applySearch" class="btn btn-primary custom-btn ms-2">
              <i class="cil-search me-1"></i> Rechercher
            </button>
          </div>
          <div class="outlook-toolbar d-flex align-items-center">
            <button @click="showAddModal = true" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Ajouter un fournisseur">
              <i class="cil-plus"></i>
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Fournisseurs</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fournisseur in paginatedFournisseurs" :key="fournisseur.id">
                <td>{{ fournisseur.nom || 'N/A' }}</td>
                <td>{{ fournisseur.contact || 'N/A' }}</td>
                <td>{{ fournisseur.email || 'N/A' }}</td>
                <td class="d-flex align-items-center">
                  <button @click="editFournisseur(fournisseur)" class="btn btn-warning btn-sm custom-btn icon-btn me-2" title="Modifier">
                    <i class="cil-pencil"></i>
                  </button>
                  <button @click="deleteFournisseur(fournisseur.id)" class="btn btn-danger btn-sm custom-btn icon-btn" title="Supprimer">
                    <i class="cil-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedFournisseurs.length === 0">
                <td colspan="4" class="text-center">Aucun fournisseur trouvé</td>
              </tr>
            </tbody>
          </table>
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
    <CModal :visible="showAddModal" :title="isEditing ? 'Modifier un Fournisseur' : 'Ajouter un Fournisseur'" @close="showAddModal = false" class="custom-modal">
      <CRow>
        <CCol :xs="12">
          <form @submit.prevent="submitFournisseur">
            <div class="mb-3">
              <label for="nom" class="form-label"><i class="cil-user me-1"></i> Nom</label>
              <input
                v-model="newFournisseur.nom"
                type="text"
                class="form-control outlook-input"
                id="nom"
                placeholder="Nom du fournisseur"
                required
              />
            </div>
            <div class="mb-3">
              <label for="contact" class="form-label"><i class="cil-phone me-1"></i> Contact</label>
              <input
                v-model="newFournisseur.contact"
                type="text"
                class="form-control outlook-input"
                id="contact"
                placeholder="Numéro de téléphone ou contact"
              />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label"><i class="cil-envelope-closed me-1"></i> Email</label>
              <input
                v-model="newFournisseur.email"
                type="email"
                class="form-control outlook-input"
                id="email"
                placeholder="Email du fournisseur"
              />
            </div>
          </form>
        </CCol>
      </CRow>
      <template #footer>
        <button @click="validateForm" class="btn btn-info custom-btn me-2">
          <i class="cil-check-circle me-1"></i> Vérifier
        </button>
        <button @click="showAddModal = false" class="btn btn-secondary custom-btn me-2">Annuler</button>
        <button
          @click="submitFournisseur"
          class="btn btn-primary custom-btn"
          :disabled="!isFormValid"
        >
          <i class="cil-check me-1"></i> {{ isEditing ? 'Modifier' : 'Valider et Enregistrer' }}
        </button>
      </template>
    </CModal>
  </CRow>
</template>

<script>
export default {
  name: 'Fournisseurs',
  data() {
    return {
      fournisseurs: [],
      searchQuery: '',
      showAddModal: false,
      isEditing: false,
      currentPage: 1,
      itemsPerPage: 5,
      newFournisseur: {
        id: null,
        nom: '',
        contact: '',
        email: '',
      },
    };
  },
  computed: {
    filteredFournisseurs() {
      const query = this.searchQuery.toLowerCase();
      return this.fournisseurs.filter(
        (fournisseur) =>
          (fournisseur.nom && fournisseur.nom.toLowerCase().includes(query)) ||
          (fournisseur.contact && fournisseur.contact.toLowerCase().includes(query)) ||
          (fournisseur.email && fournisseur.email.toLowerCase().includes(query))
      );
    },
    paginatedFournisseurs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredFournisseurs.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredFournisseurs.length / this.itemsPerPage);
    },
    isFormValid() {
      return !!this.newFournisseur.nom;
    },
  },
  methods: {
    async fetchFournisseurs() {
      try {
        const response = await fetch('http://localhost:3000/api/fournisseurs');
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        this.fournisseurs = await response.json();
        console.log('Fournisseurs récupérés:', this.fournisseurs);
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    applySearch() {
      console.log('Recherche appliquée:', this.searchQuery);
      this.currentPage = 1;
    },
    validateForm() {
      let errors = [];
      if (!this.newFournisseur.nom) errors.push('Nom requis');
      if (errors.length > 0) {
        alert('Erreurs dans le formulaire:\n- ' + errors.join('\n- '));
      } else {
        alert('Tous les champs sont valides !');
      }
    },
    async submitFournisseur() {
      if (!this.isFormValid) {
        alert('Veuillez remplir tous les champs requis');
        return;
      }
      try {
        const url = this.isEditing ? `http://localhost:3000/api/fournisseurs/${this.newFournisseur.id}` : 'http://localhost:3000/api/fournisseurs';
        const method = this.isEditing ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newFournisseur),
        });
        if (response.ok) {
          alert(this.isEditing ? 'Fournisseur modifié avec succès !' : 'Fournisseur ajouté avec succès !');
          this.showAddModal = false;
          this.isEditing = false;
          this.newFournisseur = { id: null, nom: '', contact: '', email: '' };
          await this.fetchFournisseurs();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de l\'opération'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du fournisseur:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
    editFournisseur(fournisseur) {
      this.isEditing = true;
      this.newFournisseur = { ...fournisseur };
      this.showAddModal = true;
      console.log('Modal d\'édition ouvert:', this.newFournisseur);
    },
    async deleteFournisseur(id) {
      if (!confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) return;
      try {
        const response = await fetch(`http://localhost:3000/api/fournisseurs/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Fournisseur supprimé avec succès !');
          await this.fetchFournisseurs();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error || 'Échec de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du fournisseur:', error);
        alert(`Erreur: ${error.message}`);
      }
    },
  },
  mounted() {
    this.fetchFournisseurs();
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