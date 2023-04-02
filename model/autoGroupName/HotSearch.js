import fetch from 'node-fetch'
/*
 * 名片更新模块示例：微博热搜榜1
 */

export async function NameCardContent() {
  let res = await fetch('https://tenapi.cn/v2/weibohot').catch((err) => logger.error(err))
  if (!res) { return false }
  res = await res.json()
  let result = res.data
  let hot1 = result[0].name
  if (hot1.length<=8) hot1 = '微博热搜:' + hot1
  return hot1
}