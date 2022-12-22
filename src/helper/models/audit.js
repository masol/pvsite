/// //////////////////////////////////////////////////////////////////////////
//                                                                          //
//  本文件是WIDE2.0的组成部分.                                               //
//                                                                         //
//  WIDE website: http://www.wware.org/                                    //
//  WIDE website: http://www.prodvest.com/                                 //
//  License : WWARE LICENSE(https://www.wware.org/license.html)            //
/// /////////////////////////////////////////////////////////////////////////
// Created On : 23 Sep 2022 By 李竺唐 of SanPolo.Co.LTD
// File: audit

const TABLENAME = 'audit'
module.exports.setup = async function (fastify, ojs) {
  class Audit extends ojs.Model {
    static get tableName () {
      return TABLENAME
    }

    static async logout (sid, auditJSON) {
      auditJSON.action = 'logout'
      auditJSON.suc = true
      const numberOfAffectedRows = await Audit.query()
        .patch({ sid: null })
        .where('sid', sid)
      auditJSON.sid = `${numberOfAffectedRows}::${sid}`
      await Audit.query().insert(auditJSON)
      return numberOfAffectedRows
    }

    /**
     *
     * @param {} param0
     * @returns 清理的session记录数。
     */
    static async rmLogin ({ uid, loginDev, sessionStore }) {
      const rmSess = async (sid) => {
        return new Promise((resolve, reject) => {
          sessionStore.destroy(sid, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }
      const otherDevs = await Audit.query()
        .where('uid', uid)
        .where('action', 'login')
        .whereNotNull('sid')
        .orderBy('time', 'desc')
        // otherDev.length+1是当前设备数，因当前登录尚未加入audit.
      if (otherDevs.length >= loginDev) {
        const startIdx = otherDevs.length - loginDev
        const tasks = []
        for (let i = startIdx; i < otherDevs.length; i++) {
          const entry = otherDevs[i]
          tasks.push(rmSess(entry.sid))
        }
        await Promise.all(tasks)

        await Audit.query()
          .patch({ sid: null })
          .where('uid', uid)
          .where('action', 'login')
          .whereNotNull('sid')
          .orderBy('time', 'asc')
          .limit(otherDevs.length - loginDev + 1)
        return otherDevs.length - loginDev + 1
      }
      return 0
    }
  }
  // console.log('ojs', ojs)
  ojs.Model.store[TABLENAME] = Audit
}
