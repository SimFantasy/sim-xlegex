import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

import vueDevTools from 'vite-plugin-vue-devtools'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import tailwindcss from '@tailwindcss/vite'

import type { ComponentResolver } from 'unplugin-vue-components/types'

const IconResolver: ComponentResolver = name => {
  if (name === 'Icon') {
    return {
      name: 'Icon',
      from: '@iconify/vue'
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    vueSetupExtend(),
    tailwindcss(),
    AutoImport({
      dts: 'src/types/auto-imports.d.ts',
      imports: ['vue', 'pinia', { '@iconify/vue': ['Icon'] }]
    }),
    Components({
      dts: 'src/types/components.d.ts',
      resolvers: [IconResolver],
      dirs: ['src/components', 'src/views'] // 指定自动导入的组件位置，默认是 src/components
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
