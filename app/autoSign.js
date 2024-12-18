import plugin from "../../../lib/plugins/plugin.js";
import fetch from "node-fetch";
import setting from "../model/setting.js";
import PluginsLoader from "../../../lib/plugins/loader.js";

export class autoSign extends plugin {
  constructor() {
    super({
      name: "自动化插件_自动改签名与发说说",
      dsc: "通过一言接口改签名",
      event: "message",
      priority: 4645,
      rule: [{
        reg: "^#自动签名$",
        fnc: "autoSign",
      }],
    });
  }

    async init() {
        // 功能关闭时，不创建任务，减轻任务表内容
        if (this.appconfig.enable) {
            PluginsLoader.task.push({
                cron: this.appconfig.cron,
                name: "自动化插件_签名和说说",
                fnc: () => this.autoSign(),
            })
        }
    }

  // 获取配置
  get appconfig () {
    return setting.getConfig("autoSign");
  }

  async autoSign() {
    if (!this.appconfig.enable) { return true; }

    // 从接口获取数据
    let url = "https://v1.hitokoto.cn/";
    let res = await fetch(url).catch((err) => logger.error(err));
    if (!res) { return false;}
    res = await res.json();
    await Bot.setSignature(res.hitokoto).catch((err) => {
      logger.error(`【自动修改签名】修改签名遇到不可抗力。可能是BOT掉线。\n${err}`);
      return true;
    });
    logger.info(`【自动修改签名】修改签名为：${res.hitokoto}`);
  }
}
