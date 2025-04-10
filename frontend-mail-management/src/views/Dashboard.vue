<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <!-- En-tête -->
    <CRow class="mb-4">
      <CCol>
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble des courriers entrants et sortants</p>
        <CButton color="primary" class="mr-2" to="/incoming-mails">Voir les courriers entrants</CButton>
        <CButton color="success" to="/add-incoming-mail">Ajouter un courrier entrant</CButton>
      </CCol>
    </CRow>

    <!-- Filtres -->
    <CRow class="mb-4">
      <CCol md="4">
        <CFormLabel>Période</CFormLabel>
        <CFormSelect v-model="selectedPeriod" @change="fetchData">
          <option value="last30days">Derniers 30 jours</option>
          <option value="last6months">Derniers 6 mois</option>
          <option value="lastYear">Dernière année</option>
        </CFormSelect>
      </CCol>
    </CRow>

    <!-- Statistiques globales -->
    <CRow class="mb-4">
      <CCol md="3">
        <CCard class="stat-card">
          <CCardBody>
            <h5>Total Courriers Entrants</h5>
            <h3>{{ stats.totalIncoming }}</h3>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="3">
        <CCard class="stat-card">
          <CCardBody>
            <h5>Total Courriers Sortants</h5>
            <h3>{{ stats.totalOutgoing }}</h3>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="3">
        <CCard class="stat-card">
          <CCardBody>
            <h5>Courriers en Attente</h5>
            <h3>{{ stats.pendingValidation }}</h3>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="3">
        <CCard class="stat-card">
          <CCardBody>
            <h5>Courriers Archivés</h5>
            <h3>{{ stats.archived }}</h3>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Graphiques -->
    <CRow>
      <!-- Graphique : Courriers entrants par période -->
      <CCol md="6">
        <CCard>
          <CCardHeader>
            <h4>Courriers Entrants par Période</h4>
          </CCardHeader>
          <CCardBody>
            <Chart type="line" :data="incomingByPeriodData" :options="chartOptions" />
          </CCardBody>
        </CCard>
      </CCol>
      <!-- Graphique : Courriers par statut -->
      <CCol md="6">
        <CCard>
          <CCardHeader>
            <h4>Courriers Entrants par Statut</h4>
          </CCardHeader>
          <CCardBody>
            <Chart type="pie" :data="incomingByStatusData" :options="chartOptions" />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { ref } from 'vue';
import Chart from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormLabel,
  CFormSelect,
  CButton,
} from '@coreui/vue';
import { useCourrierStore } from '../stores/courrier';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

export default {
  name: 'Dashboard',
  components: {
    Chart,
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CFormLabel,
    CFormSelect,
    CButton,
  },
  setup() {
    const courrierStore = useCourrierStore();
    const selectedPeriod = ref('last30days');
    const stats = ref({
      totalIncoming: 0,
      totalOutgoing: 0,
      pendingValidation: 0,
      archived: 0,
    });
    const incomingByPeriodData = ref({
      labels: [],
      datasets: [
        {
          label: 'Courriers Entrants',
          backgroundColor: '#007bff',
          borderColor: '#007bff',
          data: [],
          fill: false,
        },
      ],
    });
    const incomingByStatusData = ref({
      labels: ['Nouveau', 'En attente de validation', 'Validé'],
      datasets: [
        {
          label: 'Statut',
          backgroundColor: ['#007bff', '#ffc107', '#28a745'],
          data: [0, 0, 0],
        },
      ],
    });
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
    };

    const fetchData = async () => {
      try {
        await courrierStore.fetchIncomingMails();
        await courrierStore.fetchOutgoingMails();

        const incomingMails = courrierStore.getIncomingMails;
        const outgoingMails = courrierStore.getOutgoingMails;

        stats.value.totalIncoming = incomingMails.length;
        stats.value.totalOutgoing = outgoingMails.length;
        stats.value.pendingValidation = incomingMails.filter(
          (mail) => mail.status === 'en attente de validation'
        ).length;
        stats.value.archived =
          incomingMails.filter((mail) => mail.archived).length +
          outgoingMails.filter((mail) => mail.archived).length;

        const now = new Date();
        let startDate;
        if (selectedPeriod.value === 'last30days') {
          startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (selectedPeriod.value === 'last6months') {
          startDate = new Date(now.setMonth(now.getMonth() - 6));
        } else {
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        }

        const filteredMails = incomingMails.filter((mail) => {
          const mailDate = new Date(mail.arrival_date);
          return mailDate >= startDate;
        });

        const periodLabels = [];
        const periodData = [];
        if (selectedPeriod.value === 'last30days') {
          for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            periodLabels.push(date.toISOString().split('T')[0]);
            const count = filteredMails.filter(
              (mail) => mail.arrival_date === date.toISOString().split('T')[0]
            ).length;
            periodData.push(count);
          }
        } else if (selectedPeriod.value === 'last6months') {
          for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            periodLabels.push(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
            const count = filteredMails.filter(
              (mail) =>
                new Date(mail.arrival_date).getMonth() === date.getMonth() &&
                new Date(mail.arrival_date).getFullYear() === date.getFullYear()
            ).length;
            periodData.push(count);
          }
        } else {
          for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            periodLabels.push(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
            const count = filteredMails.filter(
              (mail) =>
                new Date(mail.arrival_date).getMonth() === date.getMonth() &&
                new Date(mail.arrival_date).getFullYear() === date.getFullYear()
            ).length;
            periodData.push(count);
          }
        }

        incomingByPeriodData.value.labels = periodLabels;
        incomingByPeriodData.value.datasets[0].data = periodData;

        const statusCounts = {
          nouveau: 0,
          'en attente de validation': 0,
          validé: 0,
        };
        incomingMails.forEach((mail) => {
          if (mail.status === 'nouveau') statusCounts.nouveau++;
          else if (mail.status === 'en attente de validation') statusCounts['en attente de validation']++;
          else if (mail.status === 'validé') statusCounts.validé++;
        });
        incomingByStatusData.value.datasets[0].data = [
          statusCounts.nouveau,
          statusCounts['en attente de validation'],
          statusCounts.validé,
        ];
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();

    return {
      selectedPeriod,
      stats,
      incomingByPeriodData,
      incomingByStatusData,
      chartOptions,
      fetchData,
    };
  },
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.stat-card {
  text-align: center;
  background-color: #f8f9fa;
}
.stat-card h5 {
  color: #6c757d;
  margin-bottom: 10px;
}
.stat-card h3 {
  color: #007bff;
  font-size: 2rem;
}
.card-body {
  min-height: 300px;
}
</style>