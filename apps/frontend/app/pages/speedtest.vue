<template>
  <div>
    <h2 class="page-title">
      속도 테스트
    </h2>

    <div class="run-section">
      <button
        class="btn-run"
        :disabled="isRunning"
        @click="runTest"
      >
        {{ isRunning ? '측정 중...' : '측정 시작' }}
      </button>
    </div>

    <div
      v-if="latest"
      class="result-card"
    >
      <div class="result-item">
        <p class="label">
          다운로드
        </p>
        <p class="value">
          {{ latest.download.toFixed(1) }} <span class="unit">Mbps</span>
        </p>
      </div>
      <div class="result-item">
        <p class="label">
          업로드
        </p>
        <p class="value">
          {{ latest.upload.toFixed(1) }} <span class="unit">Mbps</span>
        </p>
      </div>
      <div class="result-item">
        <p class="label">
          핑
        </p>
        <p class="value">
          {{ latest.ping.toFixed(0) }} <span class="unit">ms</span>
        </p>
      </div>
    </div>

    <div class="history-section">
      <h3>측정 이력</h3>
      <table class="table">
        <thead>
          <tr><th>시각</th><th>다운로드</th><th>업로드</th><th>핑</th></tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in history"
            :key="i"
          >
            <td>{{ formatDate(item.timestamp) }}</td>
            <td>{{ item.download.toFixed(1) }} Mbps</td>
            <td>{{ item.upload.toFixed(1) }} Mbps</td>
            <td>{{ item.ping.toFixed(0) }} ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
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

<style scoped>
.page-title { font-size: 1.4rem; margin-bottom: 1.5rem; color: #00e676; }
.run-section { margin-bottom: 2rem; }
.btn-run {
  background: #00e676;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-run:disabled { opacity: 0.5; cursor: not-allowed; }
.result-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.result-item { background: #1a1a2e; border-radius: 8px; padding: 1.2rem; }
.label { font-size: 0.8rem; color: #888; margin-bottom: 0.4rem; }
.value { font-size: 1.8rem; font-weight: 700; color: #fff; }
.unit { font-size: 0.9rem; color: #888; }
.history-section h3 { font-size: 1rem; margin-bottom: 1rem; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 0.7rem 0.8rem; text-align: left; border-bottom: 1px solid #2a2a3e; }
.table th { font-size: 0.8rem; color: #888; }
</style>
