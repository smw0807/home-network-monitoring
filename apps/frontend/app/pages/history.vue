<template>
  <UDashboardNavbar title="히스토리" />

  <UDashboardPanel>
    <div class="p-6 space-y-4">
      <div class="flex items-center gap-3">
        <USelect
          v-model="range"
          :items="rangeOptions"
          class="w-40"
          @update:model-value="fetchHistory"
        />
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">시간별 평균 트래픽</span>
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
        <div v-if="buckets.length === 0" class="flex items-center justify-center h-64 text-muted text-sm">
          데이터가 없습니다
        </div>
        <canvas v-else ref="chartCanvas" class="w-full h-64" width="800" height="256" />
      </UCard>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
interface Bucket {
  key_as_string: string;
  avg_in: { value: number | null };
  avg_out: { value: number | null };
}

interface HistoryAggregation {
  traffic_over_time: { buckets: Bucket[] };
}

const config = useRuntimeConfig();
const range = ref('1h');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const buckets = ref<Bucket[]>([]);

const rangeOptions = [
  { label: '최근 1시간', value: '1h' },
  { label: '최근 6시간', value: '6h' },
  { label: '최근 24시간', value: '24h' },
  { label: '최근 7일', value: '7d' },
];

const rangeToInterval: Record<string, string> = {
  '1h': '1m',
  '6h': '5m',
  '24h': '30m',
  '7d': '3h',
};

async function fetchHistory() {
  const interval = rangeToInterval[range.value];
  const data = await $fetch<HistoryAggregation>(
    `${config.public.apiUrl}/api/traffic/history?from=now-${range.value}&to=now&interval=${interval}`,
  );
  buckets.value = data?.traffic_over_time?.buckets ?? [];
}

watch(buckets, () => nextTick(drawChart), { deep: true });

function drawChart() {
  const canvas = chartCanvas.value;
  if (!canvas || buckets.value.length < 2) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const points = buckets.value;
  const maxBps = Math.max(
    ...points.map((p) => Math.max(p.avg_in.value ?? 0, p.avg_out.value ?? 0)),
    1,
  );
  const stepX = w / (points.length - 1);

  const drawLine = (color: string, getValue: (p: Bucket) => number) => {
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

  drawLine('#10b981', (p) => p.avg_in.value ?? 0);
  drawLine('#f43f5e', (p) => p.avg_out.value ?? 0);
}

onMounted(fetchHistory);
</script>
