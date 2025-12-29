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
    <div class="timer">
      <p>{{ date }}</p>
      <p>{{ time }}</p>
    </div>
    <div class="title">智慧农业展示平台</div>

    <div class="login-button ">

    </div>

  </header>
</template>

<script setup>
const currentTime = new Date();
const date = currentTime.toISOString().split('T')[0];
const time = currentTime.toTimeString().split(' ')[0];
</script>

<style>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 10vh;
  background-image: url("@/assets/images/header.png");
  background-size: cover;
  background-position: center center;
  z-index: 3;
  text-align: center;
  line-height: 82px;
  font-size: 3rem;
  color: #00b7ff;
  font-family: clockicons, sans-serif, Georgia, Times, 'Times New Roman', serif;
}

.timer {
  font-size: 1.5rem;
  position: absolute;
  left: 3rem;
  top: 1vh;
  display: flex;
  flex-direction: column;
  line-height: 0;
  font-weight: bold;
}

.timer p:last-child {
  margin-top: 1vh;
}

.title {
  margin-top: .5vh;
  font-size: 3rem;
  font-weight: bold;

}

.login-button {
  position: absolute;
  right: 3.2rem;
  top: 1vh;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-button .icon {
  width: 2.3rem;
  height: 2.3rem;

}

.login-button .text {
  /* margin-top: 0.2rem; */
  font-size: 1.2rem;
}
</style>
