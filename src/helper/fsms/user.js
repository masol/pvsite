/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                                 //
//                                                                          //
//  WIDE website: http://www.prodvest.com/                                  //
//  WIDE website: http://www.pinyan.tech/                                   //
//  License: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0)       //
/// //////////////////////////////////////////////////////////////////////////
// Created On : 7 Nov 2022 By 李竺唐 of 北京飞鹿软件技术研究院
// File: user

async function load (fsmm, id) { // id is request object.
  // const fastify = fsmm.$fastify
  console.log('enter user fsm load,fsmm=', fsmm.constructor)
}

// // 向fsmInst中注册一个factory,用于创建fsm.
// async function setup (fastify, fsmInst) {
//   fsmInst.reg('user', load)
// }

module.exports.load = load
