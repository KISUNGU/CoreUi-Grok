<template>
  <CRow>
    <!-- Liste des courriers prêts à être envoyés -->
    <CCol :xs="12" class="mb-4">
      <CCard>
        <CCardHeader>
          <strong><i class="cil-send"></i> Liste des Courriers à Envoyer</strong>
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
              <tr v-for="courrier in courriers" :key="courrier.id">
                <td>{{ courrier.reference }}</td>
                <td>{{ courrier.destinataire }}</td>
                <td>{{ courrier.sujet }}</td>
                <td>{{ courrier.date }}</td>
                <td>
                  <button @click="sendCourrier(courrier.id)" class="btn btn-primary btn-sm">
                    <i class="cil-send"></i> Envoyer
                  </button>
                  <button @click="viewCourrier(courrier)" class="btn btn-info btn-sm">
                    <i class="cil-eye"></i> Visualiser
                  </button>
                </td>
              </tr>
              <tr v-if="courriers.length === 0">
                <td colspan="5" class="text-center">Aucun courrier à envoyer</td>
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
      courriers: [], // Liste des courriers à envoyer
    };
  },
  methods: {
    fetchCourriers() {
      // Requête pour obtenir les courriers prêts à être envoyés depuis le backend
      fetch('http://localhost:3000/api/courriers-sortants')
        .then(response => response.json())
        .then(data => {
          this.courriers = data;
        })
        .catch(error => {
          console.error("Erreur lors de l'obtention des courriers :", error);
        });
    },
    sendCourrier(id) {
      console.log('Envoi du courrier avec ID :', id);
      // Requête pour envoyer le courrier
      fetch(`http://localhost:3000/api/courriers-sortants/${id}/send`, {
        method: 'POST',
      })
        .then(() => {
          alert('Courrier envoyé avec succès !');
          this.courriers = this.courriers.filter(c => c.id !== id);
        })
        .catch(error => {
          console.error("Erreur lors de l'envoi du courrier :", error);
          alert("Une erreur est survenue lors de l'envoi.");
        });
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
