import plugin from "../../../lib/plugins/plugin.js";
import PluginsLoader from "../../../lib/plugins/loader.js";
import schedule from "node-schedule";
import loader from "../../../lib/plugins/loader.js";
import setting from "../model/setting.js";

/**
 * created by AileYoung on 2024/11/20
 * 自动化插件_定时任务管理
 */
export class taskManage extends plugin {
    constructor() {
        super({
            name: "自动化插件_定时任务管理",
            dsc: "管理预设的任务",
            event: "message",
            priority: -1,
            rule: [
                {
                    reg: "^#批量启动任务$",
                    fnc: "startTaskBatch",
                    permission: "master"
                },
                {
                    reg: "^#单独启动任务",
                    fnc: "startTaskByName",
                    permission: "master"
                },
                {
                    reg: "^#删除任务[0-9]*$",
                    fnc: "deleteTask",
                    permission: "master"
                }
            ],
        });
    }

    // 获取配置
    get appConfig() {
        let configName = 'taskManage'
        let config = setting.getConfig(configName);
        this.reply(`读取配置文件失败，请确认[plugins/auto-plugin/def]中是否包含[${configName}.yaml]文件`);
        return config
    }

    async startTaskBatch() {
        if (!/^#批量启动任务/.test(this.e.msg)) return false;
        if (!this.e.isMaster) {
            return this.reply('你没有权限');
        }

        let config = this.appConfig
        if (!config) {
            return false;
        }
        let taskList = config.list

        let group_id = this.e.group_id ? this.e.group_id + '-' : ''
        for (let item of taskList) {
            if (item) {
                let task = item.task
                if (task.enable) {
                    let check = false
                    // 重复添加检查
                    for (let taskElement of loader.task) {
                        // 如果存在群号，以群号+任务名作为真正的任务名
                        if ((group_id + task.name) === taskElement.name) {
                            check = true
                            this.reply(`添加失败，任务表中已存在【task.name}】，请检查配置文件中task.name是否存在重复`);
                            break
                        }
                    }
                    if (check) {
                        continue
                    }
                    await this.setECronTask(this.e, task)
                    await Bot.sleep(1000)
                    this.reply(`已将任务【${task.name}】加入任务列表。关闭您的云崽、计算机或服务器后调用将立刻失效，您也可以使用自动化插件的【任务表】功能管理定时任务。`);
                }
            }
        }
    }

    async startTaskByName() {
        if (!/^#单独启动任务/.test(this.e.msg)) return false;
        if (!this.e.isMaster) {
            return this.reply('你没有权限');
        }

        let taskName = this.e.msg.toString().replace(/#单独启动任务/g, '').trim()

        let config = this.appConfig
        if (!config) {
            return false;
        }
        let taskList = config.list
        let group_id = this.e.group_id ? this.e.group_id + '-' : ''
        for (let item of taskList) {
            if (item) {
                let task = item.task
                if (task.enable && task.name === taskName) {
                    let check = false
                    // 重复添加检查
                    for (let taskElement of loader.task) {
                        // 如果存在群号，以群号+任务名作为真正的任务名
                        if ((group_id + task.name) === taskElement.name) {
                            check = true
                            this.reply(`添加失败，任务表中已存在【${group_id + task.name}】，请检查配置文件中task.name是否存在重复`);
                            break
                        }
                    }
                    if (check) {
                        continue
                    }
                    await this.setECronTask(this.e, task)
                    this.reply(`已将任务【${task.name}】加入任务列表。关闭您的云崽、计算机或服务器后调用将立刻失效，您也可以使用自动化插件的【任务表】功能管理定时任务。`);
                    return
                }
            }
        }
        this.reply(`添加失败，配置文件中无此任务【${taskName}】，或任务enable为false`);
    }


    async getE(text) {
        return {
            post_type: 'message',
            group_id: this.e.group_id,
            message_id: this.e.message_id,
            user_id: this.e.user_id,
            time: this.e.time,
            seq: this.e.seq,
            rand: this.e.rand,
            font: this.e.font,
            message_type: this.e.message_type,
            sub_type: this.e.sub_type,
            sender: this.e.sender,
            from_id: this.e.from_id,
            to_id: this.e.to_id,
            auto_reply: this.e.auto_reply,
            friend: this.e.friend,
            reply: this.e.reply,
            self_id: this.e.self_id,
            logText: '',
            isPrivate: this.e.isPrivate,
            isMaster: this.e.isMaster,
            replyNew: this.e.replyNew,
            runtime: this.e.runtime,
            user: this.e.user,
            Bot: this.e.Bot || global.Bot,

            message: [{type: 'text', text}],
            msg: '',
            original_msg: text,
            raw_message: text,
            toString: () => {
                return text
            }
        }
    }

    async setECronTask(e, task) {
        let command = task.command;
        let cron = task.cron;

        let func = async (a) => await this.getE(a)
        let job = schedule.scheduleJob(cron, async () => {
            await PluginsLoader.deal(await func(command))
        })
        loader.task.push({
            name: (e.group_id ? e.group_id + '-' : '') + task.name,
            cron,
            job: job
        })
    }

    async deleteTask() {
        let index = this.e.msg.toString().replace(/#删除任务/g, '').trim()
        let val = loader.task[Number(index)]
        val.job.cancel()
        loader.task.splice(index, 1);
        this.reply(`已删除定时任务【${val.name}】！（删除后任务表序号会发生改变，若要删除其他任务，请执行【#任务表】确认任务代号）`)
    }
}
