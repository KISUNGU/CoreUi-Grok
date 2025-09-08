import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@n8n/chat/style.css';
import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import '@coreui/icons/css/all.min.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// import DocsComponents from '@/components/DocsComponents'
// import DocsExample from '@/components/DocsExample'
// import DocsIcons from '@/components/DocsIcons'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)
// app.component('DocsComponents', DocsComponents)
// app.component('DocsExample', DocsExample)
// app.component('DocsIcons', DocsIcons)

app.mount('#app')
