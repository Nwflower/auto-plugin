import plugin from "../../../lib/plugins/plugin.js";
import fetch from "node-fetch";
import setting from "../model/setting.js";
import Common from "../../../lib/common/common.js";
import config from "../../../lib/config/config.js";

export class autoHelp extends plugin {
  constructor() {
    super({
      name: "自动化插件_帮助",
      dsc: "发送帮助指南链接，及第一次使用发送欢迎语",
      event: "message",
      priority: 4649,
      rule: [{
        reg: "^#自动化帮助$",
        fnc: "autoHelp",
      }],
    });
  }

  async init(){
    let autoHelpConfig = setting.getConfig("autoHelp");
    if (!autoHelpConfig.sent){
      await Common.relpyPrivate(config.masterQQ[0], '欢迎您使用自动化插件！\n本插件帮助文档地址：https://gitee.com/Nwflower/auto-plugin\n数据无价，请充分了解本插件功能后再使用！\n感谢你的支持！（本消息仅发送一次）')
      autoHelpConfig.sent = true
      setting.setConfig("autoHelp", autoHelpConfig)
    }
  }

  async autoHelp() {
    await this.reply(`请熟读自动化帮助文档：https://gitee.com/Nwflower/auto-plugin`)
    return true
  }
}
