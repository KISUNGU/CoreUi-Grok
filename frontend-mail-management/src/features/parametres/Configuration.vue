<template>
  <CCard>
    <CCardHeader>
      <h2>Configuration</h2>
    </CCardHeader>
    <CCardBody>
      <CForm>
        <CInputGroup class="mb-3">
          <CFormInput v-model="config.email" placeholder="Adresse email par défaut" />
        </CInputGroup>
        <CButton color="primary" @click="saveConfig">Sauvegarder</CButton>
      </CForm>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent } from 'vue';
import { CCard, CCardHeader, CCardBody, CButton, CForm, CInputGroup, CFormInput } from '@coreui/vue';

export default defineComponent({
  name: 'Configuration',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CButton,
    CForm,
    CInputGroup,
    CFormInput,
  },
  data() {
    return {
      config: {
        email: 'admin@example.com',
      },
    };
  },
  methods: {
    saveConfig() {
      console.log('Configuration sauvegardée:', this.config);
    },
  },
});
</script>