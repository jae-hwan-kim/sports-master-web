export const meta = {
  name: 'design-fidelity-review',
  description: '이미 생성된 화면 코드를 Figma 원본과 좌표/색상/크기 단위로 재대조하고 필요시 자동 수정',
  phases: [
    { title: 'Figma·코드 수집', detail: 'get_design_context/get_metadata로 원본 스펙 확보, 현재 화면 소스 Read' },
    { title: '정밀 대조', detail: '절대좌표 기반으로 색상·크기·간격 차이를 표로 계산' },
    { title: '조건부 수정', detail: '차이 발견 시에만 Fixer 실행' },
  ],
}

// ─── Schema ────────────────────────────────────────────────────────────────

const DIFF_SCHEMA = {
  type: 'object',
  properties: {
    diffs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['color', 'size', 'spacing', 'position', 'missing-element', 'responsive-intent', 'other'],
          },
          severity: { type: 'string', enum: ['error', 'warning', 'suggestion'] },
          element: { type: 'string', description: '어떤 요소인지 (예: 로그인 버튼, 구글/카카오/애플 버튼 간격)' },
          file: { type: 'string' },
          expected: { type: 'string', description: 'Figma 스펙 값 (예: height 50px, #1F2A43)' },
          actual: { type: 'string', description: '현재 코드 값' },
          fix: { type: 'string' },
        },
        required: ['category', 'severity', 'element', 'file', 'expected', 'actual', 'fix'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['diffs', 'summary'],
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
// 사용: Workflow({ name: 'design-fidelity-review', args: { figmaUrl, screenName } })
// figmaUrl: 재대조할 Figma 노드 링크 (화면 하나 단위)
// screenName: 대조 대상 화면명 (예: 'Login') — src/screens/{screenName}/ 기준으로 코드 탐색

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
const { figmaUrl, screenName } = parsedArgs ?? {}

if (!figmaUrl || !screenName) {
  throw new Error(
    'args.figmaUrl, args.screenName 이 모두 필요합니다. 예: { figmaUrl: "https://figma.com/design/...", screenName: "Login" }'
  )
}

// ─── Phase 1: Figma·코드 수집 ────────────────────────────────────────────────

phase('Figma·코드 수집')
log(`Figma 원본 스펙 조회 및 "${screenName}" 화면 소스 수집 중...`)

const collected = await agent(
  `"${screenName}" 화면의 실제 구현 코드와 Figma 원본 디자인을 비교할 준비를 하세요.

절차:
1. figma-design-to-code 스킬을 먼저 로드 (get_figma_skill로 skill://figma/figma-design-to-code/SKILL.md)
2. get_design_context로 다음 Figma 노드의 정확한 스펙(절대좌표, 색상 hex, 폰트, 사이즈, 컴포넌트 구조)을 가져오세요: ${figmaUrl}
   - 여러 하위 화면/팝업이 있으면 각각 별도로 조회 (get_metadata로 먼저 하위 노드 목록 파악)
3. sports-master-web/src/screens/${screenName}/ 안의 모든 파일을 Read로 읽으세요
4. 이 화면이 사용하는 공용 컴포넌트(src/components/의 Button, TextField, ConfirmDialog 등)도 Read로 읽으세요
5. 이 화면에서 쓰는 아이콘(src/assets/icons/index.tsx)도 함께 확인하세요

다음을 정리해 텍스트로 반환하세요:
- Figma 원본의 절대좌표 목록 (요소명, x/y/width/height, 색상, 폰트)
- 현재 코드가 각 요소를 어떻게 구현했는지 (className, style, 사용 색상/사이즈 값)
- react-native-size-matters(verticalScale/moderateScale) 등 플랫폼에 따라 값이 달라질 수 있는 함수 사용 여부`,
  { label: 'Figma+코드 수집' },
)

log('수집 완료.')

// ─── Phase 2: 정밀 대조 ──────────────────────────────────────────────────────

phase('정밀 대조')
log('좌표/색상/크기 단위로 차이 계산 중...')

const diffResult = await agent(
  `아래 수집 결과를 바탕으로 Figma 원본과 실제 코드 사이의 모든 차이를 찾으세요.

=== 수집 결과 ===
${collected}

검토 절차 (반드시 계산으로 확인 — 눈대중 금지):
1. 각 요소의 Figma 절대좌표를 이용해 "이전 요소의 bottom - 다음 요소의 top" 방식으로 실제 간격(px)을 계산
   - 주의: "텍스트 + 좌우 구분선" 패턴(예: "or 아래 계정으로" 같은 divider)에서, 구분선(h-0 벡터)의 y좌표는 텍스트의 세로 중앙에 걸치도록 배치되는 경우가 많아 텍스트 top보다 아래에 위치할 수 있음. 이때 "블록의 top"은 구분선이 아니라 텍스트(또는 그 그룹 내 가장 위에 있는 요소)의 top을 기준으로 계산할 것 — 구분선 좌표를 기준으로 잡으면 실제보다 몇 px 더 크게 오차가 남
2. 코드의 margin/padding/gap 값과 위 계산값을 비교 — 다르면 diff로 기록
3. 색상: Figma hex 값과 코드에서 실제 사용된 Tailwind 색상 토큰/hex를 비교 (예: primary #C6A75E vs gray3 #1F2A43 혼동)
4. 크기(width/height): 특히 버튼/입력창처럼 Figma가 고정 px로 명시한 요소가 verticalScale/moderateScale 등으로 감싸져 있으면 플랫폼별로 값이 달라질 수 있으므로 error로 표시
5. 아이콘: Figma 원본이 44x44 같은 탭 영역 전체를 포함해 내보낸 에셋인지, 24x24 순수 글리프인지 확인하고 코드의 렌더 사이즈와 비교
6. Figma에는 있는데 코드에 없는 요소, 코드에는 있는데 Figma에 없는 요소 확인
7. 반응형 레이아웃 의도(category: responsive-intent): 코드가 화면 하단 근처 요소(약관/저작권 텍스트, 하단 CTA 버튼 등)까지의 간격을 Figma 캔버스 높이에서 역산한 고정값(mt-[Npx])으로 처리하고 있는지 확인. 고정값이면 Figma 캔버스보다 큰 기기에서 하단에 빈 여백이 과도하게 남는 문제가 생기므로 error로 표시하고, flexGrow 스페이서(+ ScrollView contentContainerStyle의 flexGrow: 1)로 전환하도록 fix에 구체적으로 적을 것
8. 문제 없으면 diffs를 빈 배열로 반환

각 diff에는 category, severity(error: 명백히 틀림/warning: 애매하지만 다름/suggestion: 사소함), element, file, expected(Figma 값), actual(코드 값), fix(구체적 수정 방법)를 채우세요.`,
  { schema: DIFF_SCHEMA, label: '정밀 대조', effort: 'high' },
)

const errorCount = diffResult.diffs.filter((d) => d.severity === 'error').length
const warningCount = diffResult.diffs.filter((d) => d.severity === 'warning').length
log(`대조 완료: error ${errorCount}개, warning ${warningCount}개, suggestion ${diffResult.diffs.length - errorCount - warningCount}개`)

// ─── Phase 3: 조건부 수정 ────────────────────────────────────────────────────

phase('조건부 수정')

let fixResult = { files: [], skipped: ['차이 없음 — 수정 생략'] }

if (diffResult.diffs.length > 0) {
  log(`차이 ${diffResult.diffs.length}개 발견 — 수정 적용 중...`)
  fixResult = await agent(
    `다음 대조 결과를 바탕으로 "${screenName}" 화면 및 관련 공용 컴포넌트 코드를 수정하세요.

=== 대조 결과 (우선순위: error > warning > suggestion) ===
${JSON.stringify(diffResult.diffs, null, 2)}

수정 규칙:
1. error, warning은 반드시 수정. suggestion은 판단하여 적용
2. 수정 대상 파일은 Read로 최신 내용을 다시 읽은 뒤 전체 코드를 반환 (diff 조각이 아니라 파일 전체)
3. 공용 컴포넌트(Button/TextField 등)를 고치는 경우, 다른 화면에서도 쓰이고 있는지 확인하고 영향 범위를 changes에 명시
4. 수정 불필요한 파일은 files에 포함하지 말 것`,
    { schema: FIX_SCHEMA, label: '수정 적용' },
  )
  log(`수정 완료: ${fixResult.files.length}개 파일 수정, ${fixResult.skipped.length}개 수동 처리 필요`)
} else {
  log('차이 없음 — 수정 단계 생략.')
}

return {
  figmaUrl,
  screenName,
  diffs: diffResult.diffs,
  summary: diffResult.summary,
  fix: fixResult,
}
