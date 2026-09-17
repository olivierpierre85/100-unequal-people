import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // Older links: the profiles and pyramid pages are now sections of the
    // home page. Keep their URLs working.
    { path: '/profiles', redirect: (to) => ({ path: '/', query: to.query }) },
    { path: '/wealth-pyramid', redirect: { path: '/', query: { view: 'wealth' } } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    // query-only changes (the wealth/income toggle) must not jump to the top
    return to.path === from.path ? false : { top: 0 }
  },
})

export default router
