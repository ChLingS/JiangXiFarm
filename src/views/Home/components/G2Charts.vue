<template>
  <div>
    <div class="g2-left">
      <div class="g2-chart g2-chart-left">
        <div class="people-sum">江西各市耕地面积（单位平方千米）</div>
        <ColumnChart v-bind="config" :data="data" />
      </div>
      <div class="g2-chart g2-chart-left">
        <div class="people-sum">目前各市更新数据占比</div>
        <RoseChart v-bind="bus_config" :data="bus_data" />
      </div>
    </div>
    <div class="g2-right">
      <div class="g2-chart" style="height:35%">
        <div class="people-sum">田块数据</div>
        <div>

        </div>
      </div>
      <div class="g2-chart" style="height:12%">
        <div class="people-sum">在线人员</div>
        <div class="hospital">
          <div class="item">
            <h4>开发人员 <span>4人</span></h4>
            <img style="width:40px;margin-top: 5px;" src="../assets/icons/开发人员.png" alt="">
          </div>
          <div class="item">
            <h4>外业人员 <span>12人</span></h4>
            <img style="width:40px;margin-top: 5px;" src="../assets/icons/工程勘测.png" alt="">
          </div>
          <div class="item">
            <h4>校对人员<span>20人</span></h4>
            <img style="width:40px;margin-top: 5px" src="../assets/icons/校对.png" alt="">
          </div>
        </div>
      </div>
      <div class="g2-chart" style="height:12%">
        <div class="people-sum">当前进展</div>
        <div class="hospital">
          <div class="item">
            <h4>已经完成地市 <span>5个</span></h4>
            <img style="margin-top:5px" src="../assets/icons/学校.png" alt="">
          </div>
          <div class="item">
            <h4>正在进行中<span style="color: aqua;">南昌县</span></h4>
            <img style="margin-top:8px" src="../assets/icons/学生.png" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ColumnChart, RoseChart } from "@opd/g2plot-vue";

// import { defineProps } from "vue";

/* 出行人口 */
import { useLeftTop } from '@/Hooks/useLeftTop';
import { useLeftBottom } from '@/Hooks/useLeftBottom'
const { config, data } = useLeftTop();
const { bus_config, bus_data } = useLeftBottom();

// let areaData = defineProps()=>{

// }


</script>
<style>
.g2-left,
.g2-right {
  position: absolute;
  z-index: 3;
  width: 25vw;
  top: 160px;
  height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.g2-right {
  right: 60px;
}

.g2-left {
  left: 20px;
}

.g2-chart {
  border-radius: 20px;
  padding: 20px;
  width: 100%;

  background: #53697670;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to bottom, #292e494f, #53697650);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to bottom, #292e4968, #5369766a);
  position: relative;
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.g2-chart:before {
  display: block;
  position: absolute;
  top: -5px;
  left: -2px;
  content: "";
  width: 111px;
  height: 35px;
  background-image: url("../assets/images/border.png");
  transform: rotate(180deg);
}

.g2-chart:after {
  display: block;
  position: absolute;
  bottom: -5px;
  right: -2px;
  content: "";
  width: 111px;
  height: 35px;
  background-image: url("../assets/images/border.png");
}

.g2-chart-left {
  height: 38%;
}

.hospital {
  display: flex;
  justify-content: space-evenly;
  color: #fff;
  align-items: flex-start;
  text-align: center;
}

.hospital .item {
  text-align: center;
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  align-items: center;
  /* flex: 1; */
  height: 80px;
}

.people-sum {
  top: -58px;
  line-height: 46px;
  color: white;
  width: 100%;
  height: 46px;
  text-align: center;
  position: absolute;
  background: url(../assets/images/chart-item.png) no-repeat;
  z-index: 1;
}

.field-info {
  color: white;
  padding: 10px;
  text-align: left;
}

.field-info p {
  margin: 5px 0;
}
</style>
