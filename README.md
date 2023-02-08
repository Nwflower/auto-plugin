<img decoding="async" align=right src="resources/img/logo_auto.png" width="25%">

# 自动化插件Auto-plugin For Yunzai

Yunzai-Bot V3 的一个小型插件包，主要提供各式各样的定时任务功能和自动监听功能

### 前置安装提醒

本插件有较多定时任务功能，且多数不会向控制台输出执行日志，建议拥有以下技能：

* **<font color='#ef4517'>知道看完本文再提问</font>**
* 学会正常使用搜索引擎
* 知道如何利用工具修改文件
* 拥有义务教育阶段要求的知识水平
* 对于Yunzai有一定的了解，有基础的代码辨识能力

如果没有以上技能，请立刻停止插件安装并关闭浏览器。

如果你有以上技能，浏览以下内容后，不应再出现疑问。否则， 请咨询当地医院是否患有潜在脑疾。

### 安装方法

本插件为[云崽Yunzai-bot](https://gitee.com/Le-niao/Yunzai-Bot)的辅助插件

想要获取该插件，请在Yunzai根目录下运行以下代码

使用github方式获取

```
git clone --depth=1 https://github.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/
```

如果运行失败，可以使用gitee源
```
git clone --depth=1 https://gitee.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/
```

### 功能列表及使用说明

以下操作建议使用锅巴插件进行配置或者找到配置文件夹auto-plugin/config/下的对应yaml文件修改。

#### 自动更新个性签名及发说说（autoSign）

该功能默认关闭。启用后，将在设定的时间点自动发布签名和说说。

如果只需要发布签名，但不需要发布说说，请使用手机登录机器人QQ发一条个性签名，并手动勾选上：不同步到说说。后续将不会同步到空间。

签名频率可以在插件目录下config文件夹autosign.yaml修改，请自行修改cron表达式。其他配置类似，后文不再赘述。你也可以使用锅巴插件进行修改。

####  自动更新全部插件（autoUpdate）

该功能默认开启。开启后，在凌晨2-4点之间某一刻自动更新全部插件并重启。保存日志到当日8点再发送。也可以在配置中设置其他发送时间或者其他更新时刻。也可以发送`#自动更新日志`查看当日更新日志。

#### 群名片小尾巴（autoGroupName）

该功能默认开启。由旧版本内存更新群名片升级而来，支持多种小尾巴展示和多样化自定义。具体见后文：模块列表

#### 自动制裁群友召唤术（autoDelAt）

该功能默认开启。监测到非管理员如果一次at人数大于10，且超过群人数的80%就直接踢出群聊。有效制裁“群友召唤术”。

#### 自动撤回（autoRecallMsg）

该功能默认关闭。配置后，将对机器人发送的所有消息进行定时撤回

#### 自动更新米游社攻略（autoStrategy）

每周六凌晨4-6点之间某一刻更新默认米游社攻略图，也可以手动更新。命令:更新全部攻略、更新全部攻略2。

注意：自动更新攻略不是直接获取最新攻略，其作用和'更新XX攻略'作用一样，只不过是批量处理全部角色而已。因此不能保证获取的一定就是最新攻略。

#### 日志向群输出（autoSendLog）

该功能目前为测试功能。默认关闭。

这说明，开发者发布该功能的目的在于确认其能否按照预定计划工作，你可以使用，但也可能遇到一些bug。

使用方法：启用该功能后，将你和机器人拉一个单独的群聊，然后将这个群号填进配置“日志输出群号”，（生效需要重启），则机器人会将控制台的日志自动发送到该群。

日志会攒下来，偶尔性发送，方便你查阅。你也可以设置遇到报错日志立刻发送一次。

### 群名片小尾巴模块列表

|            文件名 |   功能名称   | 示例后缀                      |
| ----------------: | :----------: | ----------------------------- |
| GenshinVersionDay |  **原神倒计时**  | 离原神3.4还有25天1小时17分钟 |
|          hitokoto |     一言     | 持道而修，不可议其。          |
|     MemoryPercent |   内存占用   | 当前系统活力81.08%            |
|      MonthMassage |   月消息数   | 本月已发送30000条消息         |
|        SystemTime |   北京时间   | 现在是北京时间09:41           |
|           OldTime | 长安十二时辰 | 现在是长安午正三刻            |
|         HotSearch | 微博热搜第一 | 热搜第一：阿根廷              |
|           B站热搜 | B站热搜第一  | 委员建议禁放烟花改为限时燃放  |
|          知乎热搜 | 知乎热搜第一 | 2023经济会不会爆发式反弹?     |
|          百度热搜 | 百度热搜第一 | 上海某小区XXXX?官方辟谣! |
|          抖音热搜 | 抖音热搜第一 | 白肺的一个明显表现是气紧      |
|       userSuffix | 用户自定义尾巴 | 真名，肚饿真君              |

模块路径：auto-plugin\model\autoGroupName文件夹，可以根据12个示例自行开发新模块。

样式切换口令：

- [ ] #切换名片样式
- [ ] #切换名片样式1,3,5
- [ ] #切换名片前缀\<your nickname\>
- [ ] #切换名片自定义后缀\<your userSuffix\>

### 常见问题Q&A

Q：我是Linux服务器，有没有更方便修改配置yaml文件的方式？

A：有，请使用锅巴插件。

<font color='#ef4517'>Q：为什么我的机器人不更新群名片？</font>

**<font color='#0e735f'>A：你可能没有开启更新开关。该功能默认关闭，运行一遍插件后，请找到配置文件Yunzai-Bot\plugins\auto-plugin\config\autoGroupName.yaml，然后将第一项配置改为true。</font>**

Q：为什么我的机器人群名片配置样式不生效？

A：你可能安装了其他的同类功能，开发者Nwflower于2022.8发布了该插件的弱版本，包括较早版本的抽卡插件、js版的系统占用修改名片。其他插件如榴莲插件等也存在该功能，请确保你没有安装含有此功能的其他插件且没有开启对应开关。

Q：为什么自动更新总安排在时间段的某一刻?我想改成其他的定时定点行不行?

A：之所以设置随机更新是考虑到如果定点更新，所有装了自动化插件的默认配置用户将会在同一时刻向服务器发送请求，可能导致一些难以预料的后果，故设置为随机时间段更新。如需更改，请进入配置文件修改。

Q：配置完自动更新后如何查看更新日志？

A：发送`#自动更新日志`或者等待机器人按你配置的时间发送。

Q：还有其他疑问怎么办？

A：你可以[提出issue](https://github.com/Nwflower/auto-plugin/issues)或者对于新功能[发起PR](https://github.com/Nwflower/auto-plugin/pulls)。当然，你也可以使用QQ群组功能反馈。**点击加入[AUTO插件交流群](https://qm.qq.com/cgi-bin/qm/qr?k=XOTZhBWpv68F1sfsMIzKJpg28NBPKJgg&jump_from=webapi&authKey=/XagQoLiUhOi+t67MCkWOSRLlXe+ywVmrkCHdoD3CjwqNzAUYspTrqYklkwb3W0R)**。如果你想要获得开发者的手把手指导，请使用[爱发电](https://afdian.net/a/Nwflower)。

### 其他

##### Nwflower插件全家桶

| 插件名                | 插件地址                                                  |
| --------------------- | --------------------------------------------------------- |
| 抽卡插件Flower-plugin | [Flower-plugin](https://gitee.com/Nwflower/flower-plugin) |
| Atlas原神图鉴         | [Atlas](https://gitee.com/Nwflower/atlas)                 |
| 自动化插件auto-plugin | [Auto-plugin](https://gitee.com/Nwflower/auto-plugin)     |

##### 友情提示

* Yunzai-Bot插件库：[☞Github](https://github.com/yhArcadia/Yunzai-Bot-plugins-index)/[☞Gitee](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index)
* Yunzai-Bot（V3）：[☞Github](https://github.com/Le-niao/Yunzai-Bot)/[☞Gitee](https://gitee.com/Le-niao/Yunzai-Bot) 
* 如果你觉得本插件还行，不妨给个star或者[爱发电](https://afdian.net/a/Nwflower)，你的支持不会获得额外内容，但会提高本项目的更新积极性。
* 未成年人禁止打赏。
* 严禁用于任何商业的、非法的、违纪的、不当的、牟利性的行为
* 若你已经使用了该插件，则默认认同本说明中提及的格式条款，本说明随时更新且没有义务通知使用者。
