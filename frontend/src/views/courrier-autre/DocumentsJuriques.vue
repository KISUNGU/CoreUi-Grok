<template>
    <CRow>
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-legal"></i> Gestion des Documents Juridiques</strong>
          </CCardHeader>
          <CCardBody>
            <!-- Barre de recherche -->
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par titre ou référence"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
  
            <!-- Tableau des documents -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in filteredDocuments" :key="doc.id">
                  <td>{{ doc.ref_code }}</td>
                  <td>{{ doc.title }}</td>
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
        documents: [], // Liste des documents juridiques
        searchQuery: '', // Barre de recherche
      };
    },
    computed: {
      filteredDocuments() {
        return this.documents.filter((doc) => {
          const query = this.searchQuery.toLowerCase();
          return (
            doc.ref_code.toLowerCase().includes(query) ||
            doc.title.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchDocuments() {
        fetch('http://localhost:3000/api/documents/juridiques')
          .then((response) => response.json())
          .then((data) => {
            this.documents = data;
            console.log('Documents juridiques récupérés :', this.documents);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des documents juridiques :', error);
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
        fetch(`http://localhost:3000/api/documents/juridiques/${doc.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de la suppression');
            }
            console.log('Document supprimé avec succès');
            this.fetchDocuments();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du document :', error);
          });
      },
    },
    mounted() {
      this.fetchDocuments();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  