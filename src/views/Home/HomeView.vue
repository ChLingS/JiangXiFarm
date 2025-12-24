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
    <BottomTools 
      @toggleCharts="toggleCharts" 
      @layer-select-status="handleLayerStatus"
      />
    <G2Charts v-if="displayChart" />
    <ContractLandDetail
      v-if="showDetail"
      :featureProperties="selectedFeature"
      :visible="showDetail"
      @close="showDetail = false"
      @view-details="handleViewDetails"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup>
import BottomTools from './components/BottomTools.vue';
import MapControl from './components/MapControl.vue';
import ContractLandDetail from './components/ContractLandDetail.vue'

import useBoundaryLayer from '@/Hooks/MapBoundaryManager';
import useFieldLayer from '@/Hooks/MapFieldManager'
import contractedLayer from "@/Hooks/MapContractedLandManager"
import G2Charts from '../../G2Charts/G2Charts.vue';

import { ref, onMounted, watch } from 'vue';

const AD_NAMES = ref(['江西省', '抚州市', '南城县', '徐家镇'])

const { layerInitialize, clickController } = useBoundaryLayer( AD_NAMES )

const {contractedLandLayerInitialize, setOnFeatureClick} = contractedLayer()


watch(AD_NAMES, (newVal) => {
  console.log('AD_NAMES changed:', newVal.length)

  if( newVal.length === 5 ){
    console.log("开始加载地块");
    contractedLandLayerInitialize(newVal)
  }
}, { deep: true })  // 添加 deep: true 以确保能监听到数组内部变化


const showDetail = ref(false)
const selectedFeature = ref(null)

setOnFeatureClick((properties) => {
    selectedFeature.value = properties
    showDetail.value = true
})

const handleViewDetails = (properties) => {
  console.log('查看完整详情:', properties)
  // 这里可以跳转到详情页或打开模态框
  alert(`查看地块 ${properties.id} 的完整详情`)
}




// bottom按钮操作
const handleLayerStatus = (layers) => {
  console.log('图层状态变化:', layers)
  // 更新地图或其他操作
  layers.forEach(layer => {
    console.log(`图层 ${layer.id}: ${layer.checked ? '显示' : '隐藏'}`)
  })
}



const displayChart = ref(true)
const toggleCharts = (isDisplay) => {
  displayChart.value = isDisplay
}

onMounted(() => {
  layerInitialize()
  // // 初始化田块图层
  clickController.enable()
})


</script>
<style></style>
