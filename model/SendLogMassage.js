// 消息回复处理模块 提供一些消息、转发消息加工以及消息分割等方法
import setting from "./setting.js";

class SendLogMassage {
  constructor () {}

  // 将一堆组消息处理成转发消息
  async sendForwardMsg(MsgArray){
    let massage = []
    if (!MsgArray) return false
    let config = setting.getConfig('autoSendLog')
    let groupID = config['logGroup']
    // 校验长度是否为1
    if (MsgArray.length === 1) {
      return await Bot.sendGroupMsg(groupID, MsgArray[0])
    }

    for (let msgArrayElement of MsgArray) {massage.push({
      message: msgArrayElement,
      nickname: Bot.nickname,
      user_id: Bot.uin
    })}
    let result
    let forwardMsg = await Bot.makeForwardMsg(massage);
    forwardMsg.data = forwardMsg.data
      .replace('<?xml version="1.0" encoding="utf-8"?>','<?xml version="1.0" encoding="utf-8" ?>')
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, '<title color="#777777" size="26">请点击查看内容</title>');
    try{
      result = await Bot.sendGroupMsg(groupID, forwardMsg)
      return result
    } catch (e){
      // 遇到错误，暂时关闭该功能
      global.logger = SuperLogger
      logger.error('自动化-发送日志插件遇到如下错误', e,'\n', '已经关闭该功能...')
      return false
    }
  }
}

export default new SendLogMassage()