<template>
  <CRow>
    <!-- Barre de recherche -->
    <CCol :xs="12" class="mb-4">
      <CCard>
        <CCardHeader>
          <strong><i class="cil-storage"></i> Archivage des Courriers</strong>
        </CCardHeader>
        <CCardBody>
          <div class="d-flex mb-3">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Rechercher par référence, expéditeur, ou objet"
            />
            <button @click="applySearch" class="btn btn-primary ms-2">
              <i class="cil-search"></i> Rechercher
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Liste des courriers archivés -->
    <CCol :xs="12">
      <CCard>
        <CCardHeader>
          <strong><i class="cil-list"></i> Liste des Courriers Archivés</strong>
        </CCardHeader>
        <CCardBody>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Expéditeur</th>
                <th>Objet</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="courrier in filteredCourriers" :key="courrier.id">
                <td>{{ courrier.ref_code }}</td>
                <td>{{ courrier.sender }}</td>
                <td>{{ courrier.subject }}</td>
                <td>{{ courrier.mail_date }}</td>
                <td>{{ courrier.status }}</td>
                <td>
                  <button @click="downloadAttachment(courrier)" class="btn btn-success btn-sm">
                    <i class="cil-cloud-download"></i> Télécharger
                  </button>
                  <button @click="restoreCourrier(courrier)" class="btn btn-warning btn-sm">
                    <i class="cil-reload"></i> Restaurer
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCourriers.length === 0">
                <td colspan="6" class="text-center">Aucun courrier archivé trouvé</td>
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
      courriers: [], // Liste des courriers archivés
      searchQuery: '', // Barre de recherche
    };
  },
  computed: {
    filteredCourriers() {
      // Filtrer les courriers archivés selon la barre de recherche
      return this.courriers.filter((courrier) => {
        const query = this.searchQuery.toLowerCase();
        return (
          (courrier.ref_code && courrier.ref_code.toLowerCase().includes(query)) ||
          (courrier.sender && courrier.sender.toLowerCase().includes(query)) ||
          (courrier.subject && courrier.subject.toLowerCase().includes(query))
        );
      });
    },
  },
  methods: {
    fetchArchivedCourriers() {
      // Requête pour récupérer les courriers archivés depuis le backend
      fetch('http://localhost:3000/api/mails/incoming')
        .then((response) => response.json())
        .then((data) => {
          this.courriers = data.filter((courrier) => courrier.status === 'Archivé');
          console.log('Courriers archivés récupérés :', this.courriers);
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des courriers archivés :', error);
        });
    },
    applySearch() {
      console.log('Requête de recherche appliquée :', this.searchQuery);
    },
    downloadAttachment(courrier) {
      if (!courrier.file_path) {
        console.error('Aucun fichier attaché pour ce courrier.');
        return alert("Ce courrier n'a pas de pièce jointe.");
      }
      const fileUrl = `http://localhost:3000${courrier.file_path}`;
      console.log('Téléchargement de la pièce jointe depuis :', fileUrl);
      window.open(fileUrl, '_blank');
    },
    restoreCourrier(courrier) {
      console.log('Restauration du courrier archivé :', courrier);
      fetch(`http://localhost:3000/api/mails/incoming/${courrier.id}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'En cours' }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erreur lors de la restauration');
          }
          console.log('Courrier restauré avec succès');
          this.fetchArchivedCourriers(); // Rafraîchir les données après la restauration
        })
        .catch((error) => {
          console.error('Erreur lors de la restauration du courrier :', error);
        });
    },
  },
  mounted() {
    console.log('Module Archivage chargé.');
    this.fetchArchivedCourriers();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => vm.fetchArchivedCourriers());
  },
};
</script>

<style>
.text-center {
  text-align: center;
}
</style>
