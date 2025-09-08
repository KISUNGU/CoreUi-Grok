<template>
    <CRow>
      <!-- Barre de recherche -->
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-truck"></i> Gestion des Transports et Déplacements</strong>
          </CCardHeader>
          <CCardBody>
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par destination ou date"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Tableau des réservations -->
      <CCol :xs="12">
        <CCard>
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <strong><i class="cil-list"></i> Liste des Réservations</strong>
              <button @click="openAddModal" class="btn btn-primary">
                <i class="cil-plus"></i> Ajouter une Réservation
              </button>
            </div>
          </CCardHeader>
          <CCardBody>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Destination</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reservation in filteredReservations" :key="reservation.id">
                  <td>{{ reservation.name }}</td>
                  <td>{{ reservation.destination }}</td>
                  <td>{{ reservation.date }}</td>
                  <td>{{ reservation.type }}</td>
                  <td>
                    <button @click="editReservation(reservation)" class="btn btn-warning btn-sm">
                      <i class="cil-pencil"></i> Modifier
                    </button>
                    <button @click="deleteReservation(reservation)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredReservations.length === 0">
                  <td colspan="5" class="text-center">Aucune réservation trouvée</td>
                </tr>
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Modal Ajouter -->
      <CModal v-model="showAddModal" title="Ajouter une Nouvelle Réservation">
        <form @submit.prevent="addReservation">
          <div class="mb-3">
            <label for="name" class="form-label">Nom</label>
            <input v-model="newReservation.name" type="text" id="name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="destination" class="form-label">Destination</label>
            <input v-model="newReservation.destination" type="text" id="destination" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="date" class="form-label">Date</label>
            <input v-model="newReservation.date" type="date" id="date" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="type" class="form-label">Type</label>
            <select v-model="newReservation.type" id="type" class="form-select" required>
              <option value="Transport">Transport</option>
              <option value="Déplacement">Déplacement</option>
            </select>
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
        reservations: [], // Liste des réservations
        searchQuery: '', // Barre de recherche
        showAddModal: false, // Contrôle d'affichage de la modal
        newReservation: {
          name: '',
          destination: '',
          date: '',
          type: 'Transport', // Type par défaut
        },
      };
    },
    computed: {
      filteredReservations() {
        return this.reservations.filter((reservation) => {
          const query = this.searchQuery.toLowerCase();
          return (
            reservation.name.toLowerCase().includes(query) ||
            reservation.destination.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchReservations() {
        fetch('http://localhost:3000/api/reservations')
          .then((response) => response.json())
          .then((data) => {
            this.reservations = data;
            console.log('Réservations récupérées :', this.reservations);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des réservations :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      openAddModal() {
        this.showAddModal = true;
      },
      addReservation() {
        fetch('http://localhost:3000/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newReservation),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de l\'ajout de la réservation');
            this.fetchReservations();
            this.showAddModal = false;
            console.log('Réservation ajoutée avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de l\'ajout de la réservation :', error);
          });
      },
      editReservation(reservation) {
        console.log('Modification de la réservation :', reservation);
        // Ajoutez la logique de modification ici
      },
      deleteReservation(reservation) {
        fetch(`http://localhost:3000/api/reservations/${reservation.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de la suppression de la réservation');
            this.fetchReservations();
            console.log('Réservation supprimée avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression de la réservation :', error);
          });
      },
    },
    mounted() {
      this.fetchReservations();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  