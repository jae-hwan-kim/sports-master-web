export const meta = {
  name: 'figma-to-screen',
  description: 'Figma 플로우 링크 → 다중 RN(Expo) 화면 분해 + 코드 생성 + 백엔드 정합화 + API 연동 + 검토',
  phases: [
    { title: 'Figma 분석', detail: '플로우 프레임 안의 개별 화면들을 인식/분해' },
    { title: '화면 코드 생성', detail: '화면별 NativeWind 코드 + 폼 필드 추출' },
    { title: '백엔드 정합성 확인/수정', detail: 'DTO/Entity/Service를 화면 폼 필드에 맞춰 조정, 타입 재생성' },
    { title: 'API 연동', detail: 'TanStack Query 훅 실제 작성' },
    { title: '병렬 리뷰', detail: '구조 · RN 규칙 · 접근성/터치 · 네이티브 호환성 · API 정합성 5개 에이전트 동시 검토' },
    { title: '수정 적용', detail: '리뷰 결과 통합 후 파일 수정' },
  ],
}

// ─── Schema ────────────────────────────────────────────────────────────────

const SCREENS_SCHEMA = {
  type: 'object',
  properties: {
    screens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screenName: { type: 'string', description: 'PascalCase 영문 화면명 (예: Login, SignUpStep1)' },
          purpose: { type: 'string' },
          componentTree: { type: 'string' },
          designTokens: { type: 'string' },
          listOrRepeats: { type: 'string' },
          interactions: { type: 'string' },
          apiHint: { type: 'string', description: '이 화면에서 필요할 것으로 보이는 서버 데이터/액션 설명' },
        },
        required: ['screenName', 'purpose', 'componentTree', 'interactions'],
      },
    },
  },
  required: ['screens'],
}

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
    formFields: {
      type: 'array',
      items: { type: 'string' },
      description: '이 화면이 실제로 입력받아 서버로 보내는 폼 필드명 목록 (폼이 없으면 빈 배열)',
    },
    notes: { type: 'array', items: { type: 'string' }, description: '디자인에서 확인 못한 부분, 가정한 내용' },
  },
  required: ['files', 'formFields', 'notes'],
}

const BACKEND_SCHEMA = {
  type: 'object',
  properties: {
    mismatchFound: { type: 'boolean' },
    changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'sports-master-api 기준 상대 경로' },
          reason: { type: 'string' },
        },
        required: ['path', 'reason'],
      },
    },
    typesRegenerated: { type: 'boolean' },
  },
  required: ['mismatchFound', 'changes', 'typesRegenerated'],
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
// screenName은 선택 — 생략하면 프레임 안의 모든 화면을 처리, 지정하면 해당 화면만 필터링

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

