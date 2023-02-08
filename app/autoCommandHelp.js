import plugin from "../../../lib/plugins/plugin.js";
import loader from "../../../lib/plugins/loader.js";

export class autoCommandHelp extends plugin {
  constructor() {
    super({
      name: "自动化插件_指令表",
      dsc: "自动生成所有插件的指令表",
      event: "message",
      priority: 4649,
      rule: [{
        reg: "^#指令表$",
        fnc: "autoCommandHelp",
      }],
    });
  }

  async autoCommandHelp() {
    if(!this.e.isMaster){ return this.reply('你没有权限');}
    let pluginList = []
    let plugins = []

    loader.priority.forEach(v => {
      let p = new v.class()
      pluginList.push(p)
    })
    for (let plugin of pluginList) {
      if (!plugin.rule) { continue }
      let command = []
      for (let v of plugin.rule) {
        command.push(v.reg)
      }
      plugins.push([
        `插件名: ${plugin.name}`,
        `插件描述: ${plugin.dsc || '无'}`,
        `插件优先级: ${plugin.priority || '0'}`,
        `插件正则指令: \n${command.join('\n')|| '无'}`,
      ])
    }
    await this.sendMessageArray(plugins)
    return true
  }

  async sendMessageArray(MessageArray, quote = false, data = {}){
    let MsgArray = []
    let i = 1
    let result
    for (let messageArrayElement of MessageArray) {
      if (MsgArray.length >= 95){
        // 栈内消息大于95重置栈
        MsgArray.push(`第${i.toString()}页...未完待续`)
        result = await this.sendByForwardMsg(MsgArray)
        i++
        MsgArray = []
      }
      MsgArray.push(messageArrayElement.join('\n'))
    }
    if (MsgArray){
      MsgArray.push(`第${i.toString()}页，共${i.toString()}页`)
      result = await this.sendByForwardMsg(MsgArray)
    }
    return result
  }


  async sendByForwardMsg(MsgArray){
    let massage = []
    for (let msgArrayElement of MsgArray) {massage.push({
      message: msgArrayElement,
      nickname: Bot.nickname,
      user_id: Bot.uin
    })}
    let forwardMsg = await Bot.makeForwardMsg(massage);
    return await this.e.reply(forwardMsg, false, {recallMsg:0})
  }

}
