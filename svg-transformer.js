const { createTransformer } = require('react-native-svg-transformer');

const upstreamTransformer = (() => {
  const candidates = [
    '@expo/metro-config/babel-transformer',
    '@react-native/metro-babel-transformer',
    'metro-react-native-babel-transformer',
  ];
  for (const id of candidates) {
    try {
      return require(id);
    } catch {}
  }
  // pnpm 가상 경로 fallback
  const fallbackPaths = [
    require.resolve(
      '@expo/metro-config/build/babel-transformer',
      { paths: [require.resolve('expo/package.json').replace('/package.json', '')] }
    ),
  ];
  return require(fallbackPaths[0]);
})();

module.exports = {
  ...upstreamTransformer,
  transform: createTransformer(upstreamTransformer),
};