네이티브(iOS/Android) 렌더링 호환성 — 웹 미리보기(react-native-web)에서는 정상으로 보여도
실제 시뮬레이터에서는 깨질 수 있는 항목이므로 반드시 확인:
- \`hover:\`, \`focus:\`, \`group-hover:\` 등 상호작용 pseudo-class 클래스 금지 (네이티브 미지원, 웹에서만 동작)
- \`transition-*\`, \`animate-*\` 클래스는 reanimated worklet 없이 직접 스타일에 사용 금지 — 애니메이션은 반드시 useNativeDriver: true 또는 reanimated worklet 사용
- \`grid\`, \`display: block\` 등 CSS 전용 레이아웃 금지 (Flexbox만 사용)
- 순수 CSS box-shadow 문자열(tailwind.config.js의 boxShadow.card 등) 대신 네이티브 shadow(shadowColor/shadowOffset/shadowOpacity/shadowRadius, Android는 elevation) 또는 Platform.select 사용
- 임의값(arbitrary value) 클래스(\`w-[123px]\`, \`bg-black/50\` 등)는 지원되지만 과도하게 복잡한 조합은 react-native-css-interop 파싱 이슈 가능성 있으므로 단순한 형태 우선

크기(scale) 관련 — 기기/웹 프리뷰 간 불일치 방지:
- Figma가 고정 px로 명시한 요소(버튼/입력창 높이, 아이콘 크기 등)에는 verticalScale/scale을 쓰지 말 것 — className 고정값(예: h-[50px]) 사용. 폰트 크기 등 약간의 반응형이 허용되는 값에만 moderateScale 제한적으로 허용.

레이아웃 의도 추론 — Figma 좌표를 문자 그대로 고정값으로 옮기지 말 것:
- Figma는 하나의 고정 캔버스 높이(예: 874px)에 대한 스냅샷일 뿐, 실제 기기 화면 높이는 이보다 크거나 작을 수 있음. 요소 사이 좌표 차이를 전부 mt-[Npx] 같은 고정값으로 옮기면, 캔버스보다 큰 화면에서 콘텐츠가 위로 쏠리고 하단에 의도치 않은 빈 여백이 크게 남음.
- 화면을 구성하기 전에 먼저 판단할 것: 이 화면에서 "고정 간격이어야 하는 요소"와 "화면 크기에 따라 늘어나야 하는 유동 영역"이 무엇인지. 흔한 패턴:
  - 약관/저작권 등 legal 텍스트, 하단 CTA 버튼 — 화면 크기와 무관하게 항상 하단에 붙어야 함
  - 상단 타이틀/폼 블록 — 화면이 커지면 전체가 살짝 아래로 내려가며 여유 공간을 나눠 갖는 경우가 많음 (완전히 위에 고정된 채로 남지 않음)
- 구현 방법: 유동 영역에는 View style={{ flexGrow: N }} 스페이서를 넣고(ScrollView라면 contentContainerStyle에 flexGrow: 1 필수), 하단 고정 요소가 더 많은 비중을 갖도록 스페이서의 flexGrow 비율을 조정(예: 상단 1 : 하단 3). margin: auto는 flexGrow 스페이서와 섞으면 우선순위가 불명확해지므로 피할 것.
- 판단이 애매하면 코드 생성 후 notes에 "이 화면의 여백을 고정값으로 처리함 — 큰 화면에서 여백이 어색할 수 있으니 확인 필요"라고 명시할 것.
`

const API_ENDPOINTS = `
현재 sports-master-api에 구현된 관련 엔드포인트 (Swagger 기준):
- POST /auth/register (일반 회원가입: email, password, name, phone, mode)
- POST /auth/login (일반 로그인: email, password)
- POST /auth/kakao, /auth/apple, /auth/google (OAuth 로그인/회원가입)
- POST /auth/refresh (자동 로그인용 Access Token 재발급)
- POST /auth/logout, DELETE /auth/withdraw
- GET /home/expert-grade (명인등급 조회)
- POST /home/review-request (리뷰 요청 링크 생성)
- GET /home/diagnosis-requests/preview (요청진단 미리보기, 최대 3개)
- PATCH /home/mode (명인/고객 모드 전환)

화면 목적에 맞는 엔드포인트만 골라 사용하세요. 목적에 맞는 엔드포인트가 전혀 없으면 notes에 명시하고 연동을 생략하세요.
`

// ─── Phase 1: Figma 분석 (다중 화면 인식) ───────────────────────────────────

phase('Figma 분석')
log(`Figma 디자인 분석 중: ${figmaUrl}`)

const analysisResult = await agent(
  `다음 Figma 링크의 디자인을 분석하세요: ${figmaUrl}

이 링크는 하나의 화면이 아니라 여러 화면(단계, 팝업, 상태 분기 포함)을 포함한 플로우 프레임일 수 있습니다.

절차:
1. Figma MCP 도구(get_design_context, get_screenshot, get_variable_defs)를 사용해 실제 디자인 데이터를 가져올 것 — 추측 금지
2. 프레임 안에 시각적으로 구분되는 화면(예: 로그인 화면, 비밀번호 재설정 팝업, 회원가입 1단계, 회원가입 2단계 등)이 여러 개 있는지 확인
3. 각 화면마다: 레이아웃/컴포넌트 계층, 디자인 토큰(색상 hex, 폰트, spacing), 리스트/반복 요소 여부, 인터랙션 요소, 텍스트/아이콘 배치, 화면 이름(PascalCase 영문)과 목적을 정리
4. 화면이 하나뿐이면 screens 배열 길이 1로 반환
5. apiHint에는 이 화면이 서버와 주고받을 것으로 보이는 데이터/액션을 간단히 적을 것 (예: "이메일/비밀번호로 로그인 요청, 실패 시 에러 메시지 표시")`,
  { schema: SCREENS_SCHEMA, label: 'Figma Design Analyzer' },
)

const allScreens = analysisResult.screens
log(`화면 분해 완료: ${allScreens.length}개 화면 발견 (${allScreens.map(s => s.screenName).join(', ')})`)

