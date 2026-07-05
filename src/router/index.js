import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import WealthPyramidPage from '../views/WealthPyramidPage.vue'

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
        },
        {
            path: '/wealth-pyramid',
            name: 'wealth-pyramid',
            component: WealthPyramidPage
        }
    ]
})

export default router
