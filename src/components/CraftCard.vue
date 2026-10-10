<script setup>
import CraftMeta from './CraftMeta.vue'

defineProps({ craft: { type: Object, required: true } })
</script>

<template>
  <RouterLink :to="{ name: 'craft', params: { id: craft.id } }" class="card">
    <div class="cover" v-html="craft.cover"></div>
    <div class="body">
      <h3>{{ craft.title }}</h3>
      <p>{{ craft.description }}</p>
      <CraftMeta :craft="craft" />
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(80, 50, 20, 0.16);
}
.cover {
  background: var(--paper);
  aspect-ratio: 4 / 3;
  display: flex;
  justify-content: center;
}
.cover :deep(svg) {
  height: 100%;
}
.body {
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
h3 {
  margin: 0;
  font-size: 1.25rem;
}
p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
  flex: 1;
}
</style>
