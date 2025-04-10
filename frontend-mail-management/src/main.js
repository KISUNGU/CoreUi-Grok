import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import '@coreui/coreui/dist/css/coreui.min.css';
import './styles/custom/main.scss';
import { CIcon } from '@coreui/icons-vue';
import * as icons from '@coreui/icons';

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.component('CIcon', CIcon);
app.provide('icons', icons);
app.mount('#app');