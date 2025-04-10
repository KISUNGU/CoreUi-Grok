export default {
  items: [
    {
      name: 'Gestion Courriers',
      url: '#',
      children: [
        {
          name: 'Courriers Entrants',
          children: [
            { name: 'Réception', url: '/courriers-entrants/reception' },
            { name: 'Tri', url: '/courriers-entrants/tri' },
            { name: 'Analyse', url: '/courriers-entrants/analyse' },
          ],
        },
        {
          name: 'Courriers Sortants',
          children: [
            { name: 'Rédaction', url: '/courriers-sortants/redaction' },
            { name: 'Validation', url: '/courriers-sortants/validation' },
          ],
        },
      ],
    },
    {
      name: 'Administration',
      url: '#',
      children: [
        { name: 'Utilisateurs', url: '/administration/utilisateurs' },
      ],
    },
  ],
};