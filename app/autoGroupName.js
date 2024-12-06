import plugin from '../../../lib/plugins/plugin.js'
import os from 'os'
import lodash from 'lodash'
import setting from '../model/setting.js'
import { pluginResources, pluginRoot } from '../model/path.js'
import path from 'path'
import fs from 'fs'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { headStyle } from '../model/base.js'

let TodoGroup = []
let SaveSuffix = ''

export class autoGroupName extends plugin {
  constructor () {
    super({
      name: '自动化插件_群名片模块',
      dsc: '多群展示群名片',
      event: 'message',
      priority: 4644,
      rule: [{
        reg: '^#*更新群名片',
        fnc: 'CardTask'
      }, {
        reg: '^(#|自动化)*(切换|更改|设置)群?(名片|昵称)(前缀|自定义后缀)(.*)?$',
        fnc: 'setNickname'
      }, {
        reg: '^(#|自动化)*(切换|更改|设置)(群)?(名片|昵称)(样式|格式|后缀).*',
        fnc: 'tabGroupCard'
      }, {
        reg: '^(#|自动化)*(群)?(名片|昵称)(样式|格式|后缀|列表|一览|统计)+$',
        fnc: 'sendTabImage'
      } // ,{ reg: '打印群名片', fnc: 'sendNameCard' }
      ]
    })
    this.task = {
      cron: this.appConfig.cron,
      name: '自动群名片',
      fnc: () => this.CardTask()
    }
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  // 开发时使用，立刻打印全部模块提供的群名片
  async sendNameCard () {
    let models = fs.readdirSync(path.join(pluginRoot, 'model/autoGroupName')).filter(file => file.endsWith('.js'))
    for (let model of models) {
      let example = await this.getSuffixFun({ active: await this.fileExtName(model) })
      logger.info(await this.fileExtName(model) + '内容：' + example)
    }
    return true
  }

  // 获取配置单
  get appConfig () { return setting.getConfig('autoGroupName') }

  // 口令设置配置
  set appConfig (setter) { setting.setConfig('autoGroupName', setter) }

  // 获取需要执行任务的群组
  get taskGroup () {
    let allGroup = []
    Bot.gl.forEach((v, k) => { allGroup.push(k) })
    return lodash.difference(allGroup, this.appConfig.notGroup)
  }

  // 获取文件名后缀
  async fileExtName (fileAllName) {
    let file = fileAllName
    let index = file.indexOf('.')
    let num = 0
    if (index === -1) return fileAllName
    do {
      index = file.indexOf('.', index + 1)
      num++
    } while (index !== -1)
    if (num === 1) {
      let getFileExtName = fileAllName.split('.')
      return getFileExtName[0]
    } else {
      let getFileExtName = fileAllName.split('.')
      let fileName = ''
      for (let i = 0; i < getFileExtName.length; i++) {
        if (i === getFileExtName.length - 1) break
        fileName += getFileExtName[i] + '.'
      }
      fileName = fileName.substring(0, fileName.length - 1)
      return fileName
    }
  }

  // 根据配置获取群名片后缀
  async getSuffixFun (config = this.appConfig) {
    // 获取配置中的模块名
    let activeModels = config.active
    if (!Array.isArray(activeModels)) activeModels = [activeModels]
    let activePath = path.join(pluginRoot, `model/autoGroupName/${await lodash.sample(activeModels)}.js`)

    // 尝试运行函数
    if (fs.existsSync(activePath)) {
      try {
        if (os.platform() === 'win32') activePath = 'file:///' + activePath
        let { NameCardContent } = await import(activePath)
        if (typeof NameCardContent === 'function') {
          return await NameCardContent()
        } else {
          logger.error(`【自动化插件】文件${activePath}中NameCardContent必须要定义成一个函数方法！`)
        }
      } catch (e) {
        logger.error(`【自动化插件】文件${activePath}载入失败\n${e}`)
      }
    } else {
      logger.error(`【自动化插件】文件${activePath}不存在！`)
    }
  }

  // 设置自定义前后缀
  async setNickname () {
    let match = /^(#|自动化)*(切换|更改|设置)群?(名片|昵称)(前缀|自定义后缀)(.*)?$/.exec(this.e.msg)
    let type = match[4] // 前缀 | 自定义后缀
    let str = match[5]
    if (str == null || str === '') {
      await this.e.reply(`${type}设置方式为: \n#设置名片${type}[*] \n 请将[*]替换为要设置的${type}`)
      return
    }
    let config = this.appConfig
    if (type === '前缀') {
      config.nickname = str
    } else if (type === '自定义后缀') {
      config.userSuffix = str
    }
    this.appConfig = config
    await this.e.reply(`${type}已设置为: ` + str)
  }

  // 定时任务
  async CardTask () {
    let config = this.appConfig
    if (!config.enable) return false
    switch (config.mode) {
      case 1:
        if (!TodoGroup || TodoGroup.length === 0) {
          TodoGroup = this.taskGroup
          SaveSuffix = await this.getSuffixFun()
        }
        await this.setGroupCard(TodoGroup.shift(), SaveSuffix)
        break
      case 2:
        if (!TodoGroup || TodoGroup.length === 0) {
          TodoGroup = this.taskGroup
        }
        let Suffix = await this.getSuffixFun()
        await this.setGroupCard(TodoGroup.shift(), Suffix)
        break
      default:
        let taskGroup = this.taskGroup
        if (taskGroup.length) {
          let Suffix = await this.getSuffixFun()
          for (let groupId of taskGroup) {
            // 遇到失败情况中止任务执行
            if (!await this.setGroupCard(groupId, Suffix)) { return false }
          }
        }
        break
    }
    return true
  }

  // 切换需要展示的名片
  async tabGroupCard () {
    if (!this.e.isMaster) return false

    if (!this.appConfig.enable) {
      this.reply('该功能没有开启。请使用锅巴插件或文本配置工具修改配置文件后以使用该功能')
    }

    // 获取配置和模块列表
    let models = fs.readdirSync(path.join(pluginRoot, 'model/autoGroupName')).filter(file => file.endsWith('.js'))
    let config = this.appConfig

    // 对消息进行处理，获取需要更改的模块序号
    let msg = this.e.msg.replace(/^(#|自动化)*(切换|更改|设置)(群)?(名片|昵称)(样式|格式|后缀)/, '').replace(/，/g, ',').replace(/[^(\d|,)]*/g, '').trim()
    let tmpResult = msg.split(',')
    let result = []
    for (let num of tmpResult) { if (num >= 1 && num <= models.length) result.push(Number(num)) }

    // 没有模块序号就智能推断，是数组就设为单个模块；是某个模块就向下推
    if (!result.length) {
      if (Array.isArray(config.active)) {
        config.active = await this.fileExtName(models[0])
      } else {
        for (let index in models) {
          if (config.active === await this.fileExtName(models[index])) {
            let NewIndex = Number(Number(index) + 1)
            if (NewIndex >= models.length) NewIndex = 0
            config.active = await this.fileExtName(models[NewIndex])
            break
          }
        }
      }
    } else {
      // 有模块序号
      config.active = []
      for (let index in models) {
        if (result.includes(Number(index) + 1)) { config.active.push(await this.fileExtName(models[Number(index)])) }
      }
    }

    // 保存配置并渲染图片
    this.appConfig = config
    await this.sendTabImage(config)
    return true
  }

  // 渲染图片
  async sendTabImage (config) {
    if (config === undefined) config = this.appConfig
    let models = fs.readdirSync(path.join(pluginRoot, 'model/autoGroupName')).filter(file => file.endsWith('.js'))
    let TmpModels = []
    for (let model of models) {
      let pureModel = await this.fileExtName(model)
      let example = `${config.nickname || Bot.nickname}｜${await this.getSuffixFun({ active: pureModel })}`
      if (!Array.isArray(config.active)) config.active = [config.active]
      TmpModels.push({
        pureModel,
        example,
        able: (config.active === pureModel || config.active.includes(pureModel))
      })
    }
    let base64 = await puppeteer.screenshot('auto-plugin', {
      saveId: 'autoGroupName',
      tplFile: `${pluginResources}/html/tabGroupName/tabGroupName.html`,
      headStyle,
      pluResPath: `${pluginResources}/`,
      imgType: 'png',
      uin: Bot.uin,
      models: TmpModels,
      Notice: '使用#切换名片样式+序号可直接更改，多个序号请用逗号隔开'
    })
    await this.reply(base64)
    return true
  }

  // 根据所给后缀设置某群的名片
  async setGroupCard (groupID, Suffix) {
    if (!Suffix) return false
    let card = `${this.appConfig.nickname || Bot.nickname}｜${Suffix}`
    try {
      if (Bot.pickMember(groupID, Bot.uin).card === card) return false
      await Bot.pickGroup(groupID).setCard(Bot.uin, card)
    } catch (e) {
      logger.error('更改群名片流程异常，建议降频或关闭该功能')
    }
    return true
  }
}
