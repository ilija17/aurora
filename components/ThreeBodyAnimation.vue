<template>
  <div class="loader">
    <canvas ref="cvs"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick, ref } from 'vue'

const cvs = ref<HTMLCanvasElement | null>(null)
let raf = 0

onMounted(async () => {
  if (!cvs.value) return
  const ctx = cvs.value.getContext('2d')!

  let w = 0
  let h = 0
  let scale = 180

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    const rect = cvs.value!.getBoundingClientRect()
    w = rect.width
    h = rect.height
    cvs.value!.width = w * dpr
    cvs.value!.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const factor = Math.min(w, h) < 600 ? 0.45 : 0.25
    scale = Math.min(w, h) * factor
  }

  await nextTick()
  resize()
  window.addEventListener('resize', resize)

  const G = 1
  const DT = 5e-5
  const EPS2 = 4e-4
  const N = 3

  const mass = new Float32Array([1, 1, 1])
  const posX = new Float32Array([-0.97000436, 0, 0.97000436])
  const posY = new Float32Array([0.24308753, 0, -0.24308753])
  const velX = new Float32Array([0.066203685, -0.73240737, 0.266203685])
  const velY = new Float32Array([0.23236573, -0.56473146, 0.23236573])
  const accX = new Float32Array(N)
  const accY = new Float32Array(N)

  const computeAcc = () => {
    accX.fill(0)
    accY.fill(0)
    for (let i = 0; i < N - 1; i++) {
      for (let j = i + 1; j < N; j++) {
        let rx = posX[j] - posX[i]
        let ry = posY[j] - posY[i]
        let d2 = rx * rx + ry * ry
        if (d2 < EPS2) d2 = EPS2
        const invD = 1 / Math.sqrt(d2)
        const f = G * mass[i] * mass[j] * invD * invD
        const fx = f * rx * invD
        const fy = f * ry * invD
        accX[i] += fx / mass[i]
        accY[i] += fy / mass[i]
        accX[j] -= fx / mass[j]
        accY[j] -= fy / mass[j]
      }
    }
  }

  const verlet = () => {
    for (let i = 0; i < N; i++) {
      velX[i] += 0.5 * accX[i] * DT
      velY[i] += 0.5 * accY[i] * DT
      posX[i] += velX[i] * DT
      posY[i] += velY[i] * DT
    }
    computeAcc()
    for (let i = 0; i < N; i++) {
      velX[i] += 0.5 * accX[i] * DT
      velY[i] += 0.5 * accY[i] * DT
    }
  }

  const radius = 6
  const colours = ['#e44', '#4e4', '#44e']

  const draw = () => {
    ctx.fillStyle = 'rgba(0,0,0,0.10)'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = colours[i]
      const x = posX[i] * scale + w * 0.5
      const y = posY[i] * scale + h * 0.5
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  computeAcc()
  let last = performance.now()
  const loop = (t: number) => {
    let acc = (t - last) / 1000
    while (acc > DT) {
      verlet()
      acc -= DT
    }
    draw()
    last = t
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  background: #000;
  opacity: 0.8;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
