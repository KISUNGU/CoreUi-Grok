<template>
    <CRow>
      <!-- Barre de recherche -->
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-storage"></i> Gestion des Stocks</strong>
          </CCardHeader>
          <CCardBody>
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par nom ou catégorie"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Tableau des stocks -->
      <CCol :xs="12">
        <CCard>
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <strong><i class="cil-list"></i> Liste des Stocks</strong>
              <button @click="openAddModal" class="btn btn-primary">
                <i class="cil-plus"></i> Ajouter un Stock
              </button>
            </div>
          </CCardHeader>
          <CCardBody>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Quantité</th>
                  <th>Date d'Entrée</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stock in filteredStocks" :key="stock.id">
                  <td>{{ stock.name }}</td>
                  <td>{{ stock.category }}</td>
                  <td>{{ stock.quantity }}</td>
                  <td>{{ stock.entry_date }}</td>
                  <td>
                    <button @click="editStock(stock)" class="btn btn-warning btn-sm">
                      <i class="cil-pencil"></i> Modifier
                    </button>
                    <button @click="deleteStock(stock)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredStocks.length === 0">
                  <td colspan="5" class="text-center">Aucun stock trouvé</td>
                </tr>
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Modal Ajouter -->
      <CModal v-model="showAddModal" title="Ajouter un Nouveau Stock">
        <form @submit.prevent="addStock">
          <div class="mb-3">
            <label for="name" class="form-label">Nom</label>
            <input v-model="newStock.name" type="text" id="name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="category" class="form-label">Catégorie</label>
            <input v-model="newStock.category" type="text" id="category" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="quantity" class="form-label">Quantité</label>
            <input v-model="newStock.quantity" type="number" id="quantity" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="entry_date" class="form-label">Date d'Entrée</label>
            <input v-model="newStock.entry_date" type="date" id="entry_date" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
        </form>
      </CModal>
    </CRow>
  </template>
  
  <script>
  export default {
    data() {
      return {
        stocks: [], // Liste des stocks
        searchQuery: '', // Barre de recherche
        showAddModal: false, // Contrôle d'affichage de la modal
        newStock: {
          name: '',
          category: '',
          quantity: 0,
          entry_date: '',
        },
      };
    },
    computed: {
      filteredStocks() {
        return this.stocks.filter((stock) => {
          const query = this.searchQuery.toLowerCase();
          return (
            stock.name.toLowerCase().includes(query) ||
            stock.category.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchStocks() {
        fetch('http://localhost:3000/api/stocks')
          .then((response) => response.json())
          .then((data) => {
            this.stocks = data;
            console.log('Stocks récupérés :', this.stocks);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des stocks :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      openAddModal() {
        this.showAddModal = true;
      },
      addStock() {
        fetch('http://localhost:3000/api/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newStock),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de l\'ajout du stock');
            this.fetchStocks();
            this.showAddModal = false;
            console.log('Stock ajouté avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de l\'ajout du stock :', error);
          });
      },
      editStock(stock) {
        console.log('Modification du stock :', stock);
        // Ajoutez la logique de modification ici
      },
      deleteStock(stock) {
        fetch(`http://localhost:3000/api/stocks/${stock.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de la suppression du stock');
            this.fetchStocks();
            console.log('Stock supprimé avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du stock :', error);
          });
      },
    },
    mounted() {
      this.fetchStocks();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  