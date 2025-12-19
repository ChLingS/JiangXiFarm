import { computed, inject, ref } from 'vue'

export default () => {
  const { map } = inject('$scene_map')

  const isCityView = ref(false)

  // 定义计算属性
  const flyMsg = computed(() => {
    return isCityView.value ? '地球视角' : '城市视角'
  })
  // 定义复位函数
  function flyTo() {
    isCityView.value = !isCityView.value

    if (isCityView.value) {
      map.flyTo({
        center: [114.3, 30.5],
        zoom: 14,
        pitch: 70,
      })
    } else {
      map.flyTo({
        center: [114.3, 30.5],
        zoom: 1,
        pitch: 0,
      })
    }
  }

  return {
    flyMsg,
    flyTo,
  }
}
