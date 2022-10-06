/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                               //
//                                                                         //
//  WIDE website: http://www.wware.org/                                    //
//  WIDE website: http://www.prodvest.com/                                 //
//  License : WWARE LICENSE(https://www.wware.org/license.html)            //
/// /////////////////////////////////////////////////////////////////////////
// Created On : 6 Oct 2022 By 李竺唐 of SanPolo.Co.LTD
// File: index

const { series, task } = require('gulp')

const Names = {
  status: '状态获取',
  report: '报告'
}

const args = require('yargs')
  .alias('t', 'target')
  .alias('s', 'stage')
  .alias('f', 'force')
  .default('target', 'dev')
  .default('stage', 'check')
  .default('force', false)
  .argv

const path = require('path')
process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, '..', 'config', args.target)
const config = require('config')

const opts = {
  config,
  args
}

task(Names.status, require('./status')(opts))
task(Names.report, require('./report')(opts))

const status = series(Names.status, Names.report)
/**
 * pipeline说明:
 * 编译: build - deploy - test
 * 监测: status
 * 部署: infras(only run if status not ok,except --force given) - deploy
 */
const tasks = {
  default: status,
  status
}

module.exports = tasks
