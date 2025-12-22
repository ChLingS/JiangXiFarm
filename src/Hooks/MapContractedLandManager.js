import { inject, ref } from 'vue'

import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'

export default () => {
  const { map } = inject('$scene_map')

  const CONTRACTED_SOURCE_ID = 'poloygon-contracted-data-source'
  const FILL_CONTRACTED_LAYER_ID = 'polygon-contracted-fill-layer'
  const OUTLINE_CONTRACTED_LAYER_ID = 'polygon-contracted-outline-layer';

  let currentPopup = null;



}
