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
        <div class="h-72">
          <div v-if="buckets.length === 0" class="flex items-center justify-center h-full text-muted text-sm">
            데이터가 없습니다
          </div>
          <ClientOnly v-else>
            <TrafficHistoryChart :buckets="buckets" :range="range" />
          </ClientOnly>
        </div>
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

onMounted(fetchHistory);
</script>
