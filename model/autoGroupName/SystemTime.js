/*
 * 名片更新模块示例：系统时间
 */

export function NameCardContent() {
  let now = new Date()
  let hour = now.getHours()
  let minutes = now.getMinutes()
  if (hour < 10) { hour = `0${hour.toString()}` }
  if (minutes < 10) { minutes = `0${minutes.toString()}` }
  return `现在是北京时间${hour}:${minutes}`
}