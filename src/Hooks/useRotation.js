import { computed, inject, ref } from 'vue'

export default () => {
  const moving = ref(true)
  const { map } = inject('$scene_map')

  // 自转动画
  function rotation() {
    const zoom = map.getZoom()
    if (zoom < 5) {
      let center = map.getCenter()
      center.lng += 10
      map.easeTo({
        center,
        duration: 1000,
        easing: (n) => n,
      })
    }
  }
  rotation()
  map.on('moveend', () => {
    // 只有当状态为真时, 才执行自转
    moving.value && rotation()
  })

  // 定义控制 自转或者停止的方法
  function handleRotation() {
    moving.value = !moving.value
    if (!moving.value) {
      map.stop()
    } else {
      rotation()
    }
  }

  // 定义计算属性
  const mark = computed(() => {
    return moving.value ? '停止自转' : '开启自转'
  })

  return {
    mark,
    handleRotation,
  }
}
