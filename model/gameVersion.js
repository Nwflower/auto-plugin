import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { pluginRoot } from './path.js'

/*
 * 米哈游 / 鹰角游戏版本倒计时（联网校准 + 本地推算）
 *
 * 数据来源：各游戏官方的游戏内公告接口。
 *   - 「版本更新说明」公告正文里的维护时间 → 当前版本的开服时间（锚点）
 *   - 「版本更新维护预告」公告（换版本前几天才有）→ 下一版本的确切开服时间
 *   - 没有预告时：下一版本 = 锚点 + 版本间隔（米哈游 42 天，终末地约 50 天）
 * 校准策略：每 6 小时联网一次，成功后写入 data/gameVersion/<game>.json；
 *          失败只记日志并 30 分钟后重试，期间用缓存/内置锚点继续推算，因此不会出现 NaN。
 */

const DAY = 24 * 3600 * 1000
const HOUR = 3600 * 1000
const CYCLE = 42 * DAY
const REFRESH_OK = 6 * HOUR
const REFRESH_FAIL = 30 * 60 * 1000
const FETCH_TIMEOUT = 10 * 1000
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const cacheDir = path.join(pluginRoot, 'data', 'gameVersion')

// release 为版本开服时间，内置值仅在从未联网成功时兜底
const GAMES = {
  genshin: {
    label: '原神',
    kind: 'mihoyo',
    api: 'https://hk4e-ann-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnContent',
    query: 'game=hk4e&game_biz=hk4e_cn&lang=zh-cn&bundle_id=hk4e_cn&platform=pc&region=cn_gf01&level=60&uid=100000000&channel_id=1',
    builtin: { version: '7.1', release: Date.parse('2026-09-23T11:00:00+08:00') }
  },
  starrail: {
    label: '崩铁',
    kind: 'mihoyo',
    api: 'https://hkrpg-ann-api.mihoyo.com/common/hkrpg_cn/announcement/api/getAnnContent',
    query: 'game=hkrpg&game_biz=hkrpg_cn&lang=zh-cn&bundle_id=hkrpg_cn&platform=pc&region=prod_gf_cn&level=60&uid=100000000&channel_id=1',
    builtin: { version: '4.6', release: Date.parse('2026-09-28T11:00:00+08:00') }
  },
  zzz: {
    label: '绝区零',
    kind: 'mihoyo',
    api: 'https://announcement-api.mihoyo.com/common/nap_cn/announcement/api/getAnnContent',
    query: 'game=nap&game_biz=nap_cn&lang=zh-cn&bundle_id=nap_cn&platform=pc&region=prod_gf_cn&level=60&uid=100000000&channel_id=1',
    builtin: { version: '3.2', release: Date.parse('2026-09-09T11:00:00+08:00') }
  },
  // 鸣潮（库洛）：公告接口一次返回 game / activity / recommend 三组，版本说明标题形如「xxx」3.7版本内容说明
  ww: {
    label: '鸣潮',
    kind: 'ww',
    api: 'https://aki-gm-resources-back.aki-game.com/gamenotice/G152/76402e5b20be2c39f095a152090afddc/zh-Hans.json',
    builtin: { version: '3.7', release: Date.parse('2026-09-30T11:00:00+08:00') }
  },
  // 终末地（鹰角）：公告标题只有版本名（如「雪凇幽梦」），版本数字取自启动器接口；版本间隔约 49~51 天。
  // 开服时间取公告里维护窗口的结束时间（1.5 为 2026/09/02 06:00 - 12:00）
  endfield: {
    label: '终末地',
    kind: 'endfield',
    cycle: 50 * DAY,
    api: 'https://game-hub.hypergryph.com/bulletin/v2/aggregate',
    code: 'endfield_5SD9TN', // 公告页写死的 code，失效时自动从网页重新抓取
    webview: 'https://ef-webview.hypergryph.com/page/game_bulletin?target=IOS',
    launcher: 'https://launcher.hypergryph.com/api/game/get_latest?appcode=6LL0KJuqHBVz33WK&channel=1&sub_channel=1&source=game&launcher_appcode=abYeZZ16BPluCFyT',
    builtin: { version: '1.5', release: Date.parse('2026-09-02T12:00:00+08:00') }
  }
}

