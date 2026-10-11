import prettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

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
      'react/react-in-jsx-scope': 'off',
      // 기기별 크기 차이 방지 — docs: CLAUDE.md "기기 크기 대응"
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'TextInput'],
              message:
                "'@/components/AppText' 의 Text/TextInput 을 사용하세요 (글자 확대 상한·Android font padding 처리).",
            },
            {
              name: 'react-native-size-matters',
              message:
                'Figma px 를 고정값으로 사용하세요. 기기 폭 비례 스케일은 기기마다 크기가 달라집니다.',
            },
          ],
        },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['src/components/AppText.tsx'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'src/types/schema.ts',
      'metro.config.js',
      'babel.config.js',
      'tailwind.config.js',
    ],
  }
)
