import fs from 'node:fs'
import setting from "./model/setting.js";

logger.info('---------!_!---------')
logger.info(`自动化插件1.0.3载入成功`)
const files = fs
  .readdirSync('./plugins/auto-plugin/app')
  .filter((file) => file.endsWith('.js'))

let apps = {}
for (let file of files) {
  let name = file.replace('.js', '')
  apps[name] = (await import(`./app/${file}`))[name]
}

setTimeout(async function () {
  // 群名片复位
  let GroupNameConfig = setting.getConfig("autoGroupName")
  if (GroupNameConfig.enable){
    Bot.gl.forEach((v, k) => {
      Bot.pickGroup(k).setCard(Bot.uin, Bot.nickname);
    });
  }
}, 1000)

let index = { auto: {} }
export const auto = index.auto || {}
export { apps }
