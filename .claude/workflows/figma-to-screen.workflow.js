export const meta = {
  name: 'figma-to-screen',
  description: 'Figma 링크 → RN(Expo) 화면/컴포넌트 코드 생성 및 검토',
  phases: [
    { title: 'Figma 분석', detail: 'get_design_context/get_screenshot/get_variable_defs로 디자인 스펙 추출' },
    { title: '화면 코드 생성', detail: 'NativeWind 기반 화면 + 하위 컴포넌트 생성' },
    { title: '병렬 리뷰', detail: '구조 · RN 규칙 준수 · 접근성/터치 3개 에이전트 동시 검토' },
    { title: '수정 적용', detail: '리뷰 결과 통합 후 파일 수정' },
  ],
}

// ─── Schema ────────────────────────────────────────────────────────────────

const CODE_SCHEMA = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'src/ 기준 상대 경로 (예: screens/Home/HomeScreen.tsx)' },
          code: { type: 'string' },
          purpose: { type: 'string', description: '이 파일의 역할 한줄 설명' },
        },
        required: ['path', 'code', 'purpose'],
      },
    },
    notes: { type: 'array', items: { type: 'string' }, description: '디자인에서 확인 못한 부분, 가정한 내용' },
  },
  required: ['files', 'notes'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['error', 'warning', 'suggestion'] },
          file: { type: 'string' },
          issue: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'file', 'issue', 'fix'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['findings', 'summary'],
}

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          code: { type: 'string', description: '수정된 전체 파일 코드' },
          changes: { type: 'string' },
        },
        required: ['path', 'code', 'changes'],
      },
    },
    skipped: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'skipped'],
}

// ─── 입력 ──────────────────────────────────────────────────────────────────
// 사용: Workflow({ name: 'figma-to-screen', args: { figmaUrl, screenName } })

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
const { figmaUrl, screenName = null } = parsedArgs ?? {}

if (!figmaUrl) {
  throw new Error('args.figmaUrl 이 필요합니다. 예: { figmaUrl: "https://figma.com/design/...", screenName: "Home" }')
}

const RN_RULES = `
React Native (Expo) 필수 규칙:
- NativeWind(className) 우선, 인라인 스타일 객체 금지
- 동적/긴 리스트는 FlatList/FlashList, 짧고 고정된 목록만 map() 허용
- TouchableOpacity 금지 → Pressable + hitSlop={8}
- 이미지 width/height 명시, 외부 이미지는 expo-image
- 입력 폼 있는 화면은 KeyboardAvoidingView 필수
- 애니메이션은 useNativeDriver: true
- import 순서: ^react, ^expo, ^@tanstack, ^@/, ^[./]
- Prettier: semi false, singleQuote, printWidth 100
`

// ─── Phase 1: Figma 분석 ────────────────────────────────────────────────────

phase('Figma 분석')
log(`Figma 디자인 분석 중: ${figmaUrl}`)

const designSpec = await agent(
  `다음 Figma 링크의 디자인을 분석하세요: ${figmaUrl}

절차:
1. Figma MCP 도구(get_design_context, get_screenshot, get_variable_defs)를 사용해 실제 디자인 데이터를 가져올 것 — 추측 금지
2. 화면 구성: 레이아웃 구조, 섹션/컴포넌트 계층, 반복되는 리스트 요소 유무
3. 디자인 토큰: 색상, 타이포그래피, spacing (variable_defs 기준)
4. 인터랙션 요소: 버튼, 입력 필드, 탭 등 터치 가능한 요소와 상태(hover/pressed는 RN에 없으므로 pressed만)
5. 텍스트 컨텐츠와 아이콘/이미지 placeholder 위치

다음을 텍스트로 정리해 반환하세요:
- 화면 이름 및 목적
- 컴포넌트 트리 (들여쓰기로 계층 표현)
- 디자인 토큰 목록 (색상 hex, 폰트 크기/굵기, spacing 값)
- 리스트/반복 요소 여부와 데이터 형태 추정
- 인터랙션 요소 목록`,
  { label: 'Figma Design Analyzer' },
)

log('Figma 분석 완료.')

// ─── Phase 2: 화면 코드 생성 ─────────────────────────────────────────────────

phase('화면 코드 생성')

