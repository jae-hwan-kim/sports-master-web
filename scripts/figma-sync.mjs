#!/usr/bin/env node
// Figma ↔ 코드 동기화용 결정론적 변경 감지 스크립트 (/figma-sync 스킬이 호출)
//
// 사용: pnpm figma:sync <command> [...]
//   pages  <fileUrl>                         파일의 page 목록 출력
//   init   <fileUrl> --pages <id,id>         registry 생성 + 화면 자동 매칭 + 전체 baseline 스냅샷
//   diff                                     변경/신규/삭제 프레임 + 미처리 댓글 → .pending.json
//   commit <nodeId...|--all>                 승인·적용된 변경 프레임의 스냅샷을 pending 기준으로 갱신
//   link   <nodeId> <ScreenName|--ignore>    프레임↔화면 매핑 등록/수정 + baseline 스냅샷 (신규·미매칭 프레임)
//   unlink <nodeId>                          registry 에서 프레임 제거 (Figma 에서 삭제된 프레임)
//   reply  <commentId> <message>             Figma 댓글에 답글 + 처리 완료로 기록
//   ack    <commentId...>                    Figma 에 쓰지 않고 처리 완료로만 기록 (Q&A·진행 공지 등 코드 무관 댓글)
//   url    <nodeId>                          MCP get_design_context용 Figma 노드 URL 출력
//
// 환경변수: FIGMA_TOKEN (scope: file_content:read, file_comments:read, file_comments:write)

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, '.claude/figma')
const REGISTRY = join(DIR, 'registry.json')
const PENDING = join(DIR, '.pending.json')
const SNAP_DIR = join(DIR, 'snapshots')
const SCREENS_DIR = join(ROOT, 'src/screens')
const API = 'https://api.figma.com/v1'

// ─── IO ─────────────────────────────────────────────────────────────────────

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const writeJson = (p, v) => {
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(v, null, 2) + '\n')
}
const snapPath = (id) => join(SNAP_DIR, `${id.replace(/[:;]/g, '-')}.json`)
const hash = (v) => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 12)
const die = (msg) => {
  console.error(`✖ ${msg}`)
  process.exit(1)
}

