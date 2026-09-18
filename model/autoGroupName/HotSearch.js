import fetch from 'node-fetch'

/*
 * 名片更新模块示例：微博热搜榜1
 */


export async function NameCardContent () {
  const url = 'https://newsnow.busiyi.world/api/s?id=weibo'
  let res
  try {
    res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'accept': 'application/json,text/plain,*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
      }
    })
  } catch (err) {
    logger?.error?.('[fetch] error:', err)
    return false
  }

  if (!res || !res.ok) {
    const body = await res.text().catch(() => '')
    logger?.error?.(`[fetch] HTTP ${res?.status} ${res?.statusText} — preview: ${body.slice(0, 200)}`)
    return false
  }

  const ct = (res.headers.get('content-type') || '').toLowerCase()
  try {
    if (ct.includes('application/json') || ct.includes('json')) {
      const data = await res.json()
      const item = data?.items?.[0]
      if (item?.title) {
        let result = item.title
        if (result.length <= 8) result = '微博热搜:' + result
        return result
      }
      return false
    } else {
      // 不是 JSON，打印前缀看看是不是 HTML/重定向页
      const text = await res.text()
      logger?.error?.(`[fetch] Non-JSON content-type: ${ct} — preview: ${text.slice(0, 200)}`)
      return false
    }
  } catch (err) {
    // JSON 解析失败，回落读取文本以便诊断
    const text = await res.text().catch(() => '')
    logger?.error?.('[fetch] JSON parse failed:', err, ' preview:', text.slice(0, 200))
    return false
  }
}
