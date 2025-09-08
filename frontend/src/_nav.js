export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    badge: {
      color: 'primary',
      text: 'NEW',
    },
  },
  {
    component: 'CNavTitle',
    name: 'Courriers',
  },
  {
    component: 'CNavGroup',
    name: 'Entrants',
    to: '/courrier-entrant',
    icon: 'cil-envelope-open',
    items: [
      {
        component: 'CNavItem',
        name: 'Acquisition',
        icon: 'cil-pencil',
        to: '/courrier-entrant/acquisition',
      },
      {
        component: 'CNavItem',
        name: 'Indexation',
        to: '/courrier-entrant/indexation',
      },
      {
        component: 'CNavItem',
        name: 'Traitement',
        to: '/courrier-entrant/traitement',
      },
      {
        component: 'CNavItem',
        name: 'Archivage',
        to: '/courrier-entrant/archivage',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Sortants',
    to: '/icons',
    icon: 'cilEnvelopeClosed',
    items: [
      {
        component: 'CNavItem',
        name: 'Envoi',
        to: '/courrier-sortant/envoi',
        icon: 'cibTelegramPlane',
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: 'CNavItem',
        name: 'Redaction',
        icon: 'cil-pencil',
        to: '/courrier-sortant/redaction',
      },
      {
        component: 'CNavItem',
        name: 'Validation',
        icon: 'cil-check-circle',
        to: '/courrier-sortant/validation',
      },
      {
        component: 'CNavItem',
        name: 'Tri',
        icon: 'cilLibraryBooks',
        to: '/courrier-sortant/tri',
      },
    ],
  },
  {
    component: 'CNavTitle',
    name: 'Theme',
  },
  {
    component: 'CNavItem',
    name: 'Correspondance Interne',
    to: '/theme/correspondanceinterne',
    icon: 'cilExitToApp',
  },
  {
    component: 'CNavItem',
    name: 'Correspondance Externe',
    to: '/theme/correspondanceexterne', 
    icon: 'cilExternalLink',
  },
  // {
  //   component: 'CNavItem',
  //   name: 'Documents juridiques',
  //   to: '/courrier-autre/documentsjuridiques',
  //   icon: 'cilBalanceScale',
  // },
  {
    component: 'CNavGroup',
    name: 'Ressources Humaines',
    to: '/courrier-rh/contrats',
    icon: 'cilContact',
    items: [
      {
        component: 'CNavItem',
        name: 'Contrats',
        to: '/courrier-rh/contrats',
      },
      {
        component: 'CNavItem',
        name: 'Dossiers du Personnel',
        to: '/courrier-rh/dossierspersonnels',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Fiances',
    to: '/courrier-finance',
    icon: 'cilCreditCard',
    items: [
      {
        component: 'CNavItem',
        name: 'Budget',
        icon: 'cilChartPie',
        to: '/courrier-finance/budget',
      },
      {
        component: 'CNavItem',
        name: 'Rapport Financier',
        to: '/courrier-finance/rapport-financier',
        icone: 'cilCash',
      },
      {
        component: 'CNavItem',
        name: 'Caisse',
        to: '/courrier-finance/caisse',
        icone: 'cilDollar',
      },
      {
        component: 'CNavItem',
        name: 'Trésorerie',
        to: '/courrier-finance/tresorerie',
        icone: 'cilCalculator',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Secrétariat',
    to: '/courrier-secretariat',
    icon: 'cil-envelope-open',
    items: [
      {
        component: 'CNavItem',
        name: 'Archivage Général',
        icon: 'cil-pencil',
        to: '/courrier-secretariat/archivage-general',
      },
      {
        component: 'CNavItem',
        name: 'Proces-Verbal',
        to: '/courrier-secretariat/proces-verbal',
      },
      {
        component: 'CNavItem',
        name: 'Annauaire',
        to: '/courrier-secretariat/annuaire',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Logistique',
    to: '/courrier-logistique',
    icon: 'cil-envelope-open',
    items: [
      {
        component: 'CNavItem',
        name: 'Gestion des équipements',
        icon: 'cil-pencil',
        to: '/courrier-logistique/gestion-equipements',
      },
      {
        component: 'CNavItem',
        name: 'Stocks',
        to: '/courrier-logistique/stocks',
      },
      {
        component: 'CNavItem',
        name: 'Transport et Déplacement',
        to: '/courrier-logistique/transportdeplacements',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Passation des Marchés',
    to: '/courrier-pm',
    icon: 'cil-envelope-open',
    items: [
      {
        component: 'CNavItem',
        name: 'Contrats',
        icon: 'cil-pencil',
        to: '/courrier-pm/contrats',
      },
      {
        component: 'CNavItem',
        name: 'Dossiers apples-offres',
        to: '/courrier-pm/appels-offres',
      },
      {
        component: 'CNavItem',
        name: 'Rapport attribution',
        to: '/courrier-pm/rapports-attribution',
      },
      
      {
        component: 'CNavItem',
        name: 'Planification Annuelle',
        to: '/courrier-pm/Planification',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Suivi et Evaluation',
    to: '/courrier-se',
    icon: 'cil-envelope-open',
    items: [
      {
        component: 'CNavItem',
        name: 'Indicateurs des performance',
        icon: 'cil-pencil',
        to: '/courrier-se/indicateurs-performance',
      },
      {
        component: 'CNavItem',
        name: 'Rapports Activités',
        to: '/courrier-se/rapports-activite',
      },
      {
        component: 'CNavItem',
        name: 'Evaluation Impacts',
        to: '/courrier-se/evaluation-impacts',
      },
    ],
  },
  {
    component: 'CNavItem',
    name: 'Widgets',
    to: '/widgets',
    icon: 'cil-calculator',
    badge: {
      color: 'primary',
      text: 'NEW',
      shape: 'pill',
    },
  },
  {
    component: 'CNavTitle',
    name: 'Extras',
  },
  {
    component: 'CNavGroup',
    name: 'Pages',
    to: '/pages',
    icon: 'cil-star',
    items: [
      {
        component: 'CNavItem',
        name: 'Login',
        to: '/pages/login',
      },
      {
        component: 'CNavItem',
        name: 'Register',
        to: '/pages/register',
      },
      {
        component: 'CNavItem',
        name: 'Error 404',
        to: '/pages/404',
      },
      {
        component: 'CNavItem',
        name: 'Error 500',
        to: '/pages/500',
      },
    ],
  },
]
