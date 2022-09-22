'use strict'

module.exports = async function (fastify, opts) {
  const { soa, _ } = fastify
  const passport = await soa.get('passport')
  fastify.post('/',
    {
      preValidation: passport.authenticate('session')
    },
    async function (request, reply) {
      const { log } = fastify
      // console.log(fastify._)
      if (_.isInteger(request.session.a)) {
        request.session.a++
        console.log('request.session.a=', request.session.a)
      } else {
        request.session.a = 0
      }
      // const upload = await soa.get('multer')
      // const Handler = await passport.authenticate('session', { session: true, failureRedirect: '/login' })
      // const Handler = await passport.authenticate('local', { authInfo: false })
      // await Handler(request, reply)
      log.debug('in root:request.isAuthenticated()=%s', request.isAuthenticated())
      log.debug('in root:request.session.passport=%o', request.session.passport)
      log.debug('in root:request.session.user=%o', request.session.user)
      // console.log('request.file=', request.file)
      // console.log('upload=', upload)
      // await upload.single('file')
      console.log('fastiy.hasContentTypeParser=', fastify.hasContentTypeParser('application/x-www-form-urlencoded'))
      console.log('request.body=', request.body)
      // fastify.log.debug("fastify.hasContentTypeParser('multipart/form-data')=%s", fastify.hasContentTypeParser('multipart'))
      // fastify.log.debug('request.session.passport at root = %o', request.session.passport)
      // fastify.log.debug('request.body=%o', request.body)
      // // request.session.a = 1
      // // const vault = await fastify.soa.get('vault')
      // // fastify.log.debug('test vault from route:%o', vault)
      // // console.log("fastify.static=",fastify.static)
      // return request.logout()
      return { root: true }
    // request.session.authenticated = true
    // reply.redirect('/example')
    })
}
