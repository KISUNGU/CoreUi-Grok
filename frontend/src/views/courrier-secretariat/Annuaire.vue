<template>
    <CRow>
      <!-- Navigation des onglets -->
      <ul class="nav nav-tabs mb-4" id="directoryTabs" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link active"
            id="tab-staff"
            data-bs-toggle="tab"
            data-bs-target="#content-staff"
            type="button"
            role="tab"
            aria-controls="content-staff"
            aria-selected="true"
          >
            Staff
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            id="tab-partenaires"
            data-bs-toggle="tab"
            data-bs-target="#content-partenaires"
            type="button"
            role="tab"
            aria-controls="content-partenaires"
            aria-selected="false"
          >
            Partenaires
          </button>
        </li>
      </ul>
  
      <!-- Contenu des onglets -->
      <div class="tab-content" id="directoryTabsContent">
        <!-- Onglet Staff -->
        <div
          class="tab-pane fade show active"
          id="content-staff"
          role="tabpanel"
          aria-labelledby="tab-staff"
        >
          <h4>Staff</h4>
          <button @click="openAddModal('staff')" class="btn btn-primary mb-3">
            Ajouter un Membre du Staff
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Poste</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="person in filteredEntries('staff')" :key="person.id">
                <td>{{ person.name }}</td>
                <td>{{ person.position }}</td>
                <td>{{ person.email }}</td>
                <td>
                  <button @click="editEntry(person)" class="btn btn-warning btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="deleteEntry(person)" class="btn btn-danger btn-sm">
                    <i class="cil-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Onglet Partenaires -->
        <div
          class="tab-pane fade"
          id="content-partenaires"
          role="tabpanel"
          aria-labelledby="tab-partenaires"
        >
          <h4>Partenaires</h4>
          <button @click="openAddModal('partenaires')" class="btn btn-primary mb-3">
            Ajouter un Partenaire
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Organisation</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="partner in filteredEntries('partenaires')" :key="partner.id">
                <td>{{ partner.name }}</td>
                <td>{{ partner.organization }}</td>
                <td>{{ partner.email }}</td>
                <td>
                  <button @click="editEntry(partner)" class="btn btn-warning btn-sm">
                    <i class="cil-pencil"></i> Modifier
                  </button>
                  <button @click="deleteEntry(partner)" class="btn btn-danger btn-sm">
                    <i class="cil-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Modal Ajouter -->
      <CModal v-model="showAddModal" title="Ajouter une Nouvelle Entrée">
        <form @submit.prevent="addEntry">
          <div class="mb-3">
            <label for="name" class="form-label">Nom</label>
            <input v-model="newEntry.name" type="text" id="name" class="form-control" required />
          </div>
          <div v-if="selectedTab === 'staff'" class="mb-3">
            <label for="position" class="form-label">Poste</label>
            <input v-model="newEntry.position" type="text" id="position" class="form-control" required />
          </div>
          <div v-if="selectedTab === 'partenaires'" class="mb-3">
            <label for="organization" class="form-label">Organisation</label>
            <input v-model="newEntry.organization" type="text" id="organization" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input v-model="newEntry.email" type="email" id="email" class="form-control" required />
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
        directory: [], // Liste des entrées (Staff + Partenaires)
        selectedTab: 'staff', // Onglet actif
        showAddModal: false, // Contrôle de la modal Ajouter
        newEntry: {
          name: '',
          position: '',
          organization: '',
          email: '',
        },
      };
    },
    methods: {
      fetchEntries() {
        fetch('http://localhost:3000/api/directory')
          .then((response) => response.json())
          .then((data) => {
            this.directory = data;
          })
          .catch((error) => {
            console.error('Erreur lors de la récupération des entrées :', error);
          });
      },
      filteredEntries(tab) {
        return this.directory.filter((entry) => entry.category === tab);
      },
      openAddModal(tab) {
        this.selectedTab = tab;
        this.newEntry = { name: '', position: '', organization: '', email: '' }; // Réinitialiser le formulaire
        this.showAddModal = true;
      },
      addEntry() {
        const entryData = { ...this.newEntry, category: this.selectedTab };
        fetch('http://localhost:3000/api/directory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'entrée');
            this.fetchEntries();
            this.showAddModal = false;
          })
          .catch((error) => {
            console.error('Erreur lors de l\'ajout de l\'entrée :', error);
          });
      },
      editEntry(entry) {
        console.log('Modification de l\'entrée :', entry);
        // Implémentez la logique de modification ici
      },
      deleteEntry(entry) {
        fetch(`http://localhost:3000/api/directory/${entry.id}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) throw new Error('Erreur lors de la suppression de l\'entrée');
            this.fetchEntries();
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression de l\'entrée :', error);
          });
      },
    },
    mounted() {
      this.fetchEntries();
    },
  };
  </script>
  
  <style>
  .text-center {
    text-align: center;
  }
  </style>
  