import plugin from '../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import Cfg from "../yenai-plugin/model/Config.js";

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
    this.task = {
      cron: '10 0/5 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * ? ',
      name: '自动一言签名',
      fnc: () => this.autosign()
    }
  }

  async autosign () {
    let url = 'https://v1.hitokoto.cn/'
    let res = await fetch(url).catch((err) => logger.error(err))
    if (!res) { return false }
    res = await res.json()
    await Bot.setSignature(res.hitokoto).catch((err) => {
      logger.error(err)
      return true
    })
    logger.info(`【自动修改签名】修改签名为：${res.hitokoto}`)
    let list = await this.getlist()
    if (!list.msglist) return false
    let ck = this.getck('qzone.qq.com')
    let something = list.msglist[0]
    await fetch(`https://xiaobai.klizi.cn/API/qqgn/ss_delete.php?data=&uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&tid=${something.tid}`).then(res => res.text()).catch(err => console.log(err))
  }

  async getck (data) {
    let cookie = Bot.cookies[data]
    let ck = cookie.replace(/=/g, `":"`).replace(/;/g, `","`).replace(/ /g, "").trim()
    ck = ck.substring(0, ck.length - 2)
    ck = `{"`.concat(ck).concat("}")
    return JSON.parse(ck)
  }
  async getlist() {
    let ck = this.getck('qzone.qq.com')
    let url = `https://xiaobai.klizi.cn/API/qqgn/ss_list.php?data=json&uin=${Bot.uin}&skey=${ck.skey}&pskey=${ck.p_skey}&qq=${Bot.uin}`
    let list = await fetch(url).then(res => res.json()).catch(err => console.log(err))
    if (!list) { return false } else { return list }
  }
}
