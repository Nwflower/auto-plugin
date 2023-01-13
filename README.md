# 自动化插件Auto-plugin For Yunzai

Yunzai-Bot V3 的一个小型插件包，主要提供各式各样的定时任务功能和自动监听功能

### 前置安装注意

本插件有较多定时任务功能，如果没有以下技能，请立刻停止插件安装并关闭浏览器。

* 可能需要义务教育要求的阅读理解水平
* 可能需要义务教育要求的语文理解水平
* 需要认识26个字母并学会如何翻译它们
* 知道如何利用文本工具修改文件
* 有基础的代码辨识能力，比如什么是True，什么是False
* 对于Yunzai有一定的了解，有一定的错误排查能力

如果没有以上技能，十分不建议你安装该插件，因为本插件的目标用户不是你。

如果你有以上技能，以下内容经过你独立浏览后，不应该再出现疑问，否则说明你以上技能掌握不到位。

### 使用说明

本插件为[云崽Yunzai-bot](https://gitee.com/Le-niao/Yunzai-Bot)的辅助插件

想要获取该插件，请在Yunzai根目录下运行以下代码

使用github方式获取

> git clone --depth=1 https://github.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/

如果运行失败，可以使用gitee源
> git clone --depth=1 https://gitee.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/

### 功能列表

除非特殊说明，否则该功能默认开启。

| 命令               | 说明                                                         |
| :----------------- | :----------------------------------------------------------- |
| 自动更新签名       | 通过获取一言接口改变签名。启用时请注意：由于oicq框架限制会同步发说说，第一次使用请手机登录QQ发一条签名，并手动勾选：不同步到说说。默认关闭。 |
| 插件全部自动更新   | 在凌晨2-4点之间某一刻自动更新全部插件并重启。保存日志到当日8点再发送。 |
| 恶意at自动踢群     | 非管理员如果一次at人数大于10，且超过群人数的80%就直接t掉。   |
| 群名片小尾巴       | FLOWER-PLUGIN的内存更新群名片上位功能，支持多种小尾巴展示和多样化自定义。默认关闭。 |
| 自动更新米游社攻略 | 每周六凌晨4-6点之间某一刻更新米游社攻略图，也可以手动更新。命令:更新全部攻略、更新全部攻略2 |

### 群名片小尾巴模块列表

|            文件名 |   功能名称   | 示例后缀                      |
| ----------------: | :----------: | ----------------------------- |
| GenshinVersionDay |  原神倒计时  | 离原神3.4还有25天1小时17分钟  |
|          hitokoto |     一言     | 持道而修，不可议其。          |
|     MemoryPercent |   内存占用   | 当前系统活力81.08%            |
|      MonthMassage |   月消息数   | 本月已发送30000条消息         |
|        SystemTime |   北京时间   | 现在是北京时间09:41           |
|           OldTime | 长安十二时辰 | 现在是长安午正三刻            |
|         HotSearch | 微博热搜第一 | 热搜第一：阿根廷              |
|           B站热搜 | B站热搜第一  | 委员建议禁放烟花改为限时燃放  |
|          知乎热搜 | 知乎热搜第一 | 2023经济会不会爆发式反弹?     |
|          百度热搜 | 百度热搜第一 | 上海某小区XXXX?官方辟谣!<br / |
|          抖音热搜 | 抖音热搜第一 | 白肺的一个明显表现是气紧      |
|       userSuffix | 用户自定义尾巴 | 真名，肚饿真君              |

模块路径：auto-plugin\model\autoGroupName，可以根据11个示例自行开发新模块。

切换口令：#切换名片样式、#切换名片样式1,3,5 #切换名片前缀\<your nickname\> #切换名片自定义后缀\<your userSuffix\>

### 常见问题

Q：为什么我的机器人不更新群名片？

A：你可能没有开启更新开关。该功能默认关闭，运行一遍插件后，请找到配置文件Yunzai-Bot\plugins\auto-plugin\config\autoGroupName.yaml，然后将第一项配置改为true。后续会出通过口令更改开关的功能。

Q：为什么自动更新总安排在时间段的某一刻?我想改成其他的定时定点行不行?

A：之所以设置随机更新是考虑到如果定点更新，所有装了自动化插件的默认配置用户将会在同一时刻向服务器发送请求，可能导致一些难以预料的后果，故设置为随机时间段更新。

Q：为什么我更新完后攻略更旧了？

A：自动更新攻略不是直接获取最新攻略，其作用和'更新XX攻略'作用一样，只不过是批量处理全部角色而已。因此不能保证获取的一定就是最新攻略。

### 配置项

| 配置项           | 修改路径                                                     |
| :--------------- | :----------------------------------------------------------- |
| 自动更新签名频率 | 插件目录下config文件夹autosign.yaml，请自行修改cron表达式    |
| 群名片小尾巴参数 | 插件目录下config文件夹autoGroupName.yaml，请自行修改。建议同时关闭抽卡插件的同类功能。 |

### 其他

##### Nwflower插件全家桶

| 插件名                | 插件地址                                                  |
| --------------------- | --------------------------------------------------------- |
| 抽卡插件Flower-plugin | [flower-plugin](https://gitee.com/Nwflower/flower-plugin) |
| Atlas原神图鉴         | [Atlas](https://gitee.com/Nwflower/atlas)                 |
| 自动化插件auto-plugin | [auto-plugin](https://gitee.com/Nwflower/auto-plugin)     |

##### 友情链接

* Yunzai-Bot插件库：[☞Github](https://github.com/yhArcadia/Yunzai-Bot-plugins-index)/[☞Gitee](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index)
* Yunzai-Bot（V3）：[☞Github](https://github.com/Le-niao/Yunzai-Bot)/[☞Gitee](https://gitee.com/Le-niao/Yunzai-Bot) 
* 最后再求个star，你的支持是维护本项目的动力~~
* 严禁用于任何商业用途和非法行为
