/**
 * @Author: ChLingS
 * @Date: 2023-11-20 15:16:35
 * @Description: fetch 风格的请求实例，支持 baseURL / timeout / 请求/响应拦截器
 */

import axios from 'axios';

// 创建一个通用的请求实例生成函数
const createInstance = (baseURL = 'http://47.120.78.8:82/py/') => {
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 15000000,
  });

  // 配置响应拦截器
  instance.interceptors.response.use(
    (res) => {
      if (res.status === 200) {
        return res.data;
      } else {
        console.error('请求失败');
        return Promise.reject('请求失败');
      }
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  return instance;
};

// 默认实例（使用默认 baseURL）
const defaultInstance = createInstance();

// 导出的 request 函数
const request = (config) => {
  return defaultInstance(config);
};

// 添加一个创建新实例的方法
request.create = (baseURL) => {
  const instance = createInstance(baseURL);
  return (config) => instance(config);
};

// 导出 request
export default request;
