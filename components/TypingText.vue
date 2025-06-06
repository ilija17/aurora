<template>
  <span v-if="done" class="whitespace-pre-wrap" v-html="renderMarkdown(text)" />
  <span v-else class="whitespace-pre-wrap" v-text="display" />
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ text: string; speed?: number }>()
const { text, speed } = props

const display = ref('')
const done = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const md = new MarkdownIt()
const renderMarkdown = (t: string) => md.render(t)

function startTyping (txt: string) {
  if (timer) clearTimeout(timer)
  display.value = ''
  done.value = false
  let i = 0
  const step = speed ?? 20
  const tick = () => {
    if (i <= txt.length) {
      display.value = txt.slice(0, i)
      i++
      timer = setTimeout(tick, step)
    } else {
      done.value = true
    }
  }
  tick()
}

watch(() => text, startTyping, { immediate: true })

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>
