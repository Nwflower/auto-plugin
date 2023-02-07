import plugin from '../../../lib/plugins/plugin.js'
import setting from "../model/setting.js";

export class autoDelAt extends plugin {
  constructor () {
    let rule ={
      reg: '.*',
      fnc: 'atListen'
    }
    super({
      name: '自动化插件_恶意at',
      dsc: '自动踢掉恶意at全体成员的成员',
      event: 'message.group',
      priority: 10086,
      rule: [rule]
    })
    this.islog = false
    Object.defineProperty(rule, 'log', { get: () => this.islog })
  }

  // 获取配置
  get appconfig () {
    return setting.getConfig("autoDelAt");
  }

  // 获取群人数
  async getGroupSize () {
    let MemberMap = await this.e.group.getMemberMap()
    let allmember = []
    MemberMap.forEach((v, k) => { allmember.push(k) })
    return allmember.length
  }

  // 处理踢人事件
  async kick () {
    // 管理员、群主和Q群管家不踢
    let check = this.e.member.is_admin || this.e.member.is_owner || this.e.user_id === 2854196310
    if(check) return false
    else {
      // 监测成功，向控制台输出日志
      this.islog = true
      await this.reply(`发现QQ${this.e.user_id}恶意at，已经将其移出群`)
      await this.e.group.kickMember(this.e.user_id)
    }

  }

  async atListen (e) {
    if (!this.appconfig.enable) { return false; }
    if (!Bot.pickGroup(this.e.group_id).is_owner && !Bot.pickGroup(this.e.group_id).is_admin) {
      // BOT无权踢人就不管
    } else {
      // 记录一条消息at的人数
      let AtQQ = []
      for (let msg of e.message) { if (msg.type === 'at') { AtQQ.push(msg.qq) } }

      // 处理事件
      if (!AtQQ.length) {
        return false
      } else if (AtQQ.length>=10 && AtQQ.length>=Number(await this.getGroupSize() * 0.8)) {
        await this.kick()
      }
    }
    return this.islog
  }
}
