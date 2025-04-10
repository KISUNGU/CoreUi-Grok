<template>
    <CCard>
      <CCardHeader>
        <h2>Gestion des Rôles</h2>
      </CCardHeader>
      <CCardBody>
        <CTable :items="users" :columns="fields" striped hover>
          <template #role="{ item }">
            <td>
              <CBadge :color="item.role === 'admin' ? 'danger' : 'info'">{{ item.role }}</CBadge>
            </td>
          </template>
          <template #actions="{ item }">
            <td>
              <CButton color="primary" size="sm" @click="toggleRole(item.id)">
                {{ item.role === 'admin' ? 'Rétrograder' : 'Promouvoir' }}
              </CButton>
            </td>
          </template>
        </CTable>
      </CCardBody>
    </CCard>
  </template>
  
  <script>
  import { defineComponent, computed } from 'vue';
  import { useCourrierStore } from '../../stores/courrier';
  import { CCard, CCardHeader, CCardBody, CTable, CBadge, CButton } from '@coreui/vue';
  
  export default defineComponent({
    name: 'Roles',
    components: {
      CCard,
      CCardHeader,
      CCardBody,
      CTable,
      CBadge,
      CButton,
    },
    setup() {
      const store = useCourrierStore();
      store.fetchUsers();
  
      const users = computed(() => store.getUsers);
  
      return {
        users,
        toggleRole: (id) => {
          const user = store.getUsers.find(u => u.id === id);
          const newRole = user.role === 'admin' ? 'user' : 'admin';
          store.updateUserRole({ id, role: newRole });
        },
      };
    },
    data() {
      return {
        fields: [
          { key: 'name', label: 'Nom' },
          { key: 'role', label: 'Rôle' },
          { key: 'actions', label: 'Actions' },
        ],
      };
    },
  });
  </script>