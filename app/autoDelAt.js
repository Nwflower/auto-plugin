import plugin from '../../../lib/plugins/plugin.js'

export class autoDelAt extends plugin {
  constructor () {
    let rule ={
      reg: '.*',
      fnc: 'atListen'
    }
    super({
      name: '恶意at',
      dsc: '自动踢掉恶意at全体成员的成员',
      event: 'message.group',
      priority: 464,
      rule: [rule]
    })
    this.islog = false
    Object.defineProperty(rule, 'log', { get: () => this.islog })
  }

  async getGroupSize () {
    let MemberMap = await this.e.group.getMemberMap()
    let allmember = []
    MemberMap.forEach((v, k) => { allmember.push(k) })
    return allmember.length
  }

  async kick () {
    if(this.e.member.is_admin || this.e.member.is_owner) return false
    this.islog = true
    await this.reply(`发现QQ${this.e.user_id}恶意at，已经将其移出群`)
    await this.e.group.kickMember(this.e.user_id)
  }

  async atListen (e) {
    if (!Bot.pickGroup(this.e.group_id).is_owner && !Bot.pickGroup(this.e.group_id).is_admin) {
      // do nth
    } else {
      let AtQQ = []
      for (let msg of e.message) {
        if (msg.type === 'at') {
          AtQQ.push(msg.qq)
        }
      }
      if (!AtQQ.length) {
        return false
      } else if (AtQQ.length>=10 && AtQQ.length>=Number(await this.getGroupSize() * 0.8)) {
        await this.kick()
      } else if (e.atall) {
        await this.kick()
      }
    }
    return this.islog
  }
}
