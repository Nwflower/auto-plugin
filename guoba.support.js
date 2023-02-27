import setting from "./model/setting.js";
import lodash from "lodash";
import { pluginResources } from "./model/path.js";
import path from 'path'

// 支持锅巴
export function supportGuoba () {

  let allGroup = [];
  Bot.gl.forEach((v, k) => { allGroup.push({label: `${v.group_name}(${k})`, value: k}); });

  return {
    pluginInfo: {
      name: 'auto-plugin',
      title: '自动化插件',
      author: '@听语惊花',
      authorLink: 'https://github.com/Nwflower',
      link: 'https://github.com/Nwflower/auto-plugin',
      isV3: true,
      isV2: false,
      description: '可能是史上最强大的群名片更新插件。另外还提供了一些自动化小功能。',
      icon: 'iconoir:3d-three-pts-box',
      iconColor: '#f4c436',
      iconPath: path.join(pluginResources, 'img/logo_auto.png'),
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
        field: 'autoRecallMsg.enable',
        label: '自动全局撤回',
        bottomHelpMessage: '是否启用该功能',
        component: 'Switch'
      },{
        field: 'autoSendLog.enable',
        label: '日志向群输出',
        bottomHelpMessage: '请先阅读使用帮助，再谨慎开启该功能！',
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
        field: 'autoGroupName.mode',
        label: '群名片更新模式',
        bottomHelpMessage: '群名片更新模式选择',
        component: 'Select',
        componentProps: {
          options: [
            {label: '一次性改所有配置的群', value: 0},
            {label: '每次执行时改一个群，直到改完所有群(后缀一致）', value: 1},
            {label: '每次执行时都调取后缀，并改一个群，直到改完所有群（这可能会被API提供商制裁）', value: 2},
          ],
          placeholder: '自动撤回模式选择',
        },
      },{
        field: 'autoGroupName.nickname',
        label: '群名片前缀',
        bottomHelpMessage: '可以留空，默认为昵称',
        component: 'Input',
        required: false,
        componentProps: {
          placeholder: '请输入群名片前缀',
        },
      },{
        field: 'autoGroupName.userSuffix',
        label: '自定义后缀',
        bottomHelpMessage: '',
        component: 'Input',
        required: false,
        componentProps: {
          placeholder: '请输入群名片后缀',
        },
      },{
        field: 'autoGroupName.memoriesTick',
        label: '内存占用字样',
        bottomHelpMessage: '系统活力',
        component: 'Input',
        required: false,
        componentProps: {
          placeholder: '请输入你想显示的内存占用字样',
        },
      },{
        field: 'autoGroupName.notGroup',
        label: '群名片更新黑名单',
        bottomHelpMessage: '不需要更新的群',
        component: 'Select',
        componentProps: {
          allowAdd: true,
          allowDel: true,
          mode: 'multiple',
          options: allGroup,
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
      },{
        field: 'autoRecallMsg.time',
        label: '自动全局撤回时间',
        bottomHelpMessage: '全局撤回的时间，单位为秒',
        component: 'InputNumber',
        required: true,
        componentProps: {
          min: 0,
          max: 1000,
          placeholder: '请输入时间'
        }
      },{
        field: 'autoRecallMsg.mode',
        label: '自动撤回模式',
        bottomHelpMessage: '自动撤回模式选择',
        component: 'Select',
        componentProps: {
          options: [
            {label: '正常模式：全局撤回', value: 0},
            {label: '白名单模式：仅配置群撤回', value: 1},
            {label: '黑名单模式：配置群不撤回', value: 2},
          ],
          placeholder: '自动撤回模式选择',
        },
      },{
        field: 'autoRecallMsg.group',
        label: '自动撤回配置群',
        bottomHelpMessage: '当自动撤回模式为白名单模式或者黑名单模式时才会生效',
        component: 'Select',
        componentProps: {
          allowAdd: true,
          allowDel: true,
          mode: 'multiple',
          options: allGroup,
        },
      },{
        field: 'autoSendLog.logGroup',
        label: '日志输出群号',
        bottomHelpMessage: '请先阅读使用帮助，再谨慎开启该功能！',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入群号，只能输入一个',
        },
      },{
        field: 'autoSendLog.level',
        label: '日志输出等级',
        bottomHelpMessage: '日志输出等级 trace - 1, debug - 2, info - 3, warn - 4, fatal - 5, mark - 6, error - 7\n输出等级越低，输出日志越多，默认为3',
        component: 'InputNumber',
        required: true,
        componentProps: {
          min: 1,
          max: 8,
          placeholder: '请输入等级'
        }
      },{
        field: 'autoSendLog.errorProtect',
        label: '日志异常预警',
        bottomHelpMessage: '遇到error日志立即尝试输出一次',
        component: 'Switch'
      },{
        field: 'autoSendLog.singleLength',
        label: '单条消息日志长度',
        bottomHelpMessage: '太长会被风控 建议默认',
        component: 'InputNumber',
        required: true,
        componentProps: {
          min: 1,
          max: 25,
          placeholder: '请输入长度'
        }
      },{
        field: 'autoSendLog.massageLength',
        label: '单次发送消息数',
        bottomHelpMessage: '太长懒得翻 太短发送太频繁会被风控 建议默认 为1时不使用转发消息',
        component: 'InputNumber',
        required: true,
        componentProps: {
          min: 1,
          max: 99,
          placeholder: '请输入消息数'
        }
      },],
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
