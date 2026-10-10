<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCraft } from '../data/index.js'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const craft = computed(() => getCraft(props.id))

// Слайд 0 — вступление с материалами, дальше — шаги
const index = ref(0)
const total = computed(() => (craft.value ? craft.value.steps.length + 1 : 0))
const step = computed(() => (index.value > 0 ? craft.value.steps[index.value - 1] : null))
const isLast = computed(() => index.value === total.value - 1)

const go = (i) => (index.value = Math.max(0, Math.min(total.value - 1, i)))
const next = () => go(index.value + 1)
const prev = () => go(index.value - 1)
const exit = () => {
  if (document.fullscreenElement) document.exitFullscreen()
  router.push({ name: 'craft', params: { id: props.id } })
}

const isFullscreen = ref(false)
const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen?.()
}
const onFullscreenChange = () => (isFullscreen.value = !!document.fullscreenElement)

function onKey(e) {
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) next()
  else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) prev()
  else if (e.key === 'Home') go(0)
  else if (e.key === 'End') go(total.value - 1)
  else if (e.key === 'f' || e.key === 'а') toggleFullscreen()
  else if (e.key === 'Escape' && !document.fullscreenElement) exit()
  else return
  e.preventDefault()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
  <div v-if="craft" class="present">
    <header class="bar">
      <strong>{{ craft.title }}</strong>
      <span v-if="index > 0" class="counter">Шаг {{ index }} из {{ craft.steps.length }}</span>
      <span class="spacer"></span>
      <button class="icon" :title="isFullscreen ? 'Выйти из полноэкранного режима (F)' : 'На весь экран (F)'" @click="toggleFullscreen">
        {{ isFullscreen ? '🗗' : '⛶' }}
      </button>
      <button class="icon" title="Закрыть (Esc)" @click="exit">✕</button>
    </header>

    <section v-if="index === 0" class="slide">
      <div class="art" v-html="craft.cover"></div>
      <div class="words">
        <h1>{{ craft.title }}</h1>
        <p class="lead">Сегодня мы сделаем вот такую поделку!</p>
        <h2>Приготовь:</h2>
        <ul>
          <li v-for="m in craft.materials" :key="m">{{ m }}</li>
        </ul>
      </div>
    </section>

    <section v-else :key="index" class="slide">
      <div class="art" v-html="step.svg"></div>
      <div class="words">
        <div class="big-num">{{ index }}</div>
        <p class="step-text">{{ step.text }}</p>
        <p v-if="step.tip" class="tip">💡 {{ step.tip }}</p>
        <p v-if="isLast" class="done">🎉 Молодцы!</p>
      </div>
    </section>

    <footer class="nav">
      <button class="nav-btn" :disabled="index === 0" @click="prev">← Назад</button>
      <div class="dots">
        <button
          v-for="i in total"
          :key="i"
          class="dot"
          :class="{ active: i - 1 === index, seen: i - 1 < index }"
          :title="i === 1 ? 'Начало' : `Шаг ${i - 1}`"
          @click="go(i - 1)"
        ></button>
      </div>
      <button v-if="!isLast" class="nav-btn primary" @click="next">{{ index === 0 ? 'Начинаем →' : 'Дальше →' }}</button>
      <button v-else class="nav-btn primary" @click="exit">Готово ✓</button>
    </footer>
  </div>
  <div v-else class="missing">
    <RouterLink to="/" class="btn">← К списку поделок</RouterLink>
  </div>
</template>

<style scoped>
.present {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--paper);
}
.bar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 24px;
  font-size: 1.3rem;
  background: #fff;
}
.counter {
  color: var(--muted);
}
.spacer {
  flex: 1;
}
.icon {
  border: 0;
  background: var(--chip);
  border-radius: 10px;
  width: 44px;
  height: 44px;
  font-size: 1.3rem;
}
.slide {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  align-items: center;
  gap: 4vw;
  padding: 2vh 5vw;
  animation: appear 0.25s ease-out;
}
@keyframes appear {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
}
.art {
  height: 100%;
  min-height: 0;
  display: flex;
  justify-content: center;
}
.art :deep(svg) {
  height: 100%;
  max-width: 100%;
}
.words {
  font-size: clamp(1.2rem, 2.4vw, 2.4rem);
}
h1 {
  font-size: 2.2em;
  margin: 0;
}
h2 {
  font-size: 1em;
  margin: 1em 0 0.3em;
}
.lead {
  margin: 0.3em 0 0;
  color: var(--muted);
}
ul {
  margin: 0;
  padding-left: 1.2em;
  font-size: 0.85em;
}
.big-num {
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  font-size: 1.4em;
  display: grid;
  place-items: center;
}
.step-text {
  font-size: 1.15em;
  font-weight: 600;
  line-height: 1.35;
  margin: 0.6em 0 0;
}
.tip {
  color: var(--muted);
  font-size: 0.75em;
}
.done {
  font-size: 1.4em;
  font-weight: 800;
  color: var(--accent);
  margin: 0.6em 0 0;
}
.nav {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 24px 20px;
}
.nav-btn {
  border: 0;
  border-radius: 999px;
  padding: 14px 32px;
  font-size: 1.3rem;
  font-weight: 700;
  background: var(--chip);
  color: var(--ink);
  min-width: 180px;
}
.nav-btn.primary {
  background: var(--accent);
  color: #fff;
}
.nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.dots {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 0;
  background: #e6d9ca;
  padding: 0;
}
.dot.seen {
  background: #f5b88c;
}
.dot.active {
  background: var(--accent);
  transform: scale(1.3);
}
.missing {
  text-align: center;
  padding: 60px;
}

@media (max-aspect-ratio: 1/1) {
  .slide {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }
}
</style>
