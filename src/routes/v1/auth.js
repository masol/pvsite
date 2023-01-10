
module.exports = async function (fastify, opts) {
  const { soa, error, config, util, _ } = fastify
  const cfgutil = config.util
  const passport = await soa.get('passport')
  const auditCfg = cfgutil.dget('passport.audit', {})

  // const fsmInst = await soa.get('fsm')

  // const loginDev = parseInt(cfgutil.dget('passport.strategies.local.loginDev', '1'))
  // fastify.get('/v1/auth/info',
  //   async function (request, reply) {
  //     console.log('fsmInst=', fsmInst.load)
  //     const fsm = await fsmInst.load('user', request)
  //     console.log('fsm=', fsm)
  //     const ret = request.isAuthenticated() ? _.clone(request.user) : {}
  //     console.log('request.session.expires=', request.session)
  //     if (ret.id && request.session.expires) {
  //       ret.expires = request.session.expires
  //     }
  //     console.log('ret=', ret)
  //     return ret
  //   }
  // )

  fastify.post('/auth/login',
    {
      schema: {
        body: {
          $ref: '/v1/auth/login#'
        }
      }
    },
    async function (request, reply) {
      // console.log('123')
      // if (request.isAuthenticated()) {
      //   throw new error.PreconditionRequiredError('Already logined')
      // }
      //, { successRedirect: '/' , failureRedirect: '/login'}
      const Handler = await passport.authenticate('local')
      await Handler(request, reply)
      if (!auditCfg.disabled) {
        const ojs = await soa.get('objection')
        const Audit = ojs.Model.store.audit
        const ipfs = _.drop(util.forwarded(request))
        // 处理loginDev,从审计表中获取uid并且sid不空，销毁sid并且设置退出状态。
        // if (loginDev > 0 && request.isAuthenticated()) {
        //   const rmCount = await Audit.rmLogin({
        //     id: request.user.id,
        //     loginDev,
        //     sessionStore: fastify.sessionStore
        //   }).catch(e => {
        //     log.warn('删除登录信息错误:%s', e)
        //   })
        //   if (rmCount > 0) {
        //     const auditJSON = {
        //       action: 'logout',
        //       suc: true,
        //       uid: request.user.id,
        //       username: request.user.name,
        //       ip: request.ip,
        //       ipfs,
        //       sid: `${rmCount}::uid::${request.user.id}`
        //     }
        //     await Audit.query().insert(auditJSON)
        //   }
        //   // const Sess = await soa.get('session')
        //   // console.log('request.session.store=', Sess)
        // }
        // 添加审计信息。
        const auditJSON = {
          action: 'login',
          suc: false,
          username: request.body.username,
          ip: request.ip,
          ipfs
        }
        // console.log('request.session=', request.session)
        if (request.isAuthenticated()) {
          auditJSON.suc = true
          auditJSON.uid = request.user.id
          auditJSON.sid = request.session.meta().id
        } else {
          auditJSON.password = request.body.password
        }
        await Audit.query().insert(auditJSON)
      }
      // console.log('request.isAuthenticated', request.isAuthenticated())
      if (request.isAuthenticated()) {
        const ret = _.clone(request.user)
        if (request.body.keep) {
          // 或者使用reply.setcooke?
          const maxDayAge = cfgutil.has('passport.local.keep') ? parseInt(cfgutil.get('passport.local.keep')) : 365
          const maxAge = maxDayAge * 24 * 60 * 60
          const newToken = await request.session.touch(request, reply, maxAge)
          console.log('newToken=', newToken)
          // request.session.regenerate()
          // console.log('request.session=', request.session)
        }
        return { data: ret }
      }
      // return { error: 'unAuthenticated' }
      // return {}
      // return {
      //   ok: false
      // }
      // console.log('after handler')
    })

  fastify.post('/auth/logout',
    async function (request, reply) {
      // console.log('before handler', request.body)
      if (!request.isAuthenticated()) {
        throw new error.UnauthorizedError('not logined')
      }
      const sid = request.session.meta().id
      const name = request.user.name
      const uid = request.user.id

      await request.logout()
      if (!auditCfg.disabled) {
        const ojs = await soa.get('objection')
        const Audit = ojs.Model.store.audit
        const ipfs = _.drop(util.forwarded(request))
        await Audit.logout(sid, {
          uid,
          username: name,
          ip: request.ip,
          ipfs
        })
      }
      return {
        data: {
          id: ''
        }
      }
    }
  )
}