const targetScreens = screenName ? allScreens.filter(s => s.screenName === screenName) : allScreens

if (targetScreens.length === 0) {
  throw new Error(
    `screenName "${screenName}"과 일치하는 화면을 찾지 못했습니다. 발견된 화면: ${allScreens.map(s => s.screenName).join(', ')}`,
  )
}

// ─── 화면별 파이프라인 ────────────────────────────────────────────────────────

const screenResults = await pipeline(
  targetScreens,

  // Stage 1: 화면 코드 생성
  async screen => {
    phase('화면 코드 생성')
    const codeResult = await agent(
      `아래 디자인 스펙을 바탕으로 React Native(Expo) 화면과 하위 컴포넌트 코드를 생성하세요.

화면 이름: ${screen.screenName}
목적: ${screen.purpose}
컴포넌트 트리: ${screen.componentTree}
디자인 토큰: ${screen.designTokens ?? '(없음)'}
리스트/반복 요소: ${screen.listOrRepeats ?? '(없음)'}
인터랙션: ${screen.interactions}
서버 연동 힌트: ${screen.apiHint ?? '(없음)'}

${RN_RULES}

생성 규칙:
1. 화면 컴포넌트는 src/screens/{ScreenName}/{ScreenName}Screen.tsx — 단, sports-master-web/src/screens/ 안에 이미 같은 목적의 화면 파일이 있으면(예: Login/LoginScreen.tsx, SignUp/SignUpScreen.tsx) 먼저 Read로 읽어서 기존 UI 구조와 스타일을 최대한 유지하고 그 파일을 갱신하는 방식으로 작업
2. 재사용 가능한 하위 컴포넌트는 src/components/{ComponentName}.tsx로 분리 — 기존 컴포넌트(src/components/)가 있으면 재사용
3. 이 화면이 폼을 통해 서버로 보내는 실제 필드명을 formFields에 전부 나열 (예: ["email", "password", "nickname"]). 폼이 없으면 빈 배열
4. API 연동 코드는 이 단계에서 작성하지 말 것 (다음 단계에서 처리) — 폼/화면 UI만 완성
5. 디자인에서 확인 불가능하거나 추정한 부분은 notes에 명시
6. 모든 파일 전체 코드를 반환`,
      { schema: CODE_SCHEMA, label: `Screen Code Generator: ${screen.screenName}`, phase: '화면 코드 생성' },
    )
    log(`[${screen.screenName}] 코드 생성 완료: ${codeResult.files.length}개 파일, formFields: ${codeResult.formFields.join(', ') || '없음'}`)
    return { screen, codeResult }
  },

  // Stage 2: 백엔드 DTO 정합성 확인/수정
  async ({ screen, codeResult }) => {
    phase('백엔드 정합성 확인/수정')

    if (codeResult.formFields.length === 0) {
      log(`[${screen.screenName}] 폼 없음 — 백엔드 정합성 확인 생략`)
      return { screen, codeResult, backendResult: { mismatchFound: false, changes: [], typesRegenerated: false } }
    }

    const backendResult = await agent(
      `sports-master-web의 "${screen.screenName}" 화면(목적: ${screen.purpose})이 실제로 입력받는 폼 필드는 다음과 같습니다:
${JSON.stringify(codeResult.formFields, null, 2)}

절차:
1. 이 화면이 어떤 sports-master-api 도메인(auth/home/users/certifications 등)과 연관되는지 판단
2. Read 도구로 sports-master-api/src/modules/{도메인}/dto/*.ts, {도메인}.entity.ts, {도메인}.service.ts, {도메인}.controller.ts를 직접 읽어 현재 필드 구성 파악
3. 화면의 formFields와 DTO 필드를 비교:
   - 화면에 필요한 필드가 DTO에 없으면 DTO에 추가 (@ApiProperty, class-validator 데코레이터 포함)
   - DTO에는 필수로 있는데 화면에서 입력받지 않는 필드가 있으면, 해당 필드를 optional로 바꾸거나 DTO에서 제거 (제거 시 Entity/Service에서의 사용처도 함께 정리)
   - UI/UX가 우선이므로 화면에 없는 필드를 억지로 유지하지 말 것
4. 불일치를 발견해 수정했다면 Edit 도구로 실제 파일을 수정 (sports-master-api/CLAUDE.md의 DTO/컨벤션 규칙 준수: @ApiProperty 필수, class-validator 필수, 응답은 @ApiDataResponse 등)
5. 파일을 하나라도 수정했다면 Bash로 "cd sports-master-web && pnpm generate-types" 를 실행해 프론트 타입(schema.ts)을 최신 상태로 갱신
6. 불일치가 없으면 아무 파일도 수정하지 말고 mismatchFound: false 반환`,
      { schema: BACKEND_SCHEMA, label: `Backend Sync: ${screen.screenName}`, phase: '백엔드 정합성 확인/수정' },
    )

    if (backendResult.mismatchFound) {
      log(`[${screen.screenName}] 백엔드 정합화: ${backendResult.changes.length}개 파일 수정 (${backendResult.changes.map(c => c.path).join(', ')})`)
    } else {
      log(`[${screen.screenName}] 백엔드 정합성 문제 없음`)
    }

    return { screen, codeResult, backendResult }
  },

  // Stage 3: API 연동 코드 작성
  async ({ screen, codeResult, backendResult }) => {
    phase('API 연동')

    const currentCodeText = codeResult.files.map(f => `// ${f.path}\n${f.code}`).join('\n\n---\n\n')

    if (codeResult.formFields.length === 0 && !/api|server|데이터|목록|조회/i.test(screen.apiHint ?? '')) {
      log(`[${screen.screenName}] API 연동 대상 아님 — 생략`)
      return { screen, codeResult, backendResult, apiResult: codeResult }
    }

    const apiResult = await agent(
      `다음 화면 코드에 실제 API 연동을 추가하세요.

화면 이름: ${screen.screenName}
서버 연동 힌트: ${screen.apiHint ?? '(없음)'}
${API_ENDPOINTS}

=== 현재 화면 코드 ===
${currentCodeText}

작업 규칙:
1. sports-master-web/src/types/schema.ts 를 Read로 읽어 최신 요청/응답 타입을 확인하고 import해서 사용 (${backendResult.typesRegenerated ? '방금 백엔드 수정 후 재생성된 최신 타입임' : '기존 타입'})
2. sports-master-web/src/api/, src/hooks/ 를 Read로 확인 후, axios 인스턴스가 없으면 src/api/client.ts에 간단히 생성, TanStack Query useMutation/useQuery 훅을 src/hooks/에 실제로 작성 (주석 스텁 금지)
3. 화면 컴포넌트에서 해당 훅을 사용해 실제 폼 제출/데이터 조회가 동작하도록 연결
4. 로그인 성공 시 자동 로그인(refreshToken) 저장이 필요하면, 프로젝트에 이미 있는 저장소 패턴을 Read로 확인 후 사용. 없으면 저장 로직은 주석으로 "expo-secure-store 설치 후 사용" 이라고 표시하고 notes에 기록 (새 패키지 설치는 하지 말 것)
5. 에러 발생 시 사용자에게 에러 메시지를 보여주는 처리 포함
6. 수정/추가된 파일 전체 코드를 반환 (files, formFields는 그대로, notes는 갱신)`,
      { schema: CODE_SCHEMA, label: `API Integrator: ${screen.screenName}`, phase: 'API 연동' },
    )

    log(`[${screen.screenName}] API 연동 완료: ${apiResult.files.length}개 파일`)
    return { screen, codeResult, backendResult, apiResult }
  },

  // Stage 4: 병렬 리뷰 (5개 관점)
  async ({ screen, codeResult, backendResult, apiResult }) => {
    phase('병렬 리뷰')
    const codeText = apiResult.files.map(f => `// ${f.path}\n${f.code}`).join('\n\n---\n\n')

    const [structureReview, rnRuleReview, a11yReview, nativeCompatReview, apiReview] = await parallel([
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
          { schema: REVIEW_SCHEMA, label: `Reviewer 구조/Import: ${screen.screenName}`, phase: '병렬 리뷰' },
        ),
      () =>
        agent(
          `다음 코드가 RN 필수 규칙을 준수하는지 검토하세요.

${RN_RULES}

=== 코드 ===
${codeText}

각 위반 사항에 severity, 파일, 문제, 수정 방법을 명시하세요.`,
          { schema: REVIEW_SCHEMA, label: `Reviewer RN 규칙: ${screen.screenName}`, phase: '병렬 리뷰' },
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
4. 텍스트 대비/폰트 크기가 지나치게 작지 않은지`,
          { schema: REVIEW_SCHEMA, label: `Reviewer 접근성/터치: ${screen.screenName}`, phase: '병렬 리뷰' },
        ),
      () =>
        agent(
          `다음 코드가 웹 미리보기(react-native-web)뿐 아니라 iOS/Android 시뮬레이터에서도 동일하게 렌더링되는지 검토하세요.

=== 코드 ===
${codeText}

검토 항목:
1. hover:, focus:, group-hover: 등 pseudo-class 클래스 사용 여부
2. useNativeDriver 없는 Animated 사용 또는 reanimated worklet 규칙 위반 여부
3. grid, display: block 등 Flexbox가 아닌 CSS 레이아웃 사용 여부
4. box-shadow 형태의 순수 CSS 그림자 클래스/스타일 사용 여부
5. Image 컴포넌트에 width/height 없이 auto 의존하는 부분
6. 과도하게 복잡한 임의값(arbitrary value) 조합`,
          { schema: REVIEW_SCHEMA, label: `Reviewer 네이티브 호환성: ${screen.screenName}`, phase: '병렬 리뷰' },
        ),
      () =>
        agent(
          `다음 코드의 API 연동 정합성을 검토하세요.

=== 코드 ===
${codeText}

=== 참고: 백엔드 정합화 결과 ===
${JSON.stringify(backendResult, null, 2)}

검토 항목:
1. 요청/응답 타입이 sports-master-web/src/types/schema.ts (Read로 확인)와 일치하는지
2. 로딩/에러 상태 처리가 되어있는지 (로그인 실패, 네트워크 에러 등)
3. 백엔드가 수정되었다면(backendResult.mismatchFound) 그 변경이 sports-master-api/CLAUDE.md 컨벤션(@ApiProperty, class-validator, @ApiDataResponse 등)을 지키는지 해당 파일을 Read로 확인
4. TanStack Query 사용 패턴(mutation/query key 등)이 적절한지`,
          { schema: REVIEW_SCHEMA, label: `Reviewer API 정합성: ${screen.screenName}`, phase: '병렬 리뷰' },
        ),
    ])

    const allFindings = [
      ...(structureReview?.findings ?? []),
      ...(rnRuleReview?.findings ?? []),
      ...(a11yReview?.findings ?? []),
      ...(nativeCompatReview?.findings ?? []),
      ...(apiReview?.findings ?? []),
    ].filter(Boolean)

    return {
      screen,
      codeResult: apiResult,
      backendResult,
      reviews: { structure: structureReview, rnRules: rnRuleReview, a11y: a11yReview, nativeCompat: nativeCompatReview, api: apiReview },
      findings: allFindings,
    }
  },

  // Stage 5: 수정 적용
  async ({ screen, codeResult, backendResult, reviews, findings }) => {
    phase('수정 적용')

    const errorCount = findings.filter(f => f.severity === 'error').length
    const warningCount = findings.filter(f => f.severity === 'warning').length
    log(`[${screen.screenName}] 발견된 문제: error ${errorCount}개, warning ${warningCount}개 — 수정 적용 중...`)

    const codeText = codeResult.files.map(f => `// ${f.path}\n${f.code}`).join('\n\n---\n\n')

    const fixResult = await agent(
      `다음 리뷰 결과를 바탕으로 화면/컴포넌트 코드를 수정하세요.

=== 리뷰 결과 (우선순위: error > warning > suggestion) ===
${JSON.stringify(findings, null, 2)}

=== 현재 코드 ===
${codeText}

${RN_RULES}

수정 규칙:
1. error, warning은 반드시 수정
2. suggestion은 판단하여 적용
3. 수정이 필요없는 파일은 files에 포함하지 말 것
4. 수정 시 해당 파일 전체 코드 반환`,
      { schema: FIX_SCHEMA, label: `Fixer: ${screen.screenName}`, phase: '수정 적용' },
    )

    log(`[${screen.screenName}] 수정 완료: ${fixResult.files.length}개 파일 수정, ${fixResult.skipped.length}개 수동 처리 필요`)

    return {
      screenName: screen.screenName,
      purpose: screen.purpose,
      generated: codeResult,
      backendChanges: backendResult,
      reviews,
      findings,
      fix: fixResult,
    }
  },
)

return {
  figmaUrl,
  screens: screenResults.filter(Boolean),
}
