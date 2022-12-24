import fetch from 'node-fetch'
/*
 * 名片更新模块示例：一言
 */

export async function NameCardContent() {
  let res = await fetch('https://v1.hitokoto.cn/').catch((err) => logger.error(err))
  if (!res) { return false }
  res = await res.json()
  return res.hitokoto
}