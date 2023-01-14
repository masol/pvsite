/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                                 //
//                                                                          //
//  WIDE website: http://www.prodvest.com/                                  //
//  WIDE website: http://www.pinyan.tech/                                   //
//  License: Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0)       //
/// //////////////////////////////////////////////////////////////////////////
// Created On : 13 Jan 2023 By 李竺唐 of 北京飞鹿软件技术研究院
// File: ecosystem.config

module.exports = {
  apps: [{
    name: 'webapi',
    script: 'start.js',
    instances: 'max',
    exec_mode: 'cluster',
    instance_var: 'INSTANCE_ID',
    output: './logs/out.log',
    error: './logs/error.log',
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }]
}
