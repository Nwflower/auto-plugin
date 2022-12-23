import YAML from 'yaml'
import chokidar from 'chokidar'
import fs from 'node:fs'

class Setting {
  constructor () {
    /** 默认设置 */
    this.defPath = './plugins/auto-plugin/def/'
    this.def = {}

    /** 用户设置 */
    this.configPath = './plugins/auto-plugin/config/'
    this.config = {}

    /** 监听文件 */
    this.watcher = { config: {}, def: {} }
  }

  getdefSet (app) {
    return this.getYaml(app, 'def')
  }

  getConfig (app) {
    return { ...this.getdefSet(app), ...this.getYaml(app, 'config') }
  }


  getYaml (app, type) {
    let file = this.getFilePath(app, type)
    if (this[type][app]) return this[type][app]

    try {
      this[type][app] = YAML.parse(fs.readFileSync(file, 'utf8'))
    } catch (error) {
      logger.error(`[${app}] 格式错误 ${error}`)
      return false
    }
    this.watch(file, app, type)
    return this[type][app]
  }

  getFilePath (app, type) {
    if (type === 'def') return `${this.defPath}${app}.yaml`
    else {
      try {
        if (!fs.existsSync(`${this.configPath}${app}.yaml`)) {
          fs.copyFileSync(`${this.defPath}${app}.yaml`, `${this.configPath}${app}.yaml`)
        }
      } catch (error) {
        logger.error(`自动化插件缺失默认文件[${app}]${error}`)
      }
      return `${this.configPath}${app}.yaml`
    }
  }


  watch (file, app, type = 'def') {
    if (this.watcher[type][app]) return

    const watcher = chokidar.watch(file)
    watcher.on('change', path => {
      delete this[type][app]
      logger.mark(`[修改配置文件][${type}][${app}]`)
      if (this[`change_${app}`]) {
        this[`change_${app}`]()
      }
    })
    this.watcher[type][app] = watcher
  }
}

export default new Setting()
