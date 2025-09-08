<template>
  <CSidebar
    class="ai-sidebar shadow d-flex flex-column"
    position="fixed"
    placement="end"
    :visible="visible"
    @visible-change="(val) => emit('update:visible', val)"
    backdrop
  >
    <CSidebarHeader class="d-flex justify-content-between align-items-center px-3 py-2 bg-primary text-white">
      <h5 class="mb-0">Assistant IA</h5>
      <CCloseButton class="btn-close-white" @click="emit('update:visible', false)" />
    </CSidebarHeader>

    <div class="sidebar-body flex-grow-1 d-flex flex-column">
      <div class="messages-display" ref="chatContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.type]">
          {{ msg.text }}
        </div>
        <div v-if="isLoading" class="message-bubble bot loading">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="chat-input-area">
        <input
          type="text"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Écrivez votre message..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading">Envoyer</button>
      </div>
    </div>
  </CSidebar>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'; // Ajout de 'watch' pour la visibilité de la sidebar
import { CSidebar, CSidebarHeader, CCloseButton } from '@coreui/vue';

const emit = defineEmits(['update:visible']);
const props = defineProps({ visible: Boolean }); // Prop pour contrôler la visibilité de la sidebar

const messages = ref([
  { type: 'bot', text: 'Bonjour 👋! Je suis votre assistant IA. Que puis-je faire pour vous ?' }
]);
const newMessage = ref('');
const isLoading = ref(false);

const chatContainer = ref(null); // Ref pour le conteneur de messages

const sendMessage = async () => {
  if (newMessage.value.trim() === '') return;

  const userMessage = newMessage.value.trim();
  messages.value.push({ type: 'user', text: userMessage });
  newMessage.value = '';

  isLoading.value = true;
  await nextTick();
  scrollToBottom();

  try {
    const response = await fetch('https://bibleon.app.n8n.cloud/webhook/4c6236c6-7e3c-4107-b52a-f6e4d6fcbae7/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.response || data.text || 'Désolé, je n\'ai pas pu obtenir de réponse.';
    messages.value.push({ type: 'bot', text: botResponse });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message à n8n:', error);
    messages.value.push({ type: 'bot', text: 'Désolé, une erreur est survenue lors de la communication avec l\'IA.' });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// Initialisation du défilement au bas si la sidebar devient visible et contient des messages
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}, { immediate: true }); // Exécute le watcher au montage initial

</script>

<style scoped>
.ai-sidebar {
  width: 400px;
  background-color: #fff;
  z-index: 1200; /* Assurez-vous qu'il est au-dessus du reste du contenu */
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-body {
  flex-grow: 1; /* Permet à la zone de chat de remplir l'espace disponible */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Important pour gérer le défilement interne */
  padding: 0; /* Pas de padding ici, le chat gère son propre padding */
}

/* Styles pour l'interface de chat personnalisée (reprises de la proposition précédente) */
.messages-display {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex; /* Utiliser flexbox pour les bulles de message */
  flex-direction: column;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 10px;
  max-width: 80%;
  word-wrap: break-word;
  font-size: 0.9em;
  line-height: 1.4;
}

.message-bubble.user {
  background-color: #007bff;
  color: white;
  align-self: flex-end; /* Aligne à droite */
  margin-left: auto;
}

.message-bubble.bot {
  background-color: #ffffff;
  color: #333;
  align-self: flex-start; /* Aligne à gauche */
  margin-right: auto;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.chat-input-area {
  display: flex;
  padding: 15px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.chat-input-area input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 1em;
}

.chat-input-area button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.chat-input-area button:hover {
  background-color: #0056b3;
}

.chat-input-area button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Styles pour l'indicateur de chargement */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  background-color: #e0e0e0;
  color: #555;
  border-radius: 20px;
  width: fit-content;
}

.loading span {
  animation: bounce 1s infinite;
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #555;
  border-radius: 50%;
}

.loading span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
}

.btn-close-white {
  filter: invert(1);
}
</style>