<!--
 * @Author: wangshiyang
 * @Date: 2023-05-29 15:45:15
 * @LastEditors: your name
 * @LastEditTime: 2023-11-17 10:44:56
 * @Description: 请填写简介
-->
<template>
  <Footer>
    <template v-slot:toggle>
      <div class="btn-groups">
        <div class="item">
          <button class="toggle-btn">
            <i class="iconfont icon-tubiaozhizuomoban"></i>
          </button>
          <p>边界显示</p>
        </div>
      </div>
    </template>
  </Footer>
</template>

<script setup>
import Footer from '@/components/Footer.vue';





</script>

<style>
.btn-groups {
  display: flex;
  color: #fff;
  position: absolute;
  left: 50%;
  font-size: 8px !important;
  bottom: -4px;
  transform: translateX(-50%) rotate(180deg);
}

.btn-groups .item {
  margin-left: 20px;
  text-align: center;
}

.btn-groups button {
  margin-bottom: 4px;
  font-size: 8px;
  /* padding: 5px; */
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  outline: none;
  color: #fff;
  background: #53697670;
  /* fallback for old browsers */
  /* Chrome 10-25, Safari 5.1-6 */
  box-shadow: 0 0 5px 3px #333;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.377), rgba(0, 128, 255, 0.281));
}

.btn-groups button:hover {
  cursor: pointer;
  background: linear-gradient(to bottom, rgba(0, 128, 255, 0.6), rgba(0, 128, 255, 0.281));
}
</style>
