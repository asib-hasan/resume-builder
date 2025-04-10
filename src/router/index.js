import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashBoard.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/profile',
      name: 'resume-profile',
      component: () => import('../views/my_resume/ProfilePage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/experience',
      name: 'resume-experience',
      component: () => import('../views/my_resume/ExperiencesPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
    },
  ],
})

// Route Guard to check authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') // Retrieve JWT token from localStorage
  if (to.meta.requiresAuth && !token) {
    next('/') // Redirect to login if not authenticated
  } else {
    next() // Proceed if authenticated
  }
})

export default router
