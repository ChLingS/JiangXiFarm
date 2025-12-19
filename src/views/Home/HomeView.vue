<!--
 * @Author: wangshiyang
 * @Date: 2023-05-29 11:08:07
 * @LastEditors: your name
 * @LastEditTime: 2023-11-17 10:46:25
 * @Description: 请填写简介
-->
<template>
  <div>
    <MapControl />
    <BottomTools />
  </div>
</template>

<script setup>
import BottomTools from './components/BottomTools.vue';
import MapControl from './components/MapControl.vue';
import MapBoundsManager from '@/Hooks/MapBoundsManager ';

import { onMounted } from 'vue';

const { boundsInit } = MapBoundsManager()


onMounted(() => {
  boundsInit();
})


</script>
<style></style>
