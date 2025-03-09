<template>
  <div>
    <div class="d-flex">
      <SideBar />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/layout/SideBar.vue'

export default {
  components: { SideBar },
}
</script>
