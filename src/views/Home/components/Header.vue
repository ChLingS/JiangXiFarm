<!-- eslint-disable vue/multi-word-component-names -->
<!--
 * @Author: wangshiyang
 * @Date: 2023-05-29 11:08:07
 * @LastEditors: wangshiyang
 * @LastEditTime: 2023-06-30 11:49:36
 * @Description: 请填写简介
-->
<template>
  <header class="header">
    <!-- 左上角日期组件 -->
    <div class="timer">
      <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <line x1="8" y1="14" x2="8" y2="14.01"></line>
        <line x1="12" y1="14" x2="12" y2="14.01"></line>
        <line x1="16" y1="14" x2="16" y2="14.01"></line>
        <line x1="8" y1="18" x2="8" y2="18.01"></line>
        <line x1="12" y1="18" x2="12" y2="18.01"></line>
      </svg>
      <div class="timer-content">
        <p class="date">{{ date }}</p>
        <p class="time">{{ time }}</p>
      </div>
    </div>

    <!-- 中间标题 -->
    <div class="title-container">
      <div class="title-icon-group">
        <!-- 麦穗图标 -->
        <svg class="wheat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L8 8L12 12L16 8L12 2Z"></path>
          <path d="M8 8L6 10L8 12L10 10L8 8Z"></path>
          <path d="M16 8L18 10L16 12L14 10L16 8Z"></path>
          <path d="M12 12L10 14L12 16L14 14L12 12Z"></path>
          <line x1="12" y1="16" x2="12" y2="20"></line>
          <line x1="8" y1="12" x2="6" y2="14"></line>
          <line x1="16" y1="12" x2="18" y2="14"></line>
        </svg>
        <!-- 芯片图标 -->
        <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <line x1="9" y1="4" x2="9" y2="20"></line>
          <line x1="15" y1="4" x2="15" y2="20"></line>
          <line x1="4" y1="9" x2="20" y2="9"></line>
          <line x1="4" y1="15" x2="20" y2="15"></line>
          <circle cx="9" cy="9" r="1" fill="currentColor"></circle>
          <circle cx="15" cy="9" r="1" fill="currentColor"></circle>
          <circle cx="9" cy="15" r="1" fill="currentColor"></circle>
          <circle cx="15" cy="15" r="1" fill="currentColor"></circle>
        </svg>
      </div>
      <div class="title-group">
    <div class="title">智慧农业展示平台</div>
        <div class="title-subtitle">Smart Agriculture Display Platform</div>
      </div>
    </div>

    <!-- 右上角功能图标 -->
    <div class="header-actions">
      <div class="action-icon" title="首页">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      <div class="action-icon" title="设置">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>
    </div>

    <!-- 背景装饰层 -->
    <div class="header-bg-overlay"></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const date = ref('')
const time = ref('')

const updateTime = () => {
  const now = new Date()
  date.value = now.toISOString().split('T')[0]
  time.value = now.toTimeString().split(' ')[0]
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style>
.header {
  position: fixed;
  top: -10px;
  left: -7px;
  width: 100%;
  height: 10vh;
  min-height: 80px;
  /* 不透明背景 */
  background: linear-gradient(135deg,
    rgba(10, 25, 47, 1) 0%,
    rgba(15, 35, 60, 1) 50%,
    rgba(10, 30, 50, 1) 100%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3rem;
  position: relative;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
  border-bottom: 2px solid rgba(64, 156, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 背景图片层 - 适应标题大小 */
.header-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("@/assets/images/header.png");
  background-size: auto 100%;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 1;
  pointer-events: none;
  z-index: 1;
  filter: brightness(0.8) contrast(1.1);
}

/* 标题区域背景图片增强 */
.title-container::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 150%;
  background-image: url("@/assets/images/header.png");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 0.6;
  z-index: -1;
  pointer-events: none;
}

.header > * {
  position: relative;
  z-index: 2;
}

/* 左上角日期组件 */
.timer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(64, 156, 255, 0.3);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.timer:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(64, 156, 255, 0.5);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 183, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.calendar-icon {
  width: 20px;
  height: 20px;
  color: #00b7ff;
  flex-shrink: 0;
  filter: drop-shadow(0 0 5px rgba(0, 183, 255, 0.5));
}

.timer-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timer-content .date,
.timer-content .time {
  margin: 0;
  color: #e0e0e0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.timer-content .date {
  font-size: 0.9rem;
  color: #b0c4de;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.timer-content .time {
  font-size: 1.2rem;
  font-family: 'Courier New', monospace;
  color: #00d4ff;
  text-shadow:
    0 0 10px rgba(0, 212, 255, 0.6),
    0 0 20px rgba(0, 183, 255, 0.4);
  font-weight: 700;
}

/* 中间标题区域 */
.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  position: relative;
  z-index: 2;
}

.title-icon-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wheat-icon {
  width: 32px;
  height: 32px;
  color: #ffd700;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  animation: float 3s ease-in-out infinite;
}

.chip-icon {
  width: 28px;
  height: 28px;
  color: #00b7ff;
  filter: drop-shadow(0 0 8px rgba(0, 183, 255, 0.6));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(2deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #00b7ff 0%, #00d4ff 50%, #00e5ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 183, 255, 0.6);
  letter-spacing: 2px;
  margin: 0;
  line-height: 1.2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.title-subtitle {
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #00b7ff 0%, #00d4ff 50%, #00e5ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(0, 183, 255, 0.5),
               0 0 30px rgba(0, 212, 255, 0.3);
  margin: 0;
  line-height: 1.2;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    filter: brightness(1);
    text-shadow: 0 0 20px rgba(0, 183, 255, 0.5),
                 0 0 30px rgba(0, 212, 255, 0.3);
  }
  to {
    filter: brightness(1.2);
    text-shadow: 0 0 30px rgba(0, 183, 255, 0.8),
                 0 0 40px rgba(0, 212, 255, 0.5),
                 0 0 50px rgba(0, 229, 255, 0.3);
  }
}

/* 右上角功能图标 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.action-icon svg {
  width: 22px;
  height: 22px;
  color: #00b7ff;
  transition: all 0.3s ease;
}

.action-icon:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: #00b7ff;
  box-shadow:
    0 0 20px rgba(0, 183, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-icon:hover svg {
  color: #00d4ff;
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header {
    padding: 0 2rem;
  }

  .title {
    font-size: 2rem;
  }

  .title-subtitle {
    font-size: 0.85rem;
  }

  .wheat-icon {
    width: 28px;
    height: 28px;
  }

  .chip-icon {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 768px) {
  .header {
    height: 8vh;
    min-height: 60px;
    padding: 0 1rem;
  }

  .timer {
    padding: 6px 12px;
    gap: 8px;
  }

  .calendar-icon {
    width: 16px;
    height: 16px;
  }

  .timer-content .date {
    font-size: 0.75rem;
  }

  .timer-content .time {
    font-size: 0.9rem;
  }

  .title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .title-subtitle {
    font-size: 0.7rem;
    letter-spacing: 1px;
  }

  .wheat-icon {
    width: 24px;
    height: 24px;
  }

  .chip-icon {
    width: 20px;
    height: 20px;
  }

  .action-icon {
    width: 36px;
    height: 36px;
  }

  .action-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>
