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
      <!-- 地块信息 -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">📋</div>
          <h3>地块信息</h3>
        </div>
        
        <div v-if="featureProperties" class="info-grid">
          <div class="info-row">
            <span class="info-label">位置：</span>
            <span class="info-value location">{{ featureLocation }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">地块编码：</span>
            <span class="info-value id-value">{{ featureProperties.dkbm }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">ID：</span>
            <span class="info-value id-value">{{ featureProperties.id }}</span>
          </div>
          
          <div v-if="featureProperties.area" class="info-row">
            <span class="info-label">面积：</span>
            <span class="info-value highlight">{{ featureProperties.area }}亩</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">作物：</span>
            <span class="info-value">{{ featureProperties.zw }}</span>
          </div>
        </div>
        
        <div v-else class="no-data">
          <div class="no-data-icon">📭</div>
          <p>请点击地图上的地块</p>
        </div>
      </div>
      
      <!-- 投保人信息 -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">👤</div>
          <h3>投保人信息</h3>
        </div>
        
        <div v-if="featureProperties" class="info-grid">
          <div class="info-row">
            <span class="info-label">姓名：</span>
            <span class="info-value">{{ featureProperties.xm }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">身份证：</span>
            <span class="info-value">{{ featureProperties.sfz }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">手机号：</span>
            <span class="info-value">{{ featureProperties.sjh }}</span>
          </div>
        </div>
      </div>
      
      <!-- 保单信息 -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">📄</div>
          <h3>保单信息</h3>
        </div>
        
        <div v-if="featureProperties" class="info-grid">
          <div class="info-row">
            <span class="info-label">保单号：</span>
            <span class="info-value id-value">{{ featureProperties.bdh }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">承保标的：</span>
            <span class="info-value">{{ featureProperties.zw }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">承保面积：</span>
            <span class="info-value highlight">{{ featureProperties.area }}亩</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="featureProperties" class="action-buttons">
        <button class="btn secondary" @click="handleViewDetails">
          查看详情
        </button>
        <button class="btn primary" @click="handleEdit">
          编辑
        </button>
      </div>
    </div>
    
    <!-- 最小化状态 -->
    <div v-else class="minimized-view" @click="toggleMinimize">
      <div v-if="featureProperties" class="min-location">
        {{ featureLocationShort }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const emit = defineEmits(['close', 'view-details', 'edit'])

// 响应式数据
const detailCard = ref(null)
const isMinimized = ref(false)
const position = ref({ x: props.initialPosition.x, y: props.initialPosition.y })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const zIndex = ref(1000)

// 计算属性
const featureLocation = computed(() => {
  if (!props.featureProperties) return ''
  const { sheng, shi, xian, zhen, cun } = props.featureProperties
  return `${sheng || ''}${shi || ''}${xian || ''}${zhen || ''}${cun || ''}` || '未知位置'
})

const featureLocationShort = computed(() => {
  if (!props.featureProperties) return ''
  const { xian, zhen } = props.featureProperties
  return `${xian || ''}${zhen || ''}` || '未知位置'
})

// 方法
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
  
  // 限制在窗口内
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

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const handleClose = () => {
  emit('close')
}

const handleViewDetails = () => {
  emit('view-details', props.featureProperties)
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
.tech-card {
  position: fixed;
  width: 400px;
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
}

/* 标题栏 */
.tech-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(10, 18, 35, 0.8);
  border-bottom: 1px solid rgba(64, 156, 255, 0.2);
  cursor: move;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 20px;
  color: #409cff;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: #fff;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-insured {
  background: rgba(64, 156, 255, 0.2);
  color: #409cff;
  border: 1px solid rgba(64, 156, 255, 0.3);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  font-size: 14px;
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
  padding: 20px;
}

.info-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(64, 156, 255, 0.2);
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.section-icon {
  color: #409cff;
  font-size: 18px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  font-size: 14px;
  line-height: 1.5;
}

.info-label {
  flex: 0 0 80px;
  color: #8a9ba8;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #e0e0e0;
  word-break: break-word;
}

.location {
  color: #fff;
  font-weight: 500;
}

.id-value {
  font-family: 'Courier New', monospace;
  color: #00e5ff;
  font-weight: 500;
}

.highlight {
  color: #00e676;
  font-weight: 600;
}

/* 无数据状态 */
.no-data {
  text-align: center;
  padding: 20px;
  color: #8a9ba8;
}

.no-data-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(64, 156, 255, 0.2);
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary {
  background: linear-gradient(135deg, #409cff, #0066cc);
  color: white;
}

.primary:hover {
  background: linear-gradient(135deg, #4da6ff, #0077e6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 156, 255, 0.3);
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 最小化状态 */
.minimized-view {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(10, 18, 35, 0.8);
  border: 1px solid rgba(64, 156, 255, 0.2);
  cursor: pointer;
  gap: 12px;
}

.min-icon {
  color: #409cff;
  font-size: 18px;
}

.min-text {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  flex: 1;
}

.min-location {
  font-size: 12px;
  color: #8a9ba8;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .tech-card {
    width: 90vw;
    left: 5vw !important;
    right: 5vw;
  }
  
  .tech-content {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>