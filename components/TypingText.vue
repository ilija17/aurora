<template>
  <div class="relative">
    <div
      v-html="rendered"
      :class="['whitespace-pre-wrap', done ? '' : 'invisible']"
    />
    <div
      v-if="!done"
      v-html="typedRendered"
      class="absolute inset-0 whitespace-pre-wrap"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ text: string; speed?: number }>()
const { speed } = props

const fullText = ref(props.text)
const display = ref('')
const done = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const md = new MarkdownIt()
const rendered = ref(md.render(fullText.value))
const typedRendered = computed(() => md.render(display.value))

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
    if (!val.startsWith(display.value)) {
      display.value = ''
    }
    fullText.value = val
    rendered.value = md.render(val)
    done.value = false
    if (!timer) tick()
  },
  { immediate: true }
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>
