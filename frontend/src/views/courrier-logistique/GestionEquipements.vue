<template>
    <CRow>
      <!-- Barre de recherche -->
      <CCol :xs="12" class="mb-4">
        <CCard>
          <CCardHeader>
            <strong><i class="cil-settings"></i> Gestion des Équipements</strong>
          </CCardHeader>
          <CCardBody>
            <div class="d-flex mb-3">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Rechercher par nom ou type"
              />
              <button @click="applySearch" class="btn btn-primary ms-2">
                <i class="cil-search"></i> Rechercher
              </button>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Tableau des équipements -->
      <CCol :xs="12">
        <CCard>
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <strong><i class="cil-list"></i> Liste des Équipements</strong>
              <button @click="openAddModal" class="btn btn-primary">
                <i class="cil-plus"></i> Ajouter un Équipement
              </button>
            </div>
          </CCardHeader>
          <CCardBody>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date d'Acquisition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="equipment in filteredEquipments" :key="equipment.id">
                  <td>{{ equipment.name }}</td>
                  <td>{{ equipment.type }}</td>
                  <td>{{ equipment.status }}</td>
                  <td>{{ equipment.acquisition_date }}</td>
                  <td>
                    <button @click="editEquipment(equipment)" class="btn btn-warning btn-sm">
                      <i class="cil-pencil"></i> Modifier
                    </button>
                    <button @click="deleteEquipment(equipment)" class="btn btn-danger btn-sm">
                      <i class="cil-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredEquipments.length === 0">
                  <td colspan="5" class="text-center">Aucun équipement trouvé</td>
                </tr>
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </CCol>
  
      <!-- Modal Ajouter -->
      <CModal v-model="showAddModal" title="Ajouter un Nouvel Équipement">
        <form @submit.prevent="addEquipment">
          <div class="mb-3">
            <label for="name" class="form-label">Nom</label>
            <input v-model="newEquipment.name" type="text" id="name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="type" class="form-label">Type</label>
            <input v-model="newEquipment.type" type="text" id="type" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="status" class="form-label">Statut</label>
            <select v-model="newEquipment.status" id="status" class="form-select" required>
              <option value="Disponible">Disponible</option>
              <option value="En Réparation">En Réparation</option>
              <option value="Hors Service">Hors Service</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="acquisition_date" class="form-label">Date d'Acquisition</label>
            <input
              v-model="newEquipment.acquisition_date"
              type="date"
              id="acquisition_date"
              class="form-control"
              required
            />
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
        equipments: [], // Liste des équipements
        searchQuery: '', // Barre de recherche
        showAddModal: false, // Contrôle d'affichage de la modal
        newEquipment: {
          name: '',
          type: '',
          status: 'Disponible', // Statut par défaut
          acquisition_date: '',
        },
      };
    },
    computed: {
      filteredEquipments() {
        return this.equipments.filter((equipment) => {
          const query = this.searchQuery.toLowerCase();
          return (
            equipment.name.toLowerCase().includes(query) ||
            equipment.type.toLowerCase().includes(query)
          );
        });
      },
    },
    methods: {
      fetchEquipments() {
        fetch('http://localhost:3000/api/equipments')
          .then((response) => response.json())
          .then((data) => {
            this.equipments = data;
            console.log('Équipements récupérés :', this.equipments);
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des équipements :', error);
          });
      },
      applySearch() {
        console.log('Recherche appliquée :', this.searchQuery);
      },
      openAddModal() {
        this.showAddModal = true;
      },
      addEquipment() {
        fetch('http://localhost:3000/api/equipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newEquipment),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'équipement');
            this.fetchEquipments();
            this.showAddModal = false;
            console.log('Équipement ajouté avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de l\'ajout de l\'équipement :', error);
          });
      },
      editEquipment(equipment) {
        console.log('Modification de l\'équipement :', equipment);
        // Ajoutez la logique de modification ici
      },
      deleteEquipment(equipment) {
        fetch(`http://localhost:3000/api/equipments/${equipment.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de la suppression de l\'équipement');
            this.fetchEquipments();
            console.log('Équipement supprimé avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression de l\'équipement :', error);
          });
      },
    },
    mounted() {
      this.fetchEquipments();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  