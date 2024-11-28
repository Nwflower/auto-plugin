import plugin from "../../../lib/plugins/plugin.js";
import loader from "../../../lib/plugins/loader.js";
import moment from "moment";

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
      },{
        reg: "^#(定时)?任务表$",
        fnc: "autoJobs",
      },{
        reg: "^#(临时)?取消任务[0-9]*$",
        fnc: "cancelJobs",
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

  async cancelJobs() {
    if(!this.e.isMaster){ return this.reply('你没有权限');}
    let once = this.e.msg.includes('临时')
    let index = this.e.msg.toString().replace(/#(临时)?取消任务/g,'').trim()
    let val = loader.task[Number(index)]
    if (!val){
      this.reply(`无此任务代号【${index}】，请检查任务表`)
      return
    }
    if (once){
      val.job.cancelNext()
      this.reply(`已取消定时任务【${val.name}】的下一次调用`)
    }else {
      val.job.cancel()
      this.reply(`已取消定时任务【${val.name}】的所有计划调用`)
    }
    return true
  }

  async autoJobs() {
    if(!this.e.isMaster){ return this.reply('你没有权限');}
    let jobList = [[`以下为Bot定时任务列表汇总，想要取消某个预定的定时任务，请使用命令"#取消任务+任务代号"。如果你只是想要临时取消这个任务的下一次调用，请使用命令"#临时取消任务+任务代号"。取消不等于关闭，取消的任务会在bot重启时重新加载。`],
      [`提示：调用不一定生效，具体是否生效以插件配置为准。自动化插件的任务取消建议进入配置文件使这些配置任务不生效。`]]

    loader.task.forEach((val, index) =>{
      let date = (val.job.nextInvocation())
      let timeStr = `已被取消`
      if (date){
        timeStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${this.leadingZero(date.getHours())}:${this.leadingZero(date.getMinutes())}:${this.leadingZero(date.getSeconds())}`
      }
      jobList.push([
        `任务代号: ${index}`,
        `任务名: ${val.name}`,
        `任务执行式: ${val.cron}`,
        `下一次调用时间: ${timeStr}`,
      ])
    })
    await this.sendMessageArray(jobList)
    return true
  }

  leadingZero(number) {
    return number>10 ? number.toString():('0'+number.toString())
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
