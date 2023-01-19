/*
 * 名片更新模块示例：原神倒计时
 * 本更新模块为auto插件的核心功能之一
 * 禁止以任何形式 二次开源 倒卖 等
 */
export function NameCardContent() {
  // 基准版本
  let Version = 3.5
  let baseTime = new Date('2023-3-1 11:00:00').getTime()

  let nowTime = new Date().getTime()

  // 获取持续时间
  let duringTime = baseTime - nowTime
  while (duringTime <= 0){
    // 版本+0.1 同时时间+42天
    duringTime += 42 * 24 * 60 * 60 * 1000
    Version += 0.1
  }

  // 获取天数并取整
  let days = Math.floor(duringTime / (24 * 3600 * 1000))
  let leave1 = duringTime % (24 * 3600 * 1000);
  // 获取小时数并取整
  let hours = Math.floor(leave1 / (3600 * 1000));
  let leave2 = leave1 % (3600 * 1000);
  // 获取分钟数并取整
  let minutes = Math.floor(leave2 / (60 * 1000));

  return `离原神${Version.toFixed(1)}还有${days}天${hours}小时${minutes}分钟`
}