const strip = s => String(s ?? '').replace(/<[^>]+>/g, '')
const unescapeHtml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')

// x.0 ~ x.8 共 9 个版本，x.8 之后进位到 (x+1).0
function nextVersion (version, steps = 1) {
  let [major, minor] = version.split('.').map(Number)
  minor += steps
  major += Math.floor(minor / 9)
  minor %= 9
  return `${major}.${minor}`
}

function readCache (key) {
  try {
    let data = JSON.parse(fs.readFileSync(path.join(cacheDir, `${key}.json`), 'utf8'))
    if (/^\d+\.\d+$/.test(data.version) && Number.isFinite(data.release)) return data
  } catch (err) { /* 无缓存或损坏，忽略 */ }
  return null
}

function writeCache (key, data) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(path.join(cacheDir, `${key}.json`), JSON.stringify(data, null, 2))
  } catch (err) {
    logger?.error?.(`[gameVersion] 写入缓存失败：${err.message}`)
  }
}

const cmpVer = (a, b) => { let [a1, a2] = a.split('.').map(Number); let [b1, b2] = b.split('.').map(Number); return a1 - b1 || a2 - b2 }

const DT = String.raw`(\d{4})[\/.\-年](\d{1,2})[\/.\-月](\d{1,2})日?\s*(\d{1,2}):(\d{2})`
const toMs = (y, mo, d, h, mi) => Date.parse(`${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${mi}:00+08:00`)

// 从公告正文取维护结束时间（即开服时间）：优先「开始 - 结束」区间的结束时间，
// 其次「xx 开始，预计 N 小时」（米哈游写法，缺省按 5 小时）
function parseMaintenanceEnd (text, kind) {
  let range = text.match(new RegExp(`(?:更新(?:维护)?(?:开始)?时间|维护时间)[^\\d]{0,80}${DT}\\s*(?:-|~|～|至|到|—|–)\\s*${DT}`))
  if (range) return toMs(...range.slice(6, 11))
  if (kind !== 'mihoyo') return null

  let start = text.match(new RegExp(`(?:更新(?:维护)?(?:开始)?时间)[〓】\\]\\s:：]*${DT}`))
  if (!start) return null
  let hours = Number(text.slice(start.index).match(/预计\s*(\d+(?:\.\d+)?)\s*个?小时/)?.[1] ?? 5)
  return toMs(...start.slice(1, 6)) + hours * HOUR
}

// 官方常在新版本上线前几天发「x.x版本前瞻/预告」，标题里带下一版本号；
// 取所有标题里「x.x版本」中比当前大且相邻（不超过 +2 个小版本）的最小者，用来替代进位猜测
function findAnnouncedVersion (items, current) {
  let hit = null
  for (let it of items) {
    for (let m of it.head.matchAll(/(\d+\.\d+)版本/g)) {
      let v = m[1]
      if (cmpVer(v, current) <= 0) continue
      if (cmpVer(v, nextVersion(current, 3)) >= 0) continue
      if (!hit || cmpVer(v, hit) < 0) hit = v
    }
  }
  return hit
}

// 统一成 { head: 标题+副标题, body: 去标签后的正文 }
function normalizeItems (game, list) {
  return list.map(a => game.kind === 'ww'
    ? { head: strip(a.tabTitle).replace(/\s+/g, ' '), body: strip(unescapeHtml(strip(a.content))).replace(/\s+/g, ' ') }
    : game.kind === 'endfield'
    ? { head: strip(`${a.header ?? ''} ${a.title ?? ''}`), body: strip(unescapeHtml(strip(a.data?.html))).replace(/\s+/g, ' ') }
    : { head: strip(`${a.title} ${a.subtitle ?? ''}`), body: strip(unescapeHtml(strip(a.content))).replace(/\s+/g, ' ') })
}

