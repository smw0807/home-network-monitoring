<template>
  <UDashboardNavbar title="속도 테스트" />

  <UDashboardPanel>
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-4">
        <UButton
          :loading="isRunning"
          :disabled="isRunning"
          icon="i-heroicons-play"
          @click="runTest"
        >
          {{ isRunning ? '측정 중...' : '측정 시작' }}
        </UButton>
      </div>

      <div v-if="latest" class="grid grid-cols-3 gap-4">
        <UCard>
          <div class="text-xs text-muted mb-1">
            다운로드
          </div>
          <div class="text-2xl font-bold">
            {{ latest.download.toFixed(1) }}
            <span class="text-sm font-normal text-muted">Mbps</span>
          </div>
        </UCard>
        <UCard>
          <div class="text-xs text-muted mb-1">
            업로드
          </div>
          <div class="text-2xl font-bold">
            {{ latest.upload.toFixed(1) }}
            <span class="text-sm font-normal text-muted">Mbps</span>
          </div>
        </UCard>
        <UCard>
          <div class="text-xs text-muted mb-1">
            핑
          </div>
          <div class="text-2xl font-bold">
            {{ latest.ping.toFixed(0) }}
            <span class="text-sm font-normal text-muted">ms</span>
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <span class="text-sm font-medium">측정 이력</span>
        </template>
        <UTable :data="history" :columns="columns">
          <template #timestamp-cell="{ row }">
            {{ formatDate(row.original.timestamp) }}
          </template>
          <template #download-cell="{ row }">
            {{ row.original.download.toFixed(1) }} Mbps
          </template>
          <template #upload-cell="{ row }">
            {{ row.original.upload.toFixed(1) }} Mbps
          </template>
          <template #ping-cell="{ row }">
            {{ row.original.ping.toFixed(0) }} ms
          </template>
        </UTable>
      </UCard>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
interface SpeedResult {
  timestamp: string;
  download: number;
  upload: number;
  ping: number;
}

const config = useRuntimeConfig();
const isRunning = ref(false);
const latest = ref<SpeedResult | null>(null);
const history = ref<SpeedResult[]>([]);

const columns = [
  { accessorKey: 'timestamp', header: '시각' },
  { accessorKey: 'download', header: '다운로드' },
  { accessorKey: 'upload', header: '업로드' },
  { accessorKey: 'ping', header: '핑' },
];

const { on } = useWebSocket();
on<SpeedResult>('speedtest_result', (result) => {
  latest.value = result;
  isRunning.value = false;
});

async function runTest() {
  isRunning.value = true;
  await $fetch(`${config.public.apiUrl}/api/speedtest/run`, { method: 'POST' });
}

async function loadHistory() {
  const data = await $fetch<SpeedResult[]>(`${config.public.apiUrl}/api/speedtest/history`);
  history.value = data;
  if (data.length > 0) latest.value = data[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

onMounted(loadHistory);
</script>
