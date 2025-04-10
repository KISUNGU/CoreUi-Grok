<template>
    <CCard>
      <CCardHeader>Courriers Archivés</CCardHeader>
      <CCardBody>
        <CDataTable :items="archivedMails" :fields="fields">
          <template #status="{ item }">
            <td>
              <CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </template>
  
  <script>
  import { useCourrierStore } from '../stores/index';
  
  export default {
    setup() {
      const store = useCourrierStore();
      store.fetchArchivedMails();
  
      return {
        archivedMails: store.getArchivedMails,
        getBadgeColor(status) {
          return status === 'nouveau' ? 'success' : status === 'en cours' ? 'warning' : 'secondary';
        },
      };
    },
    data() {
      return {
        fields: ['subject', 'sender', 'status'], // Pas d'actions pour les archivés
      };
    },
  };
  </script>