/**
 * 从公告里找出：
 *   current  已开服的最新「版本更新说明」→ { version?, release }
 *   preview  尚未开服的「版本更新维护预告」→ { release }
 */
function parseAnnouncements (game, items, now) {
  let current = null
  let preview = null
  for (let it of items) {
    let isPreview = /版本更新(?:维护)?预告|维护预告/.test(it.head)
    let ver = game.kind === 'endfield'
      ? (/版本更新说明/.test(it.head) ? [] : null)
      : game.kind === 'ww'
        ? it.head.match(/(\d+\.\d+)版本(?:内容说明|更新说明|更新公告)/)
        : it.head.match(/(\d+\.\d+)版本[^\n]*?(?:更新说明|更新公告)/)
    if (!isPreview && (!ver || /预告|前瞻/.test(it.head))) continue

    let release = parseMaintenanceEnd(it.body, game.kind)
    if (!Number.isFinite(release)) continue

    if (isPreview) {
      // 预告：必须在未来 60 天内才可信，取最近的一条
      if (release > now && release < now + 60 * DAY && (!preview || release < preview.release)) preview = { release }
    } else if (release <= now + HOUR && release >= now - 120 * DAY) {
      // 已开服（至多提前 1 小时）且不早于 120 天前，取最新的一条
      if (!current || release > current.release) current = { version: ver[1], release }
    }
  }
  return { current, preview }
}

const inflight = new Map()

