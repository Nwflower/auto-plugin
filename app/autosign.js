import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import setting from "../model/setting.js";

export class autosign extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '自动改签名',
      /** 功能描述 */
      dsc: '通过一言接口改签名',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 4645,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#自动签名$',
          /** 执行方法 */
          fnc: 'autosign'
        }
      ]
    })
    this.appconfig = setting.getConfig('autosign')
    this.task = {
      cron: this.appconfig.cron,
      name: '自动一言签名',
      fnc: () => this.autosign()
    }
  }

  async autosign () {
    if (!this.appconfig.enable) {return true}
    let url = 'https://v1.hitokoto.cn/'
    let res = await fetch(url).catch((err) => logger.error(err))
    if (!res) { return false }
    res = await res.json()
    await Bot.setSignature(res.hitokoto).catch((err) => {
      logger.error(err)
      return true
    })
    logger.info(`【自动修改签名】修改签名为：${res.hitokoto}`)
  }
}
