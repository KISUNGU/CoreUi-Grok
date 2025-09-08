<template>
    <CRow>
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-chart"></i> Rapport Financier</strong>
          </CCardHeader>
          <CCardBody>
            <!-- Barre de recherche -->
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par type ou période"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
  
            <!-- Tableau des rapports financiers -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Date de Publication</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rapport in filteredRapports" :key="rapport.id">
                  <td>{{ rapport.type }}</td>
                  <td>{{ rapport.period }}</td>
                  <td>{{ rapport.date }}</td>
                  <td>
                    <button @click="downloadRapport(rapport)" class="btn btn-success btn-sm">
                      <i class="cil-cloud-download"></i> Télécharger
                    </button>
                    <button @click="deleteRapport(rapport)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredRapports.length === 0">
                  <td colspan="4" class="text-center">Aucun rapport trouvé</td>
                </tr>
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </template>
  
  <script>
  export default {
    data() {
      return {
        rapports: [],
        searchQuery: '',
      };
    },
    computed: {
      filteredRapports() {
        return this.rapports.filter((rapport) => {
          const query = this.searchQuery.toLowerCase();
          return (
            rapport.type.toLowerCase().includes(query) ||
            rapport.period.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchRapports() {
        fetch('http://localhost:3000/api/rapports-financiers')
          .then((response) => response.json())
          .then((data) => {
            this.rapports = data;
            console.log('Rapports financiers récupérés :', this.rapports);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des rapports financiers :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      downloadRapport(rapport) {
        if (!rapport.file_path) {
          return alert("Ce rapport n'a pas de fichier associé.");
        }
        window.open(`http://localhost:3000${rapport.file_path}`, '_blank');
      },
      deleteRapport(rapport) {
        fetch(`http://localhost:3000/api/rapports-financiers/${rapport.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de la suppression');
            }
            console.log('Rapport supprimé avec succès');
            this.fetchRapports();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du rapport :', error);
          });
      },
    },
    mounted() {
      this.fetchRapports();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  