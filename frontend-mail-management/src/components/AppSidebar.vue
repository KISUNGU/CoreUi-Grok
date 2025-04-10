<template>
  <CSidebar :visible="sidebarState" class="bg-dark text-white">
    <CSidebarNav>
      <CNavItem v-for="item in navItems" :key="item.name" :href="item.url">
        {{ item.name }}
        <CNavGroup v-if="item.children">
          <CNavItem v-for="child in item.children" :key="child.name" :href="child.url">
            {{ child.name }}
          </CNavItem>
        </CNavGroup>
      </CNavItem>
    </CSidebarNav>
  </CSidebar>
</template>

<script>
import { defineComponent } from 'vue';
import { CSidebar, CSidebarNav, CNavItem, CNavGroup } from '@coreui/vue';
import { useSidebarStore } from '../stores/sidebar';
import nav from '../_nav';

export default defineComponent({
  components: {
    CSidebar,
    CSidebarNav,
    CNavItem,
    CNavGroup,
  },
  setup() {
    const sidebarStore = useSidebarStore();
    return {
      sidebarState: sidebarStore.sidebarState,
      toggleSidebar: sidebarStore.toggleSidebar,
    };
  },
  data() {
    return {
      navItems: nav.items,
    };
  },
});
</script>