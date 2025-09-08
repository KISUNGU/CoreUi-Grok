<template>
  <CRow>
    <!-- Filtres -->
    <CCol :xs="12" class="mb-4">
      <CCard class="shadow-sm border-0">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-check-circle me-2"></i> Validation des Courriers Sortants</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control outlook-input"
              placeholder="Rechercher par destinataire, objet ou statut"
            />
            <button @click="applySearch" class="btn btn-primary custom-btn ms-2">
              <i class="cil-search me-1"></i> Rechercher
            </button>
          </div>
          <div>
            <label class="form-label me-2"><i class="cil-filter me-1"></i> Filtrer par statut :</label>
            <select v-model="filterStatus" class="form-control outlook-input d-inline-block" style="width: auto;">
              <option value="">Tous</option>
              <option value="Brouillon">Brouillon</option>
              <option value="Validé">Validé</option>
              <option value="Envoyé">Envoyé</option>
            </select>
            <button @click="applyFilter" class="btn btn-secondary custom-btn ms-2">
              <i class="cil-filters me-1"></i> Appliquer
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Liste des courriers -->
    <CCol :xs="12">
      <CCard class="shadow-sm border-0">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Courriers Sortants</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Destinataire</th>
                <th>Objet</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="courrier in filteredCourriers" :key="courrier.id">
                <td>{{ courrier.recipient || 'N/A' }}</td>
                <td>{{ courrier.subject || 'N/A' }}</td>
                <td>{{ courrier.mail_date || 'N/A' }}</td>
                <td>{{ courrier.status || 'Brouillon' }}</td>
                <td>
                  <button
                    v-if="courrier.status === 'Brouillon'"
                    @click="validateCourrier(courrier.id)"
                    class="btn btn-success btn-sm custom-btn me-2"
                  >
                    <i class="cil-check me-1"></i> Valider
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

    <!-- Modal pour les détails -->
    <CModal :visible="showDetailsModal" title="Détails du Courrier" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Destinataire :</strong> {{ selectedCourrier.recipient || 'N/A' }}</p>
      <p><strong>Cc :</strong> {{ selectedCourrier.cc || 'Aucun' }}</p>
      <p><strong>Objet :</strong> {{ selectedCourrier.subject || 'N/A' }}</p>
      <p><strong>Date du courrier :</strong> {{ selectedCourrier.mail_date || 'N/A' }}</p>
      <p><strong>Statut :</strong> {{ selectedCourrier.status || 'Brouillon' }}</p>
      <p><strong>Contenu :</strong> {{ selectedCourrier.content || 'Aucun' }}</p>
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
      filterStatus: '',
      showDetailsModal: false,
      selectedCourrier: {},
    };
  },
  computed: {
    filteredCourriers() {
      let filtered = [...this.courriers];
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (courrier) =>
            (courrier.recipient && courrier.recipient.toLowerCase().includes(query)) ||
            (courrier.subject && courrier.subject.toLowerCase().includes(query)) ||
            (courrier.status && courrier.status.toLowerCase().includes(query))
        );
      }
      if (this.filterStatus) {
        filtered = filtered.filter((courrier) => courrier.status === this.filterStatus);
      }
      return filtered;
    },
  },
  methods: {
    fetchCourriers() {
      console.log('Récupération des courriers sortants...');
      fetch('http://localhost:3000/api/mails/outgoing')
        .then((response) => {
          if (!response.ok) throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
          return response.json();
        })
        .then((data) => {
          console.log('Données reçues :', data);
          this.courriers = data;
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
      console.log('Filtre de statut appliqué :', this.filterStatus);
    },
    async validateCourrier(id) {
      console.log('Validation du courrier ID :', id);
      try {
        const response = await fetch(`http://localhost:3000/api/mails/outgoing/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Validé' }),
        });
        if (response.ok) {
          alert('Courrier validé avec succès');
          this.fetchCourriers();
        } else {
          const errorData = await response.json();
          alert(`Erreur : ${errorData.error || 'Échec de la validation du courrier'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la validation du courrier :', error);
        alert(`Erreur lors de la validation du courrier : ${error.message}`);
      }
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

/* Style du tableau */
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

/* Style des champs de formulaire */
.outlook-input {
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.outlook-input:focus {
  border-color: #0078d4;
  box-shadow: 0 0 5px rgba(0, 120, 212, 0.3);
  outline: none;
}

/* Style des boutons */
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
.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}
.btn-info:hover {
  background-color: #138496;
  border-color: #138496;
}
.btn-secondary {
  background-color: #8e8e8e;
  border-color: #8e8e8e;
}
.btn-secondary:hover {
  background-color: #707070;
  border-color: #707070;
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

/* Lien de téléchargement */
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