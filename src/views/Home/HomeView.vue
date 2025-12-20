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
    <BottomTools @toggleCharts="toggleCharts" />
    <G2Charts v-if="displayChart" />
  </div>
</template>

<script setup>
import BottomTools from './components/BottomTools.vue';
import MapControl from './components/MapControl.vue';
import useBoundaryLayer from '@/Hooks/MapBoundaryManager';
import G2Charts from '../../G2Charts/G2Charts.vue';

import { ref, onMounted } from 'vue';


const { layerInitialize } = useBoundaryLayer()





const displayChart = ref(true)
const toggleCharts = (isDisplay) => {
  displayChart.value = isDisplay
}

onMounted(() => {
  layerInitialize()
})


</script>
<style></style>
