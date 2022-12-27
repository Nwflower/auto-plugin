import fetch from 'node-fetch'
export async function NameCardContent() {
  let res = await fetch('https://tenapi.cn/bilihot/').catch((err) => logger.error(err))
  if (!res) { return false }
  res = await res.json()
  let result = res.list[0].showname
  if (result.length<=8) result = 'B站热搜:' + result
  return result
}