<template>
    <CRow>
      <!-- Navigation des onglets -->
      <ul class="nav nav-tabs mb-4" id="archiveTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="tab-internes"
            data-bs-toggle="tab"
            data-bs-target="#content-internes"
            type="button"
            role="tab"
            aria-controls="content-internes"
            aria-selected="true"
          >
            Documents Internes
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="tab-externes"
            data-bs-toggle="tab"
            data-bs-target="#content-externes"
            type="button"
            role="tab"
            aria-controls="content-externes"
            aria-selected="false"
          >
            Documents Externes
          </button>
        </li>
      </ul>
  
      <!-- Contenu des onglets -->
      <div class="tab-content" id="archiveTabsContent">
        <!-- Documents Internes -->
        <div
          class="tab-pane fade show active"
          id="content-internes"
          role="tabpanel"
          aria-labelledby="tab-internes"
        >
          <h4>Documents Internes</h4>
          <button @click="openAddModal('internes')" class="btn btn-primary mb-3">
            Ajouter un Document Interne
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Type</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in filteredDocuments('internes')" :key="doc.id">
                <td>{{ doc.reference }}</td>
                <td>{{ doc.type }}</td>
                <td>{{ doc.date }}</td>
                <td>{{ doc.description }}</td>
                <td>
                  <button @click="editDocument(doc)" class="btn btn-warning btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="deleteDocument(doc)" class="btn btn-danger btn-sm">
                    <i class="cil-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Documents Externes -->
        <div
          class="tab-pane fade"
          id="content-externes"
          role="tabpanel"
          aria-labelledby="tab-externes"
        >
          <h4>Documents Externes</h4>
          <button @click="openAddModal('externes')" class="btn btn-primary mb-3">
            Ajouter un Document Externe
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Type</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in filteredDocuments('externes')" :key="doc.id">
                <td>{{ doc.reference }}</td>
                <td>{{ doc.type }}</td>
                <td>{{ doc.date }}</td>
                <td>{{ doc.description }}</td>
                <td>
                  <button @click="editDocument(doc)" class="btn btn-warning btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="deleteDocument(doc)" class="btn btn-danger btn-sm">
                    <i class="cil-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CRow>
  </template>
  
  <script>
  export default {
    data() {
      return {
        documents: [], // Liste des documents (internes + externes)
        searchQuery: '',
        filter: '',
        selectedTab: 'internes',
      };
    },
    methods: {
      fetchDocuments() {
        fetch('http://localhost:3000/api/archives')
          .then((response) => response.json())
          .then((data) => {
            this.documents = data;
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des documents :', error);
          });
      },
      filteredDocuments(tab) {
        return this.documents.filter((doc) => doc.category === tab);
      },
      openAddModal(tab) {
        this.selectedTab = tab;
        console.log(`Ouverture de la modal pour ${tab}`);
      },
      editDocument(doc) {
        console.log('Modification du document :', doc);
      },
      deleteDocument(doc) {
        console.log('Suppression du document :', doc);
      },
    },
    mounted() {
      this.fetchDocuments();
    },
  };
  </script>
  