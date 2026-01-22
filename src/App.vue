<template>

  <RouterView v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </RouterView>
</template>
<script setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { RouterView } from 'vue-router'

</script>
<style>
#nav {
  position: fixed;
  z-index: 1000;
  top: 10px;
  left: 50px
}

#map {
  left: 0;
  top: 0;
  position: absolute;
  width: 100vw;
  height: 100vh;
}

/* Element Plus 组件样式优化 */
.el-select__wrapper.el-tooltip__trigger {
  
  background-color: rgba(27, 38, 56, 0.8);
  border: 1px solid rgba(64, 156, 255, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.el-select__wrapper.el-tooltip__trigger:hover {
  border-color: rgba(64, 156, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 183, 255, 0.2);
}

.el-input__wrapper {
  background-color: rgba(27, 38, 56, 0.8);
  border: 1px solid rgba(64, 156, 255, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.el-input__wrapper:hover {
  border-color: rgba(64, 156, 255, 0.5);
}

.el-input__wrapper.is-focus {
  border-color: #00b7ff;
  box-shadow: 0 0 10px rgba(0, 183, 255, 0.3);
}

.el-button--primary {
  background: linear-gradient(135deg, #00b7ff, #00d4ff);
  border: none;
  box-shadow: 0 4px 15px rgba(0, 183, 255, 0.3);
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #00d4ff, #00b7ff);
  box-shadow: 0 6px 20px rgba(0, 183, 255, 0.5);
  transform: translateY(-2px);
}

.el-cascader {
  background-color: rgba(27, 38, 56, 0.8);
}

.el-cascader:hover {
  border-color: rgba(64, 156, 255, 0.5);
}
</style>
