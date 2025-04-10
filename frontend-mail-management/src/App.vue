
<template>
  <div id="app">
    <div class="sidebar" :class="{ collapsed: !sidebarVisible }">
      <div class="sidebar-brand">
        <CIcon icon="cil-applications" size="lg" class="me-2" />
        Gestion Courrier
      </div>
      <ul class="sidebar-nav">
        <!-- Lien Dashboard -->
        <li>
          <router-link to="/dashboard">
            <CIcon icon="cil-speedometer" class="me-2" /> Dashboard
          </router-link>
        </li>
        <li class="nav-title">Gestion des Courriers</li>
        <li class="nav-group" :class="{ active: $route.path.includes('courriers-entrants') }">
          <span @click="toggleGroup('entrants')">
            <CIcon icon="cil-inbox" class="me-2" /> Courriers Entrants
          </span>
          <ul v-if="groups.entrants" class="nav-sub">
            <li><router-link to="/add-incoming-mail"><CIcon icon="cil-plus" class="me-2" />Ajouter un courrier</router-link></li>
            <li><router-link to="/incoming-mails"><CIcon icon="cil-inbox" class="me-2" />Liste des courriers entrants</router-link></li>
            <li><router-link to="/courriers-entrants/enregistrement"><CIcon icon="cil-plus" class="me-2" />Enregistrement</router-link></li>
            <li><router-link to="/courriers-entrants/reception"><CIcon icon="cil-input" class="me-2" />Réception</router-link></li>
            <li><router-link to="/courriers-entrants/tri"><CIcon icon="cil-filter" class="me-2" />Tri</router-link></li>
            <li><router-link to="/courriers-entrants/analyse"><CIcon icon="cil-chart" class="me-2" />Analyse</router-link></li>
            <li><router-link to="/courriers-entrants/details"><CIcon icon="cil-user-follow" class="me-2" />Details</router-link></li>
            <li><router-link to="/courriers-entrants/affectation"><CIcon icon="cil-user-follow" class="me-2" />Affectation</router-link></li>
            <li><router-link to="/courriers-entrants/suivi"><CIcon icon="cil-task" class="me-2" />Suivi</router-link></li>
            <li><router-link to="/courriers-entrants/archivage"><CIcon icon="cil-folder" class="me-2" />Archivage</router-link></li>
            <li><router-link to="/courriers-entrants/historique"><CIcon icon="cil-history" class="me-2" />Historique</router-link></li>
          </ul>
        </li>
        <li class="nav-group" :class="{ active: $route.path.includes('courriers-sortants') }">
          <span @click="toggleGroup('sortants')">
            <CIcon icon="cil-send" class="me-2" /> Courriers Sortants
          </span>
          <ul v-if="groups.sortants" class="nav-sub">
            <li><router-link to="/courriers-sortants/redaction"><CIcon icon="cil-pencil" class="me-2" />Rédaction</router-link></li>
            <li><router-link to="/courriers-sortants/validation"><CIcon icon="cil-check" class="me-2" />Validation</router-link></li>
            <li><router-link to="/courriers-sortants/envoi"><CIcon icon="cil-paper-plane" class="me-2" />Envoi</router-link></li>
            <li><router-link to="/courriers-sortants/statistiques"><CIcon icon="cil-bar-chart" class="me-2" />Statistiques</router-link></li>
          </ul>
        </li>
        <li class="nav-title">Administration</li>
        <li class="nav-group" :class="{ active: $route.path.includes('administration') }">
          <span @click="toggleGroup('admin')">
            <CIcon icon="cil-shield-alt" class="me-2" /> Admin
          </span>
          <ul v-if="groups.admin" class="nav-sub">
            <li><router-link to="/administration/base-donnees"><CIcon icon="cil-database" class="me-2" />Base de Données</router-link></li>
            <li><router-link to="/administration/roles"><CIcon icon="cil-lock-locked" class="me-2" />Rôles</router-link></li>
          </ul>
        </li>
        <li class="nav-title">Paramètres</li>
        <li>
          <router-link to="/parametres/notifications">
            <CIcon icon="cil-bell" class="me-2" /> Notifications
          </router-link>
        </li>
      </ul>
    </div>
    <div class="wrapper">
      <div class="header header-sticky mb-4 p-0">
        <header class="header">
          <CButton color="light" @click="logout" class="float-end">
            <CIcon icon="cil-account-logout" /> Déconnexion
          </CButton>
          <CDropdown alignment="end" class="float-end me-3">
            <CDropdownToggle color="light">
              <CIcon icon="cil-bell" />
              <CBadge color="danger" v-if="recentActions && recentActions.length">
                {{ recentActions.length }}
              </CBadge>
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem v-for="action in recentActions" :key="action.id">
                {{ action.user_name }} a {{ action.action }} un courrier ({{ action.mail_type }}) - {{ action.action_date }}
              </CDropdownItem>
              <CDropdownDivider v-if="recentActions.length" />
              <CDropdownItem @click="clearNotifications">Effacer</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </header>
      </div>
      <main class="content">
        <router-view />
      </main>
      <footer class="footer">
        <span>© 2025 - Gestion Courrier</span>
      </footer>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue';
