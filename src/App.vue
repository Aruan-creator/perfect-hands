<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const presenting = computed(() => route.name === 'present')
</script>

<template>
  <header v-if="!presenting" class="topbar no-print">
    <RouterLink to="/" class="logo">✋ Умелые ручки</RouterLink>
    <span class="tagline">идеи и пошаговые схемы для занятий</span>
  </header>
  <main :class="{ page: !presenting }">
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 14px 28px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.logo {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent);
  text-decoration: none;
}
.tagline {
  color: var(--muted);
}
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px;
}
@media print {
  .page {
    padding: 0;
    max-width: none;
  }
}
</style>
