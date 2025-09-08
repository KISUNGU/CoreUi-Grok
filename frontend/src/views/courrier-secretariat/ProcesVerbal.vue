<template>
    <CRow>
      <!-- Navigation des onglets -->
      <ul class="nav nav-tabs mb-4" id="pvTabs" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link active"
            id="tab-pv-internes"
            data-bs-toggle="tab"
            data-bs-target="#content-pv-internes"
            type="button"
            role="tab"
            aria-controls="content-pv-internes"
            aria-selected="true"
          >
            Procès-Verbaux Internes
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            id="tab-pv-externes"
            data-bs-toggle="tab"
            data-bs-target="#content-pv-externes"
            type="button"
            role="tab"
            aria-controls="content-pv-externes"
            aria-selected="false"
          >
            Procès-Verbaux Externes
          </button>
        </li>
      </ul>
  
      <!-- Contenu des onglets -->
      <div class="tab-content" id="pvTabsContent">
        <!-- PV Internes -->
        <div
          class="tab-pane fade show active"
          id="content-pv-internes"
          role="tabpanel"
          aria-labelledby="tab-pv-internes"
        >
          <h4>Procès-Verbaux Internes</h4>
          <button @click="openAddModal('internes')" class="btn btn-primary mb-3">
            Ajouter un PV Interne
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pv in filteredPV('internes')" :key="pv.id">
                <td>{{ pv.title }}</td>
                <td>{{ pv.date }}</td>
                <td>
                  <button @click="editPV(pv)" class="btn btn-warning btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="deletePV(pv)" class="btn btn-danger btn-sm">
                    <i class="cil-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- PV Externes -->
        <div
          class="tab-pane fade"
          id="content-pv-externes"
          role="tabpanel"
          aria-labelledby="tab-pv-externes"
        >
          <h4>Procès-Verbaux Externes</h4>
          <button @click="openAddModal('externes')" class="btn btn-primary mb-3">
            Ajouter un PV Externe
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pv in filteredPV('externes')" :key="pv.id">
                <td>{{ pv.title }}</td>
                <td>{{ pv.date }}</td>
                <td>
                  <button @click="editPV(pv)" class="btn btn-warning btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="deletePV(pv)" class="btn btn-danger btn-sm">
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
        pvList: [],
        selectedTab: 'internes',
      };
    },
    methods: {
      fetchPV() {
        // Logique pour récupérer les PV par catégorie
      },
      filteredPV(tab) {
        return this.pvList.filter((pv) => pv.category === tab);
      },
      openAddModal(tab) {
        this.selectedTab = tab;
        console.log(`Ouverture de la modal pour ${tab}`);
      },
      editPV(pv) {
        console.log('Modification du PV :', pv);
      },
      deletePV(pv) {
        console.log('Suppression du PV :', pv);
      },
    },
    mounted() {
      this.fetchPV();
    },
  };
  </script>
  