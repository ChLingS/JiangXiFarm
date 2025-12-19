<!--
 * @Author: wangshiyang
 * @Date: 2023-05-29 11:22:19
 * @LastEditors: wangshiyang
 * @LastEditTime: 2023-05-30 14:06:29
 * @Description: 展示查询数据
-->
<template>
    <div class="displayCard">
        <el-table :data="tableData" style="width: 180px" size="small" :max-height="400" @row-click="clickRow">
            <el-table-column :show-overflow-tooltip="true" prop="event_num" label="编号" width="60" />
            <el-table-column prop="name" label="类型" width="60" />
            <el-table-column fixed="right" label="操作" width="60">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click.stop="handleClick(scope.row)">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- 详细信息展示 -->
    <el-dialog v-model="dialogVisible" title="事故详情" width="60%" :append-to-body="true">
        <el-table :data="detailData" style="width: 100%" size="small" :max-height="400" @row-click="clickRow">
            <el-table-column :show-overflow-tooltip="true" prop="event_num" label="编号" />
            <el-table-column :show-overflow-tooltip="true" prop="longtitude" label="坐标经度" />
            <el-table-column :show-overflow-tooltip="true" prop="latitude" label="坐标纬度" />
            <el-table-column prop="name" label="事故类型" />
            <el-table-column prop="area" label="事故区域" />
            <el-table-column prop="car_num" label="车牌号"  />
            <el-table-column prop="driver" label="事故人" />
            <el-table-column prop="level" label="事故等级"/>
            <el-table-column prop="phone" label="手机号"/>
        </el-table>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
</template>
      
<script setup>
import { ref, defineProps, onMounted, inject, watch, onUnmounted } from 'vue'
import { PointLayer } from '@antv/l7'
const { scene, map } = inject("$scene_map");
// 展示详细信息
const dialogVisible = ref(false)

let pointLayer, markLayer
const props = defineProps({
    dataS: Array
})
const tableData = ref([])
const detailData = ref([])
watch(() => props.dataS, (now) => {
    reRenderCard()
})

onMounted(() => {
    !scene.hasImage('crash') && scene.addImage('crash', '/src/assets/images/crash.jpg')
    reRenderCard()
})

onUnmounted(() => {
    pointLayer && scene.removeLayer(pointLayer)
    markLayer && scene.removeLayer(markLayer)
})

const reRenderCard = () => {
    if (pointLayer) {
        scene.removeLayer(pointLayer)
    }
    pointLayer = new PointLayer();
    if (props.dataS.length) {
        const source = []
        console.log(props.dataS);
        tableData.value = props.dataS.map(item => {
            const { geometry, properties: { event_num, name, ...rest } } = item
            const coordinates = geometry.coordinates
            source.push({
                lng: coordinates[0],
                lat: coordinates[1],
                name
            })
            return {
                geometry,
                event_num,
                name,
                rest
            }
        })
        pointLayer.source(source, {
            parser: {
                type: 'json',
                x: 'lng',
                y: 'lat'
            }
        }).shape('crash').size(16)
        scene.addLayer(pointLayer)
    }
}

// 展示详细信息
const handleClick = (row) => {
    const { event_num, geometry: { coordinates }, name, rest: { area, car_num, driver, id, level, phone } } = row
    detailData.value = [
        {
            event_num,
            longtitude: coordinates[0],
            latitude: coordinates[1],
            name,
            area,
            car_num,
            id,
            driver,
            level,
            phone
        }
    ]
    dialogVisible.value = true
}

// 点击行跳转
const clickRow = (row, column, event) => {
    if (row.geometry.coordinates) {
        markLayer && scene.removeLayer(markLayer)
        // 添加动态点
        const data = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: row.geometry.coordinates
                    },
                    properties: {
                        name: "marker"
                    }
                }
            ]
        }

        markLayer = new PointLayer({}).source(data)
        markLayer
            .shape('radar')
            .size(60)
            .color('#f00')
            .animate(true);
        scene.addLayer(markLayer);
        // 添加事故点
        map.flyTo({
            //飞行的中心点
            center: row.geometry.coordinates,
            //飞行之后地图的放大级别
            zoom: 15,
            //控制飞行的速度
            speed: 0.4,
            /* 俯仰角0-90 */
            pitch: 30
        })

    }
}

</script>
      
<style scoped>
.displayCard {
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -220px;
    bottom: 65px;
    outline: none;
    color: #fff;
    background: #53697670;
    border-radius: 4px;
    box-shadow: 0 0 5px 3px #333;
}

.eleCeil {
    background: transparent;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.el-table) {
    background-color: transparent;
}

:deep(.el-table tr) {
    background-color: transparent;
    color: #fff;
    cursor: pointer;
}

:deep(.el-table tr:hover) {
    background-color: #333;
}

:deep(.el-table--enable-row-transition .el-table__body td.el-table__cell) {
    background-color: transparent;
}

:deep(.el-table th.el-table__cell) {
    background-color: transparent;
}

:deep(.el-table td.el-table__cell) {
    border-bottom: none;
}

:deep(.el-table__inner-wrapper::before) {
    height: 0;
}
</style>
  
  