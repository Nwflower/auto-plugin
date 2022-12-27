import fetch from 'node-fetch'
export async function NameCardContent() {
  let res = await fetch('https://tenapi.cn/zhihuresou/').catch((err) => logger.error(err))
  if (!res) { return false }
  res = await res.json()
  let result = res.list[0].query
  if (result.length<=8) result = '知乎热搜:' + result
  return result
}