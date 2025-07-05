import type { App } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 安装pinia全局状态库
export function setupStore(app: App) {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
}
