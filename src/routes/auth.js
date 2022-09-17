
module.exports = async function (fastify, opts) {
  const { soa, log } = fastify
  const passport = await soa.get('passport')
  fastify.post('/auth', {
    // preValidation: passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
  }, async function (request, reply) {
    // console.log('request.session=', request.session.passport)
    const Handler = await passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
    console.log('before handler')
    await Handler(request, reply)
    console.log('after handler')
    // request.session.a = 1
    // const vault = await fastify.soa.get('vault')
    // fastify.log.debug('test vault from route:%o', vault)
    // console.log("fastify.static=",fastify.static)
    log.debug('request.isAuthenticated()=%s', request.isAuthenticated())
    log.debug('request.session.passport=%o', request.session.passport)
    log.debug('request.session.user=%o', request.session.user)

    return { auth: true }
    // request.session.authenticated = true
    // reply.redirect('/example')
  })
}
