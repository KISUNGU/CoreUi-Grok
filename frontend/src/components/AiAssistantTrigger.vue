<template>
  <div>
    <div class="ai-trigger-icon" @click="toggleSidebar">
      <img src="@/assets/images/ai-icon.gif" alt="Assistant IA" class="icon-img" />
      </div>

    <AiAssistant :visible="assistantVisible" @update:visible="assistantVisible = $event" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AiAssistant from './assistant/AiAssistant.vue'; // Assurez-vous que le chemin est correct

const assistantVisible = ref(false);

const toggleSidebar = () => {
  assistantVisible.value = !assistantVisible.value;
};
</script>

<style scoped>
.ai-trigger-icon {
  position: fixed;
  bottom: 30px; /* Ajustez la position */
  right: 30px; /* Ajustez la position */
  width: 60px; /* Taille de l'icône */
  height: 60px; /* Taille de l'icône */
  background-color: #007bff;
  border-radius: 50%; /* Icône ronde */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1100; /* Moins que la sidebar (1200), mais au-dessus du contenu */
  transition: transform 0.2s ease-in-out;
}

.ai-trigger-icon:hover {
  transform: scale(1.05);
}

.icon-img {
  width: 30px; /* Taille de l'image à l'intérieur du cercle */
  height: 30px;
  filter: invert(1); /* Si votre icône est noire, cela la rendra blanche */
}
</style>