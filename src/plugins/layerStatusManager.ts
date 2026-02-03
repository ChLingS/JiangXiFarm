/**
 * 圖層狀態管理：載入 layerConfig.json 並提供全域圖層配置與查詢方法
 */

// --------------- 型別定義 ---------------

/** 圖層參數（Mapbox source/layer id） */
export interface LayerParams {
  sourceId: string
  fillLayerId: string
  outlineLayerId: string
  textLayerId?: string
}

/** 圖層樣式（Mapbox 表達式） */
export interface LayerStyle {
  fillLayerStyle?: Record<string, unknown>
  outlineLayerStyle?: Record<string, unknown>
}

/** 單一圖層配置 */
export interface LayerConfigItem {
  id: string
  /** 專題圖層類型，用於篩選 thematicLayer */
  type?: 'thematicLayer'
  layerParams: LayerParams
  label: string
  layerStyle?: LayerStyle
  visible: boolean
  zIndex: number
  apiName: string
  clickable: boolean
}

/** 根配置結構（與 layerConfig.json 一致） */
export interface LayerConfig {
  layers: LayerConfigItem[]
}

// --------------- 載入配置 ---------------

import layerConfigData from '../config/layerConfig.json'

/** 斷言為 LayerConfig（JSON 靜態載入） */
const config = layerConfigData as LayerConfig

// --------------- 全域圖層配置（唯讀） ---------------

/** 圖層配置列表（按 zIndex 排序後的快取） */
export const layers: readonly LayerConfigItem[] = [...config.layers].sort(
  (a, b) => a.zIndex - b.zIndex
)

/** 根配置物件，相容現有 provide/inject 用法 */
export const layerConfig: LayerConfig = {
  layers: [...layers],
}

// --------------- 查詢方法 ---------------

/**
 * 依 id 取得單一圖層（id 唯一：baseLayer | fieldLayer | contractLayer）
 */
export function getLayerById(id: string): LayerConfigItem | undefined {
  return layers.find((layer) => layer.id === id)
}

/**
 * 取得底圖（行政區劃）配置
 */
export function getBaseLayer(): LayerConfigItem | undefined {
  return getLayerById('baseLayer')
}

/**
 * 取得所有專題圖層配置（按 zIndex 排序）
 */
export function getThematicLayers(): LayerConfigItem[] {
  return layers.filter((layer) => layer.type === 'thematicLayer')
}

/**
 * 依 apiName 取得圖層
 */
export function getLayerByApiName(apiName: string): LayerConfigItem | undefined {
  return layers.find((layer) => layer.apiName === apiName)
}

// --------------- 預設匯出（供全域或 provide 使用） ---------------

export default {
  layerConfig,
  layers,
  getLayerById,
  getBaseLayer,
  getThematicLayers,
  getLayerByApiName,
}
