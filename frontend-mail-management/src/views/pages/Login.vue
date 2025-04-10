
<!-- src/views/pages/Login.vue -->
<template>
  <div class="login-container">
    <h2>Connexion</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input
          id="username"
          v-model="username"
          placeholder="Entrez votre nom d'utilisateur"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Entrez votre mot de passe"
          required
        />
      </div>
      <button type="submit">Se connecter</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { useCourrierStore } from '../../stores/courrier';

export default {
  name: 'Login',
  setup() {
    const courrierStore = useCourrierStore();
    return { courrierStore };
  },
  data() {
    return {
      username: '',
      password: '',
      error: null,
    };
  },
  methods: {
    async handleLogin() {
      console.log('handleLogin called with:', this.username, this.password);
      try {
        this.error = null;
        await this.courrierStore.login(this.username, this.password);
        console.log('Login successful, redirecting to /courriers-entrants/reception');
        this.$router.push('/courriers-entrants/reception');
      } catch (err) {
        console.error('Login error:', err);
        this.error = err.response?.data?.error || 'Erreur lors de la connexion';
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
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
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>