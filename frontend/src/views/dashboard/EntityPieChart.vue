<!-- src/views/EntityPieChart.vue -->
<template>
    <canvas ref="chart"></canvas>
  </template>
  
  <script>
  import { onMounted, onUnmounted, watch, ref } from 'vue';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'EntityPieChart',
    props: {
      data: Object,
    },
    setup(props) {
      const chart = ref(null);
      let chartInstance = null;
  
      const renderChart = () => {
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(chart.value, {
          type: 'pie',
          data: props.data,
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { position: 'right' },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.label}: ${context.raw} courriers`,
                },
              },
            },
          },
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