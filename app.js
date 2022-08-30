'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')

process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, 'config', 'active')
const config = require("config")

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  const _ = require('lodash')

  fastify.decorate('_', _)

  fastify.decorate('config', config)

  // fastify.addHook('onClose',()=>{
  //   fastify.decorate('_', null)
  //   fastify.decorate('config', null)
  // })

  _.set(config, 'util.isLocal', () => {
    if (!config.has('env.local')) {
      return false
    }
    return !!config.get('env.local')
  })

  function contain(propPath, chkValue) {
    if (!propPath || !_.isString(propPath)) {
      return false
    }
    if (!config.has(propPath)) {
      return false
    }
    const container = config.get(propPath)
    return (_.isArrayLike(container) && _.indexOf(container, chkValue) >= 0)
  }
  _.set(config, 'util.contain', contain)
  _.set(config, 'util.dget', (propPath, defValue = {}) => {
    if (!propPath || !_.isString(propPath)) {
      return defValue
    }
    return config.has(propPath) ? config.get(propPath) : defValue
  })
  _.set(config, 'util.isPluginDisabled', _.bind(contain, null, 'env.disabled-plugins'))
  _.set(config, 'util.isPluginEnabled', _.bind(contain, null, 'env.enabled-plugins'))
  const base = process.cwd()
  _.set(config, 'util.path', (...args) => {
    let newarg = [base, ...Array.from(args)]
    return path.join.apply(null, newarg)
  })

  //响应pm2的shutdown消息，清理环境，友好退出。
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

module.exports.options = config.has('fastify') ? config.get('fastify') : {}
