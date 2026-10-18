const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const reactNativePlugin = require('eslint-plugin-react-native');
const tanstackPluginRecommended = require('@tanstack/eslint-plugin-query');
const fs = require('fs');
const path = require('path');

/**
 * FSD (Feature-Sliced Design) layer hierarchy (top to bottom):
 *   app → screens → widgets → features → entities → shared
 *
 * Rules:
 *   1. Lower layers cannot import from upper layers (error)
 *   2. Slices within the same layer cannot import from each other (error)
 *   3. External consumers must use the slice's public API (index.ts), not its internals (error)
 */

/** Read subdirectory names of an FSD layer (auto-discovers slices). */
function getSlices(layer) {
  const dir = path.resolve(__dirname, `src/${layer}`);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/** Generate cross-slice isolation zones for a given FSD layer. */
function crossSliceZones(layer) {
  return getSlices(layer).map((slice) => ({
    target: `./src/${layer}/${slice}/**/*`,
    from: `./src/${layer}`,
    except: [`./${slice}`],
    message: `FSD: "${slice}" cannot import from sibling slices in "${layer}"`,
  }));
}

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  ...tanstackPluginRecommended.configs['flat/recommended'],
  {
    ignores: ['dist/', 'node_modules/', 'ios/', 'android/', '*.config.js', 'babel.config.js'],
    plugins: {
      'react-native': reactNativePlugin,
    },
    rules: {
      'react-native/no-color-literals': 'error',
      'react-native/no-single-element-style-arrays': 'error',
      'react-native/no-unused-styles': 'error',
    },
  },

  // ─── FSD: Layer hierarchy + Cross-slice isolation ─────────────────────────
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared/**/*',
              from: './src/{entities,features,widgets,screens,app}/**/*',
              message: 'FSD: shared cannot import from upper layers',
            },
            {
              target: './src/entities/**/*',
              from: './src/{features,widgets,screens,app}/**/*',
              message: 'FSD: entities cannot import from upper layers',
            },
            {
              target: './src/features/**/*',
              from: './src/{widgets,screens,app}/**/*',
              message: 'FSD: features cannot import from upper layers (widgets, screens, app)',
            },
            {
              target: './src/widgets/**/*',
              from: './src/{screens,app}/**/*',
              message: 'FSD: widgets cannot import from upper layers (screens, app)',
            },
            {
              target: './src/screens/**/*',
              from: './src/app/**/*',
              message: 'FSD: screens cannot import from app layer',
            },
            ...crossSliceZones('entities'),
            ...crossSliceZones('features'),
            ...crossSliceZones('widgets'),
          ],
        },
      ],

      // ─── FSD: Public API enforcement (no deep imports into slice internals) ──
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/shared/ui/*/*'],
              message: 'FSD: Import from the public API (src/shared/ui) instead of its internals',
            },
            {
              group: ['src/shared/model/stores/*'],
              message: 'FSD: Import from the public API (src/shared/model) instead of store internals',
            },
            {
              group: [
                'src/entities/*/ui/*',
                'src/entities/*/model/*',
                'src/entities/*/lib/*',
                'src/entities/*/api/*',
              ],
              message: 'FSD: Import from the public API (src/entities/<slice>) instead of its internals',
            },
            {
              group: [
                'src/features/*/ui/*',
                'src/features/*/model/*',
                'src/features/*/lib/*',
                'src/features/*/api/*',
              ],
              message: 'FSD: Import from the public API (src/features/<slice>) instead of its internals',
            },
            {
              group: [
                'src/widgets/*/ui/*',
                'src/widgets/*/model/*',
                'src/widgets/*/lib/*',
                'src/widgets/*/api/*',
              ],
              message: 'FSD: Import from the public API (src/widgets/<slice>) instead of its internals',
            },
          ],
        },
      ],
    },
  },
]);
