<template>
  <div 
    ref="detailCard"
    class="tech-card"
    :class="{ 'minimized': isMinimized }"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px',
      zIndex: zIndex
    }"
  >
    <!-- 标题栏 -->
    <div 
      class="tech-header"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="header-left">
        <div class="header-icon">📍</div>
        <div class="header-title">地块详情</div>
        <div v-if="featureProperties" class="status-badge status-insured">
          已投保
        </div>
      </div>
      
      <div class="header-actions">
        <button 
          class="action-btn minimize-btn"
          @click="toggleMinimize"
          :title="isMinimized ? '展开' : '最小化'"
        >
          {{ isMinimized ? '⬆' : '⬇' }}
        </button>
        <button 
          class="action-btn close-btn"
          @click="handleClose"
          title="关闭"
        >
          ✕
        </button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div v-if="!isMinimized" class="tech-content">
      <!-- 基本信息卡片 -->
      <div class="basic-info-cards">
        <!-- 地块信息卡片 -->
        <div class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">📋</div>
            <h3>地块信息</h3>
          </div>
          <div class="info-card-content">
            <div class="info-item">
              <div class="info-label">地块编码</div>
              <div class="info-value code">{{ featureProperties?.dkbm || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">保单号</div>
              <div class="info-value code">{{ featureProperties?.bdh || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">作物类型</div>
              <div class="info-value">{{ featureProperties?.zw || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">面积(亩)</div>
              <div class="info-value highlight">{{ parseFloat(featureProperties?.area || 0).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 农户信息卡片 -->
        <div class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon">👤</div>
            <h3>农户信息</h3>
          </div>
          <div class="info-card-content">
            <div class="info-item">
              <div class="info-label">姓名</div>
              <div class="info-value">{{ featureProperties?.xm || '--' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">身份证号</div>
              <div class="info-value code">{{ formatIdCard(featureProperties?.sfz || '') }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">手机号</div>
              <div class="info-value">{{ formatPhone(featureProperties?.sjh || '') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 位置信息（紧凑显示） -->
      <div v-if="locationText" class="location-section">
        <div class="location-text" :title="locationText">
          <span class="location-icon">📍</span>
          {{ locationText }}
        </div>
      </div>

      <!-- 操作按钮（只保留编辑按钮） -->
      <div v-if="featureProperties" class="action-buttons">
        <button class="btn primary" @click="handleEdit">
          <span class="btn-icon">✏️</span>
          编辑信息
        </button>
      </div>
    </div>
    
    <!-- 最小化状态 -->
    <div v-else class="minimized-view" @click="toggleMinimize">
      <div class="min-content">
        <div class="min-icon">📍</div>
        <div class="min-info">
          <div class="min-title">{{ featureProperties?.zw || '地块' }}</div>
          <div class="min-detail">
            <span class="min-location">{{ getShortLocation() }}</span>
            <span class="min-area">{{ parseFloat(featureProperties?.area || 0).toFixed(2) }}亩</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  featureProperties: {
    type: Object,
    default: () => null
  },
  visible: {
    type: Boolean,
    default: false
  },
  initialPosition: {
    type: Object,
    default: () => ({ x: 100, y: 100 })
  }
})

const emit = defineEmits(['close', 'edit'])

// 响应式数据
const detailCard = ref(null)
const isMinimized = ref(false)
const position = ref({ x: props.initialPosition.x, y: props.initialPosition.y })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const zIndex = ref(1000)

// 计算属性
const locationText = computed(() => {
  if (!props.featureProperties) return ''
  const { sheng, shi, xian, zhen, cun } = props.featureProperties
  return [sheng, shi, xian, zhen, cun].filter(Boolean).join('') || ''
})

// 辅助方法
const formatIdCard = (id) => {
  if (!id || id.length !== 18) return id || '--'
  return `${id.substring(0, 6)}******${id.substring(12)}`
}

const formatPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone || '--'
  return `${phone.substring(0, 3)}****${phone.substring(7)}`
}

const getShortLocation = () => {
  if (!props.featureProperties) return ''
  const { xian, zhen } = props.featureProperties
  return `${xian || ''}${zhen || ''}`.slice(0, 8) || '未知'
}

// 拖拽方法
const startDrag = (e) => {
  zIndex.value = 1001
  isDragging.value = true
  
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  
  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }
  
  e.preventDefault()
}

const handleDrag = (e) => {
  if (!isDragging.value) return
  
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  
  position.value = {
    x: clientX - dragOffset.value.x,
    y: clientY - dragOffset.value.y
  }
  
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  if (detailCard.value) {
    const cardWidth = detailCard.value.offsetWidth
    const cardHeight = detailCard.value.offsetHeight
    
    position.value.x = Math.max(0, Math.min(position.value.x, windowWidth - cardWidth))
    position.value.y = Math.max(0, Math.min(position.value.y, windowHeight - cardHeight))
  }
}

const stopDrag = () => {
  isDragging.value = false
}

// 操作方法
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const handleClose = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.featureProperties)
}

// 生命周期
onMounted(() => {
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
/* 卡片基础样式 */
.tech-card {
  position: fixed;
  width: 480px;
  max-height: 80vh;
  background: rgba(18, 25, 45, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(64, 156, 255, 0.3);
  border-radius: 12px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(64, 156, 255, 0.1),
    0 0 20px rgba(64, 156, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
}

/* 标题栏 */
.tech-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(10, 18, 35, 0.8);
  border-bottom: 1px solid rgba(64, 156, 255, 0.2);
  cursor: move;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
  row-gap: 6px;
}

.header-icon {
  font-size: 18px;
  color: #409cff;
}

.header-title {
  font-weight: 600;
  font-size: 15px;
  color: #fff;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-insured {
  background: rgba(64, 156, 255, 0.2);
  color: #409cff;
  border: 1px solid rgba(64, 156, 255, 0.3);
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: rgba(255, 86, 86, 0.2);
  color: #ff5656;
}

/* 内容区域 */
.tech-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.tech-content::-webkit-scrollbar {
  width: 4px;
}

.tech-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.tech-content::-webkit-scrollbar-thumb {
  background: rgba(64, 156, 255, 0.3);
  border-radius: 2px;
}

.tech-content::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 156, 255, 0.5);
}

/* 基本信息卡片 */
.basic-info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex-shrink: 0;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.info-card-icon {
  color: #409cff;
  font-size: 14px;
}

.info-card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 36px;
}

.info-label {
  font-size: 11px;
  color: #8a9ba8;
  font-weight: 500;
}

.info-value {
  font-size: 12px;
  color: #e0e0e0;
  word-break: break-all;
  min-height: 18px;
}

.info-value.code {
  font-family: 'Courier New', monospace;
  color: #00e5ff;
  font-weight: 500;
  font-size: 11px;
  background: rgba(0, 229, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(0, 229, 255, 0.2);
}

.info-value.highlight {
  color: #00e676;
  font-weight: 600;
  font-size: 13px;
  background: rgba(0, 230, 118, 0.1);
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 230, 118, 0.2);
}

/* 位置信息 */
.location-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.location-section:hover {
  border-color: rgba(64, 156, 255, 0.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.location-text {
  font-size: 12px;
  color: #8a9ba8;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-icon {
  color: #409cff;
  font-size: 12px;
  flex-shrink: 0;
}

/* 操作按钮 */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  white-space: nowrap;
  min-height: 40px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.primary {
  background: linear-gradient(135deg, #409cff, #0066cc);
  color: white;
  border: 1px solid rgba(64, 156, 255, 0.3);
}

.primary:hover {
  background: linear-gradient(135deg, #4da6ff, #0077e6);
  border-color: rgba(64, 156, 255, 0.5);
}

.btn-icon {
  font-size: 13px;
  line-height: 1;
}

/* 最小化状态 */
.minimized-view {
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(10, 18, 35, 0.9), rgba(20, 30, 55, 0.9));
  border: 1px solid rgba(64, 156, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid #409cff;
  flex-shrink: 0;
}

.minimized-view:hover {
  background: linear-gradient(135deg, rgba(20, 30, 55, 0.9), rgba(30, 40, 65, 0.9));
  border-color: rgba(64, 156, 255, 0.3);
  transform: translateX(2px);
}

.min-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}

.min-icon {
  font-size: 16px;
  color: #409cff;
  line-height: 1;
}

.min-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 36px;
}

.min-title {
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.min-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  line-height: 1.2;
}

.min-location {
  color: #8a9ba8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  line-height: 1.2;
}

.min-area {
  color: #409cff;
  background: rgba(64, 156, 255, 0.1);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid rgba(64, 156, 255, 0.2);
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.2;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .tech-card {
    width: 90vw;
    left: 5vw !important;
    right: 5vw;
    max-height: 85vh;
  }
  
  .basic-info-cards {
    grid-template-columns: 1fr;
  }
}
</style>