const codeResult = await agent(
  `아래 디자인 스펙을 바탕으로 React Native(Expo) 화면과 하위 컴포넌트 코드를 생성하세요.

${screenName ? `화면 이름: ${screenName}` : ''}

=== 디자인 스펙 ===
${designSpec}

${RN_RULES}

생성 규칙:
1. 화면 컴포넌트는 src/screens/{ScreenName}/{ScreenName}Screen.tsx
2. 재사용 가능한 하위 컴포넌트는 src/components/{ComponentName}.tsx로 분리
3. 서버 데이터가 필요해 보이면 TanStack Query 훅 자리만 주석으로 표시 (실제 API 연동은 하지 말 것 — 아직 백엔드 API 미확정)
4. 디자인에서 확인 불가능하거나 추정한 부분은 notes에 명시
5. 모든 파일 전체 코드를 반환`,
  { schema: CODE_SCHEMA, label: 'Screen Code Generator' },
)

log(`코드 생성 완료: ${codeResult.files.length}개 파일`)

const codeText = codeResult.files.map(f => `// ${f.path}\n${f.code}`).join('\n\n---\n\n')

// ─── Phase 3: 병렬 리뷰 ──────────────────────────────────────────────────────

phase('병렬 리뷰')
log('3개 차원 동시 검토 중...')

const [structureReview, rnRuleReview, a11yReview] = await parallel([
  () =>
    agent(
      `다음 RN 화면/컴포넌트 코드의 폴더 구조와 import 경로를 검토하세요.

=== 코드 ===
${codeText}

검토 항목:
1. 화면은 src/screens/{Name}/{Name}Screen.tsx, 컴포넌트는 src/components/ 규칙 준수 여부
2. import 순서 (^react, ^expo, ^@tanstack, ^@/, ^[./])
3. 파일명이 컴포넌트명과 일치하는가
4. 불필요하게 큰 단일 파일(책임 과다) 여부`,
      { schema: REVIEW_SCHEMA, label: 'Reviewer: 구조/Import' },
    ),
  () =>
    agent(
      `다음 코드가 RN 필수 규칙을 준수하는지 검토하세요.

${RN_RULES}

=== 코드 ===
${codeText}

각 위반 사항에 severity, 파일, 문제, 수정 방법을 명시하세요.`,
      { schema: REVIEW_SCHEMA, label: 'Reviewer: RN 규칙 준수' },
    ),
  () =>
    agent(
      `다음 코드의 접근성과 터치 UX를 검토하세요.

=== 코드 ===
${codeText}

검토 항목:
1. 터치 영역 44x44pt 이상 확보 (hitSlop 포함)
2. 이미지에 width/height 명시
3. 입력 폼 화면에 KeyboardAvoidingView 적용 여부
4. 텍스트 대비/폰트 크기가 지나치게 작지 않은지 (디자인 스펙 대비)`,
      { schema: REVIEW_SCHEMA, label: 'Reviewer: 접근성/터치' },
    ),
])

// ─── Phase 4: 수정 적용 ──────────────────────────────────────────────────────

phase('수정 적용')

const allFindings = [...(structureReview?.findings ?? []), ...(rnRuleReview?.findings ?? []), ...(a11yReview?.findings ?? [])].filter(
  Boolean,
)

const errorCount = allFindings.filter(f => f.severity === 'error').length
const warningCount = allFindings.filter(f => f.severity === 'warning').length

log(`발견된 문제: error ${errorCount}개, warning ${warningCount}개 — 수정 적용 중...`)

const fixResult = await agent(
  `다음 리뷰 결과를 바탕으로 화면/컴포넌트 코드를 수정하세요.

=== 리뷰 결과 (우선순위: error > warning > suggestion) ===
${JSON.stringify(allFindings, null, 2)}

=== 현재 코드 ===
${codeText}

${RN_RULES}

수정 규칙:
1. error, warning은 반드시 수정
2. suggestion은 판단하여 적용
3. 수정이 필요없는 파일은 files에 포함하지 말 것
4. 수정 시 해당 파일 전체 코드 반환`,
  { schema: FIX_SCHEMA, label: 'Fixer' },
)

log(`수정 완료: ${fixResult.files.length}개 파일 수정, ${fixResult.skipped.length}개 수동 처리 필요`)

return {
  figmaUrl,
  screenName,
  designSpec,
  generated: codeResult,
  reviews: { structure: structureReview, rnRules: rnRuleReview, a11y: a11yReview },
  findings: allFindings,
  fix: fixResult,
}
