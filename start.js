/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                                 //
//                                                                          //
//  WIDE website: http://www.prodvest.com/                                  //
//  WIDE website: http://www.pinyan.tech/                                   //
//  License: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0)       //
/// //////////////////////////////////////////////////////////////////////////
// Created On : 1 Nov 2022 By 李竺唐 of 北京飞鹿软件技术研究院
// File: start
'use strict'

function parseArg () {
  return require('yargs')
    .alias('l', 'log-level')
    .alias('a', 'address')
    .alias('p', 'port')
    .alias('c', 'cluster')
    .boolean('cluster')
    .default('cluster', false)
    // 不能设置默认值，因为这里的优先级高于module options.
    // .boolean('options')
    // .default('log-level', '')
    // .default('address', '0.0.0.0')
    // .default('port', 3000)
    // .default('options', true)
    .argv
}

// 过滤arg中与fastify有关的项，并返回fastify构造用options.
function filterArgs (args) {
  const optMap = {
    'log-level': 'logLevel',
    address: 'address',
    port: 'port',
    'body-limit': 'bodyLimit',
    'plugin-timeout': 'pluginTimeout'
  }
  const ret = {}
  for (const oName in args) {
    const fastOpt = optMap[oName]
    if (fastOpt) {
      ret[fastOpt] = args[oName]
    }
  }
  return ret
}

function start () {
// Read the .env file.
  require('dotenv').config()

  const args = parseArg()
  console.log('args=', args)

  // Require the framework
  const Fastify = require('fastify')

  // Require library to exit fastify process, gracefully (if possible)
  const closeWithGrace = require('close-with-grace')

  // Register your application as a normal plugin.
  const appService = require('./app.js')

  const opts = Object.assign({}, appService.options)
  Object.assign(opts, filterArgs(args))
  console.log('fastify opts=', opts)
  if (typeof opts.logger === 'undefined') {
    opts.logger = true
  }
  // Instantiate Fastify with some config
  const app = Fastify(opts)

  app.register(appService, args)

  // delay is the number of milliseconds for the graceful close to finish
  const closeListeners = closeWithGrace({ delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 }, async function ({ signal, err, manual }) {
    if (err) {
      app.log.error(err)
    }
    await app.close()
  })

  app.addHook('onClose', (instance, done) => {
    closeListeners.uninstall()
    done()
  })

  let doListen = true
  const cluster = require('cluster')
  if (args.cluster && cluster.isMaster) { // cluster模式
    doListen = false
    cluster.on('exit', function (worker) {
      console.log('Worker', worker.id, ' has exited.')
    })
  }
  // Start listening.
  if (doListen) {
    const isHttps = (opts.http2 || opts.https)
    if (!isHttps) { // 不是https时，80转发到443.
      const http = require('http')
      http.createServer(function (req, res) {
        res.writeHead(301, { Location: 'https://' + req.headers.host + req.url })
        res.end()
      }).listen({
        host: args.adress || process.env.ADDRESS || '0.0.0.0',
        port: 80
      })
    }
    app.listen({
      host: args.adress || process.env.ADDRESS || '0.0.0.0',
      port: args.port || process.env.PORT || (isHttps ? 443 : 80)
    }, (err, address) => {
      if (err) {
        app.log.error(err)
        process.exit(1)
      } else {
        console.log('listen on :', address)
      }
    })
  }
}

start()
