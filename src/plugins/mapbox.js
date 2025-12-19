/*
 * @Description:
 * @Author: your name
 * @version:
 * @Date: 2023-11-17 10:22:17
 * @LastEditors: your name
 * @LastEditTime: 2023-11-17 10:24:06
 */
// 导入相关库
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Scene } from '@antv/l7'
import { Mapbox } from '@antv/l7-maps'

// vue的插件: 导出一个对象
// 1. 在该对象必须包含一个install方法
// 2. 当执行app.use(插件对象)时, 会自动执行
export default {
  install(app) {
    // 创建scene和map对象
    // 1. 实例化mapbox中的map对象
    const token = import.meta.env.VITE_TOKEN
    mapboxgl.accessToken = token

    // 创建地图容器 <div id="map" style="width: 100%; height:100%">
    const container = document.createElement('div')
    container.id = 'map'
    container.setAttribute('style', 'width: 100%; height: 100%')
    document.body.appendChild(container)

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [116, 28.5],
      zoom: 6,
      projection: 'globe',
    })
    map.on('style.load', () => {
      map.setFog({})

      // 消除边界
      map.setFilter("admin-0-boundary-disputed", [
        "all",
        ["==", ["get", "disputed"], "true"],
        ["==", ["get", "admin_level"], 0],
        ["==", ["get", "maritime"], "false"],
        ["match", ["get", "worldview"], ["all", "CN"], true, false],
      ]);
      map.setFilter("admin-0-boundary", [
        "all",
        ["==", ["get", "admin_level"], 0],
        ["==", ["get", "disputed"], "false"],
        ["==", ["get", "maritime"], "false"],
        ["match", ["get", "worldview"], ["all", "CN"], true, false],
      ]);
      map.setFilter("admin-0-boundary-bg", [
        "all",
        ["==", ["get", "admin_level"], 0],
        ["==", ["get", "maritime"], "false"],
        ["match", ["get", "worldview"], ["all", "CN"], true, false],
      ]);
      // 删除标注图层
      const layersToRemove = [
        'water-name',      // 水域名称
        'waterway-label',  // 河流标注
        'natural-label',   // 自然特征标注
        'settlement-label',// 定居点标注
        'road-label',      // 道路标注
        'poi-label',       // 兴趣点标注
      ];

      layersToRemove.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });
    })

    const scene = new Scene({
      id: 'map',
      map: new Mapbox({
        mapInstance: map,
      }),
      logoVisible: false,
    })
    // 在app中通过provide提供scene和map对象
    app.provide('$scene_map', { scene, map })
  },
}
