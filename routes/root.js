'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    // console.log(fastify._)
    console.log('request.session=', request.session)
    request.session.a = 1
    // const vault = await fastify.soa.get('vault')
    // fastify.log.debug('test vault from route:%o', vault)
    // console.log("fastify.static=",fastify.static)
    return { root: true }
    // request.session.authenticated = true
    // reply.redirect('/example')
  })
}
