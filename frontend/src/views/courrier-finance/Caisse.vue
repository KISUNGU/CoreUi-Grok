<template>
  <div>
    <!-- Navigation des onglets -->
    <ul class="nav nav-tabs mb-4" id="financeTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="tab-approvisionnement"
          data-bs-toggle="tab"
          data-bs-target="#content-approvisionnement"
          type="button"
          role="tab"
          aria-controls="content-approvisionnement"
          aria-selected="true"
        >
          Approvisionnement
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="tab-journalisation"
          data-bs-toggle="tab"
          data-bs-target="#content-journalisation"
          type="button"
          role="tab"
          aria-controls="content-journalisation"
          aria-selected="false"
        >
          Journalisation des Achats
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="tab-paiements"
          data-bs-toggle="tab"
          data-bs-target="#content-paiements"
          type="button"
          role="tab"
          aria-controls="content-paiements"
          aria-selected="false"
        >
          Paiements Divers
        </button>
      </li>
    </ul>

    <!-- Contenu des onglets -->
    <div class="tab-content" id="financeTabsContent">
      <!-- Approvisionnement -->
      <div
        class="tab-pane fade show active"
        id="content-approvisionnement"
        role="tabpanel"
        aria-labelledby="tab-approvisionnement"
      >
        <h4>Approvisionnement</h4>
        <button @click="openAddModal('approvisionnement')" class="btn btn-primary mb-3">
          Ajouter un Approvisionnement
        </button>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Montant</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appro in approvisionnements" :key="appro.id">
              <td>{{ appro.date }}</td>
              <td>{{ appro.amount }}</td>
              <td>{{ appro.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Journalisation des Achats -->
      <div
        class="tab-pane fade"
        id="content-journalisation"
        role="tabpanel"
        aria-labelledby="tab-journalisation"
      >
        <h4>Journalisation des Achats</h4>
        <button @click="openAddModal('journalisation')" class="btn btn-primary mb-3">
          Ajouter un Achat
        </button>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Fournisseur</th>
              <th>Montant</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="achat in achats" :key="achat.id">
              <td>{{ achat.date }}</td>
              <td>{{ achat.supplier }}</td>
              <td>{{ achat.amount }}</td>
              <td>{{ achat.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paiements Divers -->
      <div
        class="tab-pane fade"
        id="content-paiements"
        role="tabpanel"
        aria-labelledby="tab-paiements"
      >
        <h4>Paiements Divers</h4>
        <form @submit.prevent="addTransaction">
          <div class="mb-3">
            <label for="datePayment" class="form-label">Date</label>
            <input v-model="newTransaction.date" type="date" id="datePayment" class="form-control" />
          </div>
          <div class="mb-3">
            <label for="amountPayment" class="form-label">Montant</label>
            <input v-model="newTransaction.amount" type="number" id="amountPayment" class="form-control" />
          </div>
          <div class="mb-3">
            <label for="descriptionPayment" class="form-label">Description</label>
            <textarea v-model="newTransaction.description" id="descriptionPayment" class="form-control"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Enregistrer le Paiement</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showAddModalFlag: false, // Contrôle l'état de la modal
      approvisionnements: [], // Données pour l'onglet approvisionnement
      achats: [], // Données pour l'onglet journalisation des achats
      payments: [], // Données pour l'onglet paiements divers
      newTransaction: {
        date: '',
        amount: 0,
        description: '',
      },
    };
  },
  methods: {
    fetchData(tab) {
      const urlMap = {
        approvisionnement: 'http://localhost:3000/api/approvisionnements',
        journalisation: 'http://localhost:3000/api/achats',
        paiements: 'http://localhost:3000/api/paiements',
      };

      fetch(urlMap[tab])
        .then((response) => response.json())
        .then((data) => {
          if (tab === 'approvisionnement') this.approvisionnements = data;
          if (tab === 'journalisation') this.achats = data;
          if (tab === 'paiements') this.payments = data;
        })
        .catch((error) => console.error(`Erreur lors de la récupération des données : ${error}`));
    },
    openAddModal(tab) {
      console.log(`Ajout dans la section ${tab}`);
      this.selectedTab = tab;
      this.showAddModalFlag = true;
    },
    addTransaction() {
      console.log('Transaction enregistrée :', this.newTransaction);
      // Logic pour ajouter la transaction
    },
  },
  mounted() {
    this.fetchData('approvisionnement');
    this.fetchData('journalisation');
    this.fetchData('paiements');
  },
};
</script>

<style>
/* Styles supplémentaires */
</style>
