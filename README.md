# 自动化插件Auto-plugin For Yunzai

Yunzai-Bot V3 的一个小型插件包，主要提供各式各样的定时任务功能和自动监听功能

### 使用说明

本插件为[云崽Yunzai-bot](https://gitee.com/Le-niao/Yunzai-Bot)的辅助插件

想要获取该插件，请在Yunzai根目录下运行以下代码

使用github方式获取

> git clone --depth=1 https://github.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/

如果运行失败，可以使用gitee源
> git clone --depth=1 https://gitee.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/

### 功能列表

| 命令             | 说明                                                         |
| :--------------- | :----------------------------------------------------------- |
| 自动更新签名     | 默认关闭。通过获取一言接口改变签名。启用时请注意：由于oicq框架限制会同步发说说，第一次使用请手机登录QQ发一条签名，并手动勾选：不同步到说说。 |
| 插件全部自动更新 | 在凌晨2-4点之间某一刻自动更新全部插件并重启。                |
| 恶意at自动踢群   | 非管理员如果一次at人数大于10，且超过群人数的80%就直接t掉。   |
| 群名片小尾巴     | FLOWER-PLUGIN的内存更新群名片上位功能，支持多种小尾巴展示和多样化自定义。 |

### 群名片小尾巴模块列表

|            文件名 |   功能名称   | 示例后缀                     |
| ----------------: | :----------: | ---------------------------- |
| GenshinVersionDay |  原神倒计时  | 离原神3.4还有25天1小时17分钟 |
|          hitokoto |     一言     | 持道而修，不可议其。         |
|     MemoryPercent |   内存占用   | 当前系统活力81.08%           |
|      MonthMassage |   月消息数   | 本月已发送30000条消息        |
|        SystemTime |   北京时间   | 现在是北京时间09:41          |
|           OldTime | 长安十二时辰 | 现在是长安午正三刻           |
|         HotSearch | 微博热搜第一 | 热搜第一：阿根廷             |
|           More... |   更多模块   | 请你开发                     |

模块路径：auto-plugin\model\autoGroupName，可以根据七个示例自行开发新模块

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