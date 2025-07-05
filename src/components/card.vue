<script lang="ts" setup name="Card">
import { computed } from 'vue'
import { useGameStore } from '@/store/modules/game'

const { node, isDock } = defineProps<{
  node: CardNode
  isDock?: boolean
}>()
const emit = defineEmits(['clickCard'])

const gameStore = useGameStore()

// 预加载所有主题的图片
const allModules = import.meta.glob('../assets/card-*/*.png', {
  as: 'url',
  import: 'default',
  eager: true
})

// 响应式的图片映射
const IMG_MAP = computed(() => {
  const theme = gameStore.config.cardTheme
  const themeModules = Object.keys(allModules)
    .filter(key => key.includes(`card-${theme}/`))
    .reduce(
      (acc, key) => {
        acc[key] = allModules[key]
        return acc
      },
      {} as Record<string, string>
    )

  return Object.keys(themeModules).reduce(
    (acc, cur) => {
      const key = cur.replace(`../assets/card-${theme}/`, '').replace('.png', '')
      acc[key] = themeModules[cur]
      return acc
    },
    {} as Record<string, string>
  )
})

const isFreeze = computed(() => {
  return node.parents.length > 0 ? node.parents.some(o => o.state < 2) : false
})

function handleClick() {
  if (!isFreeze.value) emit('clickCard', node)
}
</script>

<template>
  <div
    class="card"
    :style="
      isDock
        ? {}
        : {
            position: 'absolute',
            zIndex: node.zIndex,
            top: `${node.top}px`,
            left: `${node.left}px`
          }
    "
    @click="handleClick"
  >
    <img :src="IMG_MAP[node.type]" class="card-img" :alt="`${node.type}`" />
    <div v-if="isFreeze" class="mask" />
  </div>
</template>

<style scoped>
@reference '@/assets/styles/main.css';

.card {
  @apply relative flex-center size-10 bg-emerald-200 border border-emerald-800 rounded-sm text-primary shadow-[1px_4px_4px_-1px_#000] cursor-pointer;

  .card-img {
    @apply size-full rounded-sm;
  }

  .mask {
    @apply absolute z-1 inset-0 size-full bg-primary/50 pointer-events-none;
  }
}
</style>
