# Sports Master — 개발 컨텍스트

## 프로젝트 개요

- **플랫폼**: React Native (Expo)
- **스타일**: NativeWind (Tailwind CSS for RN)
- **상태관리**: Zustand (클라이언트), TanStack Query (서버)
- **네트워크**: Axios + openapi-typescript (Swagger → 타입 자동 생성)
- **폼**: react-hook-form + zod
- **에러트래킹**: Sentry (@sentry/react-native)
- **패키지매니저**: pnpm

---

## 코드 컨벤션

### 타입 생성 (필수)

백엔드 Swagger 스펙에서 타입 자동 생성 — 손으로 API 타입 작성 금지

```bash
pnpm run generate-types
# openapi-typescript {SWAGGER_URL}/swagger-yaml --output ./src/types/schema.ts
```

### 커밋 메시지

```
feat: 기능 추가
fix: 버그 수정
refactor: 리팩토링
docs: 문서
chore: 설정, 빌드
```

---

## ESLint 규칙

```js
// eslint.config.js
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettier,
  {
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off', // React 17+ 불필요
    },
  }
)
```

---

## Prettier 규칙

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "importOrder": ["^react", "^expo", "^@tanstack", "^@/", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

---

## React Native 필수 규칙

### 스타일링

- **NativeWind(className) 우선** — StyleSheet.create는 플랫폼 분기 필요한 경우에만
- 인라인 스타일 객체 금지 (`style={{ padding: 16 }}` X)

```tsx
// Good
<View className="flex-row p-4 bg-white" />

// 플랫폼 분기 필요 시
<View style={Platform.select({ ios: { shadowOpacity: 0.2 }, android: { elevation: 4 } })} />
```

### 리스트 렌더링

- **`map()` 금지** — 반드시 `FlatList` 또는 `FlashList` 사용

```tsx
// Bad
{items.map(item => <Item key={item.id} {...item} />)}

// Good
<FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <Item {...item} />}
/>
```

### 터치 영역

- `TouchableOpacity` 금지 → `Pressable` 사용
- 최소 터치 영역 44x44pt — `hitSlop={8}` 으로 보정

```tsx
<Pressable hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
```

### 이미지

- `width/height` 반드시 명시 (웹과 달리 auto 없음)
- 외부 이미지는 `expo-image` 사용 (캐싱)

```tsx
import { Image } from 'expo-image'
<Image source={{ uri }} style={{ width: 100, height: 100 }} />
```

### 키보드

- 입력 폼 있는 화면은 `KeyboardAvoidingView` 필수

```tsx
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <TextInput />
</KeyboardAvoidingView>
```

### 애니메이션

- 반드시 `useNativeDriver: true` — JS Thread 블로킹 방지
- 복잡한 애니메이션 → `react-native-reanimated` worklet

### 메모이제이션

```tsx
// FlatList renderItem은 반드시 useCallback
const renderItem = useCallback(({ item }) => <Item {...item} />, [])

// 무거운 컴포넌트
export default memo(HeavyComponent)
```

### 플랫폼 분기

```tsx
// 값 분기
Platform.select({ ios: 8, android: 12 })

// 파일 분기 (복잡한 경우)
Component.ios.tsx
Component.android.tsx
```

### 퍼미션

- 요청 전 상태 확인 필수
- 거부 시 안내 UI 필수 (스토어 리젝 사유)

```tsx
const { status } = await Camera.requestCameraPermissionsAsync()
if (status !== 'granted') { /* 안내 UI */ }
```

### NativeWind 웹 Tailwind 차이

| 웹 | NativeWind |
|---|---|
| `hover:`, `focus:` | 미지원 |
| `grid`, `display: block` | 없음 (Flexbox만) |
| 임의값 `w-[123px]` | 지원 |
| `overflow-hidden` | iOS/Android 동작 차이 주의 |

### 기기 크기 대응 (Figma 1px = RN 1pt)

실기기에서 크기가 달라지는 원인은 ① 시스템 글자 크기 설정 ② 기기 폭 비례 스케일 ③ iPad 네이티브 레이아웃 ④ 폰트 파일 누락(시스템 폰트 대체)이다.

- **크기는 고정, 공간은 유연**: 글자·버튼·아이콘 크기는 Figma 값 그대로 고정(`text-[17px]`, `h-[50px]`). 화면 폭 차이는 `flex-1`, `w-full` + 좌우 padding, `ScrollView`로 흡수. 고정 폭(`w-[340px]`)은 375pt 기기에서도 들어가는지 확인
- **`react-native-size-matters` 등 폭 비례 스케일 금지** (eslint 차단, 패키지 제거됨)
- **`Text`/`TextInput`은 `@/components/AppText`에서 import** (eslint 차단) — 시스템 글자 확대 상한 `MAX_FONT_SCALE = 1.2`, Android `includeFontPadding: false` 적용. 고정 높이 컨테이너는 1.2배 글자에서도 잘리지 않아야 함
- **폰트**: `fontFamily`로 쓰는 Pretendard weight는 반드시 `src/assets/fonts`에 있고 `App.tsx` `useFonts`에 등록돼 있어야 함 (Android는 custom font에 `fontWeight`가 적용되지 않음 → weight별 family 사용)
- **iPad**: `supportsTablet: false` — iPhone 호환 모드로 Figma와 동일하게 표시 (iPad 전용 디자인 생기기 전까지 유지)
- 화면 작업 후 iPhone SE / 16 Pro / Pro Max + 시스템 글자 최대 설정에서 확인

---

## Claude Code 워크플로우(.claude/workflows/*.workflow.js) 작성 시 토큰 최적화 원칙

Figma → 코드 워크플로우는 화면 하나당 여러 에이전트를 호출하고, 그 안에서 같은 규칙 텍스트/전체 코드를 반복해서 프롬프트에 넣기 쉬워 토큰이 빠르게 늘어난다. 워크플로우를 새로 만들거나 수정할 때 다음을 지킬 것:

- **병렬 리뷰어 수를 최소화**: 관점이 겹치는 리뷰(구조/컨벤션/플랫폼호환성 등)는 하나의 에이전트로 합칠 것. 서로 완전히 다른 전문성이 필요한 경우(예: API 정합성)만 분리.
- **조건부 실행 우선**: 백엔드 정합화, API 연동 리뷰, 수정(Fixer) 등은 실제로 필요한 경우(폼 존재, 리뷰에서 문제 발견 등)에만 에이전트를 호출 — 조건에 안 맞으면 기본값만 반환하고 에이전트 호출 자체를 생략. (`dto-to-module.workflow.js`의 "리뷰에서 문제 없으면 Fixer 생략" 패턴 참고)
- **긴 규칙 텍스트는 필요한 단계에만**: `RN_RULES`처럼 긴 상수 텍스트를 여러 에이전트 프롬프트에 그대로 반복 삽입하지 말 것. 코드를 새로 작성하는 단계(생성)에는 전체 규칙을, 리뷰/수정 단계에는 해당 리뷰 관점에 필요한 항목만 요약해서 전달.
- **저비용 모델/effort 활용**: 단순 필터링·요약처럼 깊은 추론이 필요 없는 단계는 `effort: 'low'`, `model: 'haiku'` 등을 지정 (`dto-to-module.workflow.js`의 Notion 규칙 추출 단계 참고). 코드 생성/수정처럼 품질이 중요한 단계만 기본 모델 유지.
- **화면 수 과다 생성 방지**: Figma 분석 단계에서 같은 화면의 상태 변형(입력중/에러/포커스 등)을 별도 화면으로 쪼개지 않도록 — 화면 수가 늘어나면 파이프라인 전체(생성+리뷰+수정)가 그만큼 반복돼 토큰이 배로 늘어남.
- **재검증 워크플로우는 필요할 때만 수동 실행**: `design-fidelity-review`처럼 사후 정밀 대조가 필요한 워크플로우는 생성 파이프라인에 자동으로 끼워넣지 말고 별도 실행으로 유지 — 매번 자동 실행되면 비용이 누적됨.

---

## Figma 동기화 (/figma-sync)

- 감시 대상·화면 매핑: `.claude/figma/registry.json` (스냅샷: `.claude/figma/snapshots/`) — 스크립트로만 갱신, 직접 편집은 `screen`/`ignore` 필드만
- 새 화면을 Figma로 만들었으면 반드시 `pnpm figma:sync link <nodeId> <ScreenName>`으로 등록 (미등록 시 다음 sync에서 "신규 프레임"으로 다시 잡힘)

---

## Figma 구현 전 필수 확인 항목

화면 코드를 작성하기 **전에** Figma에서 아래 세 가지를 반드시 파악할 것.
파악 없이 구현하면 구현 후 재수정이 발생한다.

| # | 항목 | 확인 내용 |
|---|------|-----------|
| 1 | **배경색** | 화면 bg, 패널 bg, 아이템 bg — 같아 보여도 다를 수 있음 (예: `#F2F2F2` vs `#FFFFFF`) |
| 2 | **아이템 구분선/간격** | `ItemSeparatorComponent` 필요 여부, 높이값 (shadow가 separator 역할이면 gap 필수) |
| 3 | **Shadow 방향과 색** | `shadowOffset` x/y 부호, `shadowOpacity`, `shadowRadius` — 특히 패널 상단 shadow는 y 음수 |

---

## 체크리스트 (PR 전)

```
□ generate-types 실행 후 타입 최신화 확인
□ 인라인 스타일 없음
□ 리스트 → FlatList/FlashList
□ 터치 → Pressable + hitSlop
□ 키보드 → KeyboardAvoidingView
□ 애니메이션 → useNativeDriver: true
□ 퍼미션 → 거부 UI 처리
□ typecheck 통과 (pnpm typecheck)
□ lint 통과 (pnpm lint:fix)
□ Text/TextInput → @/components/AppText, 폭 비례 스케일 없음
```
