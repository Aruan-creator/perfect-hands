<script setup>
import { techniques, difficulties } from '../data/index.js'

defineProps({ craft: { type: Object, required: true } })
</script>

<template>
  <ul class="meta">
    <li class="tech" :style="{ '--c': techniques[craft.technique].color }">
      {{ techniques[craft.technique].icon }} {{ techniques[craft.technique].name }}
    </li>
    <li :title="difficulties[craft.difficulty]">
      <span v-for="i in 3" :key="i" :class="{ off: i > craft.difficulty }">★</span>
      {{ difficulties[craft.difficulty] }}
    </li>
    <li>👧 {{ craft.age }}</li>
    <li>⏱ {{ craft.time }}</li>
  </ul>
</template>

<style scoped>
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.85rem;
}
.meta li {
  background: var(--chip);
  border-radius: 999px;
  padding: 3px 10px;
  white-space: nowrap;
}
.meta .tech {
  background: color-mix(in srgb, var(--c) 18%, white);
  color: color-mix(in srgb, var(--c) 70%, black);
  font-weight: 600;
}
span {
  color: #f5a623;
}
span.off {
  color: #ddd;
}
</style>
