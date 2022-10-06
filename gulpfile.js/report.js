/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                               //
//                                                                         //
//  WIDE website: http://www.wware.org/                                    //
//  WIDE website: http://www.prodvest.com/                                 //
//  License : WWARE LICENSE(https://www.wware.org/license.html)            //
/// /////////////////////////////////////////////////////////////////////////
// Created On : 6 Oct 2022 By 李竺唐 of SanPolo.Co.LTD
// File: reporter

let chalkInstance = null
async function getChalk () {
  if (!chalkInstance) {
    chalkInstance = (await import('chalk')).default
  }
  return chalkInstance
}

const logger = require('fancy-log')
// 下两句将使得自定义报告结果与默认gulp保持一致。
// const util = require('util')
// util.inspect.styles.date = 'gray'

module.exports = function (opts) {
  return async function () {
    const chalk = await getChalk()
    logger('enter reporter')
    logger(chalk.blue('Hello') + ' World' + chalk.red('!'))
    // cb()
  }
}
