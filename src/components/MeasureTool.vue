<!--
 * @Author: wangshiyang
 * @Date: 2023-05-29 11:22:19
 * @LastEditors: your name
 * @LastEditTime: 2023-11-17 10:11:05
 * @Description: 测量组件
-->
<template>
  <el-popover placement="top" :width="100" trigger="click" popper-style="background-color: #53697670;color:#fff">
    <template #reference>
      <slot></slot>
    </template>
    <div class="popover-w">
      <i v-for="item in tools" :key="item" :class="computeClass(item)" @click="activeTool(item)"></i>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'

const tools = ref(['drawPolygonTool', 'drawRectTool', 'drawCircleTool', 'line', 'delete'])

const props = defineProps({
  toolManager: Object
})

const toolManager = props.toolManager

const emit = defineEmits(['startMeasure'])
const computeClass = computed(() => (item) => {
  const res = {
    'iconfont': true,
    'query-item': true
  }
  res[`icon-${item}`] = true
  return res
})

const activeTool = (type) => {
  // 先清除
  toolManager.stopDrawing(true)
  toolManager.initTool()
  if (type === 'delete') {
    return
  }
  toolManager.activeTool(type)
}
</script>

<style scoped>
.el-button+.el-button {
  margin-left: 8px;
}

.popover-w {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.query-item:hover {
  cursor: pointer;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.6), rgba(0, 128, 255, 0.281));
}
</style>
