import fs from 'node:fs'

logger.info('---------!_!---------')
logger.info(`自动化插件1.0载入成功`)
const files = fs
  .readdirSync('./plugins/auto-plugin/app')
  .filter((file) => file.endsWith('.js'))

let apps = {}
for (let file of files) {
  let name = file.replace('.js', '')
  apps[name] = (await import(`./app/${file}`))[name]
}
let index = { auto: {} }
export const auto = index.auto || {}
export { apps }
