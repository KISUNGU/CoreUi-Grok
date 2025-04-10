<template>
  <CCard>
    <CCardHeader>
      <h2>Planification</h2>
    </CCardHeader>
    <CCardBody>
      <CForm>
        <CInputGroup class="mb-3">
          <CFormInput v-model="task" placeholder="Nouvelle tâche" />
          <CButton color="primary" @click="addTask">Ajouter</CButton>
        </CInputGroup>
      </CForm>
      <CTable :items="tasks" :columns="fields" striped hover />
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent } from 'vue';
import { CCard, CCardHeader, CCardBody, CTable, CButton, CForm, CInputGroup, CFormInput } from '@coreui/vue';

export default defineComponent({
  name: 'Planification',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CTable,
    CButton,
    CForm,
    CInputGroup,
    CFormInput,
  },
  data() {
    return {
      task: '',
      tasks: [
        { id: 1, name: 'Réviser courriers', date: '2025-04-10' },
      ],
      fields: [
        { key: 'name', label: 'Tâche' },
        { key: 'date', label: 'Date' },
      ],
    };
  },
  methods: {
    addTask() {
      if (this.task) {
        this.tasks.push({ id: this.tasks.length + 1, name: this.task, date: new Date().toISOString().split('T')[0] });
        this.task = '';
      }
    },
  },
});
</script>