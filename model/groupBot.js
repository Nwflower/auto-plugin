/**
 * 解析某个群真正所属的 Bot。
 *
 * TRSS-Yunzai 支持多 Bot 同时在线，`Bot.uin` 是一个数组，其 `toJSON()` 会
 * **随机**返回其中一个 uin（见 TRSS-Yunzai lib/bot.js）。把 `Bot.uin` 直接当作
 * user_id 传给适配器，就会出现「拿 KOOK 的 uin 去操作 QQ 群」这类串台：
 *
 *   uin数组 = [<bot-uin>, "ko_<kook-bot-id>"]
 *   uin.toJSON = "ko_<kook-bot-id>"      ← 随机挑中
 *   gl.bot_id  = <bot-uin>           ← 该群实际所属
 *   → NapCat 返回 {"retcode":1400,"wording":"user_id: expected a positive integer"}
 *
 * 导致自动群名片在多 Bot 环境下 100% 失败。`Bot.gl` 的条目里带 `bot_id`，
 * 用它才能拿到该群自己的那个 Bot。
 *
 * Miao-Yunzai 只有单 Bot，`Bot.gl` 的条目没有 `bot_id`，也没有 `Bot.bots`，
 * 取值链会自然回落到 `Bot.uin` / `Bot.nickname`，行为与改动前完全一致。
 *
 * @param {string|number} groupID 群号
 * @returns {{ uin: string|number, nickname: string }}
 */
export function getGroupBot (groupID) {
  const botId = Bot.gl?.get?.(groupID)?.bot_id
  const bot = (botId !== undefined && Bot.bots?.[botId]) || null
  return {
    uin: botId !== undefined ? botId : Bot.uin,
    nickname: bot?.nickname || bot?.info?.nickname || Bot.nickname
  }
}

/**
 * 取一个**确定性**的 Bot 标识，用于 redis key、转发消息节点等不针对特定群的场景。
 *
 * 不能直接用 `Bot.uin`：TRSS-Yunzai 下它是数组，`toJSON()` 每次随机返回一个 uin，
 * 于是同一个 key 写进去和读出来可能对不上（`Yz:auto-plugin:Update:${Bot.uin}`
 * 就是写在 autoUpdate、读在 autoSendUpdateLog，多 Bot 时大概率互相错过），
 * 转发消息节点的头像昵称也会随机变成别的适配器。
 *
 * 这里优先取纯数字的 uin（QQ），否则取列表第一个；单 Bot 的 Miao-Yunzai 下
 * `Bot.uin` 不是数组，直接回落到它本身。
 *
 * @returns {{ uin: string|number, nickname: string }}
 */
export function getMainBot () {
  const list = Array.isArray(Bot.uin)
    ? Array.from(Bot.uin).filter(v => v !== undefined && v !== null && v !== '')
    : [Bot.uin]
  // 一个 Bot 都没在线时返回 undefined，调用方自行决定是否跳过
  const uin = list.find(v => /^\d+$/.test(String(v))) ?? list[0]
  const bot = (uin !== undefined && Bot.bots?.[uin]) || null
  return {
    uin,
    nickname: bot?.nickname || bot?.info?.nickname || Bot.nickname
  }
}

/**
 * 当前所有在线 Bot 的 uin 列表。单 Bot 环境返回 `[Bot.uin]`。
 * @returns {Array<string|number>}
 */
export function getAllBotUin () {
  if (!Array.isArray(Bot.uin)) return Bot.uin === undefined ? [] : [Bot.uin]
  return Array.from(Bot.uin).filter(v => v !== undefined && v !== null && v !== '')
}

/**
 * 消息事件场景下取发出这条消息的那个 Bot。转发消息节点的 `user_id` / `nickname`
 * 用它，展示出来的头像昵称才和实际发消息的 Bot 一致；没有事件上下文时回落到
 * {@link getMainBot}。
 *
 * @param {object} [e] 消息事件
 * @returns {{ uin: string|number, nickname: string }}
 */
export function getEventBot (e) {
  if (e?.self_id === undefined) return getMainBot()
  return {
    uin: e.self_id,
    nickname: e.bot?.nickname || e.bot?.info?.nickname || getMainBot().nickname
  }
}
