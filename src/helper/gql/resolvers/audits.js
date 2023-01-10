/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                                 //
//                                                                          //
//  WIDE website: http://www.prodvest.com/                                  //
//  WIDE website: http://www.pinyan.tech/                                   //
//  License: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0)       //
/// //////////////////////////////////////////////////////////////////////////
// Created On : 10 Jan 2023 By 李竺唐 of 北京飞鹿软件技术研究院
// File: audits

async function setup (fastify) {
  const { _, soa } = fastify
  const ojs = await soa.get('objection')
  return {
    Query: {
      audits: async (parent, args, ctx, info) => {
        // if (!ctx.request.isAuthenticated()) {
        //   throw new fastify.error.UnauthorizedError('not logined')
        // }
        const Audit = ojs.Model.store.audit
        console.log('Audits=', Audit)
        let query = Audit.query().select('*')
        console.log('query=', query)
        if (_.isBoolean(args.suc)) {
          query = query.where('suc', args.suc)
          console.log('query suc=', query)
        }
        if (_.isNumber(args.limit)) {
          query = query.limit(args.limit)
          console.log('query limit=', query)
        }
        if (_.isNumber(args.offset)) {
          query = query.offset(args.offset)
        }
        const result = await query
        console.log('result=', result)
        return result

        // console.log('parent=', parent)
        // console.log('args=', args)
        // console.log('arg4=', info)
      }
    }
  }
}
module.exports = setup
