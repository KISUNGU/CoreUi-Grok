<template>
    <div>
      <h2>Page non trouvée</h2>
      <p>La page demandée n'existe pas.</p>
      <router-link to="/">Retour au tableau de bord</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound',
  };
  </script>