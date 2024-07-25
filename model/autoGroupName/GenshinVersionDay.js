/*
 * 名片更新模块示例：原神倒计时
 * 本更新模块为auto插件的核心功能之一
 * 禁止以任何形式 二次开源 倒卖 等
 */
export function NameCardContent() {
  // 原神版本号
  let Versions = [36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60]
  let Index = 0

  // 获取持续时间
  let baseTime = new Date('2023-4-12 11:00:00').getTime()
  let nowTime = new Date().getTime()
  let duringTime = baseTime - nowTime

  // 推算版本
  while (duringTime <= 0){
    duringTime += 42 * 24 * 60 * 60 * 1000
    Index += 1
  }

  // 计算版本号并取到小数点后一位
  let Version = (Number(Versions[Index])/10).toFixed(1)

  // 获取天数并取整
  let days = Math.floor(duringTime / (24 * 3600 * 1000))
  let leave1 = duringTime % (24 * 3600 * 1000);

  // 获取小时数并取整
  let hours = Math.floor(leave1 / (3600 * 1000));
  let leave2 = leave1 % (3600 * 1000);

  // 获取分钟数并取整
  let minutes = Math.floor(leave2 / (60 * 1000));

  // 字符串处理
  return `离原神${Version}还有${days}天${hours}小时${minutes}分钟`
}