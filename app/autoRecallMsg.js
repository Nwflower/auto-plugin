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
    if (!this.appconfig.enable) { return false; }
    let recallMsg = this.appconfig.time
    let SuperReply = this.e.reply;
    let at = false
    this.e.reply = async function (massage, quote, data) {
      if (data && data.recallMsg){
        recallMsg = data.recallMsg
      }
      if (data && data.at){
        at = true
      }
      return await SuperReply(massage, quote, { at: at, recallMsg: recallMsg })
    }
  }
}