async function fetchJson (url) {
  let controller = new AbortController()
  let timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    let res = await fetch(url, { signal: controller.signal, headers: { 'user-agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// 从公告网页里重新抓取终末地公告 code（失效时的兜底）
async function discoverEndfieldCode (game) {
  let controller = new AbortController()
  let timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    let get = async u => (await fetch(u, { signal: controller.signal, headers: { 'user-agent': UA } })).text()
    let html = await get(game.webview)
    let js = html.match(/<script[^>]+src="([^"]+\/commons\.[^"]+\.js)"/i)?.[1]
    if (!js) return null
    let code = await get(js)
    return code.match(/"code","(endfield_[A-Za-z0-9]+)"/)?.[1] ?? null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchEndfieldList (game) {
  let load = async code => {
    let json = await fetchJson(`${game.api}?type=0&code=${code}&hideDetail=0`)
    let list = json?.data?.list
    if (json?.code !== 0 || !Array.isArray(list) || !list.length) throw new Error(`公告接口异常 code=${json?.code} ${json?.msg ?? ''}`)
    return list
  }
  try {
    return await load(game.code)
  } catch (err) {
    let code = await discoverEndfieldCode(game)
    if (!code || code === game.code) throw err
    let list = await load(code)
    game.code = code // 新 code 有效，本次运行内沿用
    return list
  }
}

// 返回 { current: { version?, release }, preview?: { release }, announced? }
async function refresh (key, cache) {
  let game = GAMES[key]
  let list
  if (game.kind === 'endfield') {
    list = await fetchEndfieldList(game)
  } else if (game.kind === 'ww') {
    let json = await fetchJson(game.api)
    list = [...(json?.game ?? []), ...(json?.activity ?? []), ...(json?.recommend ?? [])]
    if (!list.length) throw new Error('鸣潮公告接口返回为空')
  } else {
    let json = await fetchJson(`${game.api}?${game.query}`)
    if (json?.retcode !== 0) throw new Error(`retcode ${json?.retcode} ${json?.message}`)
    list = json.data?.list ?? []
  }

  let items = normalizeItems(game, list)
  let { current, preview } = parseAnnouncements(game, items, Date.now())
  if (!current) throw new Error('未找到版本更新说明公告')

  // 终末地公告里没有版本数字：出现新的版本说明时，用启动器的大版本号（比锚点新才采信）
  if (game.kind === 'endfield') {
    let base = cache ?? game.builtin
    if (current.release > base.release + HOUR) {
      let launcherVer = null
      try {
        let json = await fetchJson(game.launcher)
        launcherVer = String(json?.client_version ?? json?.version ?? '').match(/^(\d+\.\d+)/)?.[1] ?? null
      } catch (err) { /* 启动器不可达则按进位规律推算 */ }
      current.version = launcherVer && cmpVer(launcherVer, base.version) > 0 ? launcherVer : nextVersion(base.version)
    } else {
      current.version = base.version
    }
  }
  return { current, preview, announced: findAnnouncedVersion(items, current.version) }
}

// 把新抓到的数据并入缓存：锚点只前进不倒退
function merge (cache, found) {
  let base = cache ?? {}
  let advance = !cache || found.current.release > cache.release
  let data = advance
    ? { version: found.current.version, release: found.current.release }
    : { version: cache.version, release: cache.release }
  data.announced = found.announced ?? (advance ? undefined : base.announced)
  // 预告的确切开服时间：有新预告就更新；锚点前进后旧的预告作废
  data.nextRelease = found.preview?.release ?? (advance ? undefined : base.nextRelease)
  return data
}

async function calibrate (key) {
  let cache = readCache(key)
  let now = Date.now()
  if (cache && now - (cache.checkedAt ?? 0) < (cache.ok ? REFRESH_OK : REFRESH_FAIL)) return cache
  if (inflight.has(key)) return inflight.get(key)

  let task = (async () => {
    try {
      let found
      try {
        found = await refresh(key, cache)
      } catch (err) {
        found = await refresh(key, cache) // 官方接口偶发超时，立即重试一次
      }
      let data = { ...merge(cache, found), checkedAt: Date.now(), ok: true }
      writeCache(key, data)
      return data
    } catch (err) {
      logger?.error?.(`[gameVersion] ${GAMES[key].label}联网校准失败，沿用本地推算：${err.message}`)
      let base = cache ?? GAMES[key].builtin
      let data = { version: base.version, release: base.release, announced: base.announced, nextRelease: base.nextRelease, checkedAt: Date.now(), ok: false }
      writeCache(key, data)
      return data
    } finally {
      inflight.delete(key)
    }
  })()
  inflight.set(key, task)
  return task
}

/**
 * 生成倒计时文案，例如「离原神7.2还有34天18小时58分钟」
 * @param {'genshin'|'starrail'|'zzz'|'endfield'|'ww'} key
 */
export async function getVersionCountdown (key) {
  let game = GAMES[key]
  let anchor
  try {
    anchor = await calibrate(key)
  } catch (err) {
    anchor = game.builtin
  }

  let now = Date.now()
  // 预告里的开服时间已过：新版本已经上线，但缓存还没刷新，先把它当作新锚点
  if (anchor.nextRelease && now >= anchor.nextRelease) {
    let v = anchor.announced && cmpVer(anchor.announced, anchor.version) > 0 ? anchor.announced : nextVersion(anchor.version)
    anchor = { version: v, release: anchor.nextRelease }
  }

  // 锚点是「当前版本」的开服时间，往后每个版本间隔一档，找出下一个尚未开服的
  let cycle = game.cycle ?? CYCLE
  // 有未到期的预告时，以预告时间为准，固定是「下一档」（推算的周期可能比预告略短）
  let announcedNext = anchor.nextRelease > now
  let steps = announcedNext ? 1 : Math.max(1, Math.floor((now - anchor.release) / cycle) + 1)
  // 仅在「下一个版本」这一档使用公告里的版本号和确切开服时间，更远的版本仍按规律推算
  let version = (steps === 1 && anchor.announced && cmpVer(anchor.announced, anchor.version) > 0)
    ? anchor.announced
    : nextVersion(anchor.version, steps)
  let target = announcedNext ? anchor.nextRelease : anchor.release + steps * cycle
  let left = target - now

  let days = Math.floor(left / DAY)
  let hours = Math.floor((left % DAY) / HOUR)
  let minutes = Math.floor((left % HOUR) / (60 * 1000))
  return `离${game.label}${version}还有${days}天${hours}小时${minutes}分钟`
}
