import requestAdapter from './request'
import CancelToken from './cancelToken'
import InterceptorManager from './interceptorManager'
import RequestQueue from './queue'
import { requestProxy } from './proxy'
import { isNotEmptyArray, isNotEmptyObject, transformReq, isThenable } from './util'
import {
  normalized,
  proxyUrl,
  isValidProxyConfig } from './mock'
export default class XFetch {
  constructor (options, MPX) {
    this.CancelToken = CancelToken
    // this.requestAdapter = (config) => requestAdapter(config, MPX)
    // 当存在 useQueue 配置时，才使用 this.queue 变量
    if (options && options.useQueue && typeof options.useQueue === 'object') {
      this.queue = new RequestQueue({
        adapter: (config) => requestAdapter(config, MPX),
        ...options.useQueue
      })
    } else {
      this.requestAdapter = (config) => requestAdapter(config, MPX)
    }
    if (options && options.proxy) this.setProxy(options.proxy)
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    }
  }

  mock( proxyConfig ) {
    const { proxy, defaultDomain } = proxyConfig
    
    let rawRequestFetch = this.fetch.bind(this)
    if (!isValidProxyConfig(proxy)) return
    let nomallizeProxy = normalized(proxy, defaultDomain)
    
    Object.defineProperty(this, 'fetch', {
      get() {
        return  (options) => {
          return new Promise((resolve, reject)=> {
            try {
              proxyUrl(nomallizeProxy, options)
              let data = rawRequestFetch.call(this, options)
              resolve(data)
            } catch (err) {
              reject(err)
            }
          })
        }
      }
    })
  }

  static normalizeConfig (config) {
    if (!config.url) {
      throw new Error('no url')
    }

    transformReq(config)

    if (!config.method) {
      config.method = 'GET'
    } else {
      config.method = config.method.toUpperCase()
    }

    const params = config.params || {}

    if (/^GET|DELETE|HEAD$/i.test(config.method)) {
      Object.assign(params, config.data)
      // get 请求都以params为准
      delete config.data
    }

    if (isNotEmptyObject(params)) {
      config.params = params
    }

    if (/^POST|PUT$/i.test(config.method)) {
      const header = config.header || {}
      let contentType = header['content-type'] || header['Content-Type']
      if (config.emulateJSON && !contentType) {
        header['content-type'] = 'application/x-www-form-urlencoded'
        config.header = header
      }
      delete config.emulateJSON
    }
  }

  create (options) {
    return new XFetch(options)
  }

  addLowPriorityWhiteList (rules) {
    // when useQueue not optioned, this.quene is undefined
    this.queue && this.queue.addLowPriorityWhiteList(rules)
  }

  setProxy (options) {
    // 代理配置
    if (isNotEmptyArray(options)) {
      this.proxyOptions = options
    } else if (isNotEmptyObject(options)) {
      this.proxyOptions = [options]
    } else {
      console.error('仅支持不为空的对象或数组')
    }
  }

  getProxy () {
    // 返回代理配置
    return this.proxyOptions
  }

  clearProxy () {
    // 解除代理配置
    this.proxyOptions = undefined
  }

  // 向前追加代理规则
  prependProxy (proxyRules) {
    if (isNotEmptyArray(proxyRules)) {
      this.proxyOptions = proxyRules.concat(this.proxyOptions)
    } else if (isNotEmptyObject(proxyRules)) {
      this.proxyOptions.unshift(proxyRules)
    } else {
      console.error('仅支持不为空的对象或数组')
    }
  }

  // 向后追加代理规则
  appendProxy (proxyRules) {
    if (isNotEmptyArray(proxyRules)) {
      this.proxyOptions = this.proxyOptions.concat(proxyRules)
    } else if (isNotEmptyObject(proxyRules)) {
      this.proxyOptions.push(proxyRules)
    } else {
      console.error('仅支持不为空的对象或数组')
    }
  }

  checkProxy (config) {
    return requestProxy(this.proxyOptions, config)
  }

  fetch (config, priority) {
    config.timeout = config.timeout || global.__networkTimeout
    // middleware chain
    const chain = []
    let promise = Promise.resolve(config)

    // use queue
    const request = (config) => {
      // 对config进行以下正规化处理：
      // 1. 检查config.url存在
      // 2. 抹平微信/支付宝header/headers字段差异
      // 3. 填充默认method为GET, method大写化
      // 4. 抽取url中query合并至config.params
      // 5. 对于类GET请求将config.data移动合并至config.params(最终发送请求前进行统一序列化并拼接至config.url上)
      // 6. 对于类POST请求将config.emulateJSON实现为config.header['content-type'] = 'application/x-www-form-urlencoded'
      // 后续请求处理都应基于正规化后的config进行处理(proxy/mock/validate/serialize)
      XFetch.normalizeConfig(config)
      if ( this.proxyOptions ) {
        config = this.checkProxy(config) // proxy
        if ( isThenable(config) ) return config
      }
      return this.queue ? this.queue.request(config, priority) : this.requestAdapter(config)
    }

    this.interceptors.request.forEach(function unshiftRequestInterceptors (interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected)
    })

    chain.push(request, undefined)

    this.interceptors.response.forEach(function pushResponseInterceptors (interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected)
    })

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }

    return promise
  }
}
