<template>
  <div class="wrapper d-flex flex-column min-vh-100 bg-light">
    <AppHeader />
    <div class="body flex-grow-1">
      <CContainer fluid class="d-flex">
        <AppSidebar />
        <div class="content flex-grow-1 p-3">
          <router-view />
        </div>
      </CContainer>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { CContainer } from '@coreui/vue';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';
import AppFooter from '../components/AppFooter.vue';

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    CContainer,
    AppHeader,
    AppSidebar,
    AppFooter,
  },
});
</script>

<style scoped>
.content {
  background: #fff;
}
</style>