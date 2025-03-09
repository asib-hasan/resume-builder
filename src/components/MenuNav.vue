<template>
  <aside id="sidebar" class="sidebar">
    <ul class="sidebar-nav" id="sidebar-nav">
      <li class="nav-heading"></li>
      <li class="nav-item">
        <router-link class="nav-link" to="/dashboard">
          <i class="bi bi-grid"></i>
          <span>Dashboard</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/profile">
          <i class="bi bi-person-circle"></i>
          <span>My Resume</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/profile">
          <i class="bi bi-pen"></i>
          <span>Blog</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/profile">
          <i class="bi bi-journal-text"></i>
          <span>Case Study</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/profile">
          <i class="bi bi-globe"></i>
          <span>Website</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'MenuNav',
}
</script>
