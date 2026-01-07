/**
 * API注册表和管理类
 */
class ApiRegistry {
  constructor() {
    this.handlers = new Map();
    this.middlewares = [];
  }

  /**
   * 注册API处理器
   * @param {string} name - API名称
   * @param {Function} handler - 处理函数
   */
  register(name, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`处理器必须是函数: ${name}`);
    }
    this.handlers.set(name, handler);
    console.log(`API处理器已注册: ${name}`);
  }

  /**
   * 取消注册API处理器
   * @param {string} name - API名称
   */
  unregister(name) {
    this.handlers.delete(name);
  }

  /**
   * 获取API处理器
   * @param {string} name - API名称
   * @returns {Function|null} 处理器函数
   */
  getHandler(name) {
    return this.handlers.get(name) || null;
  }

  /**
   * 添加中间件
   * @param {Function} middleware - 中间件函数
   */
  addMiddleware(middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * 执行API调用
   * @param {string} name - API名称
   * @param {...any} args - 参数
   * @returns {Promise<any>} API结果
   */
  async execute(name, ...args) {
    const handler = this.getHandler(name);
    if (!handler) {
      console.error(`未注册的API处理器: ${name}`);
      return {
        success: false,
        error: `未注册的API处理器: ${name}`
      };
    }

    try {
      // 执行前置中间件
      let processedArgs = args;
      for (const middleware of this.middlewares) {
        processedArgs = await this._runMiddleware(middleware, 'before', name, processedArgs);
      }

      // 执行主处理器
      const result = await handler(...processedArgs);

      // 执行后置中间件
      let finalResult = result;
      for (const middleware of this.middlewares) {
        finalResult = await this._runMiddleware(middleware, 'after', name, finalResult);
      }

      return {
        success: true,
        data: finalResult
      };
    } catch (error) {
      console.error(`API执行失败: ${name}`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 运行中间件
   * @private
   */
  async _runMiddleware(middleware, stage, name, data) {
    if (typeof middleware[stage] === 'function') {
      return await middleware[stage](name, data);
    }
    return data;
  }

  /**
   * 检查API是否存在
   * @param {string} name - API名称
   * @returns {boolean}
   */
  hasHandler(name) {
    return this.handlers.has(name);
  }

  /**
   * 获取所有注册的API名称
   * @returns {string[]}
   */
  getRegisteredApis() {
    return Array.from(this.handlers.keys());
  }
}

// 创建全局实例
const apiRegistry = new ApiRegistry();

export default apiRegistry;
