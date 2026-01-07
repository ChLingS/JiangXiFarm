<!--
 * @Author: wangshiyang
 * @Date: 2023-05-29 11:08:07
 * @LastEditors: your name
 * @LastEditTime: 2023-11-17 10:46:25
 * @Description: 请填写简介
-->
<template>
  <Header></Header>
  <div>

    <MapControl />
    <BottomTools @changed-interface="handleComponentToggle" @layer-select-status="handleLayerStatus" />

    <component :is="activeComponent" v-if="activeComponent" />

    <ContractLandDetail v-if="showDetail" :featureProperties="selectedFeature" :visible="showDetail"
      @close="showDetail = false" @view-details="handleViewDetails" @edit="handleEdit" />
  </div>
</template>

<script setup>
import BottomTools from './components/BottomTools.vue';
import MapControl from './components/MapControl.vue';
import ContractLandDetail from './components/ContractLandDetail.vue'
import Header from './components/Header.vue'
import G2Charts from './components/G2Charts.vue';
import BusinessOverview from './components/BusinessOverview.vue';

import useBoundaryLayer from '@/Hooks/MapBoundaryManager';
import fieldLayer from '@/Hooks/MapFieldManager'
import contractedLayer from "@/Hooks/MapContractedLandManager"

import layerConfig from '@/config/layerConfig.json'


import { ref, onMounted, watch, inject, shallowRef } from 'vue';

const { map } = inject('$scene_map')

// 图层管理
const AD_NAMES = ref(['江西省', '抚州市', '南城县', '徐家镇'])

// 加载边界图层
// 获取配置中的API名称
const baseLayer = layerConfig.layers.find(layer => layer.id === 'baseLayer')
const apiName = baseLayer ? baseLayer.apiName : 'getAreaByName'
const baseLayerParams = baseLayer ? baseLayer.layerParams : {}
console.log('Base Layer Params:', baseLayerParams);
const { layerInitialize, clickController } = useBoundaryLayer(AD_NAMES, apiName, baseLayerParams);

// 保单地块
const { contractedLandLayerInitialize, setOnFeatureClick } = contractedLayer()
// 作物地块
const { fieldLayerInitialize } = fieldLayer();


watch(AD_NAMES, (newVal) => {
  console.log('AD_NAMES changed:', newVal.length)

  if (newVal.length === 5) {
    console.log("开始加载地块");
    fieldLayerInitialize(newVal)
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




// layer操作
const handleLayerStatus = (changedLayer) => {
  if (changedLayer.checked) {
    changedLayer.id.split('_').forEach(element => {
      map.setLayoutProperty(element, 'visibility', 'visible');
    });

  } else {
    changedLayer.id.split('_').forEach(element => {
      map.setLayoutProperty(element, 'visibility', 'none');
    });
  }
}


// 切换组件
const components = {
  1: G2Charts,
  // 未来扩展
  2: BusinessOverview,
  // 3: MapPanel,
}
const activeComponent = shallowRef(components[2])

const handleComponentToggle = (interfaceId) => {
  const component = components[interfaceId]
  if (!component) return

  if (activeComponent.value === component) {
    activeComponent.value = null
  } else {
    activeComponent.value = component
  }
}


onMounted(() => {
  layerInitialize()
  // // 初始化田块图层
  clickController.enable()
})


</script>
<style></style>
