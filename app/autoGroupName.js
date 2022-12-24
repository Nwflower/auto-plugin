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
        fnc: "setGroupCard",
      }, {
        reg: "^(#|自动化)*切换(群)?(名片|昵称)(样式|格式|后缀)",
        fnc: "tabGroupCard",
      }],
    });
    this.appconfig = setting.getConfig("autoGroupName");
    this.task = {
      cron: this.appconfig.cron,
      name: "自动群名片",
      fnc: () => this.CardTask(),
    };
    Object.defineProperty(this.task, "log", { get: () => false });
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

  async getSuffixFun() {
    let activeModels = this.appconfig.active;
    if (!Array.isArray(activeModels)) activeModels = [activeModels];
    let activePath = path.join(pluginRoot, `model/autoGroupName/${await lodash.sample(activeModels)}.js`);
    // 判断文件是否存在
    if (fs.existsSync(activePath)) {
      try {
        // 判断是否是windows系统
        if (os.platform() === "win32") {
          activePath = "file:///" + activePath;
        }
        let { NameCardContent } = await import(activePath);
        if (typeof NameCardContent === "function") {
          this.Suffix = await NameCardContent();
        } else {
          logger.error(`【自动化插件】文件${activePath}中NameCardContent必须要定义成一个函数方法！`);
        }
      } catch (e) {
        logger.error(`【自动化插件】文件${activePath}载入失败，群名片自动更新功能可能无法使用\n${e}`);
      }
    } else {
      logger.error(`【自动化插件】文件${activePath}不存在！`);
    }
  }

  async CardTask() {
    let taskGroup = this.taskGroup;
    if (taskGroup.length) {
      await this.getSuffixFun();
      for (let groupId of taskGroup) {
        if (!await this.setGroupCard(groupId, this.Suffix, true)) {
          return false;
        }
      }
    }
    return true;
  }

  async tabGroupCard() {
    if (!this.e.isMaster) return false;
    let models = fs.readdirSync(path.join(pluginRoot, `model/autoGroupName`)).filter(file => file.endsWith(".js"));

    if (Array.isArray(this.appconfig.active)) this.appconfig.active = await this.fileExtName(models[0]);
    else {
      for (let index in models) {
        if (this.appconfig.active === await this.fileExtName(models[index])) {
          let newindex = Number(Number(index) + 1);
          if (newindex >= models.length) {
            let appdef = setting.getdefSet("autoGroupName");
            this.appconfig.active = appdef.active;
            await this.reply(`切换成功，群名片模块已切换为默认随机`);
            setting.setConfig("autoGroupName", this.appconfig);
            return true;
          } else {
            let Tmpactive = await this.fileExtName(models[newindex])
            if (!fs.existsSync(path.join(pluginRoot, `model/autoGroupName/${Tmpactive}.js`))) { Tmpactive = await this.fileExtName(models[0]);}
            this.appconfig.active = Tmpactive
          }
          break;
        }
      }
    }
    await this.getSuffixFun();
    let Suffix = this.Suffix;
    await this.reply(`切换成功，群名片模块已切换为${this.appconfig.active}\n示例：${this.appconfig.nickname || Bot.nickname}｜${Suffix}`);
    setting.setConfig("autoGroupName", this.appconfig);
    return true;
  }

  async setGroupCard(groupID, Suffix) {
    if (!this.appconfig.enable) return false;
    if (!this.Suffix) return false;
    let card = `${this.appconfig.nickname || Bot.nickname}｜${Suffix}`
    if (Bot.pickMember(groupID, Bot.uin).card === card) return
    // logger.info(`${this.appconfig.nickname || Bot.nickname}|${Suffix}`)
    await Bot.pickGroup(groupID).setCard(Bot.uin, card);
    return true;
  }
}
