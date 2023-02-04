import os from "os";
import setting from "../setting.js";
/*
 * 名片更新模块示例：内存占用百分比
 */
export function NameCardContent() {
  let config = setting.getConfig('autoGroupName')
  let Memory = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(config.fix).toString()
  let tick = config.memoriesTick
  return `当前${tick}${Memory}%`
}