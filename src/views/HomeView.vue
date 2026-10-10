<script setup>
import { computed, ref } from 'vue'
import { crafts, techniques } from '../data/index.js'
import CraftCard from '../components/CraftCard.vue'

const technique = ref('all')
const easyOnly = ref(false)
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return crafts.filter(
    (c) =>
      (technique.value === 'all' || c.technique === technique.value) &&
      (!easyOnly.value || c.difficulty === 1) &&
      (!q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)),
  )
})

const counts = computed(() =>
  Object.fromEntries(Object.keys(techniques).map((t) => [t, crafts.filter((c) => c.technique === t).length])),
)
</script>

<template>
  <section class="hero">
    <h1>Чем займёмся сегодня?</h1>
    <p>Выберите поделку. У каждой есть пошаговая схема, список материалов и советы для педагога. Схему можно показать на проекторе или распечатать.</p>
  </section>

  <div class="filters">
    <button class="chip" :class="{ active: technique === 'all' }" @click="technique = 'all'">Все · {{ crafts.length }}</button>
    <button
      v-for="(t, key) in techniques"
      :key="key"
      class="chip"
      :class="{ active: technique === key }"
      @click="technique = key"
    >
      {{ t.icon }} {{ t.name }} · {{ counts[key] }}
    </button>
    <label class="easy"><input v-model="easyOnly" type="checkbox" /> только лёгкие</label>
    <input v-model="query" class="search" type="search" placeholder="Поиск: кит, цветок…" />
  </div>

  <div v-if="filtered.length" class="grid">
    <CraftCard v-for="c in filtered" :key="c.id" :craft="c" />
  </div>
  <p v-else class="empty">Ничего не нашлось. Попробуйте другой фильтр.</p>
</template>

<style scoped>
.hero h1 {
  margin: 0 0 6px;
  font-size: 2rem;
}
.hero p {
  margin: 0 0 22px;
  color: var(--muted);
  max-width: 680px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}
.chip {
  border: 2px solid transparent;
  background: #fff;
  border-radius: 999px;
  padding: 7px 16px;
  box-shadow: var(--shadow);
}
.chip.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}
.easy {
  margin-left: 8px;
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
}
.search {
  margin-left: auto;
  border: 2px solid #eadfd2;
  border-radius: 999px;
  padding: 8px 16px;
  font: inherit;
  min-width: 220px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}
.empty {
  color: var(--muted);
  text-align: center;
  padding: 40px;
}
</style>
