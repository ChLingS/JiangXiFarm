import { inject, ref } from 'vue'

import { PolygonLayer } from '@antv/l7'

import { JiangXiBoundsApi } from '@/api/api'

export default () => {
  const { map } = inject('$scene_map')

  let currentBoundaryLayer = null
  let currentBoundaryNameLayer = null

  let oldBoundaryLayer = null
  let oldBoundaryNameLayer = null

  const createnameLayer = (boundLayerData) => {

  }
  const getBounds = async (id) => {
    const boundLayerData = await JiangXiBoundsApi.getBounds(id)
    const newBoundaryLayer = PolygonLayer({
      autoFit: false,
      event: true,
    }).source({
      type: 'FeatureCollection',
      features: boundLayerData.features,
    })
      .color('#FF5722')
      .shape('fill')
      .style({
        opacity: 0.4,
        stroke: '#FF5722',
        strokeWidth: 2,
      })
      .active(true)
      .active({
        color: '#FFC107',
        stroke: '#FFC107',
      })
    const newBoundaryNameLayer =

    return newBoundaryLayer
  }

}
