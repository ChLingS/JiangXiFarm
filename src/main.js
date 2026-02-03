import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/main.css'
import MapBox from './plugins/mapbox'
import AreaQueryManagerPlugin from './plugins/AreaQueryManager'
import '@/api/api.js';

const app = createApp(App)

app.use(router).use(MapBox).use(ElementPlus).use(AreaQueryManagerPlugin, {
  // 可选：传入初始值
  initial: ['江西省']
})

app.mount('#app')
