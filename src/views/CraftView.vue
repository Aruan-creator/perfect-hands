<script setup>
import { computed } from 'vue'
import { getCraft } from '../data/index.js'
import CraftMeta from '../components/CraftMeta.vue'

const props = defineProps({ id: { type: String, required: true } })
const craft = computed(() => getCraft(props.id))

const print = () => window.print()
</script>

<template>
  <div v-if="!craft" class="missing">
    <p>Такой поделки нет.</p>
    <RouterLink to="/" class="btn">← К списку поделок</RouterLink>
  </div>

  <article v-else>
    <RouterLink to="/" class="back no-print">← Все поделки</RouterLink>

    <header class="intro">
      <div class="cover" v-html="craft.cover"></div>
      <div class="info">
        <h1>{{ craft.title }}</h1>
        <CraftMeta :craft="craft" />
        <p class="desc">{{ craft.description }}</p>

        <h2>Понадобится</h2>
        <ul class="materials">
          <li v-for="m in craft.materials" :key="m">{{ m }}</li>
        </ul>

        <div class="actions no-print">
          <RouterLink :to="{ name: 'present', params: { id: craft.id } }" class="btn primary">▶ Показать на занятии</RouterLink>
          <RouterLink v-if="craft.template" :to="{ name: 'template', params: { id: craft.id } }" class="btn">📄 Шаблон для печати</RouterLink>
          <button class="btn" @click="print">🖨 Распечатать инструкцию</button>
        </div>
      </div>
    </header>

    <h2>Как сделать</h2>
    <ol class="steps">
      <li v-for="(step, i) in craft.steps" :key="i" class="step">
        <div class="diagram" v-html="step.svg"></div>
        <div class="text">
          <span class="num">{{ i + 1 }}</span>
          <p>{{ step.text }}</p>
          <p v-if="step.tip" class="tip">💡 {{ step.tip }}</p>
        </div>
      </li>
    </ol>

    <section v-if="craft.teacherTips?.length" class="box">
      <h2>Советы педагогу</h2>
      <ul>
        <li v-for="t in craft.teacherTips" :key="t">{{ t }}</li>
      </ul>
    </section>

    <section v-if="craft.variations?.length" class="box ideas">
      <h2>Идеи для продолжения</h2>
      <ul>
        <li v-for="v in craft.variations" :key="v">{{ v }}</li>
      </ul>
    </section>

    <aside class="legend">
      <span><svg viewBox="0 0 60 10" width="48"><line x1="2" y1="5" x2="58" y2="5" stroke="#2f6fd1" stroke-width="3" stroke-dasharray="10 7" /></svg> согнуть к себе</span>
      <span><svg viewBox="0 0 60 10" width="48"><line x1="2" y1="5" x2="58" y2="5" stroke="#2f6fd1" stroke-width="3" stroke-dasharray="14 6 3 6" /></svg> отогнуть назад</span>
      <span><svg viewBox="0 0 60 10" width="48"><line x1="2" y1="5" x2="58" y2="5" stroke="#e0325f" stroke-width="4" /></svg> куда двигаем</span>
    </aside>
  </article>
</template>

<style scoped>
.back {
  color: var(--muted);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 16px;
}
.intro {
  display: grid;
  grid-template-columns: minmax(260px, 380px) 1fr;
  gap: 32px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
  margin-bottom: 32px;
}
.cover {
  background: var(--paper);
  border-radius: 14px;
  aspect-ratio: 1;
}
.cover :deep(svg),
.diagram :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
h1 {
  margin: 0 0 10px;
  font-size: 2.2rem;
}
h2 {
  margin: 24px 0 12px;
}
.desc {
  margin: 14px 0 0;
  font-size: 1.05rem;
}
.materials {
  margin: 0;
  padding-left: 22px;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.step {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  break-inside: avoid;
}
.diagram {
  background: var(--paper);
  aspect-ratio: 1;
}
.text {
  padding: 14px 18px 18px;
  position: relative;
}
.num {
  position: absolute;
  top: -22px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  font-size: 1.2rem;
  display: grid;
  place-items: center;
}
.text p {
  margin: 12px 0 0;
  font-size: 1.05rem;
}
.tip {
  color: var(--muted);
  font-size: 0.95rem !important;
}
.box {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 4px 24px 18px;
  margin-top: 28px;
}
.ideas {
  background: var(--accent-soft);
}
.legend {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: 24px;
}
.legend span {
  display: flex;
  align-items: center;
  gap: 8px;
}
.missing {
  text-align: center;
  padding: 60px;
}

@media (max-width: 720px) {
  .intro {
    grid-template-columns: 1fr;
  }
}

@media print {
  .intro,
  .step,
  .box {
    box-shadow: none;
    border: 1px solid #ddd;
  }
  .intro {
    grid-template-columns: 200px 1fr;
    padding: 12px;
  }
  .steps {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .text p {
    font-size: 0.9rem;
  }
}
</style>
