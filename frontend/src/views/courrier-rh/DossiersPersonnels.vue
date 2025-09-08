<template>
    <CRow>
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-folder"></i> Gestion des Dossiers Personnels</strong>
          </CCardHeader>
          <CCardBody>
            <!-- Barre de recherche -->
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par employé ou type de document"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
  
            <!-- Tableau des dossiers personnels -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type de Document</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="document in filteredDocuments" :key="document.id">
                  <td>{{ document.employee }}</td>
                  <td>{{ document.type }}</td>
                  <td>{{ document.date }}</td>
                  <td>
                    <button @click="downloadDocument(document)" class="btn btn-success btn-sm">
                      <i class="cil-cloud-download"></i> Télécharger
                    </button>
                    <button @click="deleteDocument(document)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredDocuments.length === 0">
                  <td colspan="4" class="text-center">Aucun document trouvé</td>
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
        dossiers: [], // Liste des dossiers personnels
        searchQuery: '', // Barre de recherche
      };
    },
    computed: {
      filteredDocuments() {
        return this.dossiers.filter((document) => {
          const query = this.searchQuery.toLowerCase();
          return (
            document.employee.toLowerCase().includes(query) ||
            document.type.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchDossiers() {
        fetch('http://localhost:3000/api/dossiers/personnels')
          .then((response) => response.json())
          .then((data) => {
            this.dossiers = data;
            console.log('Dossiers personnels récupérés :', this.dossiers);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des dossiers personnels :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      downloadDocument(document) {
        if (!document.file_path) {
          return alert("Ce document n'a pas de fichier associé.");
        }
        window.open(`http://localhost:3000${document.file_path}`, '_blank');
      },
      deleteDocument(document) {
        fetch(`http://localhost:3000/api/dossiers/personnels/${document.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de la suppression');
            }
            console.log('Document supprimé avec succès');
            this.fetchDossiers();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du document :', error);
          });
      },
    },
    mounted() {
      this.fetchDossiers();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  