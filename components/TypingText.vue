<template>
  <span
    class="whitespace-pre-wrap"
    v-html="done ? renderMarkdown(display) : display"
  />
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ text: string; speed?: number }>()
const { speed } = props

const fullText = ref(props.text)
const display = ref('')
const done = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const md = new MarkdownIt()
const renderMarkdown = (t: string) => md.render(t)

function tick () {
  const step = speed ?? 20
  if (display.value.length < fullText.value.length) {
    display.value += fullText.value.charAt(display.value.length)
    timer = setTimeout(tick, step)
  } else {
    done.value = true
    timer = null
  }
}

watch(
  () => props.text,
  (val) => {
    fullText.value = val
    done.value = false
    if (!timer) tick()
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>
