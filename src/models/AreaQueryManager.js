import { ref, computed } from 'vue'

// 类型定义与说明
/**
 * 行政区节点
 * @typedef {Object} AreaNode
 * @property {string} level - 节点层级，如 'sheng' | 'shi' | ...
 * @property {string} name - 名称
 * @property {string} [code] - 可选的行政编码
 * @property {Object|Array<number>} [center] - 可选中心点（经纬或其他格式）
 * @property {Array<number>} [bbox] - 可选边界框 [minX,minY,maxX,maxY]
 */

/**
 * 固定层级：省、市、县、镇、村（高到低）
 * @type {string[]}
 */
const LEVELS = ['sheng', 'shi', 'xian', 'zhen', 'cun']

/**
 * 固定槽位的行政区管理器
 * - 每个层级一个槽位，保证同级只有一项
 * - 所有变更序列化以避免并发竞争
 * - 对外保持兼容的名称数组 `adNames`，并提供更丰富的槽位 API
 *
 * 节点格式建议：{ level, name, code, center, bbox }
 */
/**
 * 固定槽位的行政区管理器
 * - 每个层级一个槽位，保证同级只有一项
 * - 所有变更序列化以避免并发竞争
 * - 对外保持兼容的名称数组 `adNames`，并提供更丰富的槽位 API
 *
 * @example
 * const mgr = new AreaQueryManager(['省名','市名'])
 */
export default class AreaQueryManager {
  /**
   * @param {Array<string|AreaNode>} [initial] - 可选初始节点数组
   */
  constructor(initial = []) {
    this.slots = ref(LEVELS.reduce((acc, l) => (acc[l] = null, acc), {}))

    if (Array.isArray(initial) && initial.length) {
      initial.forEach((item, idx) => {
        const level = LEVELS[idx]
        if (!level) return
        if (item && typeof item === 'object') this.slots.value[level] = { ...item, level }
        else if (typeof item === 'string') this.slots.value[level] = { name: item, level }
      })
    }

    this._pending = Promise.resolve()

    this.adNames = computed(() => LEVELS.map(l => this.slots.value[l]?.name).filter(Boolean))
    this.adSlots = this.slots
    this.LEVELS = LEVELS
    this.depth = computed(() => {
      for (let i = LEVELS.length - 1; i >= 0; i--) if (this.slots.value[LEVELS[i]]) return i + 1
      return 0
    })
  }

  /**
   * 确保对 slots 的修改按序执行，避免并发冲突
   * @private
   * @param {() => any|Promise<any>} fn
   * @returns {Promise<any>}
   */
  _withLock(fn) {
    this._pending = this._pending.then(() => Promise.resolve().then(fn)).catch(() => fn())
    return this._pending
  }

  /**
   * 清除指定层级之下的所有槽位
   * @private
   * @param {string} level
   */
  _clearDeeper(level) {
    const idx = LEVELS.indexOf(level)
    if (idx < 0) return
    for (let i = idx + 1; i < LEVELS.length; i++) this.slots.value[LEVELS[i]] = null
  }

  /**
   * 在指定层级设置节点（会清除更低层级）
   * @param {string} level
   * @param {AreaNode|null} node
   * @returns {Promise<void>}
   */
  setLevel(level, node) {
    return this._withLock(() => {
      if (!LEVELS.includes(level)) return
      this.slots.value[level] = node ? { ...node, level } : null
      this._clearDeeper(level)
    })
  }

  /**
   * 推入一个节点到第一个空槽位，或按节点的 `level` 覆盖对应槽位
   * @param {string|AreaNode} node
   * @returns {Promise<void>}
   */
  push(node) {
    return this._withLock(() => {
      if (!node) return
      let resolved = null
      if (typeof node === 'string') resolved = { name: node }
      else if (typeof node === 'object') resolved = { ...node }
      else return

      if (resolved.level && LEVELS.includes(resolved.level)) {
        this.slots.value[resolved.level] = { ...resolved, level: resolved.level }
        this._clearDeeper(resolved.level)
        return
      }

      for (const l of LEVELS) {
        if (!this.slots.value[l]) {
          this.slots.value[l] = { ...resolved, level: l }
          this._clearDeeper(l)
          return
        }
      }
    })
  }

  /**
   * 推入名称（便捷方法）
   * @param {string} name
   * @returns {Promise<void>}
   */
  pushName(name) { return this.push(name) }

  /**
   * 移除名称匹配的槽位
   * @param {string} name
   * @returns {Promise<void>}
   */
  removeName(name) {
    return this._withLock(() => {
      for (const l of LEVELS) if (this.slots.value[l] && this.slots.value[l].name === name) this.slots.value[l] = null
    })
  }

  /**
   * 移除最深的非空槽位
   * @returns {Promise<void>}
   */
  popLast() {
    return this._withLock(() => {
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        const l = LEVELS[i]
        if (this.slots.value[l]) { this.slots.value[l] = null; return }
      }
    })
  }

  /**
   * 清除到指定层级（保留该层级），清除其以下槽位
   * @param {string} level
   * @returns {Promise<void>}
   */
  popTo(level) {
    return this._withLock(() => {
      if (!LEVELS.includes(level)) return
      const idx = LEVELS.indexOf(level)
      for (let i = idx + 1; i < LEVELS.length; i++) this.slots.value[LEVELS[i]] = null
    })
  }

  /**
   * 清空所有槽位
   * @returns {Promise<void>}
   */
  clear() { return this._withLock(() => LEVELS.forEach(l => this.slots.value[l] = null)) }

  /**
   * 用一组名称/节点填充槽位（按索引匹配层级）
   * @param {Array<string|AreaNode>} [newNames=[]]
   * @returns {Promise<void>}
   */
  setNames(newNames = []) {
    return this._withLock(() => {
      LEVELS.forEach((l, i) => {
        const item = newNames[i]
        if (!item) this.slots.value[l] = null
        else if (typeof item === 'string') this.slots.value[l] = { name: item, level: l }
        else this.slots.value[l] = { ...item, level: l }
      })
    })
  }

  /**
   * 获取当前最深（最后一个）节点
   * 返回浅拷贝以防止外部对内部状态的直接修改
   * @returns {AreaNode|null}
   */
  getCurrent() {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      const node = this.slots.value[LEVELS[i]]
      if (node) return { ...node }
    }
    return null
  }

  /**
   * 返回当前的名称数组（浅数组，仅包含名称字符串）
   * @returns {string[]}
   */
  toNames() { return this.adNames.value }

  /**
   * 返回当前深度（非空层级数）
   * @returns {number}
   */
  getLength() { return this.depth.value }
}
