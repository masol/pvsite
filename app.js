
'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')
const promiseUtils = require('blend-promise-utils')
const goodies = require('@supercharge/goodies')
const shelljs = require('shelljs')

process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, 'config', 'active')
const config = require('config')

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  const npmCache = {}
  const installPkg = async (pkgName) => {
    // 此机制不跨进程，需要跨进程，例如基于redis或nfs,需要redis自举解耦。
    if (npmCache[pkgName]) {
      return await npmCache[pkgName]
    }
    try {
      const pm = fastify.config.util.dget('env.pkg', 'yarn')
      let cmdline = ''
      switch (pm) {
        case 'yarn':
          cmdline = `yarn add ${pkgName}`
          break
        case 'npm':
          cmdline = `npm install --save ${pkgName}`
          break
        case 'pnpm':
          cmdline = `pnpm add -P ${pkgName}`
          break
      }
      if (cmdline) {
        // 卡住当前nodejs，当时不能解决多进程互锁问题。
        console.warn('请不要在产品环境下热部署！开始安装包%s，执行命令%s', pkgName, cmdline)
        npmCache[pkgName] = shelljs.exec(cmdline, {
          async: false
        })
        // fastify.log.info(npmCache[pkgName])
      }
    } catch (e) {
      fastify.log.error('install package "%s" error:%s', pkgName, e)
    }
    const pkg = await npmCache[pkgName]
    delete npmCache[pkgName]
    return pkg
  }

  shelljs.require = async (pkgName) => {
    let pkg
    try {
      pkg = require(pkgName)
    } catch (e) {
      await installPkg(pkgName)
      pkg = require(pkgName)
    }
    return pkg
  }
  shelljs.import = async (pkgName) => {
    return await import(pkgName).catch(async e => {
      // fastify.log.debug('import %s error:%s', pkgName, e)
      await installPkg(pkgName)
      return await import(pkgName).catch(e => null)
    })
  }
  const _ = require('lodash')
  const $ = _.extend({}, promiseUtils, goodies)
  const error = await import('http-errors-enhanced')
  fastify.decorate('_', _)
  fastify.decorate('$', $)
  fastify.decorate('error', error)
  fastify.decorate('config', config)
  fastify.decorate('shell', shelljs)
  // console.log('lmify=', lmify)

  // console.log('fastify.$=', fastify.$)

  // 在prodvest包中实现intEntry以获取内建支持的服务/包/插件。
  const soa = require('pv-soa')
  fastify.decorate('soa', soa.instance(fastify))

  // fastify.addHook('onClose',()=>{
  //   fastify.decorate('_', null)
  //   fastify.decorate('config', null)
  // })

  _.set(config, 'util.isLocal', () => {
    if (!config.has('env.conf.local')) {
      return false
    }
    return !!config.get('env.conf.local')
  })

  function contain (propPath, chkValue) {
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
  _.set(config, 'util.isDisabled', _.bind(contain, null, 'env.conf.disabled-plugins'))
  _.set(config, 'util.isEnabled', _.bind(contain, null, 'env.conf.enabled-plugins'))
  const base = process.cwd()
  _.set(config, 'util.path', (...args) => {
    const newarg = [base, ...Array.from(args)]
    return path.join.apply(null, newarg)
  })
  const cfgBase = path.join(base, 'config', 'active')
  _.set(config, 'util.cfgpath', (...args) => {
    const newarg = [cfgBase, ...Array.from(args)]
    return path.join.apply(null, newarg)
  })

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
