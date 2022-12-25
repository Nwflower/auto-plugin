import plugin from "../../../lib/plugins/plugin.js";
import os from "os";
import lodash from "lodash";
import setting from "../model/setting.js";
import { pluginRoot } from "../model/path.js";
import path from "path";
import fs from "fs";

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
        reg: "^(#|自动化)*切换(群)?(名片|昵称)(样式|格式|后缀)",
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
    if (Array.isArray(config.active)) config.active = await this.fileExtName(models[0]);
    else {
      for (let index in models) {
        if (config.active === await this.fileExtName(models[index])) {
          let newindex = Number(Number(index) + 1);
          if (newindex >= models.length) {
            let appdef = setting.getdefSet("autoGroupName");
            config.active = appdef.active;
            await this.reply(`切换成功，群名片模块已切换为默认随机`);
            this.appconfig = config
            return true;
          } else {
            let Tmpactive = await this.fileExtName(models[newindex])
            if (!fs.existsSync(path.join(pluginRoot, `model/autoGroupName/${Tmpactive}.js`))) { Tmpactive = await this.fileExtName(models[0]);}
            config.active = Tmpactive
          }
          break;
        }
      }
    }
    this.appconfig = config
    await this.reply(`切换成功，群名片模块已切换为${config.active}\n示例：${config.nickname || Bot.nickname}｜${await this.getSuffixFun(config)}`);
    return true;
  }

  async setGroupCard(groupID, Suffix) {
    if (!Suffix) return false;
    let card = `${this.appconfig.nickname || Bot.nickname}｜${Suffix}`
    if (Bot.pickMember(groupID, Bot.uin).card === card) return false
    await Bot.pickGroup(groupID).setCard(Bot.uin, card);
    return true;
  }
}
