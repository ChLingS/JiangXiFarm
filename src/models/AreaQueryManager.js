import { ref, computed } from 'vue'

// 固定层级：省、市、县、镇、村（高到低）
const LEVELS = ['sheng', 'shi', 'xian', 'zhen', 'cun']

/**
 * 固定槽位的行政区管理器
 * - 每个层级一个槽位，保证同级只有一项
 * - 所有变更序列化以避免并发竞争
 * - 对外保持兼容的名称数组 `adNames`，并提供更丰富的槽位 API
 *
 * 节点格式建议：{ level, name, code, center, bbox }
 */
export default class AreaQueryManager {
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

  _withLock(fn) {
    this._pending = this._pending.then(() => Promise.resolve().then(fn)).catch(() => fn())
    return this._pending
  }

  _clearDeeper(level) {
    const idx = LEVELS.indexOf(level)
    if (idx < 0) return
    for (let i = idx + 1; i < LEVELS.length; i++) this.slots.value[LEVELS[i]] = null
  }

  setLevel(level, node) {
    return this._withLock(() => {
      if (!LEVELS.includes(level)) return
      this.slots.value[level] = node ? { ...node, level } : null
      this._clearDeeper(level)
    })
  }

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

  pushName(name) { return this.push(name) }

  removeName(name) {
    return this._withLock(() => {
      for (const l of LEVELS) if (this.slots.value[l] && this.slots.value[l].name === name) this.slots.value[l] = null
    })
  }

  popLast() {
    return this._withLock(() => {
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        const l = LEVELS[i]
        if (this.slots.value[l]) { this.slots.value[l] = null; return }
      }
    })
  }

  popTo(level) {
    return this._withLock(() => {
      if (!LEVELS.includes(level)) return
      const idx = LEVELS.indexOf(level)
      for (let i = idx + 1; i < LEVELS.length; i++) this.slots.value[LEVELS[i]] = null
    })
  }

  clear() { return this._withLock(() => LEVELS.forEach(l => this.slots.value[l] = null)) }

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

  getCurrent() {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      const node = this.slots.value[LEVELS[i]]
      if (node) return node
    }
    return null
  }

  toNames() { return this.adNames.value }

  getLength() { return this.depth.value }
}
