
'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')
const SOA = require('pv-soa')

process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, 'config', 'active')
const config = require('config')

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  // 在将shell移至库函数后，需要在主项目中import/require。这是一个临时解决方案。
  fastify.decorate('require', (pkgName) => {
    return require(pkgName)
  })
  fastify.decorate('import', (pkgName) => {
    return import(pkgName)
  })
  fastify.decorate('config', config)

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

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}

module.exports.options = config.has('fastify.conf') ? config.get('fastify.conf') : {}
