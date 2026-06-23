<template>
  <UDashboardNavbar title="대시보드" />

  <UDashboardPanel>
    <div class="p-6 space-y-6">
      <!-- 실시간 속도 카드 -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <UCard>
          <div class="text-xs text-muted mb-1">
            ↓ 수신 속도
          </div>
          <div class="text-2xl font-bold">
            {{ inMbps.toFixed(2) }}
            <span class="text-sm font-normal text-muted">Mbps</span>
          </div>
        </UCard>

        <UCard>
          <div class="text-xs text-muted mb-1">
            ↑ 송신 속도
          </div>
          <div class="text-2xl font-bold">
            {{ outMbps.toFixed(2) }}
            <span class="text-sm font-normal text-muted">Mbps</span>
          </div>
        </UCard>

        <UCard>
          <div class="text-xs text-muted mb-1">
            총 수신량
          </div>
          <div class="text-2xl font-bold">
            {{ formatBytes(current?.totalIn ?? 0) }}
          </div>
        </UCard>

        <UCard>
          <div class="text-xs text-muted mb-1">
            총 송신량
          </div>
          <div class="text-2xl font-bold">
            {{ formatBytes(current?.totalOut ?? 0) }}
          </div>
        </UCard>
      </div>

      <!-- 실시간 차트 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">실시간 트래픽</span>
            <div class="flex items-center gap-3 text-xs text-muted">
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-0.5 bg-primary" />수신
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-3 h-0.5 bg-rose-500" />송신
              </span>
            </div>
          </div>
        </template>
        <canvas ref="chartCanvas" class="w-full h-48" width="800" height="192" />
      </UCard>
    </div>
  </UDashboardPanel>
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

watch(
  history,
  () => {
    drawChart();
  },
  { deep: true },
);

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

  const drawLine = (color: string, getValue: (p: (typeof points)[0]) => number) => {
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

  drawLine('#10b981', (p) => p.inBps);
  drawLine('#f43f5e', (p) => p.outBps);
}
</script>
