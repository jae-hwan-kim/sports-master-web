#!/usr/bin/env node
// 기기 매트릭스 스크린샷 수집 (/device-check 스킬이 호출)
// 기기 크기 · 시스템 글자 크기 · Android 3버튼 내비게이션 조합별로 화면을 딥링크로 열어 캡처하고,
// 비교용 Figma 원본 PNG 를 같은 폴더에 받아둔다. 판정(잘림/가림/Figma 차이)은 Claude 가 이미지를 보고 한다.
//
// 사용: pnpm device:check [--platform ios|android|all] [--screens Login,SignUp] [--profiles a,b] [--no-figma]
// 전제: 개발 빌드(expo-dev-client)가 각 시뮬레이터/에뮬레이터에 설치돼 있고 Metro(8081)가 실행 중
// 결과: .claude/device-check/<timestamp>/{<platform>__<profile>__<Screen>.png, figma__<Screen>.png, index.json}

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BUNDLE_ID = 'sports.master'
const SCHEME = 'sportsmaster'
const METRO = 'http://localhost:8081'
const SDK = process.env.ANDROID_HOME ?? join(homedir(), 'Library/Android/sdk')
const ADB = join(SDK, 'platform-tools/adb')
const EMULATOR = join(SDK, 'emulator/emulator')
const AVD = process.env.DEVICE_CHECK_AVD ?? 'Pixel_9'

// devLinking.ts 의 dev/<Screen> 경로와 1:1
const SCREENS = [
  'Onboarding', 'Login', 'SignUp', 'SignUpRoleSelect', 'MasterVerification', 'CustomerWelcome',
  'MasterWelcome', 'MasterHome', 'MasterDiagnosis', 'MasterProfile', 'MasterDetailProfile',
  'MasterDetailProfileEdit', 'MasterReview', 'MasterSettings', 'MasterProfileEdit', 'MasterMessageGuide',
  'MasterPhoneChange', 'CustomerHome', 'CustomerExplore', 'CustomerProfile', 'CustomerSettings',
  'MasterQuickRecommend', 'RegionSelectQ1', 'OnboardingQ2GenderAge', 'SurveyKeywordSelect',
  'RecommendedMasters', 'FavoriteExperts', 'ReviewWrite', 'MyReviews',
]

// iOS: 기기별 시뮬레이터 × 글자 크기. xxxl ≈ 1.35배 → AppText 상한(1.2) 동작 확인용
const IOS_PROFILES = {
  'iphone16e': { device: 'iPhone 16e', contentSize: 'large' }, // 390pt — 설치된 시뮬레이터 중 최소 폭
  'iphone17pro': { device: 'iPhone 17 Pro', contentSize: 'large' }, // 402pt — Figma 기준
  'iphone17promax': { device: 'iPhone 17 Pro Max', contentSize: 'large' }, // 440pt
  'iphone16e-maxfont': { device: 'iPhone 16e', contentSize: 'extra-extra-extra-large' },
}

// Android: 에뮬레이터 1대에서 설정만 바꿔가며 재현. 실기기 대부분이 3버튼 내비게이션
const ANDROID_PROFILES = {
  'gesture': { nav: 'gestural', font: 1.0 },
  '3btn': { nav: 'threebutton', font: 1.0 },
  '3btn-font1.3': { nav: 'threebutton', font: 1.3 },
  '3btn-small': { nav: 'threebutton', font: 1.0, size: '720x1520', density: 320 }, // 360x760dp 소형 기기
}

// ─── util ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const die = (msg) => {
  console.error(`✖ ${msg}`)
  process.exit(1)
}
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts })
const tryRun = (cmd, args) => {
  try {
    return run(cmd, args)
  } catch {
    return null
  }
}
const devClientUrl = `${SCHEME}://expo-development-client/?url=${encodeURIComponent(METRO)}`

function args() {
  const a = process.argv.slice(2)
  const get = (k) => (a.includes(k) ? a[a.indexOf(k) + 1] : null)
  return {
    platform: get('--platform') ?? 'all',
    screens: get('--screens')?.split(',') ?? SCREENS,
    profiles: get('--profiles')?.split(',') ?? null,
    figma: !a.includes('--no-figma'),
  }
}

