<template>
  <div>
    <ContractionList @sendContraction=handleContractionData></ContractionList>
    <ContractionStatus></ContractionStatus>
    <AreaSelect></AreaSelect>
  </div>
</template>
<script setup>
import { ref, inject } from 'vue'

import ContractionList from '@/components/businessComponents/ContractionList.vue';
import ContractionStatus from '@/components/businessComponents/ContractionStatus.vue';
import AreaSelect from '@/components/businessComponents/AreaSelect.vue';

const layerConfig = inject('layerConfig');
const baseLayer = layerConfig.layers.find(layer => layer.id === 'baseLayer')
const thematicLayer = layerConfig.layers.filter(layer => layer.id === 'thematicLayer').sort((a, b) => a.zIndex - b.zIndex)

const areaMgr = inject('areaManager');

const updateThematicLayerData = inject('updateThematicLayerData');
const updateBoundaryLayerData = inject('updateBoundaryLayerData');

const setHighlight = inject('setHighlight');

const handleContractionData = async (contractionData) => {
  console.log('contractionData', contractionData);

  const LEVELS = ['sheng', 'shi', 'xian', 'zhen', 'cun'];

  // 生成当前数据的标准化名称数组（按层级顺序）
  const currentNames = areaMgr.toNames();
  const newNames = LEVELS.map(level => contractionData.originalData[level] || '');

  // 深度比较新旧名称数组（简单场景可直接用 === 比较）
  const namesChanged = JSON.stringify(currentNames.sort()) !== JSON.stringify(newNames.sort());

  if (namesChanged) {
    // 创建新槽位对象（保留现有层级结构）
    const newSlots = { ...areaMgr.slots.value };

    // 按固定层级顺序处理（省→市→县→镇→村）
    LEVELS.forEach(level => {
      const name = contractionData.originalData[level];
      newSlots[level] = name
        ? { level, name, ...newSlots[level] } // 合并原有属性（如 code/center）
        : null; // 显式设置为 null（避免意外残留）
    });

    // 批量更新所有槽位
    areaMgr.slots.value = newSlots;

    console.log('areaMgr updated:', areaMgr.toNames());

    // 触发边界图层更新
    updateBoundaryLayerData(areaMgr.toNames());

    // 触发专题图层更新
    for (const layer of thematicLayer) {
      const { apiName, layerParams = {} } = layer;
      await updateThematicLayerData(apiName, areaMgr.toNames(), layerParams);
    }
  }

  await setHighlight(contractionData.originalData.bdh, 'contract-data-source', 'bdh');



};

</script>
<style scoped></style>
