'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    console.log('request.session.authenticated=', request.session.authenticated)
    return 'this is an example'
  })
}
