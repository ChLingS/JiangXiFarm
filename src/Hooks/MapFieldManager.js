import { inject, watch, computed } from 'vue'
import mapboxgl from 'mapbox-gl'
import { JiangXiBoundsApi } from '@/api/api'
import * as turf from '@turf/turf'

export default (adNamesRef) => {  // 接收 AD_NAMES 作为参数
  const { map } = inject('$scene_map')

  const SOURCE_FIELD_ID = 'polygon-field-data-source';
  const FILL_FIELD_LAYER_ID = 'polygon-field-fill-layer';
  const OUTLINE_FIELD_LAYER_ID = 'polygon-field-outline-layer';

  let currentPopup = null;
  let currentHighlightedFeatureId = null;
  let currentClickListener = null;  // 用于田块的点击事件

  // 计算属性，判断是否需要加载田块
  const shouldLoadFields = computed(() => {
    return adNamesRef && adNamesRef.value && adNamesRef.value.length === 5;
  });

  // 获取当前行政区的名称（最后一级）
  const getCurrentAreaName = () => {
    if (!adNamesRef.value || adNamesRef.value.length === 0) {
      return null;
    }
    return adNamesRef.value[adNamesRef.value.length - 1];
  };

  const fetchFieldDataByName = async (name) => {
    try {
      const response = await JiangXiBoundsApi.getFieldByName(name)
      return response
    } catch (error) {
      console.error('获取田块数据失败:', error)
      return null
    }
  };

  // 清除高亮
  function clearHighlight() {
    if (currentHighlightedFeatureId !== null) {
      try {
        console.log('清除高亮，要素ID:', currentHighlightedFeatureId);

        const source = map.getSource(SOURCE_FIELD_ID);
        if (!source) {
          console.warn('田块数据源不存在');
          return;
        }

        const sourceData = source.serialize();
        if (sourceData && sourceData.data && sourceData.data.features) {
          const featureExists = sourceData.data.features.some(feature => {
            const id = feature.id || feature.properties?.id;
            return id === currentHighlightedFeatureId;
          });

          if (featureExists) {
            map.setFeatureState(
              {
                source: SOURCE_FIELD_ID,
                id: currentHighlightedFeatureId
              },
              { highlighted: false }
            );
            console.log('成功清除要素高亮状态');
          } else {
            console.warn('要素不存在于数据源中:', currentHighlightedFeatureId);
          }
        }
      } catch (error) {
        console.warn('清除高亮状态失败:', error);
      }
      currentHighlightedFeatureId = null;
    }
  }

  // 高亮指定要素
  function highlightFeature(feature) {
    console.log('准备高亮要素:', feature);

    const featureId = feature.id || feature.properties?.id;
    if (!featureId) {
      console.warn('要素没有ID，无法高亮', feature);
      return;
    }

    console.log('高亮要素ID:', featureId);

    if (currentHighlightedFeatureId === featureId) {
      console.log('要素已高亮，跳过');
      return;
    }

    clearHighlight();

    try {
      const source = map.getSource(SOURCE_FIELD_ID);
      if (!source) {
        console.warn('田块数据源不存在');
        return;
      }

      map.setFeatureState(
        {
          source: SOURCE_FIELD_ID,
          id: featureId
        },
        { highlighted: true }
      );

      console.log('成功设置要素高亮状态');
      currentHighlightedFeatureId = featureId;

      setTimeout(() => {
        map.triggerRepaint();
      }, 0);

    } catch (error) {
      console.error('设置高亮状态失败:', error);
    }
  }

  const initializeLayers = () => {
    // 创建田块数据源
    if (!map.getSource(SOURCE_FIELD_ID)) {
      map.addSource(SOURCE_FIELD_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    // 创建田块填充图层
    if (!map.getLayer(FILL_FIELD_LAYER_ID)) {
      map.addLayer({
        id: FILL_FIELD_LAYER_ID,
        type: 'fill',
        source: SOURCE_FIELD_ID,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            '#ff6b6b',  // 高亮颜色
            '#7cfc00'   // 正常颜色
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            0.6,  // 高亮透明度
            0.3   // 正常透明度
          ],
          'fill-outline-color': '#feaa03'
        }
      });
    }

    // 创建田块边界图层
    if (!map.getLayer(OUTLINE_FIELD_LAYER_ID)) {
      map.addLayer({
        id: OUTLINE_FIELD_LAYER_ID,
        type: 'line',
        source: SOURCE_FIELD_ID,
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            '#ff0000',  // 高亮颜色
            '#228b22'   // 正常颜色
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'highlighted'], false],
            3,  // 高亮线宽
            2   // 正常线宽
          ],
          'line-opacity': 1
        }
      });
    }
  };

  const setupFieldClickEvents = () => {
    // 移除旧的点击事件监听器
    if (currentClickListener) {
      map.off('click', currentClickListener);
    }

    const clickHandler = (e) => {
      const point = e.point;
      console.log('点击坐标:', point);

      // 查询田块图层
      let fieldFeatures = [];
      try {
        fieldFeatures = map.queryRenderedFeatures(point, {
          layers: [FILL_FIELD_LAYER_ID, OUTLINE_FIELD_LAYER_ID]
        });
      } catch (err) {
        console.warn('查询田块要素时出错:', err);
        return;
      }

      console.log('找到的田块要素:', fieldFeatures);

      if (fieldFeatures.length > 0) {
        const clickedFeature = fieldFeatures[0];
        const featureId = clickedFeature.id || clickedFeature.properties?.id;

        const isSameFeature = currentHighlightedFeatureId === featureId;

        if (!isSameFeature) {
          clearHighlight();
        }

        highlightFeature(clickedFeature);

        if (currentPopup) {
          currentPopup.remove();
          currentPopup = null;
        }

        const fieldInfo = clickedFeature.properties;
        const area = turf.area(clickedFeature);
        const areaInMu = (area / 666.67).toFixed(2);

        const popup = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: true
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 10px; font-family: Arial, sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                田块信息
              </h4>
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #666;">名称:</span>
                <span style="color: #333;">${fieldInfo.name || '未知'}</span>
              </p>
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #666;">面积:</span>
                <span style="color: #333;">${areaInMu} 亩</span>
              </p>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; text-align: center;">
                <small style="color: #999;">点击地图其他位置取消高亮</small>
              </div>
            </div>
          `)
          .addTo(map);

        popup.on('close', () => {
          setTimeout(() => {
            clearHighlight();
          }, 100);
        });

        currentPopup = popup;
        return;  // 阻止事件冒泡
      }

      // 如果没有点击到田块，清除高亮
      clearHighlight();

      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
      }
    };

    map.on('click', clickHandler);
    currentClickListener = clickHandler;
  };

  const clearFieldData = () => {
    console.log('清除田块数据');

    // 清除高亮状态
    clearHighlight();

    // 关闭popup
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }

    // 移除点击事件
    if (currentClickListener) {
      map.off('click', currentClickListener);
      currentClickListener = null;
    }

    // 清空田块数据
    const source = map.getSource(SOURCE_FIELD_ID);
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  };

  const loadFieldsForCurrentArea = async () => {
    if (!shouldLoadFields.value) {
      console.log('不满足加载田块条件，跳过');
      clearFieldData();
      return;
    }

    const areaName = getCurrentAreaName();
    if (!areaName) {
      console.log('无法获取行政区名称');
      clearFieldData();
      return;
    }

    console.log(`加载 ${areaName} 的田块数据`);

    try {
      // 获取田块数据
      const fieldData = await fetchFieldDataByName(areaName);
      if (!fieldData || !fieldData.features || fieldData.features.length === 0) {
        console.log('该区域没有田块数据');
        clearFieldData();
        return;
      }

      console.log(`获取到 ${fieldData.features.length} 个田块`);

      // 初始化田块图层
      initializeLayers();

      // 设置田块数据
      const source = map.getSource(SOURCE_FIELD_ID);
      if (source) {
        const featuresWithId = fieldData.features.map((feature, index) => {
          return {
            ...feature,
            id: feature.id || feature.properties?.id || `field_${index}_${Date.now()}`
          };
        });

        source.setData({
          type: 'FeatureCollection',
          features: featuresWithId
        });

        // 设置点击事件
        setupFieldClickEvents();
        console.log('田块数据加载完成');
      }
    } catch (error) {
      console.error('加载田块数据失败:', error);
      clearFieldData();
    }
  };
  const layerInitialize = async () => {
    // 监听 AD_NAMES 的变化
    watch(adNamesRef, (newVal) => {
      console.log('AD_NAMES 变化:', newVal);
      loadFieldsForCurrentArea();
    }, { deep: true, immediate: true });

    // 监听地图加载完成
    map.once('load', () => {
      console.log('地图加载完成，初始化田块图层');
      loadFieldsForCurrentArea();
    });
  };

  return {
    layerInitialize,
    clearFieldData,
    loadFieldsForCurrentArea
  };
};
