import fetch from 'node-fetch'

export async function NameCardContent() {
    let res = await fetch('https://newsnow.busiyi.world/api/s?id=baidu').catch((err) => logger.error(err))
    if (!res) {
        return false
    }
    res = await res.json()
    let item = res.items[0]
    if (item) {
        let result = item.title
        if (result.length <= 8) result = '百度热搜:' + result
        return result
    }
    return false
}
