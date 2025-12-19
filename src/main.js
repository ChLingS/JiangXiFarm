import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import MapBox from './plugins/mapbox'

const app = createApp(App)

app.use(router).use(MapBox).use(ElementPlus)

app.mount('#app')