import { useCourrierStore } from './stores/courrier';
import { useRouter } from 'vue-router';
import { CIcon, CButton, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider, CBadge } from '@coreui/vue';

export default {
  name: 'App',
  components: {
    CIcon,
    CButton,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CDropdownDivider,
    CBadge,
  },
  setup() {
    const store = useCourrierStore();
    const router = useRouter();

    const sidebarVisible = ref(true);
    const groups = reactive({
      entrants: true,
      sortants: true,
      admin: true,
    });

    const toggleGroup = (group) => {
      groups[group] = !groups[group];
    };

    const toggleSidebar = () => {
      sidebarVisible.value = !sidebarVisible.value;
    };

    const logout = () => {
      store.logout();
      router.push('/login');
    };

    // Récupération des actions récentes
    store.fetchRecentActions();
    const recentActions = computed(() => store.getRecentActions || []);

    const clearNotifications = () => {
      store.clearRecentActions();
    };

    return {
      groups,
      toggleGroup,
      toggleSidebar,
      sidebarVisible,
      logout,
      recentActions,
      clearNotifications,
    };
  },
};
</script>
<style scoped>
/* Styles existants + ajouts */
.nav-group.active {
  background-color: #e9ecef;
}
.nav-sub a.router-link-active {
  color: #007bff;
  font-weight: bold;
}

#app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 0;
  overflow: hidden;
}

.sidebar-brand {
  font-size: 1.5rem;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-title {
  font-size: 0.9rem;
  color: #6c757d;
  padding: 10px 20px;
  text-transform: uppercase;
}

.nav-group {
  cursor: pointer;
  padding: 10px 20px;
}

.nav-group span {
  display: flex;
  align-items: center;
}

.nav-group.active {
  background-color: #f8f9fa;
  font-weight: bold;
}

.nav-sub {
  list-style: none;
  padding-left: 30px;
}

.nav-sub li {
  padding: 5px 0;
}

.nav-sub a {
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
}

.nav-sub a:hover {
  color: #007bff;
}

.nav-sub a.router-link-active {
  color: #007bff;
  font-weight: bold;
}

.wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header.header-sticky {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
}

.header-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
}

.header-nav .nav-item {
  margin: 0 10px;
}

.header-nav .nav-link {
  color: #333;
  text-decoration: none;
  padding: 10px;
}

.header-nav .nav-link:hover {
  color: #007bff;
}

.header-nav .nav-link.router-link-active {
  color: #007bff;
  font-weight: bold;
}

.header-toggler {
  background: none;
  border: none;
  padding: 10px;
}

.icon {
  width: 24px;
  height: 24px;
}

.avatar.avatar-md {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  flex: 1;
  padding: 20px;
}

.footer {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.breadcrumb {
  margin: 0;
  padding: 10px 0;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item.active span {
  color: #6c757d;
}
</style>