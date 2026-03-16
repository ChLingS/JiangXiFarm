import { ref, reactive, computed, toRefs, isRef, onUnmounted, type Ref } from 'vue'

// 1. 类型定义
type MaybeRef<T> = T | Ref<T>

interface Position {
  x: number
  y: number
}

interface DragOptions {
  initPosition?: Position
}

// 工具函数：统一获取 MaybeRef 类型的值
function toValue<T>(r: MaybeRef<T>): T {
  return isRef(r) ? r.value : r
}

// 2. 核心 Hook 实现 (带自动清理)
export function useDraggable(
  target: MaybeRef<HTMLElement | undefined | null>,
  options: DragOptions = {}
) {
  // 状态定义
  let isDragging = false
  const tempPosition = ref<Position>({ x: 0, y: 0 })
  const position = reactive<Position>({ x: 0, y: 0 })

  // 应用初始位置
  if (options.initPosition) {
    position.x = options.initPosition.x
    position.y = options.initPosition.y
  }

  // 3. 事件处理器 (定义为具名函数，以便后续移除)
  const handleEvent = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const start = (e: PointerEvent) => {
    handleEvent(e)
    isDragging = true
    const el = toValue(target)
    if (!el) return
    const { left, top } = el.getBoundingClientRect()
    tempPosition.value.x = e.clientX - left
    tempPosition.value.y = e.clientY - top
  }

  const move = (e: PointerEvent) => {
    handleEvent(e)
    if (!isDragging) return
    position.x = e.clientX - tempPosition.value.x
    position.y = e.clientY - tempPosition.value.y
  }

  const end = (e: PointerEvent) => {
    handleEvent(e)
    isDragging = false
    tempPosition.value.x = 0
    tempPosition.value.y = 0
  }

  // 4. 绑定事件监听器
  const setupEventListeners = () => {
    const el = toValue(target)
    if (el) {
      el.addEventListener('pointerdown', start, { capture: true })
      el.addEventListener('pointerup', end, { capture: true })
      window.addEventListener('pointermove', move, { capture: true })
    }
  }

  // 5. 清理事件监听器
  const cleanupEventListeners = () => {
    const el = toValue(target)
    if (el) {
      el.removeEventListener('pointerdown', start, true)
      el.removeEventListener('pointerup', end, true)
      window.removeEventListener('pointermove', move, true)
    }
  }

  // 立即设置监听器
  setupEventListeners()

  // 关键：在组件卸载时自动清理
  onUnmounted(() => {
    cleanupEventListeners()
  })


  return {
    position: computed(() => ({ x: position.x, y: position.y }))
  }
}
