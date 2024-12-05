import plugin from "../../../lib/plugins/plugin.js";
import PluginsLoader from "../../../lib/plugins/loader.js";
import schedule from "node-schedule";
import setting from "../model/setting.js";
import cfg from '../../../lib/config/config.js'
import WebSocket from "ws";

/**
 * created by AileYoung on 2024/12/05
 * 自动化插件_自动启动webSocket任务
 */
export class autoWebSocketTask extends plugin {
    constructor() {
        super({
            name: "自动化插件_自动启动webSocket任务",
            dsc: "自动启动webSocket任务",
            event: "message",
            priority: 5000,
            rule: [],
        });
    }

    async init() {
        // 延迟半分钟启动，确保yunzai已连接到协议端，可根据自己实际情况调整（如果你的yunzai半分钟内都无法启动，可以延长这里的延迟时间）
        setTimeout(() => {
            this.startWSTaskBatch()
        }, 30 * 1000)
    }

    // 获取配置
    get appConfig() {
        return setting.getConfig('taskManage')
    }

    async startWSTaskBatch() {
        let config = this.appConfig
        if (!config) {
            return false;
        }
        // 必输项检查
        if (!config.openWS || !config.ws) {
            return false;
        }
        let taskList = config.list
        let logArray = []
        for (let item of taskList) {
            if (item) {
                let task = item.task
                if (task.enable && task.group) {
                    let check = false
                    let group_id = task.group
                    // 重复添加检查
                    for (let taskElement of PluginsLoader.task) {
                        // 以“群号-任务名”作为真正的任务名
                        if ((group_id + '-' + task.name) === taskElement.name) {
                            check = true
                            logArray.push(`[自动化插件]添加失败，任务表中已存在【${taskElement.name}】，请检查配置文件中task.name是否存在重复`)
                            break
                        }
                    }
                    if (check) {
                        continue
                    }
                    await this.setECronTask(task, group_id, config)
                    logArray.push(`[自动化插件]已将任务【${group_id + '-' + task.name}】加入任务列表，您也可以使用自动化插件的【任务表】功能管理定时任务。`)
                    await Bot.sleep(1000)
                }
            }
        }
        // 向主人发送任务启动日志，受上线推送通知的冷却时间影响
        if (logArray.length > 0) {
            if (!cfg.bot.online_msg_exp) {
                return
            }
            const key = `Yz:loginMsg:${Bot.uin}`
            if (await redis.get(key)) {
                return
            }
            let massage = []
            for (let msg of logArray) {
                massage.push({
                    message: msg,
                    nickname: Bot.nickname,
                    user_id: Bot.uin
                })
            }
            let forwardMsg = await Bot.makeForwardMsg(massage);
            await Bot.sendMasterMsg(forwardMsg)
        }
    }


    async setECronTask(task, group_id, config) {
        let command = task.command;
        let cron = task.cron;

        // 模拟主人发送一条消息
        let msg = {
            self_id: Bot.uin,
            user_id: cfg.masterQQ[0],
            group_id: group_id,
            time: new Date().getTime() / 1000,
            message_type: 'group',
            sender: {user_id: cfg.masterQQ[0], nickname: 'master', card: 'master', role: 'owner'},
            sub_type: 'normal',
            post_type: 'message',
            message: command,
            raw_message: command,
        }

        let job = schedule.scheduleJob(cron, async () => {
            await this.openWSAndSend(config.ws, group_id, JSON.stringify(msg))
        })
        PluginsLoader.task.push({
            name: group_id + '-' + task.name,
            cron,
            job: job
        })
    }

    async openWSAndSend(wsUrl, group, msg) {
        try {
            let ws = new WebSocket(wsUrl);

            const config = cfg.getGroup(cfg.masterQQ[0], group)
            /* 受指令操作冷却时间（可在yunzai/config/config/group.yaml中设置），可能存在主人刚刚发送完指令就触发本方法，导致指令处理受限，
             * 故等待最大冷却CD+10毫秒后再进行此次命令
             */
            let sleep = (config.groupCD > config.singleCD ? config.groupCD : config.singleCD) + 10;
            await Bot.sleep(sleep);
            logger.info("模拟向群[" + group + "]发送消息：\n" + msg)
            ws.send(msg);

            /* WebSocket连接yunzai后，此时yunzai会认为是有新Bot上线，会等待新Bot进行连接，默认300秒，如果300秒后不断开连接，
             * yunzai会报错“Bot上线超时”，因此每次开启ws发送消息后都会及时关闭。同样因为这个原因，ws无法复用。最开始的想法是创建
             * 一个全局的WebSocket连接，要发送模拟消息的时候就拿过来发，但是控制台会报错“Bot上线超时”，所以还是采用随用随关的方式
             */
            ws.close();

            // 当连接成功时触发
            ws.on('open', () => {
                logger.info('创建新的WebSocket连接成功');
            });
            // 当连接关闭时触发
            ws.on('close', () => {
                logger.info('新的WebSocket连接已关闭');
            });
            // 处理错误
            ws.on('error', function error(err) {
                logger.error('新的WebSocket客户端出错:');
                logger.error(err);
            });
            return Promise.resolve(true)
        } catch (e) {
            logger.error(e)
            return Promise.reject(false);
        }

    }
}