async function figma(path, init = {}) {
  const token = process.env.FIGMA_TOKEN
  if (!token) die('FIGMA_TOKEN 이 없습니다. sports-master-web/.env 에 설정하세요.')
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json', ...init.headers },
  })
  if (!res.ok) die(`Figma API ${res.status} ${path}: ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

function parseFileKey(url) {
  const m = url.match(/figma\.com\/(?:design|file|proto)\/([A-Za-z0-9]+)/)
  if (!m) die(`Figma 파일 URL 형식이 아닙니다: ${url}`)
  return m[1]
}

// ─── 노드 정규화 ─────────────────────────────────────────────────────────────
// 코드에 영향이 있는 시각 속성만 남기고, 좌표는 화면 원점 기준 상대값으로 변환

const r = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n)
const hex = ({ r: R, g, b }) =>
  '#' + [R, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase()

function paint(p) {
  if (p.visible === false) return null
  const out = { type: p.type }
  if (p.color) out.color = hex(p.color)
  const a = (p.opacity ?? 1) * (p.color?.a ?? 1)
  if (a !== 1) out.opacity = r(a)
  if (p.gradientStops) out.stops = p.gradientStops.map((s) => `${hex(s.color)}@${r(s.position)}`)
  if (p.imageRef) out.image = true
  return out
}

function effect(e) {
  if (e.visible === false) return null
  return {
    type: e.type,
    color: e.color && hex(e.color),
    opacity: e.color && r(e.color.a),
    offset: e.offset && [r(e.offset.x), r(e.offset.y)],
    radius: r(e.radius),
    spread: e.spread ? r(e.spread) : undefined,
  }
}

const TEXT_STYLE = ['fontFamily', 'fontWeight', 'fontSize', 'lineHeightPx', 'letterSpacing', 'textAlignHorizontal']
const LAYOUT = [
  'layoutMode', 'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
  'primaryAxisAlignItems', 'counterAxisAlignItems', 'layoutSizingHorizontal', 'layoutSizingVertical',
]

function normalize(node, origin) {
  if (node.visible === false) return null
  const box = node.absoluteBoundingBox
  const o = origin ?? box ?? { x: 0, y: 0 }
  const n = { id: node.id, name: node.name, type: node.type }
  if (box) n.box = [r(box.x - o.x), r(box.y - o.y), r(box.width), r(box.height)]
  const fills = node.fills?.map(paint).filter(Boolean)
  if (fills?.length) n.fills = fills
  const strokes = node.strokes?.map(paint).filter(Boolean)
  if (strokes?.length) {
    n.strokes = strokes
    n.strokeWeight = r(node.strokeWeight)
  }
  if (node.cornerRadius) n.radius = r(node.cornerRadius)
  if (node.rectangleCornerRadii) n.radius = node.rectangleCornerRadii.map(r)
  const effects = node.effects?.map(effect).filter(Boolean)
  if (effects?.length) n.effects = effects
  if (node.opacity !== undefined && node.opacity !== 1) n.opacity = r(node.opacity)
  if (node.characters !== undefined) n.text = node.characters
  if (node.style) for (const k of TEXT_STYLE) if (node.style[k] !== undefined) n[k] = r(node.style[k])
  for (const k of LAYOUT) if (node[k] !== undefined && node[k] !== 0) n[k] = node[k]
  if (node.componentId) n.componentId = node.componentId
  const kids = node.children?.map((c) => normalize(c, o)).filter(Boolean)
  if (kids?.length) n.children = kids
  return n
}

// ─── 트리 diff ──────────────────────────────────────────────────────────────

function flatten(node, path = '', out = new Map()) {
  const p = path ? `${path} / ${node.name}` : node.name
  const { children, ...props } = node
  out.set(node.id, { path: p, props })
  children?.forEach((c) => flatten(c, p, out))
  return out
}

function diffTree(before, after) {
  const a = flatten(before)
  const b = flatten(after)
  const changes = []
  for (const [id, { path, props }] of b) {
    const prev = a.get(id)
    if (!prev) {
      changes.push({ kind: 'added', id, path, props })
      continue
    }
    for (const k of new Set([...Object.keys(prev.props), ...Object.keys(props)])) {
      if (k === 'id') continue
      const [x, y] = [JSON.stringify(prev.props[k]), JSON.stringify(props[k])]
      if (x !== y) changes.push({ kind: 'changed', id, path, prop: k, from: prev.props[k], to: props[k] })
    }
  }
  for (const [id, { path }] of a) if (!b.has(id)) changes.push({ kind: 'removed', id, path })
  return changes
}

const subtreeIds = (node, out = new Set()) => (out.add(node.id), node.children?.forEach((c) => subtreeIds(c, out)), out)

// ─── Figma 조회 ─────────────────────────────────────────────────────────────

// 화면 = 모바일 폭 FRAME/COMPONENT. SECTION 은 재귀 탐색, 슬라이드·배지·카드 등은 제외
const isScreen = (n) =>
  ['FRAME', 'COMPONENT'].includes(n.type) &&
  n.absoluteBoundingBox?.width >= 320 &&
  n.absoluteBoundingBox?.width <= 480

async function fetchFile(key, pageIds = null) {
  const f = await figma(`/files/${key}?depth=2`)
  const pages = []
  for (const p of f.document.children) {
    if (pageIds && !pageIds.includes(p.id)) continue
    const frames = []
    const sections = [] // 댓글 귀속용 { id, path }
    // [node, sectionPath] 큐 — SECTION 은 depth=1 로 한 단계씩 펼침
    let level = (p.children ?? []).map((c) => [c, p.name])
    while (level.length) {
      const next = []
      for (const [n, path] of level) {
        if (isScreen(n)) frames.push({ id: n.id, name: n.name, type: n.type, page: path })
        else if (n.type === 'SECTION') next.push([n.id, `${path} / ${n.name}`])
      }
      sections.push(...next.map(([id, path]) => ({ id, path })))
      level = []
      for (let i = 0; i < next.length; i += 40) {
        const batch = next.slice(i, i + 40)
        const res = await figma(`/files/${key}/nodes?depth=1&ids=${encodeURIComponent(batch.map(([id]) => id).join(','))}`)
        for (const [id, path] of batch) {
          for (const c of res.nodes[id]?.document?.children ?? []) level.push([c, path])
        }
      }
    }
    pages.push({ id: p.id, name: p.name, frames, sections })
  }
  return { name: f.name, version: f.version, lastModified: f.lastModified, pages }
}

async function fetchNodes(key, ids) {
  const out = {}
  for (let i = 0; i < ids.length; i += 40) {
    const batch = ids.slice(i, i + 40)
    const res = await figma(`/files/${key}/nodes?ids=${encodeURIComponent(batch.join(','))}`)
    for (const [id, v] of Object.entries(res.nodes)) if (v?.document) out[id] = normalize(v.document)
  }
  return out
}

// ─── 화면 이름 매칭 ──────────────────────────────────────────────────────────

const norm = (s) => s.toLowerCase().replace(/screen$/i, '').replace(/[^a-z0-9가-힣]/g, '')
const codeScreens = () =>
  existsSync(SCREENS_DIR)
    ? readdirSync(SCREENS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : []

// ─── Commands ───────────────────────────────────────────────────────────────

async function cmdPages(url) {
  const file = await fetchFile(parseFileKey(url))
  console.log(JSON.stringify({ file: file.name, pages: file.pages.map((p) => ({ id: p.id, name: p.name, screens: p.frames.length })) }, null, 2))
}

async function cmdInit(url, pageIds) {
  if (existsSync(REGISTRY)) die('registry.json 이 이미 있습니다. 매핑 수정은 registry.json 을 직접 편집하세요.')
  if (!pageIds.length) die('--pages <pageId,...> 가 필요합니다. 먼저 `pages <fileUrl>` 로 확인하세요.')
  const key = parseFileKey(url)
  const file = await fetchFile(key, pageIds)
  const screens = codeScreens()
  const frames = {}
  for (const f of file.pages.flatMap((p) => p.frames)) {
    const match = screens.find((s) => norm(s) === norm(f.name)) ?? null
    frames[f.id] = { name: f.name, page: f.page, screen: match, ignore: false }
  }
  const nodes = await fetchNodes(key, Object.keys(frames))
  for (const [id, n] of Object.entries(nodes)) {
    writeJson(snapPath(id), n)
    frames[id].hash = hash(n)
  }
  writeJson(REGISTRY, {
    fileKey: key,
    fileName: file.name,
    pages: pageIds,
    version: file.version,
    syncedAt: new Date().toISOString(),
    handledComments: [],
    frames,
  })
  const unmatched = Object.entries(frames).filter(([, f]) => !f.screen)
  const mapped = new Set(Object.values(frames).map((f) => f.screen).filter(Boolean))
  console.log(JSON.stringify({
    frames: Object.keys(frames).length,
    autoMatched: Object.keys(frames).length - unmatched.length,
    unmatchedFrames: unmatched.map(([id, f]) => ({ id, name: f.name, page: f.page })),
    unmappedScreens: screens.filter((s) => !mapped.has(s)),
  }, null, 2))
}

async function cmdDiff() {
  const reg = readJson(REGISTRY)
  const file = await fetchFile(reg.fileKey, reg.pages)
  const live = file.pages.flatMap((p) => p.frames)
  const liveIds = new Set(live.map((f) => f.id))

  const tracked = Object.entries(reg.frames).filter(([id, f]) => !f.ignore && liveIds.has(id))
  const nodes = file.version === reg.version ? {} : await fetchNodes(reg.fileKey, tracked.map(([id]) => id))

  const changed = []
  for (const [id, f] of tracked) {
    const n = nodes[id]
    if (!n || hash(n) === f.hash) continue
    const before = existsSync(snapPath(id)) ? readJson(snapPath(id)) : { id, name: f.name }
    changed.push({ id, name: f.name, screen: f.screen, hash: hash(n), changes: diffTree(before, n), after: n })
  }

  const added = live.filter((f) => !reg.frames[f.id])
  const removed = Object.entries(reg.frames).filter(([id, f]) => !f.ignore && !liveIds.has(id)).map(([id, f]) => ({ id, ...f }))

  // 감시 page 안 노드에 핀된 미해결 최상위 댓글 → 화면(또는 SECTION)에 귀속
  // 제외: 본인 작성, 처리 완료 기록(reply 로 남긴 것), ignore 프레임
  // 본인 답글("확인했습니다")만으로는 코드 반영 여부를 알 수 없으므로 제외하지 않고 lastReply 로 전달
  const [{ comments }, me] = await Promise.all([figma(`/files/${reg.fileKey}/comments`), figma('/me')])
  const lastReply = new Map()
  for (const c of comments.filter((c) => c.parent_id).sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    lastReply.set(c.parent_id, `${c.user?.handle}: ${c.message.replace(/\s+/g, ' ').slice(0, 80)}`)
  }
  const owners = Object.keys(reg.frames).map((id) => {
    const n = nodes[id] ?? (existsSync(snapPath(id)) ? readJson(snapPath(id)) : { id })
    return [id, subtreeIds(n)]
  })
  const sections = new Map(file.pages.flatMap((p) => p.sections).map((s) => [s.id, s.path]))
  const screensUnder = (path) =>
    [...new Set(Object.values(reg.frames).filter((f) => !f.ignore && f.screen && f.page.startsWith(path)).map((f) => f.screen))]
  const open = []
  let skipped = 0
  for (const c of comments) {
    if (c.parent_id || c.resolved_at || reg.handledComments.includes(c.id)) continue
    if (c.user?.id === me.id) { skipped++; continue }
    const nodeId = c.client_meta?.node_id ?? null
    const frame = nodeId && (reg.frames[nodeId] ? nodeId : owners.find(([, ids]) => ids.has(nodeId))?.[0])
    const base = { id: c.id, author: c.user?.handle, message: c.message, createdAt: c.created_at, nodeId, lastReply: lastReply.get(c.id) ?? null }
    if (frame) {
      if (reg.frames[frame].ignore) { skipped++; continue }
      open.push({ ...base, frame, screen: reg.frames[frame].screen ?? null })
    } else if (nodeId && sections.has(nodeId)) {
      const section = sections.get(nodeId)
      open.push({ ...base, section, screen: null, screens: screensUnder(section) })
    } else skipped++ // 감시 page 밖 또는 캔버스 댓글
  }

  writeJson(PENDING, { version: file.version, lastModified: file.lastModified, changed, added, removed, comments: open })

  // stdout 은 요약만 — 상세는 .pending.json
  console.log(JSON.stringify({
    fileVersion: file.version === reg.version ? 'unchanged' : `${reg.version} → ${file.version}`,
    lastModified: file.lastModified,
    changed: changed.map((c) => ({ id: c.id, name: c.name, screen: c.screen, changeCount: c.changes.length })),
    added: added.map((f) => ({ id: f.id, name: f.name, page: f.page })),
    removed: removed.map((f) => ({ id: f.id, name: f.name, screen: f.screen })),
    comments: open.map(({ id, author, createdAt, message, screen, section, screens, lastReply }) => ({ id, author, createdAt: createdAt.slice(0, 10), screen: screen ?? `[section] ${section} → ${screens.join(', ')}`, message, lastReply })),
    commentsSkipped: skipped,
    detail: '.claude/figma/.pending.json',
  }, null, 2))
}

function cmdCommit(ids) {
  const reg = readJson(REGISTRY)
  const pending = readJson(PENDING)
  const all = ids.includes('--all')
  const targets = pending.changed.filter((c) => all || ids.includes(c.id))
  for (const c of targets) {
    writeJson(snapPath(c.id), c.after)
    reg.frames[c.id].hash = c.hash
  }
  const remaining = pending.changed.filter((c) => !targets.includes(c))
  // 모든 변경이 반영됐을 때만 파일 version 을 올려 다음 diff 의 빠른 경로가 정확하도록 유지
  if (!remaining.length) reg.version = pending.version
  reg.syncedAt = new Date().toISOString()
  writeJson(REGISTRY, reg)
  console.log(JSON.stringify({ committed: targets.map((c) => c.id), remaining: remaining.map((c) => c.id), versionUpdated: !remaining.length }, null, 2))
}

async function cmdLink(nodeId, target) {
  const reg = readJson(REGISTRY)
  const ignore = target === '--ignore'
  if (!ignore && !codeScreens().includes(target)) console.warn(`⚠ src/screens/${target} 가 아직 없습니다 (신규 화면이면 생성 후 정상).`)
  const { pages } = await fetchFile(reg.fileKey, reg.pages)
  const frame = pages.flatMap((p) => p.frames).find((f) => f.id === nodeId)
  if (!frame) die(`감시 중인 파일에서 프레임 ${nodeId} 를 찾을 수 없습니다.`)
  const n = (await fetchNodes(reg.fileKey, [nodeId]))[nodeId]
  if (!n) die(`프레임 ${nodeId} 의 노드 데이터를 가져오지 못했습니다 (숨김 처리되었거나 권한 없음).`)
  writeJson(snapPath(nodeId), n)
  reg.frames[nodeId] = { name: n.name, page: frame.page, screen: ignore ? null : target, ignore, hash: hash(n) }
  writeJson(REGISTRY, reg)
  console.log(`✔ ${n.name} (${nodeId}) → ${ignore ? 'ignore' : target}`)
}

function cmdUnlink(nodeId) {
  const reg = readJson(REGISTRY)
  if (!reg.frames[nodeId]) die(`registry 에 ${nodeId} 가 없습니다.`)
  delete reg.frames[nodeId]
  if (existsSync(snapPath(nodeId))) rmSync(snapPath(nodeId))
  writeJson(REGISTRY, reg)
  console.log(`✔ ${nodeId} 제거`)
}

async function cmdReply(commentId, message) {
  const reg = readJson(REGISTRY)
  await figma(`/files/${reg.fileKey}/comments`, { method: 'POST', body: JSON.stringify({ message, comment_id: commentId }) })
  if (!reg.handledComments.includes(commentId)) reg.handledComments.push(commentId)
  writeJson(REGISTRY, reg)
  console.log(`✔ 댓글 ${commentId} 답글 완료`)
}

function cmdAck(ids) {
  const reg = readJson(REGISTRY)
  for (const id of ids) if (!reg.handledComments.includes(id)) reg.handledComments.push(id)
  writeJson(REGISTRY, reg)
  console.log(`✔ ${ids.length}개 댓글 처리 완료로 기록`)
}

function cmdUrl(nodeId) {
  const reg = readJson(REGISTRY)
  console.log(`https://www.figma.com/design/${reg.fileKey}/?node-id=${nodeId.replace(':', '-')}`)
}

