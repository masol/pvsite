'use strict'

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    // console.log(fastify._)
    const { soa } = fastify
    const upload = await soa.get('multer')
    console.log('request.file=', request.file)
    console.log('upload=', upload)
    await upload.single('file')
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
