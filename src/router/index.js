import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashBoard.vue'),
    },
    {
      path: '/resume/profile',
      name: 'resume-profile',
      component: () => import('../views/my_resume/Profile.vue'),
    },
    {
      path: '/resume/experience',
      name: 'resume-experience',
      component: () => import('../views/my_resume/Experiences.vue'),
    },
  ],
})

export default router
