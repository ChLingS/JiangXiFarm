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
    <BottomTools @changed-interface="handleComponentToggle" @layer-select-status="handleLayerStatus" :transConfig="layerConfig"/>

    <component :is="activeComponent" v-if="activeComponent" />

    <ContractLandDetail v-if="showDetail" :featureProperties="selectedFeature" :visible="showDetail"
      @close="showDetail = false" @view-details="handleViewDetails" @edit="handleEdit" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject, shallowRef, onUnmounted, provide } from 'vue';

import BottomTools from './components/BottomTools.vue';
import MapControl from './components/MapControl.vue';
import ContractLandDetail from './components/ContractLandDetail.vue'
import Header from './components/Header.vue'
import G2Charts from './components/G2Charts.vue';
import BusinessOverview from './components/BusinessOverview.vue';

import useBoundaryLayer from '@/Hooks/MapBoundaryManager';
import { useThematicLayerProvider } from '@/Hooks/MapThematicLayer';
const thematicLayerService = useThematicLayerProvider();
const { loadThematicLayer, updateThematicLayerData, setHighlight } = thematicLayerService;
provide('updateThematicLayerData', updateThematicLayerData)
provide('setHighlight', setHighlight)

import layerConfig from '@/config/layerConfig.json'
provide('layerConfig', layerConfig);

import clickController from '@/Hooks/LayerClickEventHandl';



const { map } = inject('$scene_map')

// 图层管理 — 使用 AreaQueryManager 以避免并发竞争
/** @type {import('@/plugins/AreaQueryManager').default} */
const areaMgr = inject('areaManager')


// 加载边界图层
// 获取配置中的API名称
const baseLayer = layerConfig.layers.find(layer => layer.id === 'baseLayer')
const apiName = baseLayer.apiName
const baseLayerParams = baseLayer ? baseLayer.layerParams : {}
console.log('Base Layer Params:', baseLayerParams);
const { layerInitialize, updateBoundaryLayerData } = useBoundaryLayer(areaMgr, apiName, baseLayerParams);
provide('updateBoundaryLayerData', updateBoundaryLayerData)
layerInitialize()


// 获取专题图层配置
const thematicLayer = layerConfig.layers.filter(layer => layer.id === 'thematicLayer').sort((a, b) => a.zIndex - b.zIndex)
for (const layer of thematicLayer) {
  console.log(`Thematic Layer ID: ${layer.id}, API Name: ${layer.apiName}`);
  const layerParams = layer.layerParams || {};
  const layerStyle = layer.layerStyle || {};
  loadThematicLayer(layerParams, layerStyle)
}
// 处理图层点击事件
const {initMapClickListener, 
      getLastThematicLayerProps, 
      cleanupMapClickListener} = clickController(areaMgr, layerConfig,
                                                updateBoundaryLayerData, 
                                                updateThematicLayerData,
                                                setHighlight);



// 加载专题田块图层

watch(() => areaMgr.getLength(), () => {
  // if (areaMgr.getLength() == 5) {
  //   for (const layer of thematicLayer) {
  //     const layerApiName = layer.apiName
  //     const layerParams = layer.layerParams || {};
  //     updateThematicLayerData(layerApiName, areaMgr.toNames(), layerParams)
  //   }
  // }
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
  2: BusinessOverview,
  // 未来扩展
  1: G2Charts,
}
const activeComponent = shallowRef(components[1])

const handleComponentToggle = (interfaceId) => {
  const component = components[interfaceId]
  if (!component) return

  if (activeComponent.value === component) {
    activeComponent.value = null
  } else {
    activeComponent.value = component
  }
}

// 数据传入卡片中
const selectedFeature = ref(null);
const showDetail = ref(false)
onMounted(async () => {
  if (map) {
    // 初始化点击监听
    initMapClickListener((props) => {
      selectedFeature.value = props;
      console.log("selectedFeature", selectedFeature.value)
      showDetail.value = true
    });
  }
});

onUnmounted(() => {
  cleanupMapClickListener();
});


</script>
<style></style>
