<template>
    <div class="contraction-status-panel" :class="{ 'collapsed': isCollapsed }">
        <div class="panel-header" @click="isCollapsed = !isCollapsed;">
            <div class="header-title">
                保单详情
            </div>
            <div class="collapse-icon">
                <i :class="['iconfont', isCollapsed ? 'icon-zhankai' : 'icon-shouqi']"></i>
            </div>
        </div>
        <transition name="slide-fade">
            <div class="panel-content" v-show="!isCollapsed">
                
            </div>
        </transition>

    </div>
</template>
<script setup>
import { ref } from 'vue';

let isCollapsed = ref(false)
</script>
<style scoped>
.contraction-status-panel {
    position: absolute;
    width: 450px;
    height: auto;
    max-height: 75vh;
    z-index: 3;
    top: 15%;
    left: 20px;
    display: flex;
    flex-direction: column;
    background: rgba(18, 25, 45, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(64, 156, 255, 0.3);
    border-radius: 12px;
    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(64, 156, 255, 0.1),
        0 0 20px rgba(64, 156, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(10, 18, 35, 0.9);
    border-bottom: 1px solid rgba(64, 156, 255, 0.2);
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease, border-bottom-color 0.3s ease;
    flex-shrink: 0;
}

.contraction-list-panel.collapsed .panel-header {
    border-bottom: 1px solid transparent;
    background: rgba(10, 18, 35, 1);
    border-radius: 12px;
}

.panel-header:hover {
    background: rgba(20, 30, 50, 0.9);
}

.header-title {
    font-weight: 600;
    font-size: 16px;
    color: #fff;
    letter-spacing: 1px;
}

.collapse-icon {
    cursor: pointer;
    color: #409cff;
    font-size: 18px;
    transition: transform 0.3s ease, color 0.3s ease;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.collapse-icon:hover {
    background: rgba(64, 156, 255, 0.1);
    transform: scale(1.1);
}

/* 收起/展开动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
    margin: 0;
    padding: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
    max-height: 1000px;
}

.panel-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    padding: 20px;
    overflow: hidden;
    gap: 20px;
}



</style>