


import XFetch from '../src/xfetch'

// const xfetch = new XFetch({
//     isMock: true,  // 开发环境 --mock开启后为true
//     proxyConfig: {
//       defaultDomain: 'http://10.88.128.16:8000',
//       proxy: [{
//         context: ['/dynamic/conf', '/mini/getBubble', '/webapp/super/app', '/gulfstream/performance/v1/other/pGetMessageInfo'],
//         target: '/promise-mock/mock/DxH766opl'
//       }]
      // filter:(url)=> {
      // },
  
      // proxy: {
      //   '/dynamic/conf': {
      //     target: '/promise-mock',
      //     pathRewrite: {'^/dynamic/conf': "/mock/DxH766opl/dynamic/conf"}
      //   },
      //   '/mini/getBubble': {
      //     target: '/promise-mock/mock/DxH766opl',
      //   },
      //   '/webapp/super/app': {
      //     target: '/promise-mock/mock/DxH766opl',
      //   }
      // }

      // proxy: {
        // '/': 'http://gzpregsapi.udache.com'
        // '/dynamic/conf': '/promise-mock/mock/DxH766opl',
        // '/mini/getBubble': '/promise-mock/mock/DxH766opl',
        // '/webapp/super/app': '/promise-mock/mock/DxH766opl'
        // '/api/v1/passenger': '/abc123'
      // }
//     }
// })


/*
describe('proxy url test1', () => {
    const xfetch = new XFetch({
        isMock: true,  // 开发环境 --mock开启后为true
        proxyConfig: {
          defaultDomain: 'http://10.88.128.16:8000',
          proxy: [{
            context: ['/dynamic/conf'],
            target: '/promise-mock/mock/DxH766opl'
          }]
        }
    })
    it("proxy one-1",() => {
        // request url
        const options = { url: 'http://www.baidu.com/dynamic/conf'}
        xfetch.fetch(options)
        expect(options.url).toBe('http://10.88.128.16:8000/promise-mock/mock/DxH766opl/dynamic/conf')
    })
    it("proxy one-2",() => {
        // request url
        const options = { url: 'http://www.baidu.com/dynamic'}
        xfetch.fetch(options)
        expect(options.url).toBe('http://www.baidu.com/dynamic')
    })
})


describe('proxy url test2', () => {
    const xfetch = new XFetch({
        isMock: true,  // mini-开发环境 --mock开启后为true
        proxyConfig: {
          defaultDomain: 'http://10.88.128.16:8000',
           proxy: {
                '/dynamic/conf': {
                    target: '/promise-mock',
                    pathRewrite: {'^/dynamic/conf': "/mock/DxH766opl/dynamic/conf"}
                }
            }
        }
    })
    it("proxy two-1.",() => {
        // request url
        const options = { url: 'http://www.baidu.com/dynamic/conf'}
        xfetch.fetch(options)
        expect(options.url).toBe('http://10.88.128.16:8000/promise-mock/mock/DxH766opl/dynamic/conf')
    })
    it("proxy two-2.",() => {
        // request url
        const options = { url: 'http://www.baidu.com/dynamic'}
        xfetch.fetch(options)
        expect(options.url).toBe('http://www.baidu.com/dynamic')
    })
})

*/
const xfetch = new XFetch({
    isMock: false,  // 开发环境 --mock开启后为true
})

xfetch.setProxy([
    // {
    // test: { // 自定义匹配规则
        // custom (config) { // config 为原始的请求配置
        //     // console.log('config123', config)
        //     // config.url = 'http://taobao.com'
        //     return false
        //     // 自定义匹配逻辑
		// 	// if ('xxx') {
		// 	// 	return true
		// 	// }
		// 	// return false
		// },
        // response() {
        //     console.log('aaaaaaaaaaaaa')
        //     return {
        //         name: 123
        //     }
        // }
    // }}
    {
        test: {
            protocol: 'http:',
            host: '10.88.128.16',
            port: '8000',
            path: '/dynamic/conf',
            response(mock) {
                
               return mock.mock({
                    "data|2": { // 随机选取object中的两条数据作为返回
                        "310000": "上海市",
                        "320000": "江苏省",
                        "330000": "浙江省",
                        "340000": "安徽省"
                      }                                  
                })
                
                // return {
                //     name: 123
                // }
            },
            proxy: {
                host: 'test.didi.com',
                port: 8888
            },
        },
    }
])


describe('proxy url test1', () => {
    
    it("proxy one-1",async () => {
        // request url
        const options = { url: 'http://10.88.128.16:8000/dynamic/conf'}
        // try {
        //     let aa = await  xfetch.fetch(options)
        //     console.log(aa)
        // } catch (err) {
        //     console.log('err', err)
        // }
        let config = xfetch.checkProxy(options)
        // expect(config.url).toBe('http://www.baidu.com/dynamic/conf')
    })
})