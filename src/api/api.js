/*
* @Description: API 接口统一出口
* @Author: ChLingS
* @Date: 2025-12-14 11:43:00
* @LastEditors: ChLingS
* @LastEditTime: 2025-12-14 11:43:00

*/

import request from './request'

export const JiangXiApi = {

  getAreaByName: (name, level) => {
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
    const code = cityAdcodeMap[name] || '360000'
    switch (level) {
      case 0:
        return request({
          url: `/api/geojson/full/360000`,
          method: 'GET',
        })
      case 1:
        return request({
          url: `/api/geojson/full/${code}`,
          method: 'GET',
        })
      case 2:
        return request({
          url: `getXianBoundary_full?xian=${name}`,
          method: 'GET'
        })
      case 3:
        return request({
          url: `getZhenBoundary_full?zhen=${name}`,
          method: 'GET'
        })
      case 4:
        return request({
          url: `getCunBoundary?cun=${name}`,
          method: 'GET'
        })
    }
  },
  getFieldByName: (name) => {
    return request({
      url: `zaodaoShapfile?city=抚州&cun=${name}`,
      method: 'GET'
    })
  },
  getContractedLandByName: (name) => {
    return request({
      url: `${name}`,
      method: 'GET'
    })
  }
};

import apiRegistry from './apiRegistry.js'

// 注册API到注册表
apiRegistry.register('getAreaByName', JiangXiApi.getAreaByName);
apiRegistry.register('getFieldByName', JiangXiApi.getFieldByName);
apiRegistry.register('getContractedLandByName', JiangXiApi.getContractedLandByName);
