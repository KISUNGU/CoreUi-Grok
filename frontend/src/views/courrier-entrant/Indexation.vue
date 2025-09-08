<template>
  <CRow>
    <!-- Barre de recherche et filtres -->
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-primary text-white">
          <strong><i class="cil-tags me-2"></i> Indexation des Courriers</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Rechercher par référence, expéditeur, ou objet"
            />
            <button @click="applySearch" class="btn btn-primary ms-2 custom-btn">
              <i class="cil-search me-1"></i> Rechercher
            </button>
          </div>
          <div>
            <label class="form-label me-2"><i class="cil-filter me-1"></i> Filtrer par date :</label>
            <input
              v-model="filterDate"
              type="date"
              class="form-control d-inline-block"
              style="width: auto;"
            />
            <button @click="applyFilter" class="btn btn-secondary ms-2 custom-btn">
              <i class="cil-filters me-1"></i> Appliquer
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Liste des courriers -->
    <CCol :xs="12">
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-primary text-white">
          <strong><i class="cil-list me-2"></i> Liste des Courriers</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Expéditeur</th>
                <th>Objet</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="courrier in filteredCourriers" :key="courrier.id">
                <td>{{ courrier.ref_code || 'N/A' }}</td>
                <td>{{ courrier.sender || 'N/A' }}</td>
                <td>{{ courrier.subject || 'N/A' }}</td>
                <td>{{ courrier.mail_date || 'N/A' }}</td>
                <td>
                  <button @click="addTag(courrier.id)" class="btn btn-warning btn-sm custom-btn me-2">
                    <i class="cil-bookmark me-1"></i> Taguer
                  </button>
                  <button @click="viewDetails(courrier)" class="btn btn-info btn-sm custom-btn">
                    <i class="cil-eye me-1"></i> Visualiser
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCourriers.length === 0">
                <td colspan="5" class="text-center">Aucun courrier trouvé</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal pour les tags -->
    <CModal :visible="showTagModal" title="Ajouter un Tag" @close="closeTagModal" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedCourrier.ref_code || 'N/A' }}</p>
      <p><strong>Expéditeur :</strong> {{ selectedCourrier.sender || 'N/A' }}</p>
      <div class="mb-3">
        <label for="tagInput" class="form-label">Nouveau Tag</label>
        <input v-model="newTag" type="text" class="form-control" id="tagInput" placeholder="Entrer un tag" ref="tagInput" />
      </div>
      <button @click="saveTag" class="btn btn-primary custom-btn"><i class="cil-save me-1"></i> Enregistrer</button>
      <button @click="closeTagModal" class="btn btn-secondary custom-btn ms-2">Annuler</button>
    </CModal>

    <!-- Modal pour les détails -->
    <CModal :visible="showDetailsModal" title="Détails du Courrier" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedCourrier.ref_code || 'N/A' }}</p>
      <p><strong>Expéditeur :</strong> {{ selectedCourrier.sender || 'N/A' }}</p>
      <p><strong>Objet :</strong> {{ selectedCourrier.subject || 'N/A' }}</p>
      <p><strong>Date du courrier :</strong> {{ selectedCourrier.mail_date || 'N/A' }}</p>
      <p><strong>Date d'arrivée :</strong> {{ selectedCourrier.arrival_date || 'N/A' }}</p>
      <p><strong>Statut :</strong> {{ selectedCourrier.status || 'Nouveau' }}</p>
      <p><strong>Commentaire/Tag :</strong> {{ selectedCourrier.comment || 'Aucun' }}</p>
      <p v-if="selectedCourrier.file_path">
        <strong>Fichier :</strong>
        <a :href="`http://localhost:3000${selectedCourrier.file_path}`" target="_blank" class="text-primary">Télécharger</a>
      </p>
      <button @click="showDetailsModal = false" class="btn btn-secondary custom-btn">Fermer</button>
    </CModal>
  </CRow>
</template>

