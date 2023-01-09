'use strict'

module.exports = async function (fastify, opts) {
  // const { soa } = fastify
  // const corsess = await soa.get('corsess')
  fastify.get('/', async function (request, reply) {
    // const token = await corsess.token(request)
    // console.log('current token=', token)
    // request.logIn()
    console.log('request.session=', request.isAuthenticated())
    if (!request.session.test) {
      request.session.test = 1
    } else {
      // request.session.test++
    }
    console.log('request.session.test=', request.session.test)
    return 'this is an example aa' + request.session.test
  })
}
