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
      path: '/blog/add',
      name: 'blog-add',
      component: () => import('../views/blog/AddBlogPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/blog/edit/:id',
      name: 'blog-edit',
      component: () => import('../views/blog/EditBlogPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/blog/list',
      name: 'blog-list',
      component: () => import('../views/blog/BlogListPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/case/study/add',
      name: 'case-study-add',
      component: () => import('../views/case_study/AddCSPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/case/study/edit/:id',
      name: 'case-study-edit',
      component: () => import('../views/case_study/EditCSPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/case/study/list',
      name: 'case-study-list',
      component: () => import('../views/case_study/CSListPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/photo/gallery/',
      name: 'photo-gallery',
      component: () => import('../views/photo_gallery/PhotoGalleryPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/photo/gallery/:id/images',
      name: 'photo-gallery-images',
      component: () => import('../views/photo_gallery/AddPhotoPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/profile',
      name: 'resume-profile',
      component: () => import('../views/my_resume/ProfilePage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/experiences',
      name: 'resume-experience',
      component: () => import('../views/my_resume/ExperiencesPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/educations',
      name: 'resume-education',
      component: () => import('../views/my_resume/EducationPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/skills',
      name: 'resume-skills',
      component: () => import('../views/my_resume/SkillsPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/interests',
      name: 'resume-interests',
      component: () => import('../views/my_resume/InterestPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/publications',
      name: 'resume-publications',
      component: () => import('../views/my_resume/PublicationPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/languages',
      name: 'resume-languages',
      component: () => import('../views/my_resume/LanguagePage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/certifications',
      name: 'resume-certifications',
      component: () => import('../views/my_resume/CertificationPage.vue'),
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/resume/awards',
      name: 'resume-awards',
      component: () => import('../views/my_resume/AwardPage.vue'),
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
