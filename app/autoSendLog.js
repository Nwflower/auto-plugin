import plugin from "../../../lib/plugins/plugin.js";
import SendLogMassage from "../model/SendLogMassage.js";
import setting from "../model/setting.js";
import chalk from "chalk";

export class autoSendLog extends plugin {
  constructor() {
    super({
      name: "自动化插件_控制台日志输出",
      dsc: "向某群自动输出控制台日志，方便查阅",
      event: "message",
      priority: 4649,
    });
    this.appconfig = setting.getConfig("autoSendLog");
  }

  async init(){
    let appconfig = setting.getConfig("autoSendLog");
    if (!this.appconfig.enable) { return false; }
    global.SuperLogger = logger
    let putMassage = (type,extend,forceSent) =>{ this.putMassage(type,extend,forceSent)}
    let level = this.appconfig.level
    global.BotLogMassage = []
    global.BotLogErrorMassage = []
    global.BotLogMassageArray = []
    global.logger = {
      trace() {
        if (level<=1){ putMassage('trace',[...arguments]) }
        SuperLogger.trace(...arguments)
      },
      debug() {
        if (level<=2){ putMassage('debug',[...arguments]) }
        SuperLogger.debug(...arguments)
      },
      info() {
        if (level<=3){ putMassage('info',[...arguments]) }
        SuperLogger.info(...arguments)
      },
      // warn及以上的日志采用error策略
      warn() {
        if (level<=4){ putMassage('warn',[...arguments]) }
        SuperLogger.warn(...arguments)
      },
      error() {
        if (level<=5){ putMassage('error',[...arguments], appconfig["errorProtect"]) }
        SuperLogger.error(...arguments)
      },
      fatal() {
        if (level<=6){ putMassage('fatal',[...arguments]) }
        SuperLogger.fatal(...arguments)
      },
      mark() {
        if (level<=7){ putMassage('mark',[...arguments]) }
        SuperLogger.mark(...arguments)
      }
    }

    logger.chalk = chalk
    logger.red = chalk.red
    logger.green = chalk.green
    logger.yellow = chalk.yellow
    logger.blue = chalk.blue
    logger.magenta = chalk.magenta
    logger.cyan = chalk.cyan
  }

  // 消息压栈
  async putMassage(type,extend,forceSent = false){
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    // 强行转化字符串
    for (let extendIndex in extend) {
      extend[extendIndex] = extend[extendIndex].toString()
    }

    let massage = `[${hours}:${minutes <10? '0'+minutes : minutes}:${seconds <10? '0'+seconds : seconds}][${type}] ${extend.join(' ')}`

    BotLogMassage.push(massage)
    BotLogErrorMassage.push(massage)
    if (BotLogMassage.length >= parseInt(this.appconfig['singleLength'])){
      BotLogMassageArray.push(BotLogMassage.join('\n'))
      global.BotLogMassage = []
    }
    if (BotLogMassageArray.length >= parseInt(this.appconfig['massageLength'])){
      let sendMsg = BotLogMassageArray
      global.BotLogMassageArray = []
      return await SendLogMassage.sendForwardMsg(sendMsg)
    }
    if (BotLogErrorMassage.length > 5) {
      BotLogErrorMassage.shift()
    }
    if (forceSent){
      // 强制输出
      let array = BotLogErrorMassage
      global.BotLogErrorMassage = []
      return await SendLogMassage.sendForwardMsg([array.join('\n')])
    }

  }

}
