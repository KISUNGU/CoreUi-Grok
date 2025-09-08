<script setup>
import { ref, onMounted } from 'vue'
import { useColorModes, CButton } from '@coreui/vue'
import CIcon from '@coreui/icons-vue'

import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import AppHeaderDropdownAccnt from '@/components/AppHeaderDropdownAccnt.vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import AiAssistant from '@/components/assistant/AIAssistant.vue'

const sidebar = useSidebarStore()
const { colorMode, setColorMode } = useColorModes('coreui-free-vue-admin-template-theme')
const headerClassNames = ref('mb-4 p-0')
const showAISidebar = ref(false)

onMounted(() => {
  document.addEventListener('scroll', () => {
    headerClassNames.value = document.documentElement.scrollTop > 0
      ? 'mb-4 p-0 shadow-sm'
      : 'mb-4 p-0'
  })
})
</script>

<template>
  <CHeader position="sticky" :class="headerClassNames">
    <CContainer class="border-bottom px-4" fluid>
      <CHeaderToggler @click="sidebar.toggleVisible()" style="margin-inline-start: -14px">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>

      <CHeaderNav class="d-none d-md-flex">
        <CNavItem><CNavLink href="/dashboard">Dashboard</CNavLink></CNavItem>
        <CNavItem><CNavLink href="#">Users</CNavLink></CNavItem>
        <CNavItem><CNavLink href="#">Settings</CNavLink></CNavItem>
      </CHeaderNav>

      <CHeaderNav class="ms-auto">
        <CNavItem><CNavLink href="#"><CIcon icon="cil-bell" size="lg" /></CNavLink></CNavItem>
        <CNavItem><CNavLink href="#"><CIcon icon="cil-list" size="lg" /></CNavLink></CNavItem>
        <CNavItem><CNavLink href="#"><CIcon icon="cil-envelope-open" size="lg" /></CNavLink></CNavItem>

        <li class="nav-item py-1"><div class="vr h-100 mx-2 text-body text-opacity-75"></div></li>

        <CDropdown variant="nav-item" placement="bottom-end">
          <CDropdownToggle :caret="false">
            <CIcon v-if="colorMode === 'dark'" icon="cil-moon" size="lg" />
            <CIcon v-else-if="colorMode === 'light'" icon="cil-sun" size="lg" />
            <CIcon v-else icon="cil-contrast" size="lg" />
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem :active="colorMode === 'light'" component="button" @click="setColorMode('light')">
              <CIcon class="me-2" icon="cil-sun" size="lg" /> Light
            </CDropdownItem>
            <CDropdownItem :active="colorMode === 'dark'" component="button" @click="setColorMode('dark')">
              <CIcon class="me-2" icon="cil-moon" size="lg" /> Dark
            </CDropdownItem>
            <CDropdownItem :active="colorMode === 'auto'" component="button" @click="setColorMode('auto')">
              <CIcon class="me-2" icon="cil-contrast" size="lg" /> Auto
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

        <li class="nav-item py-1"><div class="vr h-100 mx-2 text-body text-opacity-75"></div></li>
        <AppHeaderDropdownAccnt />
      </CHeaderNav>
    </CContainer>

    <CContainer class="px-4" fluid>
      <AppBreadcrumb />
    </CContainer>

    <AiAssistant :visible="showAISidebar" @update:visible="showAISidebar = $event" />
  </CHeader>
</template>
