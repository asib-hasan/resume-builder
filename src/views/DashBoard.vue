<script>
import SideBar from '@/layout/SideBar.vue'
import { onMounted } from 'vue'
export default {
  components: { SideBar },
  setup() {
    onMounted(() => {
      const dashboardItem = document.getElementById('dashboard')
      dashboardItem.classList.add('nav-active')
    })
  },
}
</script>

<template>
  <SideBar />
  <main id="main" class="main">
    <div class="pagetitle">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">Home</li>
        <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
      </ol>
    </div>
    <section class="dashboard">
      <div class="row">
        <div class="col-md-12"></div>
      </div>
    </section>
  </main>
</template>