async function assertMetro() {
  const ok = await fetch(`${METRO}/status`).then((r) => r.text()).catch(() => '')
  if (!ok.includes('running')) die('Metro(8081)가 실행 중이 아닙니다. `pnpm start` 를 먼저 띄우세요.')
}

// ─── iOS ────────────────────────────────────────────────────────────────────

function simUdid(name) {
  const { devices } = JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'available', '-j']))
  const all = Object.values(devices).flat().filter((d) => d.name === name)
  return (all.find((d) => d.state === 'Booted') ?? all[0])?.udid ?? null
}

async function captureIos(out, screens, profiles, shots) {
  const booted = new Set()
  for (const [key, p] of Object.entries(IOS_PROFILES).filter(([k]) => !profiles || profiles.includes(k))) {
    const udid = simUdid(p.device)
    if (!udid) {
      shots.skipped.push(`${key}: 시뮬레이터 "${p.device}" 없음`)
      continue
    }
    tryRun('xcrun', ['simctl', 'boot', udid])
    run('xcrun', ['simctl', 'bootstatus', udid, '-b'])
    if (!tryRun('xcrun', ['simctl', 'get_app_container', udid, BUNDLE_ID, 'app'])) {
      shots.skipped.push(`${key}: 앱 미설치 → pnpm ios --device "${p.device}"`)
      continue
    }
    run('xcrun', ['simctl', 'ui', udid, 'content_size', p.contentSize])
    if (!booted.has(udid)) {
      tryRun('xcrun', ['simctl', 'terminate', udid, BUNDLE_ID])
      run('xcrun', ['simctl', 'openurl', udid, devClientUrl])
      await sleep(15000) // 번들 로드
      booted.add(udid)
    } else await sleep(3000) // 글자 크기 변경 반영
    for (const s of screens) {
      run('xcrun', ['simctl', 'openurl', udid, `${SCHEME}://dev/${s}`])
      await sleep(2500)
      const file = `ios__${key}__${s}.png`
      run('xcrun', ['simctl', 'io', udid, 'screenshot', join(out, file)])
      shots.files.push({ platform: 'ios', profile: key, ...p, screen: s, file })
    }
    run('xcrun', ['simctl', 'ui', udid, 'content_size', 'large'])
  }
}

// ─── Android ────────────────────────────────────────────────────────────────

const adb = (...a) => run(ADB, a)
const shell = (...a) => run(ADB, ['shell', ...a]).trim()

async function ensureEmulator() {
  if (!existsSync(ADB)) die(`adb 없음: ${ADB}`)
  if (adb('devices').split('\n').slice(1).some((l) => l.includes('\tdevice'))) return
  console.log(`· 에뮬레이터 ${AVD} 부팅 중...`)
  spawn(EMULATOR, ['-avd', AVD, '-no-audio', '-no-boot-anim', '-no-snapshot-save'], { detached: true, stdio: 'ignore' }).unref()
  adb('wait-for-device')
  for (let i = 0; i < 90 && shell('getprop', 'sys.boot_completed') !== '1'; i++) await sleep(2000)
}

const NAV_OVERLAY = (mode) => `com.android.internal.systemui.navbar.${mode}`
const currentNav = () =>
  shell('cmd', 'overlay', 'list').split('\n').find((l) => l.includes('[x]') && l.includes('systemui.navbar.'))?.split('navbar.')[1]?.trim() ?? 'gestural'

async function applyAndroid(p) {
  shell('cmd', 'overlay', 'enable-exclusive', '--category', NAV_OVERLAY(p.nav))
  shell('settings', 'put', 'system', 'font_scale', String(p.font))
  if (p.size) {
    shell('wm', 'size', p.size)
    shell('wm', 'density', String(p.density))
  } else {
    shell('wm', 'size', 'reset')
    shell('wm', 'density', 'reset')
  }
  await sleep(4000) // configuration change → activity 재생성 대기
}

