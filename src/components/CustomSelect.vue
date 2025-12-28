<template>
  <el-select class="ly-tab-sou" popper-class="popper-ly-tab-sou" v-model="selectVal" :filterable="filterable"
    :placeholder="placeholder" @change="selectChange">
    <template #prefix v-if="prefix">
      <img src="@/assets/svg/搜索.svg" />
    </template>
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  filterable: {
    type: Boolean,
    default: false
  },
  prefix: {
    type: Boolean,
    default: false
  },
  align: {
    type: String,
    default: 'right'
  },
  placeholder: {
    type: String,
    default: '搜索'
  }
});

const emits = defineEmits(['update:modelValue', 'onChangeSelect']);
const selectVal = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emits('update:modelValue', val);
  }
});

const selectChange = (val) => {
  emits('onChangeSelect', val);
};
</script>

<style scoped>
.ly-tab-sou {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* 使用:deep()穿透到子组件 */
.ly-tab-sou :deep(.el-input__wrapper) {
  background: rgba(30, 40, 60, 0.8) !important;
  border: 1px solid rgba(64, 156, 255, 0.2) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  width: 100%;
}

.ly-tab-sou :deep(.el-input__inner) {
  color: #e0e0e0 !important;
  font-size: 14px;
  background: transparent !important;
}

.ly-tab-sou :deep(.el-input__inner::placeholder) {
  color: rgba(224, 224, 224, 0.6) !important;
}

.ly-tab-sou :deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.ly-tab-sou :deep(.el-input__prefix img) {
  width: 16px;
  height: 16px;
  filter: invert(0.8) brightness(0.8);
}

.ly-tab-sou :deep(.el-input__suffix .el-icon) {
  color: rgba(224, 224, 224, 0.6) !important;
}

.ly-tab-sou :deep(.el-input__suffix .el-icon svg) {
  width: 14px;
  height: 14px;
}

.ly-tab-sou :deep(.el-input__clear) {
  color: rgba(224, 224, 224, 0.6) !important;
}

.ly-tab-sou :deep(.el-input__wrapper:hover) {
  border-color: rgba(64, 156, 255, 0.4) !important;
}

.ly-tab-sou :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(64, 156, 255, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(64, 156, 255, 0.2) !important;
}
</style>

<style>
/* 全局样式，用于修改下拉框 */
.popper-ly-tab-sou {
  background: rgba(18, 25, 45, 0.95) !important;
  border: 1px solid rgba(64, 156, 255, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
  border-radius: 6px !important;
}

.popper-ly-tab-sou .el-scrollbar {
  --el-fill-color-light: #484d56;
}

.popper-ly-tab-sou .el-select-dropdown__item {
  color: #e0e0e0 !important;
  background-color: transparent !important;
}

.popper-ly-tab-sou .el-select-dropdown__item:hover {
  background-color: rgba(64, 156, 255, 0.1) !important;
}

.popper-ly-tab-sou .el-select-dropdown__item.selected {
  color: #409cff !important;
  background-color: rgba(64, 156, 255, 0.1) !important;
}
</style>
