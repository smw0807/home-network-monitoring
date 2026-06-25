<template>
  <UDashboardNavbar title="히스토리" />

  <UDashboardPanel class="overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center gap-3">
        <USelect
          v-model="range"
          :items="rangeOptions"
          class="w-40"
          @update:model-value="fetchHistory"
        />
      </div>

      <!-- 차트 -->
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

      <!-- 테이블 -->
      <UCard>
        <template #header>
          <span class="text-sm font-medium">
            상세 데이터
            <span class="ml-2 text-xs text-muted font-normal">({{ tableRows.length }}건, 최신순)</span>
          </span>
        </template>
        <div v-if="tableRows.length === 0" class="flex items-center justify-center py-12 text-muted text-sm">
          데이터가 없습니다
        </div>
        <UTable v-else :data="tableRows" :columns="columns">
          <template #timestamp-cell="{ row }">
            <span class="text-xs font-mono">{{ row.original.timestamp }}</span>
          </template>
          <template #inMbps-cell="{ row }">
            <span :class="speedColor(row.original.inMbps)" class="font-medium tabular-nums">
              {{ row.original.inMbps }}
            </span>
          </template>
          <template #outMbps-cell="{ row }">
            <span :class="speedColor(row.original.outMbps)" class="font-medium tabular-nums">
              {{ row.original.outMbps }}
            </span>
          </template>
          <template #samples-cell="{ row }">
            <span class="text-muted text-xs tabular-nums">{{ row.original.samples }}</span>
          </template>
        </UTable>
      </UCard>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
interface Bucket {
  key_as_string: string;
  doc_count: number;
  avg_in: { value: number | null };
  avg_out: { value: number | null };
}

interface HistoryAggregation {
  traffic_over_time: { buckets: Bucket[] };
}

interface TableRow {
  timestamp: string;
  inMbps: string;
  outMbps: string;
  samples: number;
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

const columns = [
  { accessorKey: 'timestamp', header: '시각' },
  { accessorKey: 'inMbps',   header: '평균 수신 (Mbps)' },
  { accessorKey: 'outMbps',  header: '평균 송신 (Mbps)' },
  { accessorKey: 'samples',  header: '샘플 수' },
];

const tableRows = computed<TableRow[]>(() =>
  [...buckets.value].reverse().map((b) => ({
    timestamp: formatLabel(b.key_as_string, range.value),
    inMbps:  bpsToMbps(b.avg_in.value ?? 0),
    outMbps: bpsToMbps(b.avg_out.value ?? 0),
    samples: b.doc_count,
  })),
);

async function fetchHistory() {
  const interval = rangeToInterval[range.value];
  const data = await $fetch<HistoryAggregation>(
    `${config.public.apiUrl}/api/traffic/history?from=now-${range.value}&to=now&interval=${interval}`,
  );
  buckets.value = data?.traffic_over_time?.buckets ?? [];
}

function bpsToMbps(bps: number): string {
  return ((bps * 8) / 1_000_000).toFixed(2);
}

function formatLabel(iso: string, r: string): string {
  const d = new Date(iso);
  if (r === '1h' || r === '6h') {
    return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  if (r === '24h') {
    return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit' });
}

function speedColor(mbpsStr: string): string {
  const v = parseFloat(mbpsStr);
  if (v >= 50) return 'text-red-500';
  if (v >= 10) return 'text-yellow-500';
  if (v > 0)   return 'text-emerald-500';
  return 'text-muted';
}

onMounted(fetchHistory);
</script>
