<script lang="ts" setup name="App">
import Card from '@/components/card.vue'
import Settings from '@/components/settings.vue'
import { basicCannon, schoolPride } from '@/lib/utils'
import { useGame } from '@/hooks/use-game'
import { useGameStore } from '@/store/modules/game'

const gameStore = useGameStore()
const config = gameStore.config

const containerRef = ref<HTMLElement | undefined>()
const clickAudioRef = ref<HTMLAudioElement | undefined>()
const dropAudioRef = ref<HTMLAudioElement | undefined>()
const winAudioRef = ref<HTMLAudioElement | undefined>()
const loseAudioRef = ref<HTMLAudioElement | undefined>()
const welAudioRef = ref<HTMLAudioElement | undefined>()

const {
  nodes,
  selectedNodes,
  handleSelect,
  handleBack,
  backFlag,
  handleRemove,
  removeFlag,
  removeList,
  handleSelectRemove,
  initData
} = useGame({
  container: containerRef,
  cardNum: 4,
  layerNum: 2,
  trap: false,
  events: {
    clickCallback: handleClickCard,
    dropCallback: handleDropCard,
    winCallback: handleWin,
    loseCallback: handleLose
  }
})

function handleClickCard() {
  if (config.soundEnabled) {
    clickAudioRef.value?.play().catch(error => {
      console.error('音频播放失败', error)
    })
  }
}

function handleDropCard() {
  if (config.soundEnabled) {
    dropAudioRef.value?.play().catch(error => {
      console.error('音频播放失败', error)
    })
  }
}

function handleWin() {
  if (config.soundEnabled) {
    winAudioRef.value?.play().catch(error => {
      console.error('音频播放失败', error)
    })
  }

  if (gameStore.currentLevel < gameStore.levelConfig.length) {
    basicCannon()
    gameStore.setShowTip(true)
    setTimeout(() => {
      gameStore.setShowTip(false)
    }, 1500)
    setTimeout(() => {
      initData(gameStore.levelConfig[gameStore.currentLevel])
      gameStore.setCurrentLevel(gameStore.currentLevel + 1)
    }, 2000)
  } else {
    gameStore.setIsWin(true)
    schoolPride()
  }
}

function handleLose() {
  if (config.soundEnabled) {
    loseAudioRef.value?.play().catch(error => {
      console.error('音频播放失败', error)
    })
  }

  setTimeout(() => {
    alert('槽位已满，再接再厉~')
    nodes.value = []
    removeList.value = []
    selectedNodes.value = []

    if (config.soundEnabled) {
      welAudioRef.value?.play().catch(error => {
        console.error('音频播放失败', error)
      })
    }

    gameStore.setCurrentLevel(0)
    gameStore.setShowTip(true)
    setTimeout(() => {
      gameStore.setShowTip(false)
    }, 1500)
    setTimeout(() => {
      initData(gameStore.levelConfig[gameStore.currentLevel])
      gameStore.setCurrentLevel(gameStore.currentLevel + 1)
    }, 2000)
  }, 500)
}

function openSettings() {
  gameStore.setShowSettings(true)
}

function closeSettings() {
  gameStore.setShowSettings(false)
}

onMounted(() => {
  gameStore.resetBackCount() // 确保初始化撤回次数
  initData()
})
</script>

<template>
  <div class="game-wrapper">
    <div class="game-header">
      <span>{{ config.title }}</span>
      <button class="settings-btn" @click="openSettings">
        <Icon icon="tabler:settings" />
      </button>
    </div>

    <div ref="containerRef" class="game-container">
      <div class="game-board">
        <template v-for="item in nodes" :key="item.id">
          <transition name="slide-fade">
            <Card v-if="[0, 1].includes(item.state)" :node="item" @click-card="handleSelect" />
          </transition>
        </template>
      </div>

      <transition name="bounce">
        <div v-if="gameStore.isWin" class="game-title">成功加入兔圈！</div>
      </transition>

      <transition name="bounce">
        <div v-if="gameStore.showTip" class="game-title">第{{ gameStore.currentLevel + 1 }}关</div>
      </transition>
    </div>

    <div class="game-remove-container">
      <Card
        v-for="item in removeList"
        :key="item.id"
        :node="item"
        @click-card="handleSelectRemove"
        is-dock
      />
    </div>

    <div class="game-card-dock-wrapper">
      <div class="game-card-dock">
        <template v-for="item in selectedNodes" :key="item.id">
          <transition name="bounce">
            <Card v-if="item.state === 2" :node="item" is-dock />
          </transition>
        </template>
      </div>
    </div>

    <div class="game-button-container">
      <button class="game-button" :disabled="removeFlag" @click="handleRemove">
        移出前{{ config.removeCount }}个
      </button>
      <button class="game-button" :disabled="backFlag" @click="handleBack">
        回退({{ gameStore.remainingBackCount }}/{{ config.backCount }})
      </button>
    </div>

    <div class="game-footer"></div>

    <!-- 设置界面 -->
    <Settings v-if="gameStore.showSettings" @close="closeSettings" />

    <!-- 音频元素 -->
    <audio ref="clickAudioRef" class="hidden" controls>
      <source src="./assets/audio/click.mp3" type="audio/mpeg" />
    </audio>

    <audio ref="dropAudioRef" class="hidden" controls>
      <source src="./assets/audio/drop.mp3" type="audio/mpeg" />
    </audio>

    <audio ref="winAudioRef" class="hidden" controls>
      <source src="./assets/audio/win.mp3" type="audio/mpeg" />
    </audio>

    <audio ref="loseAudioRef" class="hidden" controls>
      <source src="./assets/audio/lose.mp3" type="audio/mpeg" />
    </audio>

    <audio ref="welAudioRef" class="hidden" controls>
      <source src="./assets/audio/wel.mp3" type="audio/mpeg" />
    </audio>
  </div>
</template>

<style scoped>
@reference '@/assets/styles/main.css';

.game-wrapper {
  @apply flex-y-4 items-center w-full h-dvh;

  .game-header {
    @apply flex items-center justify-between mt-4 w-full h-16 px-4 text-center text-4xl font-semibold text-primary;
  }

  .settings-btn {
    @apply text-2xl bg-transparent border-none cursor-pointer hover:scale-110 transition-transform p-2 rounded-full hover:bg-primary/10;
  }

  .game-container {
    @apply flex-1 flex-center flex-col size-full;

    .game-board {
      @apply relative mx-auto size-full;
    }

    .game-title {
      @apply flex-center w-full text-center text-4xl font-semibold text-primary;
    }
  }

  .game-remove-container {
    @apply flex-center h-13;
  }

  .game-card-dock-wrapper {
    @apply flex-center w-full;

    .game-card-dock {
      @apply flex items-start p-0.5 w-76 h-13 border-3 border-emerald-600 bg-card/60 rounded-md;
    }
  }

  .game-button-container {
    @apply flex-center gap-2 w-full h-12;

    .game-button {
      @apply flex-center px-4 py-2 bg-card/90 border-none outline-none rounded-md text-sm text-primary disabled:text-primary/30 disabled:bg-card/40;
    }
  }
}
</style>
