// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useCourrierStore } from '../stores/courrier';

const routes = [
  { path: '/login', component: () => import('../views/pages/Login.vue') },
  { path: '/', redirect: '/courriers-entrants/reception' },
  // Courriers Entrants
  { path: '/courriers-entrants/enregistrement', component: () => import('../features/courriers-entrants/Enregistrement.vue') },
  { path: '/courriers-entrants/reception', component: () => import('../features/courriers-entrants/Reception.vue') },
  { path: '/courriers-entrants/tri', component: () => import('../features/courriers-entrants/Tri.vue') },
  { path: '/courriers-entrants/analyse', component: () => import('../features/courriers-entrants/Analyse.vue') },
  { path: '/courriers-entrants/details', component: () => import('../features/courriers-entrants/Details.vue') },
  { path: '/courriers-entrants/affectation', component: () => import('../features/courriers-entrants/Affectation.vue') },
  { path: '/courriers-entrants/suivi', component: () => import('../features/courriers-entrants/Suivi.vue') },
  { path: '/courriers-entrants/archivage', component: () => import('../features/courriers-entrants/Archivage.vue') },

  // Courriers Sortants
  { path: '/courriers-sortants/redaction', component: () => import('../features/courriers-sortants/Redaction.vue') },
  { path: '/courriers-sortants/validation', component: () => import('../features/courriers-sortants/Validation.vue') },
  { path: '/courriers-sortants/envoi', component: () => import('../features/courriers-sortants/Envoi.vue') },

  // Administration
  { path: '/administration/utilisateurs', component: () => import('../features/administration/Utilisateurs.vue'), meta: { requiresRole: 'admin' } },
  { path: '/administration/planification', component: () => import('../features/administration/Planification.vue'), meta: { requiresRole: 'admin' } },

  // Paramètres
  { path: '/parametres/configuration', component: () => import('../features/parametres/Configuration.vue') },

  // Ajout des routes pour Dashboard, AddIncomingMail, et IncomingMails
  { path: '/dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/add-incoming-mail', component: () => import('../views/AddIncomingMail.vue') },
  { path: '/incoming-mails', component: () => import('../views/IncomingMails.vue') },

  // Pages par défaut
  { path: '/:pathMatch(.*)*', component: () => import('../views/pages/Page404.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useCourrierStore();
  if (to.path !== '/login' && !store.isAuthenticated) {
    return next('/login');
  }
  const requiredRole = to.meta.requiresRole;
  if (requiredRole && !store.hasRole(requiredRole)) {
    return next('/courriers-entrants/reception');
  }
  next();
});

export default router;