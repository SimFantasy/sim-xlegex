<template>
  <div class="settings-overlay" @click="closeSettings">
    <div class="settings-modal" @click.stop>
      <div class="settings-header">
        <h2>游戏设置</h2>
        <button class="close-btn" @click="closeSettings">
          <Icon icon="tabler:x" />
        </button>
      </div>

      <div class="settings-content">
        <div class="setting-section">
          <h3>基础设置</h3>

          <div class="setting-item">
            <label>
              <Icon icon="tabler:edit" />
              游戏标题：
            </label>
            <input v-model="localConfig.title" type="text" class="setting-input" />
          </div>

          <div class="setting-item">
            <label>
              <Icon icon="tabler:palette" />
              卡牌主题：
            </label>
            <select v-model="localConfig.cardTheme" class="setting-select">
              <option value="1">主题1</option>
              <option value="2">主题2</option>
              <option value="3">主题3</option>
            </select>
          </div>

          <div class="setting-item">
            <label>
              <Icon icon="tabler:trash" />
              移出卡牌数量：
            </label>
            <input
              v-model.number="localConfig.removeCount"
              type="number"
              min="1"
              max="7"
              class="setting-input"
            />
          </div>

          <div class="setting-item">
            <label>
              <Icon icon="tabler:arrow-back-up" />
              撤回步数：
            </label>
            <input
              v-model.number="localConfig.backCount"
              type="number"
              min="1"
              max="10"
              class="setting-input"
            />
          </div>

          <div class="setting-item">
            <label>
              <Icon icon="tabler:volume" />
              音效开关：
            </label>
            <button
              class="toggle-btn"
              :class="{ active: localConfig.soundEnabled }"
              @click="localConfig.soundEnabled = !localConfig.soundEnabled"
            >
              <Icon :icon="localConfig.soundEnabled ? 'tabler:volume' : 'tabler:volume-off'" />
              {{ localConfig.soundEnabled ? '开启' : '关闭' }}
            </button>
          </div>
        </div>

        <div class="setting-section">
          <h3>关卡设置</h3>

          <div class="level-list">
            <div v-for="(level, index) in localLevelConfig" :key="index" class="level-item">
              <span class="level-title">第{{ index + 1 }}关</span>
              <div class="level-controls">
                <label>卡牌种类：</label>
                <input
                  v-model.number="level.cardNum"
                  type="number"
                  min="3"
                  max="50"
                  class="level-input"
                />
                <label>层数：</label>
                <input
                  v-model.number="level.layerNum"
                  type="number"
                  min="2"
                  max="15"
                  class="level-input"
                />
                <label>陷阱：</label>
                <input v-model="level.trap" type="checkbox" class="level-checkbox" />
                <button
                  class="remove-level-btn"
                  @click="removeLevelConfig(index)"
                  :disabled="localLevelConfig.length <= 1"
                >
                  <Icon icon="tabler:trash" />
                </button>
              </div>
            </div>
          </div>

          <button class="add-level-btn" @click="addLevelConfig">
            <Icon icon="tabler:plus" />
            添加关卡
          </button>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn btn-secondary" @click="resetSettings">
          <Icon icon="tabler:refresh" />
          重置默认
        </button>
        <button class="btn btn-primary" @click="saveSettings">
          <Icon icon="tabler:device-floppy" />
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useGameStore, type GameConfig } from '@/store/modules/game'

const emit = defineEmits(['close'])
const gameStore = useGameStore()

// 本地配置副本
const localConfig = ref<GameConfig>({ ...gameStore.config })
const localLevelConfig = ref([...gameStore.levelConfig])

const closeSettings = () => {
  emit('close')
}

const saveSettings = () => {
  gameStore.updateConfig(localConfig.value)
  gameStore.updateLevelConfig(localLevelConfig.value)
  closeSettings()
}

const resetSettings = () => {
  gameStore.resetConfig()
  localConfig.value = { ...gameStore.config }
  localLevelConfig.value = [...gameStore.levelConfig]
}

const addLevelConfig = () => {
  localLevelConfig.value.push({
    cardNum: 20,
    layerNum: 8,
    trap: true
  })
}

const removeLevelConfig = (index: number) => {
  if (localLevelConfig.value.length > 1) {
    localLevelConfig.value.splice(index, 1)
  }
}

onMounted(() => {
  localConfig.value = { ...gameStore.config }
  localLevelConfig.value = [...gameStore.levelConfig]
})
</script>

<style scoped>
@reference '@/assets/styles/main.css';

.settings-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/50;
}

.settings-modal {
  @apply bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto;
}

.settings-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.settings-header h2 {
  @apply text-xl font-semibold text-gray-800;
}

.close-btn {
  @apply text-2xl text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1 rounded hover:bg-gray-100;
}

.settings-content {
  @apply p-4 space-y-6;
}

.setting-section {
  @apply space-y-4;
}

.setting-section h3 {
  @apply text-lg font-medium text-gray-800 border-b border-gray-200 pb-2;
}

.setting-item {
  @apply flex items-center justify-between;
}

.setting-item label {
  @apply flex items-center gap-2 text-sm font-medium text-gray-700 min-w-[120px];
}

.setting-input,
.setting-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.toggle-btn {
  @apply flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors;
}

.toggle-btn.active {
  @apply bg-blue-100 border-blue-300 text-blue-700;
}

.level-list {
  @apply space-y-3;
}

.level-item {
  @apply p-3 border border-gray-200 rounded-md;
}

.level-title {
  @apply font-medium text-gray-800 block mb-2;
}

.level-controls {
  @apply flex items-center gap-2 flex-wrap;
}

.level-controls label {
  @apply text-sm text-gray-600;
}

.level-input {
  @apply w-16 px-2 py-1 border border-gray-300 rounded text-sm;
}

.level-checkbox {
  @apply w-4 h-4;
}

.remove-level-btn {
  @apply p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed;
}

.add-level-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 transition-colors;
}

.settings-footer {
  @apply flex justify-end gap-2 p-4 border-t border-gray-200;
}

.btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500;
}
</style>
