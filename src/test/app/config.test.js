'use strict'

const { test } = require('tap')
const { build } = require('../helper')
// const Fastify = require('fastify')
// const Support = require('../../plugins/support')

test('app env checker', async (t) => {
  const app = await build(t)

  // console.log(app)
  // const fastify = Fastify()
  // fastify.register(Support)

  await app.after()
  console.log('app.config=',app.config)
  // t.same(app._, require("lodash"),"Lodash加载错误")
  t.ok(app, 'hugs')
})

// You can also use plugin with opts in fastify v2
//
// test('support works standalone', (t) => {
//   t.plan(2)
//   const fastify = Fastify()
//   fastify.register(Support)
//
//   fastify.ready((err) => {
//     t.error(err)
//     t.equal(fastify.someSupport(), 'hugs')
//   })
// })
