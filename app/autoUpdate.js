import plugin from '../../../lib/plugins/plugin.js'
import { createRequire } from 'module'
import lodash from 'lodash'
import fs from 'node:fs'
import common from '../../../lib/common/common.js'
import setting from "../model/setting.js";

const require = createRequire(import.meta.url)
const { exec, execSync } = require('child_process')

/**
 * 插件使用说明 必看
 * 插件会在凌晨2-4点之间某一刻自动更新Yunzai和全部插件并自动重启，请谨慎安装！确定需要再安装！
 * 理论上其他目录也可以 但是没测试 不知道 出问题不负责。
 * 已测试功能 更新正常 重启正常
 * 开发者 西北一枝花 QQ1679659 首发群240979646 其他群搬运追责
 **/

export class autoUpdate extends plugin {
  constructor () {
    super({
      name: '自动全部更新',
      dsc: '自动更新全部插件并重启',
      event: 'notice',
      priority: 99999,
    })
    this.typeName = 'Yunzai-Bot'
    this.key = 'Yz:autoUpdate'
    this.alllog = []
    this.defcron = '0 0 2 * * ?'
    this.task = {
      cron: this.appconfig.cron,
      name: '自动更新全部插件：凌晨2-4点之间某一刻自动执行',
      fnc: () => this.updataTask()
    }
  }

  get appconfig () {
    return setting.getConfig("autoUpdate");
  }

  async init () {
    let restart = await redis.get(this.key)
    if (restart && process.argv[1].includes('pm2')) { this.reply('重启成功') }
    redis.del(this.key)
  }

  async updataTask () {
    if (!this.appconfig.enable) {
      return false;
    }
    let ops = 0
    if (this.appconfig.cron === this.defcron) {
      // 默认表达式情况下 随机延迟 防止出现扎堆更新
      ops = 7199999
    }
    setTimeout(() => this.updateAll(), Math.floor(Math.random() * ops + 1))
  }

  async reply (msg = '', quote = false, data = { at: false }) {
    if (quote || data.at) { logger.error(msg) } else { logger.info(msg) }
    if (Array.isArray(msg)){
      this.alllog.push({
        plugin: '',
        logs: msg
      })
    }else {
      this.alllog.push({
        plugin: '',
        logs:[msg]
      })
    }
    return true
  }

  getPlugin (plugin = '') {
    if (!fs.existsSync(`./plugins/${plugin}/.git`)) return false
    this.typeName = plugin
    return plugin
  }

  async runUpdate (plugin = '') {
    let updataPluginLog = {
      plugin: plugin || this.typeName,
      logs:[]
    }
    let cm = 'git pull --no-rebase'
    let type = '更新'
    if (plugin) { cm = `git -C ./plugins/${plugin}/ pull --no-rebase` }
    this.oldCommitId = await this.getcommitId(plugin)
    updataPluginLog.logs.push(`开始${type}：${this.typeName}`)
    let ret = await this.execSync(cm)
    if (ret.error) {
      updataPluginLog.logs.push(`更新失败：${this.typeName}`)
      await this.gitErr(ret.error, ret.stdout)
      return false
    }
    let time = await this.getTime(plugin)
    if (/Already up|已经是最新/g.test(ret.stdout)) { updataPluginLog.logs.push(`${this.typeName}已经是最新`) } else {
      this.isUp = true
      updataPluginLog.logs.push(`${this.typeName}更新成功`)
      updataPluginLog.logs.push(await this.getLog(plugin))
    }
    updataPluginLog.logs.push(`最后更新时间：${time}`)
    this.alllog.push(updataPluginLog)
    return true
  }

  async getcommitId (plugin = '') {
    let cm = 'git rev-parse --short HEAD'
    if (plugin) { cm = `git -C ./plugins/${plugin}/ rev-parse --short HEAD` }
    let commitId = execSync(cm, { encoding: 'utf-8' })
    commitId = lodash.trim(commitId)
    return commitId
  }

