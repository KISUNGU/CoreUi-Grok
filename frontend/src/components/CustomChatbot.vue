<script setup>
import { ref } from 'vue';

// Gestion du chat visible ou non
const chatVisible = ref(false);
const messages = ref([]); // Stocke les messages du chat
const userMessage = ref('');

// Fonction pour basculer l'affichage du chatbot
const toggleChat = () => {
  chatVisible.value = !chatVisible.value;
};

// Envoi de la requête à n8n
const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  // Ajoute le message utilisateur
  messages.value.push({ role: 'user', content: userMessage.value });

  try {
    const response = await fetch('https://bibleon.app.n8n.cloud/webhook/4c6236c6-7e3c-4107-b52a-f6e4d6fcbae7/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: userMessage.value }),
    });

    const data = await response.json();
    messages.value.push({ role: 'bot', content: data.result }); // Réponse du chatbot
  } catch (error) {
    messages.value.push({ role: 'bot', content: '⚠️ Erreur de connexion avec le chatbot.' });
  }

  userMessage.value = ''; // Reset input après envoi
};
</script>

<template>
  <div class="chatbot">
    <button class="chat-trigger" @click="toggleChat">💬 Chatbot</button>
    
    <div id="chat-container" v-if="chatVisible">
      <div class="chat-header">
        <h4>Assistant IA</h4>
        <button @click="toggleChat">❌ Fermer</button>
      </div>
      <div class="chat-body">
        <div v-for="msg in messages" :key="msg.content" :class="msg.role">
          <p>{{ msg.content }}</p>
        </div>
      </div>
      <div class="chat-input">
        <input v-model="userMessage" placeholder="Pose ta question..." />
        <button @click="sendMessage">Envoyer</button>
      </div>
    </div>
  </div>
</template>

<style>
.chat-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  padding: 12px 15px;
  border-radius: 50px;
  background-color: #007bff;
  color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

#chat-container {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 400px;
  height: 500px;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  background: #007bff;
  color: white;
  padding: 10px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.user {
  text-align: right;
  background: #d1e7ff;
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.bot {
  text-align: left;
  background: #f5f5f5;
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.chat-input {
  display: flex;
  border-top: 1px solid #ccc;
  padding: 10px;
}

.chat-input input {
  flex: 1;
  padding: 5px;
}

.chat-input button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px;
}
</style>
