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
      priority: 416,
      rule: [rule]
    })
    this.islog = false
    Object.defineProperty(rule, 'log', { get: () => this.islog })
  }

  async atListen (e) {
    if (!Bot.pickGroup(this.e.group_id).is_owner && !Bot.pickGroup(this.e.group_id).is_admin) {
      // do nth
    } else if (e.atall && !e.member.is_admin && !e.member.is_owner ) {
      await this.e.group.kickMember(this.e.user_id)
      await this.reply(`QQ${this.e.user_id}恶意at全体成员，已经将其移出群`)
      this.islog = true
    }
    return this.islog
  }
}
