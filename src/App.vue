<template>
  <Header></Header>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
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
</style>
