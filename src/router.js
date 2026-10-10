import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import CraftView from './views/CraftView.vue'
import PresentView from './views/PresentView.vue'
import TemplateView from './views/TemplateView.vue'

export default createRouter({
  // Hash-режим: сайт работает с любого статического хостинга и даже из папки
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/craft/:id', name: 'craft', component: CraftView, props: true },
    { path: '/craft/:id/present', name: 'present', component: PresentView, props: true },
    { path: '/craft/:id/template', name: 'template', component: TemplateView, props: true },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