  async getTime (plugin = '') {
    let cm = 'git log  -1 --oneline --pretty=format:"%cd" --date=format:"%m-%d %H:%M"'
    if (plugin) { cm = `cd ./plugins/${plugin}/ && git log -1 --oneline --pretty=format:"%cd" --date=format:"%m-%d %H:%M"` }
    let time = ''
    try {
      time = execSync(cm, { encoding: 'utf-8' })
      time = lodash.trim(time)
    } catch (error) { time = '获取时间失败' }
    return time
  }

  async gitErr (err, stdout) {
    let msg = '更新失败！'
    let errMsg = err.toString()
    stdout = stdout.toString()
    if (errMsg.includes('Timed out')) {
      await this.reply(msg + `\n连接超时：${errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '')}`)
    } else if (/Failed to connect|unable to access/g.test(errMsg)) {
      await this.reply(msg + `\n连接失败：${errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '')}`)
    } else if (errMsg.includes('be overwritten by merge')) {
      await this.reply(msg + `存在冲突：\n${errMsg}\n` + '请解决冲突后再更新，或者执行#强制更新，放弃本地修改')
    } else if (stdout.includes('CONFLICT')) {
      await this.reply([msg + '存在冲突\n', errMsg, stdout, '\n请解决冲突后再更新，或者执行#强制更新，放弃本地修改'])
    } else {
      await this.reply([errMsg, stdout])
    }
  }

  async updateAll () {
    await this.reply('Auto - PLUGIN即将执行自动更新')
    let dirs = fs.readdirSync('./plugins/')
    await this.runUpdate()
    for (let plu of dirs) {
      plu = this.getPlugin(plu)
      if (plu === false) continue
      await common.sleep(1500)
      await this.runUpdate(plu)
    }
    if (this.isUp) {
      logger.info('即将执行重启，以应用更新')
      await this.saveLog()
      setTimeout(() => this.restart(), 2000)
    } else {
      await this.saveLog()
    }
    if (this.appconfig.log === 2) {
      let key = `Yz:auto-plugin:Update:${Bot.uin}`
      redis.set(key, '1', { EX: 72000 })
    }
  }

  async getLog (plugin = '') {
    let cm = 'git log  -20 --oneline --pretty=format:"%h||[%cd]  %s" --date=format:"%m-%d %H:%M"'
    if (plugin) { cm = `cd ./plugins/${plugin}/ && ${cm}` }
    let logAll
    try { logAll = execSync(cm, { encoding: 'utf-8' }) } catch (error) { this.reply(error.toString(), true) }
    if (!logAll) return false
    logAll = logAll.split('\n')
    let log = []
    for (let str of logAll) {
      str = str.split('||')
      if (str[0] === this.oldCommitId) break
      if (str[1].includes('Merge branch')) continue
      log.push(str[1])
    }
    let line = log.length
    log = log.join('\n')
    if (log.length <= 0) return ''
    logger.info(`${plugin || 'Yunzai-Bot'}更新日志，共${line}条\n${log}`)
    return log
  }

  async restart () {
    await this.reply('开始执行重启，请稍等...')
    let npm = await this.checkPnpm()
    try {
      await redis.set(this.key, 'autoUpdate', { EX: 120 })
      let cm = `${npm} start`
      if (process.argv[1].includes('pm2')) { cm = `${npm} run restart` } else { await this.reply('当前为前台运行，重启将转为后台...') }
      exec(cm, { windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          redis.del(this.key)
          this.reply(`重启失败\n${error.stack}`, true)
        } else if (stdout) {
          this.reply('重启成功，运行已由前台转为后台')
          this.reply(`查看日志请用命令：${npm} run log`)
          this.reply(`停止后台运行命令：${npm} stop`)
          process.exit()
        }
      })
    } catch (error) {
      redis.del(this.key)
      let e = error.stack ?? error
      this.reply(`操作失败！\n${e}`, true)
    }
  }

  async checkPnpm () {
    let ret = await this.execSync('pnpm -v')
    return ret.stdout ? 'pnpm' : 'npm'
  }

  async execSync (cmd) { return new Promise((resolve, reject) => { exec(cmd, { windowsHide: true }, (error, stdout, stderr) => { resolve({ error, stdout, stderr }) }) }) }

  async saveLog() {
    setting.setData(`autoUpdata`,`log-${(new Date().toLocaleDateString()).replace(/\//g,'-')}`, this.alllog)
    this.alllog = []
  }
}
