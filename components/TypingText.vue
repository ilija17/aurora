<template>
  <span class="whitespace-pre-wrap" v-html="typedRendered" />
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ text: string; speed?: number }>()
const { speed } = props

const fullText = ref(props.text)
const display = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

const md = new MarkdownIt()
const typedRendered = computed(() => md.render(display.value))

function tick () {
  const step = speed ?? 20
  if (display.value.length < fullText.value.length) {
    display.value += fullText.value.charAt(display.value.length)
    timer = setTimeout(tick, step)
  } else {
    timer = null
  }
}

watch(
  () => props.text,
  (val) => {
    if (!val.startsWith(display.value)) {
      display.value = ''
    }
    fullText.value = val
    if (!timer) tick()
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>
