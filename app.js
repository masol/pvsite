
'use strict'
const fs = require('fs')
const path = require('path')
const AutoLoad = require('@fastify/autoload')
const SOA = require('pv-soa')
const fp = require('fastify-plugin')

process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, 'config', 'active')
const config = require('config')

/// 从类url的配置中加载内容，如果没有，默认从文件中加载。
// @todo: 将此函数加入到config.util中.
function loadCtx (urlCtx, defPath) {
  if (urlCtx) {
    console.error('尚未实现类URL的key/cert配置(从vault,fs或直接获取值)。')
  }
  return fs.readFileSync(defPath)
}
const fastiConf = config.has('fastify.conf') ? Object.assign({}, config.get('fastify.conf')) : {}
// const usehttps = false
if (fastiConf.http2 || fastiConf.https) {
  // usehttps = true
  fastiConf.https = fastiConf.https || {}
  const basePath = path.join(__dirname, 'config', 'active', 'fastify')
  fastiConf.https.key = loadCtx(fastiConf.https.key, path.join(basePath, 'https.key'))
  fastiConf.https.cert = loadCtx(fastiConf.https.cert, path.join(basePath, 'https.crt'))
}

if (!fastiConf.ajv) {
  fastiConf.ajv = {
    plugins: [
      require('ajv-merge-patch'),
      require('ajv-formats'),
      SOA.ajvPlugin
    ]
  }
}

module.exports = fp(async function (fastify, opts) {
  if (opts.cmd) {
    // 由于fastify-cli无法设置additionalOptions，改为监听random socks.see: https://github.com/fastify/fastify-cli/blob/c694d12aa14d53bad93da5541ff281e79e9f337f/start.js#L152
    fastiConf.address = undefined
    fastify.decorate('runcmd', opts)

    // 命令模式，添加onReady hook,并等到opts的deps结束。
    fastify.addHook('onReady', async function () {
      setTimeout(async () => {
        const deps = opts.deps || []
        await Promise.all(deps)
        await fastify.$.delay(100)
        let exitCode = 0
        await fastify.close().catch(e => {
          console.log('退出命令模式时发生错误:', e)
          exitCode = 1
        })
        process.exit(exitCode)
      }, 1000)
    })
  }
  // Place here your custom code!

  // const SystemJS = require('systemjs')
  // console.log('SystemJS=', SystemJS.System)
  // const test = await import('https://www.prodvest.com/localibs/pvschema.m.js').catch(e => {
  //   console.log('import from net error:', e)
  // })
  // console.log('test module=', test)
  // 在将shell移至库函数后，需要在主项目中import/require。这是一个临时解决方案。
  fastify.decorate('require', (pkgName) => {
    return require(pkgName)
  })
  fastify.decorate('import', (pkgName) => {
    return import(pkgName)
  })
  fastify.decorate('config', config)

  // await fastify.register(require('@fastify/middie'))
  await SOA.decorate(fastify, config, opts)
  // fastify.addHook('onClose',()=>{
  //   fastify.decorate('_', null)
  //   fastify.decorate('config', null)
  // })

  // 响应pm2的shutdown消息，清理环境，友好退出。
  process.on('message', msg => {
    if (msg === 'shutdown') {
      fastify.close()
    }
  })

  // if (usehttps) {
  //   fastify.register(require('fastify-https-redirect'), {
  //     httpPort: 1080,
  //     httpsPort: 10443
  //   })
  // }

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'src/plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'src/routes'),
    options: Object.assign({}, opts)
  })
}, { fastify: '4.x' })

// console.log('fastiConf=', fastiConf)
module.exports.options = fastiConf
