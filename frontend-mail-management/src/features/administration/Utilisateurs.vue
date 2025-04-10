<template>
  <CCard>
    <CCardHeader>
      <h2>Gestion des Utilisateurs</h2>
    </CCardHeader>
    <CCardBody>
      <CTable :items="users" :columns="fields" striped hover>
        <template #role="{ item }">
          <td>
            <CBadge :color="item.role === 'admin' ? 'danger' : 'info'">{{ item.role }}</CBadge>
          </td>
        </template>
      </CTable>
    </CCardBody>
  </CCard>
</template>

<script>
import { defineComponent } from 'vue';
import { CCard, CCardHeader, CCardBody, CTable, CBadge } from '@coreui/vue';

export default defineComponent({
  name: 'Utilisateurs',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CTable,
    CBadge,
  },
  data() {
    return {
      users: [
        { id: 1, name: 'Jean Dupont', role: 'admin' },
        { id: 2, name: 'Marie Curie', role: 'user' },
      ],
      fields: [
        { key: 'name', label: 'Nom' },
        { key: 'role', label: 'Rôle' },
      ],
    };
  },
});
</script>