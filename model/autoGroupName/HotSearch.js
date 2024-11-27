import fetch from 'node-fetch'

/*
 * 名片更新模块示例：微博热搜榜1
 */

export async function NameCardContent() {
    let res = await fetch('https://newsnow.busiyi.world/api/s?id=weibo').catch((err) => logger.error(err))
    if (!res) {
        return false
    }
    res = await res.json()
    let item = res.items[0]
    if (item) {
        let result = res.items[0].title
        if (result.length <= 8) result = '微博热搜:' + result
        return result
    } else {
        return false
    }
}
