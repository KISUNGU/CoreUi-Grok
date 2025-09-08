<template>
  <div>
    <!-- Navigation des onglets -->
    <ul class="nav nav-tabs mb-4" id="treasuryTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="tab-previsions"
          data-bs-toggle="tab"
          data-bs-target="#content-previsions"
          type="button"
          role="tab"
          aria-controls="content-previsions"
          aria-selected="true"
        >
          Prévisions de Trésorerie
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="tab-mobilisations"
          data-bs-toggle="tab"
          data-bs-target="#content-mobilisations"
          type="button"
          role="tab"
          aria-controls="content-mobilisations"
          aria-selected="false"
        >
          Mobilisation des Fonds
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
          Gestion des Paiements
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="tab-reconciliations"
          data-bs-toggle="tab"
          data-bs-target="#content-reconciliations"
          type="button"
          role="tab"
          aria-controls="content-reconciliations"
          aria-selected="false"
        >
          Vérifications & Réconciliations
        </button>
      </li>
    </ul>

    <!-- Contenu des onglets -->
    <div class="tab-content" id="treasuryTabsContent">
      <!-- Prévisions de Trésorerie -->
      <div
        class="tab-pane fade show active"
        id="content-previsions"
        role="tabpanel"
        aria-labelledby="tab-previsions"
      >
        <h4>Prévisions de Trésorerie</h4>
        <form @submit.prevent="generateForecast">
          <div class="mb-3">
            <label for="startDate" class="form-label">Date de Début</label>
            <input v-model="forecast.startDate" type="date" id="startDate" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="endDate" class="form-label">Date de Fin</label>
            <input v-model="forecast.endDate" type="date" id="endDate" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Générer les Prévisions</button>
        </form>
      </div>

      <!-- Mobilisation des Fonds -->
      <div
        class="tab-pane fade"
        id="content-mobilisations"
        role="tabpanel"
        aria-labelledby="tab-mobilisations"
      >
        <h4>Mobilisation des Fonds</h4>
        <form @submit.prevent="addFundMobilization">
          <div class="mb-3">
            <label for="source" class="form-label">Source de Fonds</label>
            <input v-model="mobilization.source" type="text" id="source" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="amount" class="form-label">Montant</label>
            <input v-model="mobilization.amount" type="number" id="amount" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="date" class="form-label">Date</label>
            <input v-model="mobilization.date" type="date" id="date" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
        </form>
      </div>

      <!-- Gestion des Paiements -->
      <div
        class="tab-pane fade"
        id="content-paiements"
        role="tabpanel"
        aria-labelledby="tab-paiements"
      >
        <h4>Gestion des Paiements</h4>
        <button @click="openAddModal('paiements')" class="btn btn-primary mb-3">
          Ajouter un Paiement
        </button>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Montant</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ payment.date }}</td>
              <td>{{ payment.amount }}</td>
              <td>{{ payment.type }}</td>
              <td>{{ payment.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vérifications & Réconciliations -->
      <div
        class="tab-pane fade"
        id="content-reconciliations"
        role="tabpanel"
        aria-labelledby="tab-reconciliations"
      >
        <h4>Vérifications & Réconciliations</h4>
        <form @submit.prevent="verifyReconciliation">
          <div class="mb-3">
            <label for="bankAccount" class="form-label">Compte Bancaire</label>
            <input v-model="reconciliation.bankAccount" type="text" id="bankAccount" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="verificationDate" class="form-label">Date</label>
            <input v-model="reconciliation.date" type="date" id="verificationDate" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Réconcilier</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      forecast: {
        startDate: '',
        endDate: '',
      },
      mobilization: {
        source: '',
        amount: 0,
        date: '',
      },
      payments: [],
      reconciliation: {
        bankAccount: '',
        date: '',
      },
    };
  },
  methods: {
    generateForecast() {
      console.log('Prévisions générées pour :', this.forecast);
      // Logique pour calculer les prévisions
    },
    addFundMobilization() {
      console.log('Mobilisation ajoutée :', this.mobilization);
      // Logique pour ajouter une mobilisation
    },
    verifyReconciliation() {
      console.log('Réconciliation vérifiée pour :', this.reconciliation);
      // Logique pour vérifier
    },
    openAddModal(tab) {
      console.log(`Ajout dans la section ${tab}`);
      this.selectedTab = tab;
    },
    fetchData(tab) {
      const urlMap = {
        paiements: 'http://localhost:3000/api/paiements',
      };

      fetch(urlMap[tab])
        .then((response) => response.json())
        .then((data) => {
          if (tab === 'paiements') this.payments = data;
        })
        .catch((error) => console.error(`Erreur lors de la récupération des données : ${error}`));
    },
  },
  mounted() {
    this.fetchData('paiements');
  },
};
</script>

<style>
/* Styles supplémentaires */
</style>
