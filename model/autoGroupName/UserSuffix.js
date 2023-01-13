import setting from "../setting.js";
/*
 * 名片更新模块示例：自定义后缀
 */

export function NameCardContent() {
    let config = setting.getConfig('autoGroupName')
    return config.userSuffix
  }