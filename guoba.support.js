import setting from "./model/setting.js";
import lodash from "lodash";

// 支持锅巴
export function supportGuoba () {
  return {
    pluginInfo: {
      name: 'auto-plugin',
      title: '自动化插件',
      author: '@西北一枝花',
      authorLink: 'https://github.com/Nwflower',
      link: 'https://github.com/Nwflower/auto-plugin',
      isV3: true,
      isV2: false,
      description: '可能是史上最强大的群名片更新插件。另外还提供了一些自动化小功能。',
      icon: 'iconoir:3d-three-pts-box',
      iconColor: '#f4c436'
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [{
        field: 'autoDelAt.enable',
        label: '恶意At踢出群聊',
        bottomHelpMessage: '是否启用该功能',
        component: 'Switch'
      },{
        field: 'autoGroupName.enable',
        label: '自动群名片',
        bottomHelpMessage: '是否启用该功能',
        component: 'Switch'
      },{
        field: 'autoSign.enable',
        label: '自动改个签',
        bottomHelpMessage: '是否启用该功能',
        component: 'Switch'
      },{
        field: 'autoStrategy.enable',
        label: '自动更新攻略图',
        bottomHelpMessage: '是否启用该功能',
        component: 'Switch'
      },{
        field: 'autoUpdate.enable',
        label: '自动更新全部插件',
        bottomHelpMessage: '是否启用该功能',
        component: 'Switch'
      },{
        field: 'autoGroupName.cron',
        label: '群名片更新cron',
        bottomHelpMessage: '群名片更新的定时表达式。不会写可以百度"cron定时表达式"',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入定时表达式',
        },
      },{
        field: 'autoGroupName.nickname',
        label: '群名片前缀',
        bottomHelpMessage: '可以留空，默认为前缀',
        component: 'Input',
        required: false,
        componentProps: {
          placeholder: '请输入群名片前缀',
        },
      },{
        field: 'autoSign.cron',
        label: '个签更新cron',
        bottomHelpMessage: '发个签，涨权重；一直发，一直加。',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入定时表达式',
        },
      },{
        field: 'autoStrategy.cron',
        label: '攻略更新cron',
        bottomHelpMessage: '攻略更新的定时表达式。不会写可以百度"cron定时表达式"',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入定时表达式',
        },
      },{
        field: 'autoUpdate.log',
        label: '自动更新日志',
        bottomHelpMessage: '自动更新日志提醒模式',
        component: 'Select',
        componentProps: {
          options: [
            {label: '不提醒', value: 0},
            {label: '每天7:58提醒', value: 1},
            {label: '当监听到你今日发送了消息时，把日志发送给你', value: 2},
          ],
          placeholder: '提醒模式',
        },
      },{
        field: 'autoUpdate.cron',
        label: '自动更新cron',
        bottomHelpMessage: '插件定时cron表达式 默认表达式每日凌晨2点到4点之前某一刻请求。如果表达式有变更，将在你指定的时间点更新。',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入定时表达式',
        },
      }],

      getConfigData () {
        return setting.merge()
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData (data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        config = lodash.merge({}, setting.merge, config)
        setting.analysis(config)
        return Result.ok({}, '保存成功~')
      }
    }
  }
}
