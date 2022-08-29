'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    // console.log(fastify._)
    return { root: true }
  })
}
