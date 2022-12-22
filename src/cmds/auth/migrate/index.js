/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                               //
//                                                                         //
//  WIDE website: http://www.wware.org/                                    //
//  WIDE website: http://www.prodvest.com/                                 //
//  License : WWARE LICENSE(https://www.wware.org/license.html)            //
/// /////////////////////////////////////////////////////////////////////////
// Created On : 20 Sep 2022 By 李竺唐 of SanPolo.Co.LTD
// File: migrate

// Create a custom migration source class
class AuthMigrate {
  constructor (fastify, opts) {
    this.fastify = fastify
    this.opts = opts
  }

  // Must return a Promise containing a list of migrations.
  // Migrations can be whatever you want,
  // they will be passed as arguments to getMigrationName
  // and getMigration
  getMigrations () {
    // In this example we are just returning migration names
    return Promise.resolve(['v1'])
  }

  getMigrationName (migration) {
    return migration
  }

  getMigration (migration) {
    return require(`./${migration}`)(this.fastify, this.opts)
  }
}

module.exports.run = async function (fastify, opts = {}) {
  const { soa, runcmd, log } = fastify
  const knex = await soa.get('knex')
  // console.log('opts=', fastify.runcmd)
  const conf = { migrationSource: new AuthMigrate(fastify, opts) }
  if (runcmd.down) {
    await knex.migrate.rollback(conf, !!runcmd.all)
  } else {
    await knex.migrate.latest(conf)
  }
  log.info('%s完毕，当前数据库结构版本:%s', runcmd.down ? '回滚' : '升级', await knex.migrate.currentVersion(conf))
}