async function captureAndroid(out, screens, profiles, shots) {
  await ensureEmulator()
  if (!shell('pm', 'list', 'packages', BUNDLE_ID).includes(BUNDLE_ID)) {
    shots.skipped.push('android: 앱 미설치 → pnpm android (expo run:android)')
    return
  }
  const original = { nav: currentNav(), font: shell('settings', 'get', 'system', 'font_scale') }
  adb('reverse', 'tcp:8081', 'tcp:8081')
  shell('am', 'force-stop', BUNDLE_ID)
  shell('am', 'start', '-a', 'android.intent.action.VIEW', '-d', `'${devClientUrl}'`, BUNDLE_ID)
  await sleep(20000)
  try {
    for (const [key, p] of Object.entries(ANDROID_PROFILES).filter(([k]) => !profiles || profiles.includes(k))) {
      await applyAndroid(p)
      for (const s of screens) {
        shell('am', 'start', '-a', 'android.intent.action.VIEW', '-d', `${SCHEME}://dev/${s}`, BUNDLE_ID)
        await sleep(2500)
        const file = `android__${key}__${s}.png`
        writeFileSync(join(out, file), execFileSync(ADB, ['exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 }))
        shots.files.push({ platform: 'android', profile: key, ...p, screen: s, file })
      }
    }
  } finally {
    // 에뮬레이터 설정 원복
    await applyAndroid({ nav: original.nav, font: Number(original.font) || 1.0 })
  }
}

// ─── Figma 원본 ─────────────────────────────────────────────────────────────

async function fetchFigma(out, screens, shots) {
  const regPath = join(ROOT, '.claude/figma/registry.json')
  const token = process.env.FIGMA_TOKEN
  if (!existsSync(regPath) || !token) {
    shots.skipped.push('figma: registry.json 또는 FIGMA_TOKEN 없음')
    return
  }
  const reg = JSON.parse(readFileSync(regPath, 'utf8'))
  // 화면별 대표 프레임: 이름에 Default 가 들어간 것 → 없으면 첫 프레임
  const pick = {}
  for (const [id, f] of Object.entries(reg.frames)) {
    if (f.ignore || !f.screen || !screens.includes(f.screen)) continue
    if (!pick[f.screen] || /default/i.test(f.name)) pick[f.screen] = { id, name: f.name }
  }
  const ids = Object.values(pick).map((p) => p.id)
  if (!ids.length) return
  const res = await fetch(`https://api.figma.com/v1/images/${reg.fileKey}?ids=${encodeURIComponent(ids.join(','))}&format=png&scale=2`, {
    headers: { 'X-Figma-Token': token },
  }).then((r) => r.json())
  for (const [screen, { id, name }] of Object.entries(pick)) {
    const url = res.images?.[id]
    if (!url) continue
    const file = `figma__${screen}.png`
    writeFileSync(join(out, file), Buffer.from(await (await fetch(url)).arrayBuffer()))
    shots.figma.push({ screen, frame: name, nodeId: id, file })
  }
}

// ─── main ───────────────────────────────────────────────────────────────────

const opt = args()
const unknown = opt.screens.filter((s) => !SCREENS.includes(s))
if (unknown.length) die(`알 수 없는 화면: ${unknown.join(', ')} (devLinking.ts 에 등록된 화면만 가능)`)
await assertMetro()

const out = join(ROOT, '.claude/device-check', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19))
mkdirSync(out, { recursive: true })
const shots = { out, files: [], figma: [], skipped: [] }

if (opt.figma) await fetchFigma(out, opt.screens, shots)
if (['ios', 'all'].includes(opt.platform)) await captureIos(out, opt.screens, opt.profiles, shots)
if (['android', 'all'].includes(opt.platform)) await captureAndroid(out, opt.screens, opt.profiles, shots)

writeFileSync(join(out, 'index.json'), JSON.stringify(shots, null, 2) + '\n')
console.log(JSON.stringify({ out, captured: shots.files.length, figma: shots.figma.length, skipped: shots.skipped }, null, 2))
