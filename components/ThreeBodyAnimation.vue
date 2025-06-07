<template>
  <canvas ref="cvs" width="1000" height="1000"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const cvs = ref<HTMLCanvasElement | null>(null)
let frame = 0

onMounted(() => {
  if (!cvs.value) return
  const ctx = cvs.value.getContext('2d')!

  const G   = 1
  const DT  = 0.01
  const N   = 3

  const mass   = new Float32Array([1, 1, 1])
  const posX   = new Float32Array(N)
  const posY   = new Float32Array(N)
  const velX   = new Float32Array(N)
  const velY   = new Float32Array(N)
  const accX   = new Float32Array(N)
  const accY   = new Float32Array(N)

  const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
  for (let i = 0; i < N; i++) {
    posX[i] = Math.cos(angles[i])
    posY[i] = Math.sin(angles[i])
  }

  const speed = 0.1
  for (let i = 0; i < N; i++) {
    velX[i] = -speed * Math.sin(angles[i])
    velY[i] = speed * Math.cos(angles[i])
  }

  function computeAcc() {
    accX.fill(0); accY.fill(0)
    for (let i = 0; i < N - 1; ++i) {
      for (let j = i + 1; j < N; ++j) {
        const rx = posX[j] - posX[i]
        const ry = posY[j] - posY[i]
        const d2 = rx * rx + ry * ry + 1e-9
        const invD = 1 / Math.sqrt(d2)
        const f = G * mass[i] * mass[j] * invD * invD
        const fx = f * rx * invD
        const fy = f * ry * invD
        accX[i] += fx / mass[i]; accY[i] += fy / mass[i]
        accX[j] -= fx / mass[j]; accY[j] -= fy / mass[j]
      }
    }
  }

  function verlet() {
    for (let i = 0; i < N; ++i) {
      velX[i] += 0.5 * accX[i] * DT
      velY[i] += 0.5 * accY[i] * DT
      posX[i] += velX[i] * DT
      posY[i] += velY[i] * DT
    }
    computeAcc()
    for (let i = 0; i < N; ++i) {
      velX[i] += 0.5 * accX[i] * DT
      velY[i] += 0.5 * accY[i] * DT
    }
  }

  const scale = 100
  const radius = 5
  const colours = ['#f44', '#4f4', '#44f']

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, cvs.value!.width, cvs.value!.height)

    for (let b = 0; b < N; ++b) {
      ctx.fillStyle = colours[b]
      const x = posX[b] * scale + cvs.value!.width / 2
      const y = posY[b] * scale + cvs.value!.height / 2
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  computeAcc()
  function tick() {
    verlet()
    draw()
    frame = requestAnimationFrame(tick)
  }
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

