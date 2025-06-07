<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { format, parseISO } from 'date-fns'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { useChat } from '@ai-sdk/vue'
import { useMoodEntries } from '~/composables/useMoodEntries'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend)

const md = new MarkdownIt()
const renderMarkdown = (text: string) => DOMPurify.sanitize(md.render(text))

const { finalizedEntries, fetchFinalizedMoodEntries } = useMoodEntries()

const chartData = ref({ labels: [], datasets: [] })
const chartOptions = {
  responsive: true,
  scales: {
    y: { beginAtZero: true, max: 5 }
  }
}

const { messages, input, handleSubmit } = useChat({
  api: '/api/openai/chat-with-data',
  experimental_prepareRequestBody: ({ id, messages, requestBody }) => ({
    id,
    messages,
    ...requestBody,
    data: { userData: finalizedEntries.value }
  })
})

onMounted(async () => {
  await fetchFinalizedMoodEntries()
  updateChart()
})

function updateChart () {
  const entries = finalizedEntries.value
  if (!entries.length) return

  const monthly: Record<string, number[]> = {}
  for (const entry of entries) {
    const date = parseISO(entry.payload.entry_timestamp)
    const key = format(date, 'yyyy-MM')
    monthly[key] = monthly[key] || []
    monthly[key].push(entry.payload.general_mood.id)
  }

  const labels: string[] = []
  const data: number[] = []
  Object.keys(monthly).sort().forEach(k => {
    labels.push(k)
    const arr = monthly[k]
    data.push(arr.reduce((a, b) => a + b, 0) / arr.length)
  })

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Average Mood',
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)'
      }
    ]
  }
}

const summaryMessage = ref('')

async function generateSummary () {
  const dataString = JSON.stringify(finalizedEntries.value)
  input.value = `Here is my mood data: ${dataString}. Provide a short summary of my recent mood trends.`
  await handleSubmit()
}

const summaryHtml = computed(() => {
  const aiMsg = messages.value.find(m => m.role === 'assistant')
  return aiMsg ? renderMarkdown(aiMsg.content) : ''
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-6">
    <h1 class="text-center text-2xl font-bold mb-4">Mood Analytics</h1>
    <div class="bg-[var(--secondary)] p-4 rounded-xl">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <button
      class="px-4 py-2 rounded bg-[var(--primary)] text-white"
      @click="generateSummary"
    >
      Generate AI Summary
    </button>
    <div v-html="summaryHtml" class="prose prose-invert max-w-none"></div>
  </div>
</template>

<style scoped>
.prose :deep(p) {
  margin: 0.5rem 0;
}
</style>

