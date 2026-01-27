/*
* @Description: API 接口统一出口
* @Author: ChLingS
* @Date: 2025-12-14 11:43:00
* @LastEditors: ChLingS
* @LastEditTime: 2025-12-14 11:43:00

*/

import request from './request'

export const JiangXiApi = {

  getAreaByName: (nameCollection = []) => {
    const cityAdcodeMap = {
      // 省级
      '江西省': '360000',
      '江西': '360000',

      // 地级市
      '南昌市': '360100',
      '南昌': '360100',
      '景德镇市': '360200',
      '景德镇': '360200',
      '萍乡市': '360300',
      '萍乡': '360300',
      '九江市': '360400',
      '九江': '360400',
      '新余市': '360500',
      '新余': '360500',
      '鹰潭市': '360600',
      '鹰潭': '360600',
      '赣州市': '360700',
      '赣州': '360700',
      '吉安市': '360800',
      '吉安': '360800',
      '宜春市': '360900',
      '宜春': '360900',
      '抚州市': '361000',
      '抚州': '361000',
      '上饶市': '361100',
      '上饶': '361100'
    };
    const code = cityAdcodeMap[nameCollection.slice(-1)[0]] || '360000'
    switch (nameCollection.length) {
      case 1:
        return request({
          url: `/api/geojson/full/360000`,
          method: 'GET',
        })
      case 2:
        return request({
          url: `/api/geojson/full/${code}`,
          method: 'GET',
        })
      case 3:
        return request({
          url: `getXianBoundary_full?shi=${nameCollection[1]}&xian=${nameCollection[2]}`,
          method: 'GET'
        })
      case 4:
        return request({
          url: `getZhenBoundary_full?shi=${nameCollection[1]}&xian=${nameCollection[2]}&zhen=${nameCollection[3]}`,
          method: 'GET'
        })
      case 5:
        return request({
          url: `getCunBoundary?shi=${nameCollection[1]}&xian=${nameCollection[2]}&zhen=${nameCollection[3]}&cun=${nameCollection[4]}`,
          method: 'GET'
        })
    }
  },
  getFieldByName: (nameCollection) => {
    return request({
      url: `zaodaoShapfile?city=抚州&cun=${nameCollection[4]}`,
      method: 'GET'
    })
  },
  getContractedLandByName: (nameCollection) => {
    return request({
      url: `getContractedLayer?shi=${nameCollection[1]}&xian=${nameCollection[2]}&zhen=${nameCollection[3]}&cun=${nameCollection[4]}`,
      method: 'GET'
    })
  },

  /**
   * 根据AreaQueryManager实例自动构建查询
   * @param {Object} areaManager - AreaQueryManager实例
   * @param {Object} additionalParams - 额外参数
   * @param {number} [additionalParams.page=1] - 页码
   * @param {number} [additionalParams.page_size=20] - 每页大小
   */
  getContractedListByAreaManager: (areaManager, additionalParams = {}) => {
    if (!areaManager || !areaManager.slots) {
      throw new Error('areaManager参数无效')
    }

    const { slots } = areaManager
    const queryParams = {
      page: additionalParams.page || 1,
      page_size: additionalParams.page_size || 20
    }

    // 从areaManager中提取行政区划参数
    if (slots.value.sheng?.name) queryParams.sheng = slots.value.sheng.name
    if (slots.value.shi?.name) queryParams.shi = slots.value.shi.name
    if (slots.value.xian?.name) queryParams.xian = slots.value.xian.name
    if (slots.value.zhen?.name) queryParams.zhen = slots.value.zhen.name
    if (slots.value.cun?.name) queryParams.cun = slots.value.cun.name

    // 如果有地块编号参数，也添加
    if (additionalParams.bdh) queryParams.bdh = additionalParams.bdh

    // 过滤空参数
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key]
      }
    })

    return request({
      url: '/getContractedList',
      method: 'GET',
      params: queryParams
    })
  }
};


import apiRegistry from './apiRegistry.js'

// 注册API到注册表
apiRegistry.register('getAreaByName', JiangXiApi.getAreaByName);
apiRegistry.register('getFieldByName', JiangXiApi.getFieldByName);
apiRegistry.register('getContractedLandByName', JiangXiApi.getContractedLandByName);
apiRegistry.register('getContractedListByAreaManager', JiangXiApi.getContractedListByAreaManager);
