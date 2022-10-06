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

const gulpInst = require('gulp')

const args = require('yargs')
  .alias('t', 'target')
  .alias('s', 'stage')
  .alias('f', 'force')
  .default('target', 'dev')
  .default('stage', 'check')
  .default('force', false)
  .argv

const path = require('path')
process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, 'config', args.target)
const config = require('config')

const opts = {
  config,
  gulpInst
}

module.exports = require('@masol/pipeline')(opts)
