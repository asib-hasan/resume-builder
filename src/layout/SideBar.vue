<script>
import TopBar from '@/components/TopBar.vue'
import MenuBar from '@/components/MenuNav.vue'
import FooTer from '@/components/Footer.vue'

export default {
  components: { TopBar, MenuBar, FooTer },
}
</script>
<template>
  <div>
    <TopBar />
    <div>
      <MenuBar />
      <div class="content">
        <router-view />
        <FooTer />
      </div>
    </div>
  </div>
</template>
