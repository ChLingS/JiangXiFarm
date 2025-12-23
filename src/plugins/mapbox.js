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

    const TIAN_DI_TU = '57613e03f2408b1d2243a49588aa57e0'
    console.log(TIAN_DI_TU);


    const map = new mapboxgl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          'tdt-satellite': {
            type: 'raster',
            tiles: [
              `http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIAN_DI_TU}`
            ],
            tileSize: 256,
          },
          'tdt-label': {
            type: 'raster',
            tiles: [
              `http://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIAN_DI_TU}`
            ],
            tileSize: 256,
          }
        },
        layers: [
          {
            id: 'tdt-satellite-layer',
            type: 'raster',
            source: 'tdt-satellite',
            minzoom: 0,
            maxzoom: 20
          },
          {
            id: 'tdt-label-layer',
            type: 'raster',
            source: 'tdt-label',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [116, 28.5],
      zoom: 6,
      projection: 'globe',
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
