<template>
  <div>
    <h2 class="page-title">대시보드</h2>

    <div class="stat-cards">
      <div class="card">
        <p class="label">↓ 수신 속도</p>
        <p class="value">{{ inMbps.toFixed(2) }} <span class="unit">Mbps</span></p>
      </div>
      <div class="card">
        <p class="label">↑ 송신 속도</p>
        <p class="value">{{ outMbps.toFixed(2) }} <span class="unit">Mbps</span></p>
      </div>
      <div class="card">
        <p class="label">총 수신량</p>
        <p class="value">{{ formatBytes(current?.totalIn ?? 0) }}</p>
      </div>
      <div class="card">
        <p class="label">총 송신량</p>
        <p class="value">{{ formatBytes(current?.totalOut ?? 0) }}</p>
      </div>
    </div>

    <div class="chart-section">
      <h3>실시간 트래픽 (최근 60포인트)</h3>
      <canvas ref="chartCanvas" width="800" height="300" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { current, history, inMbps, outMbps } = useTraffic();
const chartCanvas = ref<HTMLCanvasElement | null>(null);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

watch(history, () => {
  drawChart();
}, { deep: true });

function drawChart() {
  const canvas = chartCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const points = history.value;
  if (points.length < 2) return;

  const maxBps = Math.max(...points.map((p) => Math.max(p.inBps, p.outBps)), 1);
  const stepX = w / (points.length - 1);

  const drawLine = (color: string, getValue: (p: typeof points[0]) => number) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = h - (getValue(p) / maxBps) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  drawLine('#00e676', (p) => p.inBps);
  drawLine('#ff6b6b', (p) => p.outBps);
}
</script>

<style scoped>
.page-title {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: #00e676;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 1.2rem;
}

.label {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.4rem;
}

.value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
}

.unit {
  font-size: 0.9rem;
  color: #888;
}

.chart-section {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 1.2rem;
}

.chart-section h3 {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1rem;
}

canvas {
  width: 100%;
  height: auto;
  background: #0f0f1a;
  border-radius: 4px;
}
</style>
