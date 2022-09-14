
module.exports = async function (fastify, opts) {
  const { soa } = fastify
  const passport = await soa.get('passport')
  fastify.get('/auth', {
    // preValidation: passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
  }, async function (request, reply) {
    const data = await request.file()
    console.log('data=', data)
    const uploadValue = await request.body.upload.toBuffer() // access files
    console.log('uploadValue=', uploadValue)
    console.log('request.session=', request.session.passport)
    const Handler = await passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
    console.log('before handler')
    await Handler(request, reply)
    console.log('after handler')
    // request.session.a = 1
    // const vault = await fastify.soa.get('vault')
    // fastify.log.debug('test vault from route:%o', vault)
    // console.log("fastify.static=",fastify.static)
    // return { auth: true }
    // request.session.authenticated = true
    // reply.redirect('/example')
  })
}
