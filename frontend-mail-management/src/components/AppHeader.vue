<template>
  <CHeader position="sticky" class="mb-4 bg-primary text-white">
    <CContainer fluid>
      <span>ArchivaCourrier</span>
      <CHeaderNav class="ms-auto">
        <CDropdown variant="nav-item">
          <CDropdownToggle caret>Admin</CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem @click="logout">Déconnexion</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CHeaderNav>
    </CContainer>
  </CHeader>
</template>

<script>
import { defineComponent } from 'vue';
import { CHeader, CContainer, CHeaderNav, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/vue';

export default defineComponent({
  components: {
    CHeader,
    CContainer,
    CHeaderNav,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
  },
  methods: {
    logout() {
      this.$router.push('/login');
    },
  },
});
</script>