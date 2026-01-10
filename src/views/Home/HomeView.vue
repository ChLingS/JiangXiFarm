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
import useThematicLayer from '@/Hooks/MapThematicLayer';
const { loadThematicLayer, updateThematicLayerData } = useThematicLayer();

import layerConfig from '@/config/layerConfig.json'
import clickController from '@/Hooks/LayerClickEventHandl';


import { ref, onMounted, watch, inject, shallowRef } from 'vue';
import AreaQueryManager from '@/models/AreaQueryManager'
import { area } from '@antv/g2plot';

const { map } = inject('$scene_map')

// 图层管理 — 使用 AreaQueryManager 以避免并发竞争
/** @type {import('@/models/AreaQueryManager').default} */
const areaMgr = new AreaQueryManager(['江西省', '抚州市', '南城县', '徐家镇'])

// 加载边界图层
// 获取配置中的API名称
const baseLayer = layerConfig.layers.find(layer => layer.id === 'baseLayer')
const apiName = baseLayer.apiName
const baseLayerParams = baseLayer ? baseLayer.layerParams : {}
console.log('Base Layer Params:', baseLayerParams);
const { layerInitialize, updateBoundaryLayerData } = useBoundaryLayer(areaMgr, apiName, baseLayerParams);
layerInitialize()


// 获取专题图层配置
const thematicLayer = layerConfig.layers.filter(layer => layer.id === 'thematicLayer')
for (const layer of thematicLayer) {
  console.log(`Thematic Layer ID: ${layer.id}, API Name: ${layer.apiName}`);
  const layerParams = layer.layerParams || {};
  const layerStyle = layer.layerStyle || {};
  loadThematicLayer(layerParams, layerStyle)
}
// 处理图层点击事件
const { handleLayerClick } = clickController(areaMgr, updateBoundaryLayerData);

// const showDetail = ref(false)
// const selectedFeature = ref(null)

// setOnFeatureClick((properties) => {
//   selectedFeature.value = properties
//   showDetail.value = true
// })

// 加载专题田块图层

watch(() => areaMgr.getLength(), () => {
  if (areaMgr.getLength() == 5) {
    for (const layer of thematicLayer) {
      const layerApiName = layer.apiName
      const layerParams = layer.layerParams || {};
      updateThematicLayerData(layerApiName, areaMgr.getCurrent(), layerParams)
    }
  }

}, { deep: true })


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

  // // 初始化田块图层
  handleLayerClick()
})


</script>
<style></style>
