import plugin from "../../../lib/plugins/plugin.js";
import os from "os";
import lodash from "lodash";
import setting from "../model/setting.js";
import { _path, pluginResources, pluginRoot } from "../model/path.js";
import path from "path";
import fs from "fs";
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import { headStyle } from "../model/base.js";

export class autoGroupName extends plugin {
  constructor() {
    super({
      name: "自动群名片",
      dsc: "多群展示群名片",
      event: "message",
      priority: 4644,
      rule: [{
        reg: "^#*更新群名片",
        fnc: "CardTask",
      }, {
        reg: "^(#|自动化)*(切换|更改|设置)(群)?(名片|昵称)(样式|格式|后缀).*",
        fnc: "tabGroupCard",
      }],
    });
    this.task = {
      cron: this.appconfig.cron,
      name: "自动群名片",
      fnc: () => this.CardTask(),
    };
    Object.defineProperty(this.task, "log", { get: () => false });
  }

  get appconfig() {
    return setting.getConfig("autoGroupName")
  }

  set appconfig(setter) {
    setting.setConfig("autoGroupName", setter);
  }

  get taskGroup() {
    let allGroup = [];
    Bot.gl.forEach((v, k) => {
      allGroup.push(k);
    });
    return lodash.difference(allGroup, this.appconfig.notGroup);
  }

  async fileExtName(fileAllName) {
    let file = fileAllName;
    let index = file.indexOf(".");
    let num = 0;
    if (index === -1) return fileAllName;
    do {
      index = file.indexOf(".", index + 1);
      num++;
    } while (index !== -1);
    if (num === 1) {
      let getFileExtName = fileAllName.split(".");
      return getFileExtName[0];
    } else {
      let getFileExtName = fileAllName.split(".");
      let fileName = "";
      for (let i = 0; i < getFileExtName.length; i++) {
        if (i === getFileExtName.length - 1) break;
        fileName += getFileExtName[i] + ".";
      }
      fileName = fileName.substring(0, fileName.length - 1);
      return fileName;
    }
  }

  async getSuffixFun(config = this.appconfig) {
    let activeModels = config.active;
    if (!Array.isArray(activeModels)) activeModels = [activeModels];
    let activePath = path.join(pluginRoot, `model/autoGroupName/${await lodash.sample(activeModels)}.js`);
    if (fs.existsSync(activePath)) {
      try {
        if (os.platform() === "win32") activePath = "file:///" + activePath;
        let { NameCardContent } = await import(activePath);
        if (typeof NameCardContent === "function") {
          return await NameCardContent()
        } else {
          logger.error(`【自动化插件】文件${activePath}中NameCardContent必须要定义成一个函数方法！`);
        }
      } catch (e) {
        logger.error(`【自动化插件】文件${activePath}载入失败\n${e}`);
      }
    } else {
      logger.error(`【自动化插件】文件${activePath}不存在！`);
    }
  }

  async CardTask() {
    if (!this.appconfig.enable) return false;
    let taskGroup = this.taskGroup;
    if (taskGroup.length) {
      let Suffix = await this.getSuffixFun();
      for (let groupId of taskGroup) {
        if (!await this.setGroupCard(groupId, Suffix)) {
          return false;
        }
      }
    }
    return true;
  }

  async tabGroupCard() {
    if (!this.e.isMaster) return false;

    let models = fs.readdirSync(path.join(pluginRoot, `model/autoGroupName`)).filter(file => file.endsWith(".js"));

    let config = this.appconfig

    let msg = this.e.msg.replace(/^(#|自动化)*(切换|更改|设置)(群)?(名片|昵称)(样式|格式|后缀)/, '').replace(/，/g,',').replace(/[^(\d|,)]*/g,'').trim()
    let tmpResult = msg.split(',')
    let result = []
    for (let num of tmpResult) {
      if (num>=1 && num<=models.length) result.push(Number(num))
    }
    if (!result.length) {
      if (Array.isArray(config.active)) {
        config.active = await this.fileExtName(models[0]);
      } else {
        for (let index in models) {
          if (config.active === await this.fileExtName(models[index])) {
            let newindex = Number(Number(index) + 1);
            if (newindex >= models.length) newindex = 0
            config.active = await this.fileExtName(models[newindex])
            break;
          }
        }
      }
    }else {
      config.active = []
      for (let index in models) {
        if (result.includes(Number(index) + 1)) {
          config.active.push(await this.fileExtName(models[Number(index)]))
        }
      }
    }

    this.appconfig = config
    return await this.sendTabImage(config)
  }

  async sendTabImage (config = this.appconfig){

    let models = fs.readdirSync(path.join(pluginRoot, `model/autoGroupName`)).filter(file => file.endsWith(".js"));
    let TmpModels = []
    for (let model of models) {
      let pureModel = await this.fileExtName(model)
      let example = `${config.nickname || Bot.nickname}｜${await this.getSuffixFun({ active: pureModel })}`
      TmpModels.push({
        pureModel,
        example,
        able: (config.active === pureModel || config.active.includes(pureModel))
      })
    }
    let base64 = await puppeteer.screenshot('auto-plugin', {
      saveId: `autoGroupName`,
      tplFile: `${pluginResources}/html/tabGroupName/tabGroupName.html`,
      headStyle,
      pluResPath: `${pluginResources}/`,
      imgType: 'png',
      uin:Bot.uin,
      models: TmpModels,
      Notice: '使用#切换名片样式+序号可直接更改，多个序号请用逗号隔开'
    })
    await this.reply(base64)
    return true
  }

  async setGroupCard(groupID, Suffix) {
    if (!Suffix) return false;
    let card = `${this.appconfig.nickname || Bot.nickname}｜${Suffix}`
    if (Bot.pickMember(groupID, Bot.uin).card === card) return false
    await Bot.pickGroup(groupID).setCard(Bot.uin, card);
    return true;
  }
}
