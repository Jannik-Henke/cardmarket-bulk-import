import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/auto-icons',
    '@wxt-dev/i18n/module',
  ],
  manifest: {
    name: 'Cardmarket Bulk Import',
    default_locale: 'en',
    // Explicit add-on ID so the build can be signed for permanent Firefox
    // installation (AMO unlisted / self-distribution requires a stable ID).
    browser_specific_settings: {
      gecko: {
        id: 'cardmarket-bulk-import@jannikhenke.dev',
        strict_min_version: '109.0',
      },
    },
  },
  zip: {
    sourcesRoot: 'src',
  },
  srcDir: 'src',
  imports: false,
  vite: () => ({
    plugins: [nodePolyfills()],
  }),
});
