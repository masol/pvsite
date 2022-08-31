'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    // console.log(fastify._)
    console.log(fastify.sco)
    // console.log("fastify.static=",fastify.static)
    return { root: true }
  })
}
