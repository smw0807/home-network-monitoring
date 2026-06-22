<template>
  <div>
    <h2 class="page-title">히스토리</h2>

    <div class="filters">
      <select v-model="range" @change="fetch">
        <option value="1h">최근 1시간</option>
        <option value="6h">최근 6시간</option>
        <option value="24h">최근 24시간</option>
        <option value="7d">최근 7일</option>
      </select>
    </div>

    <div class="chart-section">
      <h3>시간별 평균 트래픽</h3>
      <canvas ref="chartCanvas" width="800" height="300" />
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const range = ref('1h');
const chartCanvas = ref<HTMLCanvasElement | null>(null);

const rangeToInterval: Record<string, string> = {
  '1h': '1m',
  '6h': '5m',
  '24h': '30m',
  '7d': '3h',
};

async function fetch() {
  const interval = rangeToInterval[range.value];
  const data = await $fetch(
    `${config.public.apiUrl}/api/traffic/history?from=now-${range.value}&to=now&interval=${interval}`,
  );
  // TODO: render chart from data
  console.log('history data', data);
}

onMounted(fetch);
</script>

<style scoped>
.page-title { font-size: 1.4rem; margin-bottom: 1.5rem; color: #00e676; }
.filters { margin-bottom: 1.5rem; }
.filters select {
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
}
.chart-section { background: #1a1a2e; border-radius: 8px; padding: 1.2rem; }
.chart-section h3 { font-size: 0.9rem; color: #888; margin-bottom: 1rem; }
canvas { width: 100%; height: auto; background: #0f0f1a; border-radius: 4px; }
</style>
