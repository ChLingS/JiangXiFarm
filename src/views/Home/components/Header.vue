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
      <div class="icon">
        <svg t="1765603059594" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="6665" width="200" height="200">
          <path d="M0 0h1024v1024H0z" fill="#1296db" opacity=".01" p-id="6666"></path>
          <path
            d="M546.384 510.544c106.336-11.744 192.416-97.856 204.16-204.208C765.968 166.32 656.848 48 519.984 48 391.888 48 288 151.776 288 279.936v0.112c0 136.896 118.4 245.92 258.384 230.496zM512.048 576C357.184 576 48 665.312 48 842.704v100C48 961.152 62.88 976 81.104 976H942.88A33.2 33.2 0 0 0 976 942.704v-100C976.112 665.424 666.928 576 512.048 576z"
            fill="#1296db" p-id="6667"></path>
        </svg>
      </div>
      <button>
        1
      </button>
      <button>
        2
      </button>
      <div class="text">
        用户登录
      </div>
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
  top: 1.2rem;
  display: flex;
  flex-direction: column;
  line-height: 0;
  font-weight: bold;
}

.timer p:last-child {
  margin-top: 1.4rem;
}

.title {
  margin-top: .7rem;
  font-size: 3rem;
  font-weight: bold;

}

.login-button {
  position: absolute;
  right: 3.2rem;
  top: 1.3rem;
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
