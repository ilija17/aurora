<template>
  <ClientOnly>
    <div class="p-6 space-y-10">
      <h1 class="text-2xl font-bold text-center">Mood Analytics</h1>
      <div>
        <canvas ref="weeklyChartRef" class="w-full max-w-3xl mx-auto"></canvas>
      </div>
      <div>
        <canvas ref="monthlyChartRef" class="w-full max-w-3xl mx-auto"></canvas>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { parseISO, getWeek, format } from 'date-fns'
import { useMoodEntries } from '~/composables/useMoodEntries'

Chart.register(...registerables)

definePageMeta({ requiresAuth: true })

const { finalizedEntries, fetchFinalizedMoodEntries } = useMoodEntries()

const weeklyChartRef = ref<HTMLCanvasElement | null>(null)
const monthlyChartRef = ref<HTMLCanvasElement | null>(null)
let weeklyChart: Chart | null = null
let monthlyChart: Chart | null = null

onMounted(async () => {
  await fetchFinalizedMoodEntries()
  buildCharts()
})

watch(finalizedEntries, buildCharts)

function buildCharts() {
  if (!weeklyChartRef.value || !monthlyChartRef.value) return
  const entries = finalizedEntries.value
  if (!entries.length) return

  // group moods by week
  const weekMap: Record<string, number[]> = {}
  const monthMap: Record<string, number[]> = {}
  for (const e of entries) {
    const d = parseISO(e.payload.entry_timestamp)
    const weekKey = `${d.getFullYear()}-W${getWeek(d)}`
    const monthKey = format(d, 'yyyy-MM')
    const idx = (e.payload.general_mood?.id || 0) - 1
    if (!weekMap[weekKey]) weekMap[weekKey] = [0,0,0,0,0]
    if (!monthMap[monthKey]) monthMap[monthKey] = [0,0,0,0,0]
    if (idx >= 0 && idx < 5) {
      weekMap[weekKey][idx]++
      monthMap[monthKey][idx]++
    }
  }

  const moodLabels = ['Great', 'Good', 'Fine', 'Bad', 'Awful']
  const colors = ['#4ade80','#60a5fa','#facc15','#f97316','#ef4444']

  const weekLabels = Object.keys(weekMap).sort()
  const weekData = moodLabels.map((label, i) => ({
    label,
    backgroundColor: colors[i],
    data: weekLabels.map(w => weekMap[w][i])
  }))

  if (weeklyChart) weeklyChart.destroy()
  weeklyChart = new Chart(weeklyChartRef.value.getContext('2d')!, {
    type: 'bar',
    data: { labels: weekLabels, datasets: weekData },
    options: { responsive: true, stacked: true }
  })

  const monthLabels = Object.keys(monthMap).sort()
  const monthData = moodLabels.map((label, i) => ({
    label,
    backgroundColor: colors[i],
    data: monthLabels.map(m => monthMap[m][i])
  }))

  if (monthlyChart) monthlyChart.destroy()
  monthlyChart = new Chart(monthlyChartRef.value.getContext('2d')!, {
    type: 'bar',
    data: { labels: monthLabels, datasets: monthData },
    options: { responsive: true, stacked: true }
  })
}
</script>
