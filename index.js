import fs from 'node:fs'

logger.info('---------!_!---------')
logger.info(`自动化插件1.0.1载入成功`)
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
  Bot.gl.forEach((v, k) => {
    Bot.pickGroup(k).setCard(Bot.uin, Bot.nickname);
  });
}, 1000)


let index = { auto: {} }
export const auto = index.auto || {}
export { apps }
