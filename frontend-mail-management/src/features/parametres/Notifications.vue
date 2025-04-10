<template>
    <CCard>
      <CCardHeader>
        <h2>Paramètres de Notifications</h2>
      </CCardHeader>
      <CCardBody>
        <CForm>
          <CFormCheck
            id="emailNotif"
            v-model="settings.emailNotifications"
            label="Activer les notifications par email"
            class="mb-3"
          />
          <CInputGroup class="mb-3">
            <CFormInput v-model="settings.email" placeholder="Adresse email pour notifications" />
          </CInputGroup>
          <CButton color="primary" @click="saveSettings">Sauvegarder</CButton>
        </CForm>
      </CCardBody>
    </CCard>
  </template>
  
  <script>
  import { defineComponent, computed } from 'vue';
  import { useCourrierStore } from '../../stores/courrier';
  import { CCard, CCardHeader, CCardBody, CForm, CFormCheck, CInputGroup, CFormInput, CButton } from '@coreui/vue';
  
  export default defineComponent({
    name: 'Notifications',
    components: {
      CCard,
      CCardHeader,
      CCardBody,
      CForm,
      CFormCheck,
      CInputGroup,
      CFormInput,
      CButton,
    },
    setup() {
      const store = useCourrierStore();
      store.fetchSettings();
  
      const settings = computed({
        get: () => ({
          emailNotifications: store.getSettings.emailNotifications === '1',
          email: store.getSettings.email || '',
        }),
        set: (value) => store.updateSettings({
          emailNotifications: value.emailNotifications ? '1' : '0',
          email: value.email,
        }),
      });
  
      return {
        settings,
        saveSettings: () => store.updateSettings({
          emailNotifications: settings.value.emailNotifications ? '1' : '0',
          email: settings.value.email,
        }),
      };
    },
  });
  </script>