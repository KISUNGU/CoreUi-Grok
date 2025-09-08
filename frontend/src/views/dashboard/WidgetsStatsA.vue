<!-- src/views/WidgetsStatsA.vue -->
<template>
  <CRow :xs="{ cols: 1, gutter: 4 }" :md="{ cols: 4 }">
    <CCol>
      <CWidgetStatsA
        class="mb-3 clickable"
        color="primary"
        :value="stats.totalIncoming"
        title="Entrants"
        @click="$emit('widget-click', 'incoming')"
      >
        <template #icon>
          <CIcon icon="cil-inbox" size="xl" class="my-2" />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol>
      <CWidgetStatsA
        class="mb-3 clickable"
        color="info"
        :value="stats.totalOutgoing"
        title="Sortants"
        @click="$emit('widget-click', 'outgoing')"
      >
        <template #icon>
          <CIcon icon="cil-send" size="xl" class="my-2" />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol>
      <CWidgetStatsA
        class="mb-3 clickable"
        color="warning"
        :value="stats.pendingValidation"
        title="En attente"
        @click="$emit('widget-click', 'pending')"
      >
        <template #icon>
          <CIcon icon="cil-clock" size="xl" class="my-2" />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol>
      <CWidgetStatsA
        class="mb-3 clickable"
        color="danger"
        :value="stats.archived"
        title="Archivés"
        @click="$emit('widget-click', 'archived')"
      >
        <template #icon>
          <CIcon icon="cil-folder" size="xl" class="my-2" />
        </template>
      </CWidgetStatsA>
    </CCol>
  </CRow>
</template>

<script>
import { CRow, CCol, CWidgetStatsA, CIcon } from '@coreui/vue';

export default {
  name: 'WidgetsStatsA',
  components: {
    CRow,
    CCol,
    CWidgetStatsA,
    CIcon,
  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
.clickable:hover {
  opacity: 0.8;
}
</style>