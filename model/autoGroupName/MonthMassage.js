import moment from "moment";

/*
 * 名片更新模块示例：月消息数
 */
export async function NameCardContent() {
  let month = Number(moment().month()) + 1
  let monthKey = `Yz:count:sendMsg:month:`
  let messageCount = await redis.get(`${monthKey}${month}`) || 0
  return `本月已发送${messageCount}条消息`
}