<script>
export default {
  data() {
    return {
      courriers: [],
      searchQuery: '',
      filterDate: '',
      showTagModal: false,
      showDetailsModal: false,
      selectedCourrier: {},
      newTag: '',
    };
  },
  computed: {
    filteredCourriers() {
      let filtered = [...this.courriers];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (courrier) =>
            (courrier.ref_code && courrier.ref_code.toLowerCase().includes(query)) ||
            (courrier.sender && courrier.sender.toLowerCase().includes(query)) ||
            (courrier.subject && courrier.subject.toLowerCase().includes(query))
        );
      }
      if (this.filterDate) {
        filtered = filtered.filter((courrier) => courrier.mail_date === this.filterDate);
      }
      return filtered;
    },
  },
  methods: {
    formatDateToISO(date) {
      if (!date) return '';
      try {
        if (date.includes('/')) {
          const [day, month, year] = date.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return date;
      } catch (error) {
        console.error('Erreur lors du formatage de la date :', date, error);
        return date;
      }
    },
    fetchCourriers() {
      console.log('Récupération des courriers...');
      fetch('http://localhost:3000/api/mails/incoming')
        .then((response) => {
          if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
          return response.json();
        })
        .then((data) => {
          console.log('Données reçues :', data);
          this.courriers = data.map((courrier) => ({
            ...courrier,
            mail_date: this.formatDateToISO(courrier.mail_date),
            arrival_date: this.formatDateToISO(courrier.arrival_date),
          }));
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des courriers :', error);
          alert(`Erreur lors de la récupération des courriers : ${error.message}`);
        });
    },
    applySearch() {
      console.log('Requête de recherche appliquée :', this.searchQuery);
      this.fetchCourriers();
    },
    applyFilter() {
      console.log('Filtre de date appliqué :', this.filterDate);
      this.fetchCourriers();
    },
    addTag(id) {
      console.log('Tentative d’ajout de tag pour l’ID :', id);
      const courrier = this.courriers.find((c) => c.id === id);
      if (courrier) {
        console.log('Courrier sélectionné :', courrier);
        this.selectedCourrier = { ...courrier };
        this.newTag = ''; // Réinitialiser newTag à l'ouverture du modal
        this.showTagModal = true;
        this.$nextTick(() => {
          this.$refs.tagInput.focus(); // Mettre le focus sur l'input pour faciliter la saisie
        });
      } else {
        console.error('Courrier non trouvé pour l’ID :', id);
        alert('Courrier non trouvé');
      }
    },
    async saveTag() {
      console.log('Valeur de newTag :', this.newTag);
      if (!this.newTag || this.newTag.trim().length === 0) {
        alert('Veuillez entrer un tag non vide');
        return;
      }
      console.log('Enregistrement du tag :', this.newTag, 'pour le courrier ID :', this.selectedCourrier.id);
      try {
        const response = await fetch(`http://localhost:3000/api/mails/incoming/${this.selectedCourrier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: this.selectedCourrier.status || 'Nouveau',
            comment: this.newTag.trim(),
          }),
        });
        if (response.ok) {
          console.log('Tag enregistré avec succès');
          alert('Tag enregistré avec succès');
          this.showTagModal = false;
          this.newTag = '';
          this.fetchCourriers();
        } else {
          const errorData = await response.json();
          console.error('Erreur de l’API :', errorData);
          alert(`Erreur : ${errorData.error || 'Échec de l’enregistrement du tag'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l’enregistrement du tag :', error);
        alert(`Erreur lors de l’enregistrement du tag : ${error.message}`);
      }
    },
    closeTagModal() {
      this.showTagModal = false;
      this.newTag = ''; // Réinitialiser newTag à la fermeture
    },
    viewDetails(courrier) {
      console.log('Affichage des détails du courrier :', courrier);
      this.selectedCourrier = { ...courrier };
      this.showDetailsModal = true;
    },
  },
  mounted() {
    this.fetchCourriers();
  },
};
</script>

<style scoped>
/* Style général */
.text-center {
  text-align: center;
}

/* Style des cartes */
.card {
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Style du tableau */
.custom-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
}
.custom-table th,
.custom-table td {
  padding: 14px 16px;
  vertical-align: middle;
}
.custom-table th {
  background-color: #f4f6f9;
  font-weight: 600;
  color: #2c3e50;
}
.custom-table tr:hover {
  background-color: #f1f3f5;
}

/* Style des boutons */
.custom-btn {
  border-radius: 8px;
  padding: 10px 18px;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.custom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}
.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}
.btn-warning {
  background-color: #f39c12;
  border-color: #f39c12;
}
.btn-warning:hover {
  background-color: #e67e22;
  border-color: #e67e22;
}
.btn-info {
  background-color: #1abc9c;
  border-color: #1abc9c;
}
.btn-info:hover {
  background-color: #16a085;
  border-color: #16a085;
}
.btn-secondary {
  background-color: #95a5a6;
  border-color: #95a5a6;
}
.btn-secondary:hover {
  background-color: #7f8c8d;
  border-color: #7f8c8d;
}

/* Style des modals */
.custom-modal .modal-content {
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  padding: 20px;
}
.custom-modal .modal-header {
  background-color: #3498db;
  color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  padding: 15px 20px;
  border-bottom: none;
}
.custom-modal .modal-title {
  font-weight: 600;
}
.custom-modal .modal-body {
  padding: 20px;
  color: #34495e;
}
.custom-modal .modal-body p {
  margin-bottom: 10px;
  font-size: 16px;
}
.custom-modal .form-control {
  border-radius: 8px;
  border: 1px solid #bdc3c7;
  padding: 10px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.custom-modal .form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.3);
}
.custom-modal .modal-footer {
  border-top: none;
  padding: 0 20px 20px;
  justify-content: flex-end;
}

/* Animation d’entrée pour les modals */
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

/* Lien de téléchargement */
.text-primary {
  color: #3498db !important;
  text-decoration: none;
  transition: color 0.3s ease;
}
.text-primary:hover {
  color: #2980b9 !important;
  text-decoration: underline;
}
</style>