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
          <span class="text-sm font-medium">시간별 평균 트래픽</span>
        </template>
        <canvas ref="chartCanvas" class="w-full h-64" width="800" height="256" />
      </UCard>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const range = ref('1h');
const chartCanvas = ref<HTMLCanvasElement | null>(null);

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
  const data = await $fetch(
    `${config.public.apiUrl}/api/traffic/history?from=now-${range.value}&to=now&interval=${interval}`,
  );
  console.log('history data', data);
  // TODO: render chart from Elasticsearch aggregation response
}

onMounted(fetchHistory);
</script>
