<template>
  <footer id="footer" class="footer text-center bg-light py-3">
    <div class="text-muted small">
      Copyright &copy; {{ new Date().getFullYear() }} All Rights Reserved <br />
      <span class="text-secondary">Developed by Asib Hasan</span>
    </div>
    <a
      href="#"
      class="btn btn-primary btn-sm rounded-circle position-fixed bottom-0 end-0 m-3"
      @click="scrollToTop"
    >
      <i class="bi bi-arrow-up-short"></i>
    </a>
  </footer>
</template>
