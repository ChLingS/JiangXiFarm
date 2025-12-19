<template>
  <div class="footer">
    <slot name="toggle"></slot>
  </div>
</template>

<script setup>

</script>

<style>
.footer {
  width: 100%;
  height: 8vh;
  position: fixed;
  z-index: 90;
  left: 0;
  bottom: 0;
  background: url('../assets/images/xzd-header.png') no-repeat;
  background-size: cover;
  transform: rotate(180deg);

}
</style>
