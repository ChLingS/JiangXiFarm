// src/stores/layer.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 导入你的静态配置
import layerConfig from '../config/layerConfig.json'
// 获取业务层id对应的所有mapbox图层id
function getMapboxLayerIds(layerId: string): string[] {
  const layer = (layerConfig.layers as any[]).find(l => l.id === layerId)
  if (!layer || !layer.layerParams) return []
  const { fillLayerId, outlineLayerId, textLayerId } = layer.layerParams
  const ids = []
  if (fillLayerId) ids.push(fillLayerId)
  if (outlineLayerId) ids.push(outlineLayerId)
  if (textLayerId) ids.push(textLayerId)
  return ids
}

interface LayerConfig {
  layers: { id: string; visible: boolean }[];
}

const typedLayerConfig = layerConfig as LayerConfig;

export const useLayerStore = defineStore('layer', () => {
  // --------------- 状态 ---------------

  // 图层显隐状态：以图层id为key，存储visible状态
  const layerVisibility = ref<Record<string, boolean>>({})
  // 地图实例（需外部注入）
  let mapInstance: any = null

  // 注入mapbox实例
  const setMapInstance = (map: any) => {
    mapInstance = map
    syncToMapbox()
  }

  // 同步到mapbox
  const syncToMapbox = () => {
    if (!mapInstance) return
    console.log('Syncing layer visibility to Mapbox:', layerVisibility.value)
    Object.entries(layerVisibility.value).forEach(([layerId, visible]) => {
      const mapboxLayerIds = getMapboxLayerIds(layerId)
      mapboxLayerIds.forEach(mbLayerId => {
        if (mapInstance.getLayer(mbLayerId)) {
          mapInstance.setLayoutProperty(mbLayerId, 'visibility', visible ? 'visible' : 'none')
        } else {
          console.warn(`Mapbox layer with id "${mbLayerId}" not found for business layer "${layerId}"`)
        }
      })
    })
  }

  // 初始化：从JSON配置中读取每个图层的默认显隐状态
  const initialize = () => {
    typedLayerConfig.layers.forEach(layer => {
      layerVisibility.value[layer.id] = layer.visible
    })
    syncToMapbox()
  }

  // 立即初始化
  initialize()

  // --------------- Getter/计算属性 ---------------

  // 检查特定图层是否可见
  const isVisible = computed(() => (layerId: string) => {
    return layerVisibility.value[layerId] ?? false
  })

  // 获取当前所有可见的图层id数组
  const visibleLayerIds = computed(() => {
    return Object.keys(layerVisibility.value).filter(id => layerVisibility.value[id])
  })

  // --------------- Actions/方法 ---------------

  // 1. 切换单个图层显隐
  const toggle = (layerId: string) => {
    if (layerId in layerVisibility.value) {
      layerVisibility.value[layerId] = !layerVisibility.value[layerId]
      syncToMapbox()
    }
  }

  // 2. 显示指定图层
  const show = (layerId: string) => {
    console.log(`Showing layer: ${layerId}`)
    layerVisibility.value[layerId] = true
    syncToMapbox()
  }

  // 3. 隐藏指定图层
  const hide = (layerId: string) => {
    console.log(`Hiding layer: ${layerId}`)
    layerVisibility.value[layerId] = false
    syncToMapbox()
  }

  // 4. 批量操作（可选）
  const showAll = () => {
    Object.keys(layerVisibility.value).forEach(id => {
      layerVisibility.value[id] = true
    })
    syncToMapbox()
  }

  const hideAll = () => {
    Object.keys(layerVisibility.value).forEach(id => {
      layerVisibility.value[id] = false
    })
    syncToMapbox()
  }

  const hideAllThematicLayers = () => {
    Object.keys(layerVisibility.value).forEach(id => {
      const layerConfigItem = typedLayerConfig.layers.find(layer => layer.id === id)
      if (layerConfigItem && layerConfigItem.type === 'thematicLayer') {
        layerVisibility.value[id] = false
      }
    })
    syncToMapbox()
  }

  return {
    // 状态
    layerVisibility,

    // Getter
    isVisible,
    visibleLayerIds,

    // Actions
    toggle,
    show,
    hide,
    showAll,
    hideAll,
    initialize,
    setMapInstance,
    syncToMapbox
    , hideAllThematicLayers
  }
})
