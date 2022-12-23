/*
 * 名片更新模块示例：系统时间
 */

export function NameCardContent() {
  let now = new Date()
  let nowTime = `${now.getHours()}:${now.getMinutes()}`
  return `现在是北京时间${nowTime}`
}