<template>
  <div class="mb-4">
    <h3>Assistant IA</h3>
    <CInputGroup>
      <CFormInput
        v-model="query"
        placeholder="Posez une question..."
        @keyup.enter="sendQuery"
        aria-label="Champ de saisie pour poser une question à l'assistant IA"
      />
      <CButton color="primary" @click="sendQuery" aria-label="Envoyer la question">Envoyer</CButton>
    </CInputGroup>
    <CAlert v-if="error" color="danger" class="mt-2" aria-live="assertive">{{ error }}</CAlert>
    <div v-if="loading" class="mt-2" aria-live="polite">Chargement...</div>
    <div v-else-if="response" class="mt-2" aria-live="polite">{{ response }}</div>
    <CToast v-if="error" autohide :delay="5000" color="danger" class="mt-2">
  {{ error }}
</CToast>
    <CToast v-if="response" autohide :delay="5000" color="success" class="mt-2">
      {{ response }}
    </CToast>
    <CButton v-if="response" color="secondary" @click="response = ''" class="mt-2">Réinitialiser</CButton>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      query: '',
      response: '',
      loading: false,
      error: null,
    };
  },
  methods: {
    async sendQuery() {
      if (!this.query.trim()) {
        this.error = 'Veuillez entrer une question.';
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('http://localhost:3000/api/ai-query', { query: this.query });
        this.response = response.data.result;
        this.$emit('query-response', this.response);
        this.query = '';
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors de la requête IA. Veuillez réessayer.';
        console.error('Erreur AI Assistant:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.text-danger {
  color: #dc3545;
}
@media (forced-colors: active) {
  .text-danger {
    forced-color-adjust: none;
    color: CanvasText !important;
  }
  .c-button {
    background-color: ButtonFace !important;
    color: ButtonText !important;
    border: 1px solid ButtonBorder !important;
  }
}
</style>