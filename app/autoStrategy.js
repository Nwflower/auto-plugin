import plugin from "../../../lib/plugins/plugin.js";
import common from "../../../lib/common/common.js";
import lodash from "lodash";
import fs from "node:fs";
import fetch from "node-fetch";
import gsCfg from "../../genshin/model/gsCfg.js";
import path from "path";
import { _path } from "../model/path.js";
import setting from "../model/setting.js";

export class autoStrategy extends plugin {
  constructor () {
    super({
      name: '自动更新米游社攻略',
      dsc: '自动更新米游社攻略图',
      event: 'message',
      priority: 499,
      rule: [{
        reg: '^#?更新全部攻略([1-4])?$',
        fnc: 'strategy'
      }]
    })
    this.appconfig = setting.getConfig("autoStrategy");
    this.set = gsCfg.getConfig('mys', 'set')
    this.path = `${_path}/data/strategy`

    this.url = 'https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=2&order_type=2&collection_id='
    this.collection_id = [
      [],
      // 来源：西风驿站
      [839176, 839179, 839181, 1180811],
      // 来源：原神观测枢
      [813033],
      // 来源：派蒙喵喵屋
      [341284],
      // 来源：OH是姜姜呀(需特殊处理)
      [341523]
    ]
    this.oss = '?x-oss-process=image//resize,s_1200/quality,q_90/auto-orient,0/interlace,1/format,jpg'
    this.task = {
      cron: this.appconfig.cron,
      name: "自动更新默认攻略",
      fnc: () => this.UpdateTask(),
    };
  }

  async strategy () {
    if (!this.e.isMaster) {
      this.reply(`你没有权限`)
      return false
    }
    let match = /^#?更新全部攻略([1-4])?$/.exec(this.e.msg)
    let group = match[1] ? match[1] : this.set.defaultSource

    this.reply(`正在更新全部攻略${group}，耗时可能比较久~`)
    await this.updateStrategy(group)
    return true
  }

  async updateStrategy (group) {
    let roleNames = fs.readdirSync(path.join(this.path, group.toString())).filter(file => file.endsWith(".jpg"));
    for (let roleName of roleNames) {
      this.sfPath = `${this.path}/${group}/${roleNames}`
      await this.getImg(roleName.replace(/.jpg/g,'').trim(), group)
      // 等待时间
      await common.sleep(1000)
    }
    return true
  }

  /** 下载攻略图 */
  async getImg (name, group) {
    let msyRes = []
    this.collection_id[group].forEach((id) => msyRes.push(this.getData(this.url + id)))

    try {
      msyRes = await Promise.all(msyRes)
    } catch (error) {
      logger.error(`下载${name}攻略${group}时出错\n${error}}`)
      return false
    }

    let posts = lodash.flatten(lodash.map(msyRes, (item) => item.data.posts))
    let url
    for (let val of posts) {
      if (group === 4) {
        if (val.post.structured_content.includes(name + '】')) {
          let content = val.post.structured_content.replace(/\\\/\{\}/g, '')
          let pattern = new RegExp(name + '】.*?image":"(.*?)"')
          let imgId = pattern.exec(content)[1]
          for (let image of val.image_list) {
            if (image.image_id === imgId) {
              url = image.url
              break
            }
          }
          break
        }
      } else {
        if (val.post.subject.includes(name)) {
          let max = 0
          val.image_list.forEach((v, i) => {
            if (Number(v.size) >= Number(val.image_list[max].size)) max = i
          })
          url = val.image_list[max].url
          break
        }
      }
    }

    if (!url) {
      logger.info(`暂无${name}攻略${group}`)
      return false
    }
    logger.mark(`${this.e.logFnc} 下载${name}攻略图${group}`)
    if (!await common.downFile(url + this.oss, this.sfPath)) { return false }
    logger.mark(`${this.e.logFnc} 下载${name}攻略${group}成功`)
  }

  async getData (url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) { return false }
    return await response.json()
  }

  async UpdateTask() {
    if (!this.appconfig.enable) {
      return true;
    }
    setTimeout(() => this.this.updateStrategy(this.set.defaultSource), Math.floor(Math.random() * 7199999 + 1))
  }
}
