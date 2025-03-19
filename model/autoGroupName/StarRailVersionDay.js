/*
 * 名片更新模块示例：星穹铁道倒计时
 * 本更新模块为auto插件的核心功能之一
 * 禁止以任何形式 二次开源 倒卖 等
 */
export function NameCardContent () {
  // 星穹铁道版本号 更新到5.0
  let Versions = [31,32,33,34,35,36,37,38,40,41,42,43,44,45,46,47,48,50]
  let Index = 0
  // 获取持续时间
  let baseTime = new Date('2025-02-26 10:00:00').getTime()
  let nowTime = new Date().getTime()
  let duringTime = baseTime - nowTime

  // 推算版本
  while (duringTime <= 0) {
    duringTime += 42 * 24 * 60 * 60 * 1000
    Index += 1
  }

  // 计算版本号并取到小数点后一位
  let Version = (typeof Versions[Index] === 'number') ? (Number(Versions[Index]) / 10).toFixed(1) : String(Versions[Index])

  // 获取天数并取整
  let days = Math.floor(duringTime / (24 * 3600 * 1000))
  let leave1 = duringTime % (24 * 3600 * 1000)

  // 获取小时数并取整
  let hours = Math.floor(leave1 / (3600 * 1000))
  let leave2 = leave1 % (3600 * 1000)

  // 获取分钟数并取整
  let minutes = Math.floor(leave2 / (60 * 1000))

  // 字符串处理
  return `离崩铁${Version}还有${days}天${hours}小时${minutes}分钟`
}
