<!-- src/views/MainChart.vue -->
<template>
    <canvas ref="chart"></canvas>
  </template>
  
  <script>
  import { onMounted, onUnmounted, watch, ref } from 'vue'; // Ajout de ref ici
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'MainChart',
    props: {
      data: Object,
      options: Object,
    },
    setup(props) {
      const chart = ref(null); // ref est maintenant défini
      let chartInstance = null;
  
      const renderChart = () => {
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(chart.value, {
          type: 'line',
          data: props.data,
          options: props.options,
        });
      };
  
      onMounted(() => {
        if (props.data) renderChart();
      });
  
      watch(() => props.data, () => {
        if (props.data) renderChart();
      });
  
      onUnmounted(() => {
        if (chartInstance) chartInstance.destroy();
      });
  
      return { chart };
    },
  };
  </script>