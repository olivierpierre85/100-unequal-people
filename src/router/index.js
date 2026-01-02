import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: LandingPage
        },
        {
            path: '/profiles',
            name: 'profiles',
            component: () => import('../views/ProfilesView.vue')
        }
    ]
})

export default router
