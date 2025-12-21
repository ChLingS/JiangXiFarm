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
import useFieldLayer from '@/Hooks/MapFieldManager'
import G2Charts from '../../G2Charts/G2Charts.vue';

import { ref, onMounted, watch } from 'vue';


const { layerInitialize, AD_NAMES } = useBoundaryLayer()

watch(AD_NAMES, (newVal) => {
  console.log('AD_NAMES changed:', newVal)
}, { deep: true })  // 添加 deep: true 以确保能监听到数组内部变化

// 初始化田块图层，传入 AD_NAMES
const { layerInitialize: initFieldLayer } = useFieldLayer(AD_NAMES);



const displayChart = ref(true)
const toggleCharts = (isDisplay) => {
  displayChart.value = isDisplay
}

onMounted(() => {
  layerInitialize()
  // 初始化田块图层
  initFieldLayer();
})


</script>
<style></style>
