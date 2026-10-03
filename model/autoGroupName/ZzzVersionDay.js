/*
 * 名片更新模块示例：绝区零倒计时
 * 本更新模块为auto插件的核心功能之一
 * 禁止以任何形式 二次开源 倒卖 等
 *
 * 版本号与开服时间由官方游戏公告联网校准（见 model/gameVersion.js），联网失败时自动本地推算
 */
import { getVersionCountdown } from '../gameVersion.js'

export async function NameCardContent () {
  return await getVersionCountdown('zzz')
}
