import { ceil, floor, random, shuffle } from 'es-toolkit/compat'
import { useGameStore } from '@/store/modules/game'

const defaultGameConfig: GameConfig = {
  cardNum: 4,
  layerNum: 2,
  trap: true,
  delNode: false
}

export function useGame(config: GameConfig): Game {
  const gameStore = useGameStore()
  const { config: gameConfig, remainingBackCount } = storeToRefs(gameStore)
  const { container, delNode, events = {}, ...initConfig } = { ...defaultGameConfig, ...config }
  const histroyList = ref<CardNode[]>([])
  const backFlag = ref(false)
  const removeFlag = ref(false)
  const removeList = ref<CardNode[]>([])
  const preNode = ref<CardNode | null>(null)
  const nodes = ref<CardNode[]>([])
  const indexSet = new Set()
  let perFloorNodes: CardNode[] = []
  const selectedNodes = ref<CardNode[]>([])
  const size = 40
  let floorList: number[][] = []

  function updateState() {
    nodes.value.forEach(o => {
      o.state = o.parents.every(p => p.state > 0) ? 1 : 0
    })
  }

  function handleSelect(node: CardNode) {
    if (selectedNodes.value.length === 7) return
    node.state = 2
    histroyList.value.push(node)
    preNode.value = node
    const index = nodes.value.findIndex(o => o.id === node.id)
    if (index > -1) {
      if (delNode) {
        nodes.value.splice(index, 1)
      }
    }

    // 判断是否有可以消除的节点
    const selectedSomeNode = selectedNodes.value.filter(s => s.type === node.type)
    if (selectedSomeNode.length === 2) {
      // 第二个节点索引
      const secondIndex = selectedNodes.value.findIndex(o => o.id === selectedSomeNode[1].id)
      selectedNodes.value.splice(secondIndex + 1, 0, node)
      // 为了动画效果添加延迟
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          // const index = selectedNodes.value.findIndex(o => o.type === node.type)
          selectedNodes.value.splice(secondIndex - 1, 1)
        }
        preNode.value = null
        // 判断是否已经清空节点，即是否胜利
        if (
          delNode
            ? nodes.value.length === 0
            : nodes.value.every(o => o.state > 0) &&
              removeList.value.length === 0 &&
              selectedNodes.value.length === 0
        ) {
          removeFlag.value = true
          backFlag.value = true
          if (events.winCallback) events.winCallback()
        } else {
          if (events.dropCallback) events.dropCallback()
        }
      }, 100)
    } else {
      if (events.clickCallback) events.clickCallback()
      const index = selectedNodes.value.findIndex(o => o.type === node.type)
      if (index > -1) selectedNodes.value.splice(index + 1, 0, node)
      else selectedNodes.value.push(node)
      // 判断卡槽是否已满，即失败
      if (selectedNodes.value.length === 7) {
        removeFlag.value = true
        backFlag.value = true
        if (events.loseCallback) events.loseCallback()
      }
    }
  }

  function handleSelectRemove(node: CardNode) {
    const index = removeList.value.findIndex(o => o.id === node.id)
    if (index > -1) removeList.value.splice(index, 1)
    handleSelect(node)
  }

  // function handleBack() {
  //   if (histroyList.value.length === 0) return

  //   // 使用配置中的撤回步数
  //   const backCount = Math.min(gameConfig.value.backCount, histroyList.value.length)

  //   for (let i = 0; i < backCount; i++) {
  //     const node = histroyList.value.pop()
  //     if (!node) break

  //     node.state = 0
  //     if (delNode) nodes.value.push(node)
  //     const index = selectedNodes.value.findIndex(o => o.id === node.id)
  //     if (index > -1) selectedNodes.value.splice(index, 1)
  //   }

  //   preNode.value = histroyList.value[histroyList.value.length - 1] || null
  //   backFlag.value = histroyList.value.length === 0
  // }

  function handleBack() {
    if (histroyList.value.length === 0) return

    // 检查是否还有撤回次数
    if (!gameStore.useBackCount()) {
      return // 没有撤回次数了
    }

    // 每次只撤回一步
    const node = histroyList.value.pop()
    if (!node) return

    node.state = 0
    if (delNode) nodes.value.push(node)
    const index = selectedNodes.value.findIndex(o => o.id === node.id)
    if (index > -1) selectedNodes.value.splice(index, 1)

    preNode.value = histroyList.value[histroyList.value.length - 1] || null
    backFlag.value = histroyList.value.length === 0 || remainingBackCount.value === 0
  }

  function handleRemove() {
    // 使用配置中的移出数量
    const removeCount = gameConfig.value.removeCount

    if (selectedNodes.value.length < removeCount) return
    removeFlag.value = true
    preNode.value = null

    for (let i = 0; i < removeCount; i++) {
      const node = selectedNodes.value.shift()
      if (!node) return
      removeList.value.push(node)
    }
  }

  function initData(config?: GameConfig | null) {
    const { cardNum, layerNum, trap } = { ...initConfig, ...config }
    histroyList.value = []
    backFlag.value = false
    removeFlag.value = false
    removeList.value = []
    preNode.value = null
    nodes.value = []
    indexSet.clear()
    perFloorNodes = []
    selectedNodes.value = []
    floorList = []
    const isTrap = trap && floor(random(0, 100)) !== 50
    // 在初始化时重置撤回次数
    gameStore.resetBackCount()

    // 生成节点池
    const itemTypes = new Array(cardNum).fill(0).map((_, index) => index + 1)
    let itemList: number[] = []
    for (let i = 0; i < 3 * layerNum; i++) itemList = [...itemList, ...itemTypes]

    if (isTrap) {
      const len = itemList.length
      itemList.splice(len - cardNum, len)
    }
    // 打乱节点
    itemList = shuffle(shuffle(itemList))

    // 初始化各个层级节点
    let len = 0
    let floorIndex = 1
    const itemLength = itemList.length
    while (len <= itemLength) {
      const maxFloorNum = floorIndex * floorIndex
      const floorNum = ceil(random(maxFloorNum / 2, maxFloorNum))
      floorList.push(itemList.splice(0, floorNum))
      len += floorNum
      floorIndex++
    }

    if (container && container.value) {
      const containerWidth = container.value.clientWidth
      const containerHeight = container.value.clientHeight
      const width = containerWidth / 2
      const height = containerHeight / 2 - 60

      floorList.forEach((o, index) => {
        indexSet.clear()
        let i = 0
        const floorNodes: CardNode[] = []
        o.forEach(k => {
          i = floor(random(0, (index + 1) ** 2))
          while (indexSet.has(i)) i = floor(random(0, (index + 1) ** 2))
          const row = floor(i / (index + 1))
          const column = index ? i % index : 0
          const node: CardNode = {
            id: `${index}-${i}`,
            type: k,
            zIndex: index,
            index: i,
            row,
            column,
            top: height + (size * row - (size / 2) * index),
            left: width + (size * column - (size / 2) * index),
            parents: [],
            state: 0
          }
          const xy = [node.top, node.left]
          perFloorNodes.forEach(e => {
            if (Math.abs(e.top - xy[0]) <= size && Math.abs(e.left - xy[1]) <= size)
              e.parents.push(node)
          })
          floorNodes.push(node)
          indexSet.add(i)
        })
        nodes.value = nodes.value.concat(floorNodes)
        perFloorNodes = floorNodes
      })
    }

    updateState()
  }

  return {
    nodes,
    selectedNodes,
    removeFlag,
    removeList,
    backFlag,
    handleSelect,
    handleBack,
    handleRemove,
    handleSelectRemove,
    initData
  }
}
