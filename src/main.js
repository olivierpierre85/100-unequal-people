import { createApp } from 'vue'
// self-hosted fonts (bundled by Vite): no requests to Google Fonts
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/nunito'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App)
    .use(router)
    .mount('#app')
