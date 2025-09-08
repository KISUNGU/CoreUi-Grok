```vue
<template>
  <div>
    <h2>Tableau de Bord</h2>
    <AIAssistant @query-response="handleAIResponse" />
    <WidgetsStatsA class="mb-4" :stats="dashboardStats" />
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardBody>
            <CRow>
              <CCol :sm="5">
                <h4 id="traffic" class="card-title mb-0">Traffic</h4>
                <div class="small text-body-secondary">Données récentes</div>
              </CCol>
              <CCol :sm="7" class="d-none d-md-block">
                <CButton color="primary" class="float-end" @click="downloadReport">
                  <CIcon icon="cil-cloud-download" />
                </CButton>
                <CButtonGroup
                  class="float-end me-3"
                  role="group"
                  aria-label="Période de filtrage"
                >
                  <CButton color="secondary" variant="outline" @click="filterBy('day')">Jour</CButton>
                  <CButton color="secondary" variant="outline" active @click="filterBy('month')">Mois</CButton>
                  <CButton color="secondary" variant="outline" @click="filterBy('year')">Année</CButton>
                </CButtonGroup>
              </CCol>
            </CRow>
            <CRow>
              <MainChart style="height: 300px; max-height: 300px; margin-top: 40px" :chart-data="trafficData" />
            </CRow>
          </CCardBody>
          <CCardFooter>
            <CRow
              :xs="{ cols: 1, gutter: 4 }"
              :sm="{ cols: 2 }"
              :lg="{ cols: 4 }"
              :xl="{ cols: 5 }"
              class="mb-2 text-center"
            >
              <CCol v-for="(stat, index) in trafficStats" :key="index">
                <div class="text-body-secondary">{{ stat.label }}</div>
                <div class="fw-semibold text-truncate">{{ stat.value }}</div>
                <CProgress class="mt-2" :color="stat.color" thin :precision="1" :value="stat.percentage" />
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
    <WidgetsStatsD class="mb-4" :stats="additionalStats" />
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader>Données Récentes</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol :sm="12" :lg="6">
                <h5>Courriers Entrants</h5>
                <div v-if="loading">Chargement...</div>
                <div v-else-if="error" class="text-danger">{{ error }}</div>
                <CTable v-else align="middle" class="mb-4 border" hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sujet</CTableHeaderCell>
                      <CTableHeaderCell>Expéditeur</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Statut</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow v-for="mail in incomingMails.slice(0, 5)" :key="mail.id">
                      <CTableDataCell>{{ mail.subject }}</CTableDataCell>
                      <CTableDataCell>{{ mail.sender }}</CTableDataCell>
                      <CTableDataCell>{{ mail.mail_date }}</CTableDataCell>
                      <CTableDataCell>{{ mail.status }}</CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </CCol>
              <CCol :sm="12" :lg="6">
                <h5>Contrats Actifs</h5>
                <div v-if="loading">Chargement...</div>
                <div v-else-if="error" class="text-danger">{{ error }}</div>
                <CTable v-else align="middle" class="mb-4 border" hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Employé</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Date de début</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow v-for="contrat in contrats.slice(0, 5)" :key="contrat.id">
                      <CTableDataCell>{{ contrat.employee }}</CTableDataCell>
                      <CTableDataCell>{{ contrat.type }}</CTableDataCell>
                      <CTableDataCell>{{ contrat.start_date }}</CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </CCol>
            </CRow>
            <CRow>
              <CCol :sm="12" :lg="6">
                <h5>Approvisionnements Récents</h5>
                <div v-if="loading">Chargement...</div>
                <div v-else-if="error" class="text-danger">{{ error }}</div>
                <div v-else>
                  <div
                    v-for="item in approvisionnements.slice(0, 5)"
                    :key="item.id"
                    class="progress-group mb-4"
                  >
                    <div class="progress-group-prepend">
                      <span class="text-body-secondary small">{{ item.description }}</span>
                    </div>
                    <div class="progress-group-bars">
                      <CProgress thin color="info" :value="item.amount / maxAmount * 100" />
                    </div>
                  </div>
                </div>
              </CCol>
              <CCol :sm="12" :lg="6">
                <h5>Statistiques Utilisateurs</h5>
                <div
                  v-for="item in userStats"
                  :key="item.title"
                  class="progress-group mb-4"
                >
                  <div class="progress-group-header">
                    <CIcon :icon="item.icon" class="me-2" size="lg" />
                    <span class="title">{{ item.title }}</span>
                    <span class="ms-auto fw-semibold">{{ item.value }}%</span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress thin :value="item.value" color="warning" />
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import AIAssistant from './AIAssistant.vue';
import WidgetsStatsA from './../widgets/WidgetsStatsTypeA.vue';
import WidgetsStatsD from './../widgets/WidgetsStatsTypeD.vue';
import MainChart from './MainChart.vue';
import axios from 'axios';

// Données statiques (peuvent être externalisées dans un fichier séparé)
const userStats = [
  { title: 'Utilisateurs Actifs', icon: 'cil-user', value: 53 },
  { title: 'Nouveaux Utilisateurs', icon: 'cil-user-follow', value: 43 },
];

export default {
  components: {
    AIAssistant,
    WidgetsStatsA,
    WidgetsStatsD,
    MainChart,
  },
  data() {
    return {
      incomingMails: [],
      contrats: [],
      approvisionnements: [],
      loading: false,
      error: null,
      dashboardStats: [
        { title: 'Courriers', value: 0, icon: 'cil-envelope-closed', color: 'primary' },
        { title: 'Contrats', value: 0, icon: 'cil-file', color: 'info' },
        { title: 'Approvisionnements', value: 0, icon: 'cil-cart', color: 'success' },
      ],
      trafficData: {
        labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        datasets: [
          {
            label: 'Courriers Entrants',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      },
      trafficStats: [
        { label: 'Courriers', value: '0', percentage: 0, color: 'success' },
        { label: 'Contrats', value: '0', percentage: 0, color: 'info' },
        { label: 'Approvisionnements', value: '0', percentage: 0, color: 'warning' },
        { label: 'Utilisateurs', value: '0', percentage: 0, color: 'danger' },
      ],
      additionalStats: [
        { title: 'Nouveaux Courriers', value: 0, color: 'info' },
        { title: 'Contrats Actifs', value: 0, color: 'success' },
      ],
      userStats,
      maxAmount: 1000, // Valeur maximale pour normaliser les progress bars des approvisionnements
      filterPeriod: 'month', // Période de filtrage par défaut
    };
  },
  computed: {
    normalizedTrafficData() {
      // Normaliser les données pour le graphique en fonction des données réelles
      const mailCounts = this.trafficData.labels.map((_, index) => {
        return this.incomingMails.filter(mail => {
          const mailDate = new Date(mail.mail_date);
          const day = mailDate.getDay();
          return day === (index + 1) % 7; // Associer les jours
        }).length;
      });
      return {
        ...this.trafficData,
        datasets: [
          {
            ...this.trafficData.datasets[0],
            data: mailCounts,
          },
        ],
      };
    },
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        const [mailsResponse, contratsResponse, approvisionnementsResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/mails/incoming'),
          axios.get('http://localhost:3000/api/contrats'),
          axios.get('http://localhost:3000/api/approvisionnements'),
        ]);
        this.incomingMails = mailsResponse.data;
        this.contrats = contratsResponse.data;
        this.approvisionnements = approvisionnementsResponse.data;

        // Mettre à jour les statistiques du tableau de bord
        this.dashboardStats[0].value = this.incomingMails.length;
        this.dashboardStats[1].value = this.contrats.length;
        this.dashboardStats[2].value = this.approvisionnements.length;

        // Mettre à jour les statistiques de traffic
        this.trafficStats[0].value = `${this.incomingMails.length} Courriers`;
        this.trafficStats[0].percentage = Math.min((this.incomingMails.length / 100) * 100, 100);
        this.trafficStats[1].value = `${this.contrats.length} Contrats`;
        this.trafficStats[1].percentage = Math.min((this.contrats.length / 50) * 100, 100);
        this.trafficStats[2].value = `${this.approvisionnements.length} Approvisionnements`;
        this.trafficStats[2].percentage = Math.min((this.approvisionnements.length / 50) * 100, 100);
        this.trafficStats[3].value = '53 Utilisateurs'; // Donnée statique pour l'exemple
        this.trafficStats[3].percentage = 53;

        // Mettre à jour les stats supplémentaires
        this.additionalStats[0].value = this.incomingMails.filter(mail => mail.status === 'En cours').length;
        this.additionalStats[1].value = this.contrats.filter(contrat => !contrat.end_date || new Date(contrat.end_date) > new Date()).length;

        // Calculer la valeur maximale pour les approvisionnements
        this.maxAmount = Math.max(...this.approvisionnements.map(item => item.amount), 1000);
      } catch (error) {
        this.error = 'Erreur lors de la récupération des données. Veuillez réessayer.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    filterBy(period) {
      this.filterPeriod = period;
      // TODO: Implémenter le filtrage par période (jour, mois, année)
      // Par exemple, recharger les données avec un paramètre de requête
      this.fetchData();
    },
    downloadReport() {
      // TODO: Implémenter le téléchargement d'un rapport (par exemple, un CSV)
      alert('Fonctionnalité de téléchargement à implémenter.');
    },
    handleAIResponse(response) {
      // Gérer les réponses de l'assistant IA
      console.log('Réponse IA reçue :', response);
      // Par exemple, afficher la réponse dans une notification
    },
  },
};
</script>

<style scoped>
.progress-group {
  margin-bottom: 1rem;
}
.text-danger {
  color: #dc3545;
}
</style>