import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vue-toast-notification/dist/theme-sugar.css'
import VueToast from 'vue-toast-notification'
import 'quill/dist/quill.snow.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueToast)

app.mount('#app')
