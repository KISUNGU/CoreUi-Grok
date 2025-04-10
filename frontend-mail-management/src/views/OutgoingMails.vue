<template>
    <CCard>
      <CCardHeader>Courriers Sortants</CCardHeader>
      <CCardBody>
        <CDataTable :items="outgoingMails" :fields="fields">
          <template #status="{ item }">
            <td>
              <CBadge :color="getBadgeColor(item.status)">{{ item.status }}</CBadge>
            </td>
          </template>
          <template #actions="{ item }">
            <td>
              <CButton color="primary" @click="updateStatus(item.id, 'en cours')">En cours</CButton>
              <CButton color="warning" @click="archiveMail(item.id)">Archiver</CButton>
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
      store.fetchOutgoingMails();
  
      return {
        outgoingMails: store.getOutgoingMails,
        updateStatus: (id, status) => store.updateMail({ id, status }),
        archiveMail: (id) => store.updateMail({ id, archived: true }),
        getBadgeColor(status) {
          return status === 'nouveau' ? 'success' : status === 'en cours' ? 'warning' : 'secondary';
        },
      };
    },
    data() {
      return {
        fields: ['subject', 'recipient', 'status', 'actions'], // Ajuste les champs si nécessaire
      };
    },
  };
  </script>