import plugin from '../../../lib/plugins/plugin.js'
import setting from "../model/setting.js";
import common from "../../../lib/common/common.js";
import cfg from "../../../lib/config/config.js";


export class autoSendUpdateLog extends plugin {
  constructor () {
    let rule = {
      reg: ".*",
      fnc: "listen"
    }
    super({
      name: '自动化插件_发送更新日志',
      dsc: '更新全部插件并重启后发送更新日志',
      event: 'message',
      priority: 9999,
      rule: [{
        reg: "^#?[今昨日天自动]+更新(日志|内容)$",
        fnc: "updataLog",
      },rule],
    })
    this.task = {
      cron: '0 58 7 * * ?',
      name: '自动化插件_早晨推送更新消息',
      fnc: () => this.updataTask()
    }
    this.islog = false
    Object.defineProperty(rule, 'log', { get: () => this.islog })
  }

  get appconfig () {
    return setting.getConfig("autoUpdate");
  }

  async init () {
    if (!this.appconfig.remind) {return}

    let key = `Yz:loginMsg:${Bot.uin}`
    await redis.set(key, '1', { EX: cfg.bot.online_msg_exp })
  }

  async listen () {
    if (this.appconfig.log !== 2) {return false}
    if (!this.e.isMaster) {return false}
    let key = `Yz:auto-plugin:Update:${Bot.uin}`
    if (!await redis.get(key)) return false
    await this.sendLog(cfg.masterQQ[0])
    await redis.del(key)
  }

  async updataTask () {
    if (this.appconfig.log !== 1) {return}
    await this.sendLog(cfg.masterQQ[0])
  }

  async sendLog (qq = cfg.masterQQ[0]) {
    let filename = `log-${(new Date().toLocaleDateString()).replace(/\//g, '-')}`
    let updataLog = await setting.getData(`autoUpdata`, filename)
    if(!updataLog) return
    let replyMsg = []
    for (let pluginLog of updataLog){
      let pluginName = pluginLog.plugin
      let message = pluginLog.logs
      if (pluginName) {
        pluginName = pluginName + '更新日志如下：'
        message = [pluginName, ...pluginLog.logs]
      }
      for (let messageIndex in message) {
        // 二次核查数据是否存在数组
        if (Array.isArray(message[messageIndex])){
          message[messageIndex] = message[messageIndex].join('\n')
        }
      }
      replyMsg.push({
        message: message.length>1?message.join('\n'):message,
        nickname: Bot.nickname,
        user_id: Bot.uin
      })
    }
    if(!replyMsg) return
    // 以转发消息形式处理
    let forwardMsg = await Bot.makeForwardMsg(replyMsg);
    forwardMsg.data = forwardMsg.data
      .replace('<?xml version="1.0" encoding="utf-8"?>','<?xml version="1.0" encoding="utf-8" ?>')
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, '<title color="#777777" size="26">请点击查看内容</title>');
    await common.relpyPrivate(qq, '主人~自动化插件已帮您更新了全部插件。插件更新日志请您过目……')
    await common.relpyPrivate(qq, forwardMsg)
  }

  async updataLog () {
    if (!this.e.isMaster) {
      await this.reply('你没有权限')
      return false
    }
    await this.sendLog(this.e.user_id)
  }

}
