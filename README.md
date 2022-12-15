# 自动化插件Auto-plugin

### 务必详细查看Readme！误操作造成的一切操作损失和插件作者无关
### 介绍
Yunzai-Bot V3 的插件包，主要提供各式各样的定时任务功能和自动监听功能

### 使用说明

本插件为[云崽bot](https://gitee.com/Le-niao/Yunzai-Bot)的辅助插件

想要获取该插件，请在云崽根目录下运行以下代码

使用github
> git clone --depth=1 https://github.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/

如果运行失败，可以使用gitee源
> git clone --depth=1 https://gitee.com/Nwflower/auto-plugin.git ./plugins/auto-plugin/

### 功能列表

|          命令 | 说明                                                         |
|------------:|:-----------------------------------------------------------|
|      自动更新签名 | 通过获取一言接口改变签名。如果发现会同步发说说，请手机登录QQ发一条签名，并手动勾选：不同步到说说。更新频率：5分钟 |
|    插件全部自动更新 | 在凌晨2-4点之间某一刻自动更新全部插件                                       |
|    恶意at自动踢群 | 监听到at全体成员的消息，如果此人不是管理员或者群主，就直接t掉这个人                        |

### 可修改配置项

|      配置项 | 修改路径                                     |
|---------:|:-----------------------------------------|
| 自动更新签名频率 | 插件目录下config文件夹autosign.yaml，请自行修改cron表达式 |

### 其他
- 最后再求个star，你的支持是维护本项目的动力~~
- 严禁用于任何商业用途和非法行为

[Yunzai-Bot插件索引](https://gitee.com/Hikari666/Yunzai-Bot-plugins-index) 