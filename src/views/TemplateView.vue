<script setup>
import { computed } from 'vue'
import { getCraft } from '../data/index.js'

const props = defineProps({ id: { type: String, required: true } })
const craft = computed(() => getCraft(props.id))
const print = () => window.print()
</script>

<template>
  <div v-if="craft?.template" class="template">
    <div class="no-print head">
      <RouterLink :to="{ name: 'craft', params: { id } }" class="back">← {{ craft.title }}</RouterLink>
      <h1>Шаблон для печати</h1>
      <p>
        Листов: {{ craft.template.length }}, А4, альбомная ориентация. В окне печати выберите
        <b>масштаб 100%</b> (не «по размеру страницы»). Проверьте распечатку линейкой
        по размеру: длинная лента корпуса на первом листе — около 21 см.
      </p>
      <button class="btn primary" @click="print">🖨 Распечатать шаблон</button>
    </div>
    <div v-for="(sheet, i) in craft.template" :key="i" class="sheet" v-html="sheet"></div>
  </div>
  <div v-else class="no-print">
    <p>У этой поделки нет шаблона.</p>
    <RouterLink to="/" class="btn">← К списку поделок</RouterLink>
  </div>
</template>

<style scoped>
.head {
  margin-bottom: 20px;
}
.back {
  color: var(--muted);
  text-decoration: none;
}
.head p {
  color: var(--muted);
  max-width: 760px;
}
.sheet {
  background: #fff;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}
.sheet :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

@media print {
  .template {
    page: template;
  }
  .sheet {
    box-shadow: none;
    margin: 0;
    width: 297mm;
    height: 209mm;
    overflow: hidden;
    break-after: page;
  }
  .sheet:last-child {
    break-after: auto;
  }
  .sheet :deep(svg) {
    width: 297mm;
    height: 210mm;
  }
}
</style>
