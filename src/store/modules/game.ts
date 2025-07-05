import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GameConfig {
  title: string
  cardTheme: string
  removeCount: number
  backCount: number
  soundEnabled: boolean
}

const defaultConfig: GameConfig = {
  title: '兔了个兔',
  cardTheme: '1',
  removeCount: 3,
  backCount: 1,
  soundEnabled: true
}

export const useGameStore = defineStore(
  'game',
  () => {
    // 游戏配置
    const config = ref<GameConfig>({ ...defaultConfig })

    // 游戏状态
    const currentLevel = ref(1)
    const isWin = ref(false)
    const showTip = ref(false)
    const showSettings = ref(false)
    const remainingBackCount = ref(0)

    // 关卡配置
    const levelConfig = ref([
      { cardNum: 4, layerNum: 2, trap: false },
      { cardNum: 6, layerNum: 3, trap: false },
      { cardNum: 8, layerNum: 4, trap: false },
      { cardNum: 10, layerNum: 5, trap: false },
      { cardNum: 12, layerNum: 6, trap: false },
      { cardNum: 15, layerNum: 6, trap: true }
    ])

    // 更新配置
    const updateConfig = (newConfig: Partial<GameConfig>) => {
      Object.assign(config.value, newConfig)
    }

    // 重置配置
    const resetConfig = () => {
      config.value = { ...defaultConfig }
    }

    // 重置撤回次数（每关开始时调用）
    const resetBackCount = () => {
      remainingBackCount.value = config.value.backCount
    }

    // 使用一次撤回
    const useBackCount = () => {
      if (remainingBackCount.value > 0) {
        remainingBackCount.value--
        return true
      }
      return false
    }

    // 添加新关卡
    const addLevel = (level: { cardNum: number; layerNum: number; trap: boolean }) => {
      levelConfig.value.push(level)
    }

    // 更新关卡配置
    const updateLevelConfig = (
      levels: Array<{ cardNum: number; layerNum: number; trap: boolean }>
    ) => {
      levelConfig.value = levels
    }

    // 游戏状态管理
    const setCurrentLevel = (level: number) => {
      currentLevel.value = level
    }

    const setIsWin = (win: boolean) => {
      isWin.value = win
    }

    const setShowTip = (show: boolean) => {
      showTip.value = show
    }

    const setShowSettings = (show: boolean) => {
      showSettings.value = show
    }

    return {
      // 状态
      config,
      currentLevel,
      isWin,
      showTip,
      showSettings,
      levelConfig,
      remainingBackCount,

      // 方法
      updateConfig,
      resetConfig,
      resetBackCount,
      useBackCount,
      addLevel,
      updateLevelConfig,
      setCurrentLevel,
      setIsWin,
      setShowTip,
      setShowSettings
    }
  },
  {
    persist: {
      key: 'game-store',
      storage: localStorage,
      // 只持久化配置和关卡数据，不持久化游戏状态
      pick: ['config', 'levelConfig']
    }
  }
)
