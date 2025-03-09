<template>
  <div>
    <TopBar />
    <div>
      <MenuBar />
      <div class="content">
        <router-view />
        <Footer />
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import MenuBar from '@/components/MenuNav.vue'
import Footer from '@/components/Footer.vue'

export default {
  components: { TopBar, MenuBar, Footer },
}
</script>
