import plugin from "../../../lib/plugins/plugin.js";
import PluginsLoader from "../../../lib/plugins/loader.js";
import schedule from "node-schedule";
import loader from "../../../lib/plugins/loader.js";

export class autoCommand extends plugin {
  constructor() {
    super({
      name: "自动化插件_指令",
      dsc: "按照需要自动执行指令",
      event: "message",
      priority: -1,
      rule: [{
        reg: "^#定时指令.*",
        fnc: "autoCommand",
      }],
    });
  }

  async autoCommand() {
    if (!/^#定时指令/.test(this.e.msg)) return false;
    if(!this.e.isMaster){ return this.reply('你没有权限');}
    let command = /-t="(.*)"$/.exec(this.e.msg)
    let cron = /-c="(.*)" -t=/.exec(this.e.msg)
    let timeout = /-s=([0-9]*)/.exec(this.e.msg)
    let type = (!timeout || !timeout[1])
    if (!command || !command[1]) {
      return false;
    }
    if (!type) {
      if (!isNaN(Number(timeout[1]))){
        await this.setETask(command[1], Number(timeout[1]))
        return this.reply(`将在${Number(timeout[1]).toString()}秒后执行指令【${command[1]}】，执行完毕前，请不要关闭您的云崽、计算机或服务器。`);
      } else {
        return this.reply('未正确识别出延时时间，请确认格式后再发送');
      }
    }else {
      if (!cron || !cron[1]){
        return this.reply('未正确识别出cron表达式，请确认格式后再发送');
      } else {
        await this.setECronTask(command[1], String(cron[1]))
        return this.reply(`已将指令【${command[1]}】加入任务列表。关闭您的云崽、计算机或服务器后调用将立刻失效，您也可以使用自动化插件的【任务表】功能管理定时任务。`);
      }
    }

  }

  async setETask(text, timeout) {
    let e = await this.getE(text)
    return setTimeout(async function () {
      await PluginsLoader.deal(e)
    }, timeout * 1000)
  }

  async getE(text){
    return {
      post_type: 'message',
      message_id: this.e.message_id,
      user_id: this.e.user_id,
      time: this.e.time,
      seq: this.e.seq,
      rand: this.e.rand,
      font: this.e.font,
      message_type: this.e.message_type,
      sub_type: this.e.sub_type,
      sender: this.e.sender,
      from_id: this.e.from_id,
      to_id: this.e.to_id,
      auto_reply: this.e.auto_reply,
      friend: this.e.friend,
      reply: this.e.reply,
      self_id: this.e.self_id,
      logText: '',
      isPrivate: this.e.isPrivate,
      isMaster: this.e.isMaster,
      replyNew: this.e.replyNew,
      runtime: this.e.runtime,
      user: this.e.user,
      Bot: this.e.Bot || global.Bot,

      message: [{ type: 'text', text }],
      msg: '',
      original_msg: text,
      raw_message: text,
      toString: () => { return text }
    }
  }

  async setECronTask(command, cron) {
    let func = async (a) => await this.getE(a)
    let job = schedule.scheduleJob(cron, async () => {
      await PluginsLoader.deal(await func(command))
    })
    loader.task.push({
      name:`自动指令调用-【${command}】`,
      cron,
      job: job
    })
  }
}
