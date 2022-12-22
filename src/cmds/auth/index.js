/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                               //
//                                                                         //
//  WIDE website: http://www.wware.org/                                    //
//  WIDE website: http://www.prodvest.com/                                 //
//  License : WWARE LICENSE(https://www.wware.org/license.html)            //
/// /////////////////////////////////////////////////////////////////////////
// Created On : 20 Sep 2022 By 李竺唐 of SanPolo.Co.LTD
// File: index

module.exports.run = async function (fastify, opts = {}) {
  const cmd = fastify.runcmd.cmd
  switch (cmd) {
    case 'migrate':
    case 'user': // 初始化admin用户。
      await require('./migrate').run(fastify, opts)
      if (cmd === 'user') {
        await require('./user').run(fastify, opts)
      }
      break
    case 'passwd': // 设置admin用户的密码。
      await require('./passwd').run(fastify, opts)
      break
  }
}
