<!-- src/views/AddIncomingMail.vue -->
<template>
    <div class="add-mail-container">
      <h2>Ajouter un courrier entrant</h2>
      <CForm @submit.prevent="handleSubmit">
        <CFormGroup>
          <CFormLabel for="subject">Sujet</CFormLabel>
          <CInput type="text" id="subject" v-model="form.subject" required />
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="sender">Expéditeur</CFormLabel>
          <CInput type="text" id="sender" v-model="form.sender" required />
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="type">Type</CFormLabel>
          <CFormSelect id="type" v-model="form.type" required>
            <option value="lettre">Lettre</option>
            <option value="email">Email</option>
            <option value="colis">Colis</option>
          </CFormSelect>
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="priority">Priorité</CFormLabel>
          <CFormSelect id="priority" v-model="form.priority" required>
            <option value="basse">Basse</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
          </CFormSelect>
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="mail_date">Date du courrier</CFormLabel>
          <CInput type="date" id="mail_date" v-model="form.mail_date" required />
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="arrival_date">Date d'arrivée</CFormLabel>
          <CInput type="date" id="arrival_date" v-model="form.arrival_date" required />
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="entity">Entité</CFormLabel>
          <CInput type="text" id="entity" v-model="form.entity" required />
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="assigned_to">Assigné à</CFormLabel>
          <CFormSelect id="assigned_to" v-model="form.assigned_to">
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </CFormSelect>
        </CFormGroup>
        <CFormGroup>
          <CFormLabel for="file">Pièce jointe</CFormLabel>
          <CInput type="file" id="file" ref="fileInput" @change="handleFileChange" />
        </CFormGroup>
        <CButton type="submit" color="success">Ajouter</CButton>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">Courrier ajouté avec succès !</p>
      </CForm>
    </div>
  </template>
  
  <script>
  import { useCourrierStore } from '../stores/courrier';
  import {
    CForm,
    CFormGroup,
    CFormLabel,
    CInput,
    CFormSelect,
    CButton,
  } from '@coreui/vue';
  
  export default {
    name: 'AddIncomingMail',
    components: {
      CForm,
      CFormGroup,
      CFormLabel,
      CInput,
      CFormSelect,
      CButton,
    },
    setup() {
      const courrierStore = useCourrierStore();
      return { courrierStore };
    },
    data() {
      return {
        form: {
          subject: '',
          sender: '',
          type: 'lettre',
          priority: 'moyenne',
          mail_date: '',
          arrival_date: '',
          entity: '',
          assigned_to: null,
        },
        file: null,
        users: [],
        error: null,
        success: false,
      };
    },
    async created() {
      try {
        await this.courrierStore.fetchUsers();
        this.users = this.courrierStore.getUsers;
      } catch (err) {
        this.error = 'Erreur lors du chargement des utilisateurs';
      }
    },
    methods: {
      handleFileChange(event) {
        this.file = event.target.files[0];
      },
      async handleSubmit() {
        try {
          this.error = null;
          this.success = false;
          await this.courrierStore.createIncomingMail(this.form, this.file);
          this.success = true;
          this.form = {
            subject: '',
            sender: '',
            type: 'lettre',
            priority: 'moyenne',
            mail_date: '',
            arrival_date: '',
            entity: '',
            assigned_to: null,
          };
          this.file = null;
          this.$refs.fileInput.value = '';
        } catch (err) {
          this.error = err.response?.data?.error || 'Erreur lors de l’ajout du courrier';
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .add-mail-container {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input,
  select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #218838;
  }
  .error {
    color: red;
    margin-top: 10px;
  }
  .success {
    color: green;
    margin-top: 10px;
  }
  </style>