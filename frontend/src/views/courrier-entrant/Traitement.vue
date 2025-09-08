<template>
  <CRow>
    <!-- Liste des courriers à traiter -->
    <CCol :xs="12">
      <CCard>
        <CCardHeader>
          <strong><i class="cil-task"></i> Gestion des Courriers à Traiter</strong>
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
              <tr v-for="courrier in courriersEnCours" :key="courrier.id">
                <td>{{ courrier.ref_code }}</td>
                <td>{{ courrier.sender }}</td>
                <td>{{ courrier.subject }}</td>
                <td>{{ courrier.mail_date }}</td>
                <td>{{ courrier.status }}</td>
                <td>
                  <button @click="openUpdateModal(courrier)" class="btn btn-primary btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="archiveCourrier(courrier)" class="btn btn-danger btn-sm">
                    <i class="cil-folder"></i> Archiver
                  </button>

                </td>
              </tr>
              

              <tr v-if="courriersEnCours.length === 0">
                <td colspan="6" class="text-center">Aucun courrier à traiter</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal pour modifier le statut -->
    <CModal v-model="showModal" title="Modifier le Courrier">
      <p><strong>Référence :</strong> {{ selectedCourrier.ref_code }}</p>
      <p><strong>Objet :</strong> {{ selectedCourrier.subject }}</p>
      <div class="mb-3">
        <label for="status" class="form-label">Statut</label>
        <select v-model="updatedStatus" id="status" class="form-control">
          <option value="En cours">En cours</option>
          <option value="Validé">Validé</option>
          <option value="Rejeté">Rejeté</option>
        </select>
      </div>
      <button @click="updateCourrier" class="btn btn-success">Enregistrer</button>
    </CModal>


  </CRow>
</template>

<script>
export default {
  data() {
    return {
      courriers: [], // Tous les courriers
      showModal: false, // Contrôle pour la modal
      selectedCourrier: {}, // Courrier sélectionné pour mise à jour
      updatedStatus: 'En cours', // Nouveau statut
      updatedComment: '', // Commentaire ajouté
    };
  },
  computed: {
    courriersEnCours() {
      // Filtrer les courriers avec le statut "En cours"
      return this.courriers.filter((courrier) => courrier.status === 'En cours');
    },
  },
  methods: {
    fetchCourriers() {
      fetch('http://localhost:3000/api/mails/incoming')
        .then((response) => response.json())
        .then((data) => {
          this.courriers = data.map((courrier) => ({
            ...courrier,
            status: courrier.status || 'En cours', // Statut par défaut
          }));
          console.log('Données récupérées dans fetchCourriers:', this.courriers);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des courriers :", error);
        });
    },
    openUpdateModal(courrier) {
      console.log('Bouton Modifier cliqué pour :', courrier);
      this.selectedCourrier = courrier;
      this.updatedStatus = courrier.status; // Préremplir avec le statut actuel
      this.updatedComment = ''; // Réinitialiser les commentaires
      this.showModal = true; // Afficher la modal
    },

    updateCourrier() {
      console.log('Mise à jour du courrier :', this.selectedCourrier);
      console.log('Nouveau statut :', this.updatedStatus);
      console.log('Commentaire :', this.updatedComment);

      fetch(`http://localhost:3000/api/mails/incoming/${this.selectedCourrier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: this.updatedStatus,
          comment: this.updatedComment,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la mise à jour");
          }
          console.log('Courrier mis à jour avec succès');
          this.showModal = false;
          this.fetchCourriers(); // Rafraîchir les données
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour :", error);
        });
    },
    archiveCourrier(courrier) {
      console.log('Tentative d\'archivage pour le courrier :', courrier);
      fetch(`http://localhost:3000/api/mails/incoming/${courrier.id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erreur lors de l\'archivage');
          }
          console.log('Courrier archivé avec succès');
          this.fetchCourriers(); // Rafraîchir les données après l'archivage
        })
        .catch((error) => {
          console.error('Erreur lors de l\'archivage :', error);
        });
    },
    downloadAttachment(courrier) {
      console.log('Téléchargement de la pièce jointe pour le courrier :', courrier);
      // Logique pour gérer le téléchargement depuis le backend
      window.open(`http://localhost:3000${courrier.file_path}`, '_blank');
    },
    assignCourrier(courrier) {
  const responsable = prompt('Attribuer ce courrier à :'); // Prompt pour saisir le nom du responsable
  if (!responsable) {
    console.log('Aucune attribution effectuée');
    return;
  }

  fetch(`http://localhost:3000/api/mails/incoming/${courrier.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assigned_to: responsable,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de l'attribution");
      }
      console.log(`Courrier attribué à ${responsable}`);
      this.fetchCourriers(); // Rafraîchir les données
    })
    .catch((error) => {
      console.error("Erreur lors de l'attribution :", error);
    });
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
