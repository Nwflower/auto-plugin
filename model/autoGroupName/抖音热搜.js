import fetch from 'node-fetch'

export async function NameCardContent() {
    let res = await fetch('https://newsnow.busiyi.world/api/s?id=douyin').catch((err) => logger.error(err))
    if (!res) {
        return false
    }
    res = await res.json()
    let item = res.items[0]
    if (item) {
        let result = res.items[0].title
        if (result.length <= 8) result = '抖音热搜:' + result
        return result
    } else {
        return false
    }
}

