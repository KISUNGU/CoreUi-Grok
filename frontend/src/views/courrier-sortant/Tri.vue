<template>
  <CRow>
    <!-- Filtres et options de tri -->
    <CCol :xs="12" class="mb-4">
      <CCard>
        <CCardHeader>
          <strong><i class="cil-sort"></i> Tri des Courriers Sortants</strong>
        </CCardHeader>
        <CCardBody>
          <form @submit.prevent="applyFilters">
            <div class="mb-3">
              <label for="critere" class="form-label"><i class="cil-filter"></i> Critères de Tri</label>
              <select
                v-model="filters.critere"
                class="form-control"
                id="critere"
                required
              >
                <option value="">Sélectionnez un critère</option>
                <option value="date">Date</option>
                <option value="destinataire">Destinataire</option>
                <option value="sujet">Sujet</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="ordre" class="form-label"><i class="cil-arrow-thick-to-top"></i> Ordre</label>
              <select
                v-model="filters.ordre"
                class="form-control"
                id="ordre"
                required
              >
                <option value="">Sélectionnez l'ordre</option>
                <option value="asc">Ascendant</option>
                <option value="desc">Descendant</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary"><i class="cil-check-circle"></i> Appliquer</button>
          </form>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Liste des courriers triés -->
    <CCol :xs="12">
      <CCard>
        <CCardHeader>
          <strong><i class="cil-list"></i> Liste des Courriers Triés</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Destinataire</th>
                <th>Sujet</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="courrier in filteredCourriers" :key="courrier.id">
                <td>{{ courrier.reference }}</td>
                <td>{{ courrier.destinataire }}</td>
                <td>{{ courrier.sujet }}</td>
                <td>{{ courrier.date }}</td>
                <td>
                  <button @click="viewCourrier(courrier)" class="btn btn-info btn-sm">
                    <i class="cil-eye"></i> Visualiser
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCourriers.length === 0">
                <td colspan="5" class="text-center">Aucun courrier trouvé</td>
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
      courriers: [], // Liste initiale des courriers
      filters: {
        critere: '',
        ordre: '',
      },
    };
  },
  computed: {
    filteredCourriers() {
      let sortedCourriers = [...this.courriers];
      if (this.filters.critere) {
        sortedCourriers = sortedCourriers.sort((a, b) => {
          if (this.filters.critere === 'date') {
            return this.filters.ordre === 'asc'
              ? new Date(a.date) - new Date(b.date)
              : new Date(b.date) - new Date(a.date);
          } else {
            return this.filters.ordre === 'asc'
              ? a[this.filters.critere].localeCompare(b[this.filters.critere])
              : b[this.filters.critere].localeCompare(a[this.filters.critere]);
          }
        });
      }
      return sortedCourriers;
    },
  },
  methods: {
    fetchCourriers() {
      // Requête pour obtenir les courriers depuis le backend
      fetch('http://localhost:3000/api/courriers')
        .then(response => response.json())
        .then(data => {
          this.courriers = data;
        })
        .catch(error => {
          console.error("Erreur lors de l'obtention des courriers :", error);
        });
    },
    applyFilters() {
      console.log('Filtres appliqués :', this.filters);
      // La logique de tri est appliquée via `filteredCourriers`
    },
    viewCourrier(courrier) {
      console.log('Visualisation du courrier :', courrier);
      // Ajoutez ici une redirection ou une modal pour afficher les détails du courrier
    },
  },
  mounted() {
    this.fetchCourriers();
  },
};
</script>

<style>
.text-center {
  text-align: center;
}
</style>
