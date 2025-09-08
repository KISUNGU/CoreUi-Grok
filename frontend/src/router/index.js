import { h, resolveComponent } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue'
          ),
      },
      {
        path: '/theme',
        name: 'Theme',
        redirect: '/theme/typography',
      },
      {
        path: '/theme/correspondanceinterne',
        name: 'Correspondance Interne',
        component: () => import('@/views/theme/CorrespondanceInterne.vue'),
      },
      {
        path: '/theme/correspondanceexterne',
        name: 'Correspondance Externe',
        component: () => import('@/views/theme/CorrespondanceExterne.vue'),
      },
      {
        path: '/courrier',
        name: 'courrier',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-entrant/indexation',
        children: [
          {
            path: '/courrier-entrant/acquisition',
            name: 'Acquisition',
            component: () => import('@/views/courrier-entrant/Acquisition.vue'),
          },
          {
            path: '/courrier-entrant/indexation',
            name: 'Indexation',
            component: () => import('@/views/courrier-entrant/Indexation.vue'),
          },
          {
            path: '/courrier-entrant/traitement',
            name: 'Traitement',
            component: () => import('@/views/courrier-entrant/Traitement.vue'),
          },
          {
            path: '/courrier-entrant/archivage',
            name: 'Archivage',
            component: () => import('@/views/courrier-entrant/Archivage.vue'),
          },
          {
            path: '/courrier-entrant/navs',
            name: 'Navs',
            component: () => import('@/views/courrier-entrant/Navs.vue'),
          },
          {
            path: '/courrier-entrant/paginations',
            name: 'Paginations',
            component: () => import('@/views/courrier-entrant/Paginations.vue'),
          },
          {
            path: '/courrier-entrant/placeholders',
            name: 'Placeholders',
            component: () => import('@/views/courrier-entrant/Placeholders.vue'),
          },
          {
            path: '/courrier-entrant/popovers',
            name: 'Popovers',
            component: () => import('@/views/courrier-entrant/Popovers.vue'),
          },
          {
            path: '/courrier-entrant/progress',
            name: 'Progress',
            component: () => import('@/views/courrier-entrant/Progress.vue'),
          },
          {
            path: '/courrier-entrant/spinners',
            name: 'Spinners',
            component: () => import('@/views/courrier-entrant/Spinners.vue'),
          },
          {
            path: '/courrier-entrant/tables',
            name: 'Tables',
            component: () => import('@/views/courrier-entrant/Tables.vue'),
          },
          {
            path: '/courrier-entrant/tabs',
            name: 'Tabs',
            component: () => import('@/views/courrier-entrant/Tabs.vue'),
          },
          {
            path: '/courrier-entrant/tooltips',
            name: 'Tooltips',
            component: () => import('@/views/courrier-entrant/Tooltips.vue'),
          },
        ],
      },
      // {
      //   path: '/courrier-autre',
      //   name: 'Documents juridiques',
      //   component: () => import('@/views/courrier-autre/DocumentsJuriques.vue'),
      // },
      {
        path: '/courrier-sortant',
        name: 'Entrants',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-sortant/envoi',
        children: [
          {
            path: '/courrier-sortant/envoi',
            name: 'Envoi',
            component: () => import('@/views/courrier-sortant/Envoi.vue'),
          },
          {
            path: '/courrier-sortant/redaction',
            name: 'Redaction',
            component: () => import('@/views/courrier-sortant/Redaction.vue'),
          },
          {
            path: '/courrier-sortant/validation',
            name: 'Validation',
            component: () => import('@/views/courrier-sortant/Validation.vue'),
          },
          {
            path: '/courrier-sortant/tri',
            name: 'Tri',
            component: () => import('@/views/courrier-sortant/tri.vue'),
          },
        ],
      },
      {
        path: '/courrier-rh',
        name: 'Ressources Humaines',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-rh/contrats',
        children: [
          {
            path: '/courrier-rh/contrats',
            name: 'Contrats',
            component: () => import('@/views/courrier-rh/Contrats.vue'),
          },
          {
            path: '/courrier-rh/dossierspersonnels',
            name: 'Dossiers Personnels',
            component: () => import('@/views/courrier-rh/DossiersPersonnels.vue'),
          },
        ],
      },
      {
        path: '/courrier-finance',
        name: 'Finance',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-finance/budget',
        children: [
          {
            path: '/courrier-finance/rapport-financier',
            name: 'Rapport Financier',
            component: () => import('@/views/courrier-finance/RapportFinancier.vue'),
          },
          {
            path: '/courrier-finance/budget',
            name: 'Budget',
            component: () => import('@/views/courrier-finance/Budget.vue'),
          },
          {
            path: '/courrier-finance/caisse',
            name: 'Caisse',
            component: () => import('@/views/courrier-finance/Caisse.vue'),
          },
          {
            path: '/courrier-finance/tresorerie',
            name: 'Trésorerie',
            component: () => import('@/views/courrier-finance/Tresorerie.vue'),
          },
        ],
      },
      {
        path: '/courrier-secretariat',
        name: 'Secrétariat',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-secretariat/archivage-general',
        children: [
          {
            path: '/courrier-secretariat/archivage-general',
            name: 'Archivage Général',
            component: () => import('@/views/courrier-secretariat/ArchivageGeneral.vue'),
          },
          {
            path: '/courrier-secretariat/proces-verbal',
            name: 'Procès Verbal',
            component: () => import('@/views/courrier-secretariat/ProcesVerbal.vue'),
          },
          {
            path: '/courrier-secretariat/annuaire',
            name: 'Annauaire',
            component: () => import('@/views/courrier-secretariat/Annuaire.vue'),
          },
        ],
      },
      {
        path: '/courrier-logistique',
        name: 'Logistique',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-logistique/stocks',
        children: [
          {
            path: '/courrier-logistique/gestion-equipements',
            name: 'Gestion des équipements',
            component: () => import('@/views/courrier-logistique/GestionEquipements.vue'),
          },
          {
            path: '/courrier-logistique/stocks',
            name: 'Stocks',
            component: () => import('@/views/courrier-logistique/Stocks.vue'),
          },
          {
            path: '/courrier-logistique/transportdeplacements',
            name: 'Transport et Déplacements',
            component: () => import('@/views/courrier-logistique/TransportDeplacements.vue'),
          },
        ],
      },
      {
        path: '/courrier-pm',
        name: 'Passation des Marchés',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-pm/contrats',
        children: [
          {
            path: '/courrier-pm/appels-offres',
            name: 'Dossiers Appels-Offres',
            component: () => import('@/views/courrier-pm/AppelsOffres.vue'),
          },
          {
            path: '/courrier-pm/contrats',
            name: 'contrats',
            component: () => import('@/views/courrier-pm/Contrats.vue'),
          },
          {
            path: '/courrier-pm/rapports-attribution',
            name: 'Rapports Attribution',
            component: () => import('@/views/courrier-pm/RapportsAttribution.vue'),
          },
          
          {
            path: '/courrier-pm/planification',
            name: 'Planification Annuelle',
            component: () => import('@/views/courrier-pm/Planification.vue'),
          },
        ],
      },
      {
        path: '/courrier-se',
        name: 'Suivi et Évaluation',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/courrier-se/rapports-activite',
        children: [
          {
            path: '/courrier-se/indicateurs-performance',
            name: 'Indicateurs des performance',
            component: () => import('@/views/courrier-se/IndicateursPerformance.vue'),
          },
          {
            path: '/courrier-se/rapports-activite',
            name: 'Rapports Activités',
            component: () => import('@/views/courrier-se/RapportsActivite.vue'),
          },
          {
            path: '/courrier-se/evaluation-impacts',
            name: 'Evaluation Impacts',
            component: () => import('@/views/courrier-se/EvaluationImpacts.vue'),
          },
        ],
      },
      {
        path: '/widgets',
        name: 'Widgets',
        component: () => import('@/views/widgets/Widgets.vue'),
      },
    ],
  },
  {
    path: '/pages',
    redirect: '/pages/404',
    name: 'Pages',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: '404',
        name: 'Page404',
        component: () => import('@/views/pages/Page404'),
      },
      {
        path: '500',
        name: 'Page500',
        component: () => import('@/views/pages/Page500'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/pages/Login'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/pages/Register'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
