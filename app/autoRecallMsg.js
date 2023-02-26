import setting from "../model/setting.js";

export class autoRecallMsg extends plugin {
  constructor() {
    super({
      name: '自动化插件_全局消息撤回',
      dsc: '给机器人发送的所有消息添加撤回时间',
      event: 'message',
      priority: 2,
    });
  }

  // 获取配置
  get appconfig () {
    return setting.getConfig("autoRecallMsg");
  }

  async accept() {
    let config = this.appconfig
    if (!config) { return false; }
    if (!config.enable) { return false; }

    // 判断模式
    switch (config.mode) {
      case 1:
        if (!config.group.includes(parseInt(this.e.group_id))){ return false }
        break;
      case 2:
        if (config.group.includes(parseInt(this.e.group_id))){ return false }
        break;
      default:
        break;
    }

    let recallMsg = config.time
    let SuperReply = this.e.reply;
    let at = false
    this.e.reply = async function (massage , quote = false, data = {}) {
      return await SuperReply(massage, quote, { at, recallMsg, ...data })
    }
    return false;
  }
}