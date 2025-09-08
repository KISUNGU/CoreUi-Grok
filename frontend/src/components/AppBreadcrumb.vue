<script setup>
import { onMounted, ref } from 'vue'
import router from '@/router'

const indexation = ref()

const getBreadcrumbs = () => {
  return router.currentRoute.value.matched.map((route) => {
    return {
      active: route.path === router.currentRoute.value.fullPath,
      name: route.name,
      path: `${router.options.history.courrier}${route.path}`,
    }
  })
}

router.afterEach(() => {
  indexation.value = getBreadcrumbs()
})

onMounted(() => {
  indexation.value = getBreadcrumbs()
})
</script>

<template>
  <CBreadcrumb class="my-0">
    <CBreadcrumbItem
      v-for="item in indexation"
      :key="item"
      :href="item.active ? '' : item.path"
      :active="item.active"
    >
      {{ item.name }}
    </CBreadcrumbItem>
  </CBreadcrumb>
</template>