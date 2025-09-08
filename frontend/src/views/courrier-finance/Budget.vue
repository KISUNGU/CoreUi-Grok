<template>
    <CRow>
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-calculator"></i> Gestion du Budget</strong>
          </CCardHeader>
          <CCardBody>
            <!-- Barre de recherche -->
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par catégorie ou année"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
  
            <!-- Tableau du budget -->
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Année</th>
                  <th>Montant Alloué</th>
                  <th>Montant Utilisé</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="budget in filteredBudgets" :key="budget.id">
                  <td>{{ budget.category }}</td>
                  <td>{{ budget.year }}</td>
                  <td>{{ budget.allocated }}</td>
                  <td>{{ budget.used }}</td>
                  <td>
                    <button @click="viewBudgetDetails(budget)" class="btn btn-info btn-sm">
                      <i class="cil-pencil"></i> Détails
                    </button>
                    <button @click="deleteBudget(budget)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredBudgets.length === 0">
                  <td colspan="5" class="text-center">Aucun budget trouvé</td>
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
        budgets: [], // Liste des budgets
        searchQuery: '', // Barre de recherche
      };
    },
    computed: {
      filteredBudgets() {
        return this.budgets.filter((budget) => {
          const query = this.searchQuery.toLowerCase();
          return (
            budget.category.toLowerCase().includes(query) ||
            budget.year.toString().includes(query)
          );
        });
      },
    },
    methods: {
      fetchBudgets() {
        fetch('http://localhost:3000/api/budgets')
          .then((response) => response.json())
          .then((data) => {
            this.budgets = data;
            console.log('Budgets récupérés :', this.budgets);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des budgets :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      viewBudgetDetails(budget) {
        console.log('Affichage des détails du budget :', budget);
        // Logique pour afficher une modal ou naviguer vers une autre page
      },
      deleteBudget(budget) {
        fetch(`http://localhost:3000/api/budgets/${budget.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erreur lors de la suppression');
            }
            console.log('Budget supprimé avec succès');
            this.fetchBudgets();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression du budget :', error);
          });
      },
    },
    mounted() {
      this.fetchBudgets();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  