/*
 * 名片更新模块示例：长安十二时辰
 */

export function NameCardContent() {
  let now = new Date()
  let BigHourName = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子']
  let BigHourType = ['正','初']
  let BigMinName = ['零', '一', '二', '三', '四']
  let hour = Number(now.getHours())
  let minutes = now.getMinutes()
  return `现在是长安${BigHourName[Math.floor((hour + 1)/2)]}${BigHourType[hour % 2]}${BigMinName[Math.floor(minutes/15)]}刻`
}