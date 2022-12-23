import plugin from '../../../lib/plugins/plugin.js'
import os from 'os'
import lodash from "lodash";
import setting from "../model/setting.js";
import { pluginRoot } from "../model/path.js";
import path from "path";
import fs from "fs";

export class autoGroupName extends plugin {
  constructor () {
    super({
      name: '自动群名片',
      dsc: '多群展示群名片',
      event: 'message',
      priority: 4644,
      rule: [{
        reg: '^#*更新群名片',
        fnc: 'setGroupCard'
      }]
    })
    this.appconfig = setting.getConfig('autoGroupName')
    this.task = {
      cron: this.appconfig.cron,
      name: '自动群名片',
      fnc: () => this.CardTask()
    }
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  async getSuffixFun() {
    let activeModels = this.appconfig.active
    if(!Array.isArray(activeModels)) activeModels= [activeModels]
    let activePath = path.join(pluginRoot, `model/autoGroupName/${lodash.sample(activeModels)}.js`)
    // 判断文件是否存在
    if (fs.existsSync(activePath)) {
      try {
        // 判断是否是windows系统
        if (os.platform() === 'win32') { activePath = 'file:///' + activePath }
        let {NameCardContent} = await import(activePath)
        if (typeof NameCardContent === 'function') {
          this.Suffix = await NameCardContent()
        } else { logger.error(`【自动化插件】文件${activePath}中NameCardContent必须要定义成一个函数方法！`) }
      } catch (e) { logger.error(`【自动化插件】文件${activePath}载入失败，群名片自动更新功能可能无法使用\n${e}`) }
    } else { logger.error(`【自动化插件】文件${activePath}不存在！`) }
  }


  get taskGroup () {
    let allGroup = []
    Bot.gl.forEach((v, k) => { allGroup.push(k) })
    return lodash.difference(allGroup, this.appconfig.notGroup)
  }

  async CardTask () {
    let taskGroup = this.taskGroup
    if (taskGroup.length) {
      await this.getSuffixFun()
      for (let groupId of taskGroup) {
        if (!await this.setGroupCard(groupId, this.Suffix, true)) { return false }
      }
    }
    return true
  }

  async setGroupCard (groupID, Suffix) {
    if (!this.appconfig.enable) return false
    if (!this.Suffix) return false
    // logger.info(`${this.appconfig.nickname || Bot.nickname}|${Suffix}`)
    await Bot.pickGroup(groupID).setCard(Bot.uin, `${this.appconfig.nickname || Bot.nickname}｜${Suffix}`)
    return true
  }
}
