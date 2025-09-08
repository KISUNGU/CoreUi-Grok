<template>
    <CRow>
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-user"></i> Gestion des Ressources Humaines</strong>
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
  
            <!-- Tableau des documents RH -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in filteredRHDocuments" :key="doc.id">
                  <td>{{ doc.employee }}</td>
                  <td>{{ doc.type }}</td>
                  <td>{{ doc.date }}</td>
                  <td>
                    <button @click="downloadDocument(doc)" class="btn btn-success btn-sm">
                      <i class="cil-cloud-download"></i> Télécharger
                    </button>
                    <button @click="deleteDocument(doc)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredRHDocuments.length === 0">
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
        rhDocuments: [], // Liste des documents RH
        searchQuery: '', // Barre de recherche
      };
    },
    computed: {
      filteredRHDocuments() {
        return this.rhDocuments.filter((doc) => {
          const query = this.searchQuery.toLowerCase();
          return (
            doc.employee.toLowerCase().includes(query) ||
            doc.type.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchRHDocuments() {
        fetch('http://localhost:3000/api/documents/rh')
          .then((response) => response.json())
          .then((data) => {
            this.rhDocuments = data;
            console.log('Documents RH récupérés :', this.rhDocuments);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des documents RH :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      downloadDocument(doc) {
        if (!doc.file_path) {
          return alert("Ce document n'a pas de fichier associé.");
        }
        window.open(`http://localhost:3000${doc.file_path}`, '_blank');
      },
      deleteDocument(doc) {
        fetch(`http://localhost:3000/api/documents/rh/${doc.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de la suppression');
            }
            console.log('Document RH supprimé avec succès');
            this.fetchRHDocuments();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du document RH :', error);
          });
      },
    },
    mounted() {
      this.fetchRHDocuments();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  