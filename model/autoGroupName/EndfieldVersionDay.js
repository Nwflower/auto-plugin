/*
 * 名片更新模块示例：明日方舟：终末地倒计时
 * 本更新模块为auto插件的核心功能之一
 * 禁止以任何形式 二次开源 倒卖 等
 *
 * 开服时间取官方公告里的维护窗口结束时间，版本数字取自启动器接口；无预告时按约50天间隔推算，见 model/gameVersion.js
 */
import { getVersionCountdown } from '../gameVersion.js'

export async function NameCardContent () {
  return await getVersionCountdown('endfield')
}