// ─── main ───────────────────────────────────────────────────────────────────

const [cmd, ...rest] = process.argv.slice(2)
const needsRegistry = ['diff', 'commit', 'link', 'unlink', 'reply', 'ack', 'url']
if (needsRegistry.includes(cmd) && !existsSync(REGISTRY)) die('registry.json 이 없습니다. 먼저 `init` 을 실행하세요.')

switch (cmd) {
  case 'pages': await cmdPages(rest[0] ?? die('fileUrl 이 필요합니다')); break
  case 'init': {
    const i = rest.indexOf('--pages')
    await cmdInit(rest[0] ?? die('fileUrl 이 필요합니다'), i >= 0 ? rest[i + 1].split(',') : [])
    break
  }
  case 'diff': await cmdDiff(); break
  case 'commit': cmdCommit(rest.length ? rest : die('nodeId 또는 --all 이 필요합니다')); break
  case 'link': await cmdLink(rest[0] ?? die('nodeId 가 필요합니다'), rest[1] ?? die('ScreenName 또는 --ignore 가 필요합니다')); break
  case 'unlink': cmdUnlink(rest[0] ?? die('nodeId 가 필요합니다')); break
  case 'reply': await cmdReply(rest[0], rest.slice(1).join(' ') || die('message 가 필요합니다')); break
  case 'ack': cmdAck(rest.length ? rest : die('commentId 가 필요합니다')); break
  case 'url': cmdUrl(rest[0] ?? die('nodeId 가 필요합니다')); break
  default: die('command: pages | init | diff | commit | link | unlink | reply | ack | url')
}
