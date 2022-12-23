/*
 * 名片更新模块示例：原神倒计时
 */
export function NameCardContent() {
  let Version = 3.4
  let baseTime = new Date('2023-1-18 11:00:00').getTime()

  let nowTime = new Date().getTime()
  let duringTime = baseTime - nowTime
  while (duringTime <= 0){
    duringTime += 42 * 24 * 60 * 60 * 1000
    Version += 0.1
  }
  let days = Math.floor(duringTime / (24 * 3600 * 1000))
  let leave1 = duringTime % (24 * 3600 * 1000);
  let hours = Math.floor(leave1 / (3600 * 1000));
  let leave2 = leave1 % (3600 * 1000);
  let minutes = Math.floor(leave2 / (60 * 1000));

  return `离原神${Version.toFixed(1)}还有${days}天${hours}小时${minutes}分钟`
}