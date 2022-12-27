import fetch from 'node-fetch'
export async function NameCardContent() {
  let res = await fetch('https://tenapi.cn/douyinresou/').catch((err) => logger.error(err))
  if (!res) { return false }
  res = await res.json()
  let result = res.list[0].name
  if (result.length<=8) result = '抖音热搜:' + result
  return result
}