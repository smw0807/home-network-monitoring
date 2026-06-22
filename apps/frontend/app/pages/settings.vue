<template>
  <div>
    <h2 class="page-title">
      설정
    </h2>

    <form
      v-if="settings"
      class="form"
      @submit.prevent="save"
    >
      <div class="form-group">
        <label>공유기 IP</label>
        <input
          v-model="settings.routerIp"
          type="text"
        />
      </div>
      <div class="form-group">
        <label>SNMP 커뮤니티</label>
        <input
          v-model="settings.snmpCommunity"
          type="text"
        />
      </div>
      <div class="form-group">
        <label>WAN 인터페이스 인덱스</label>
        <input
          v-model.number="settings.snmpIfIndex"
          type="number"
          min="1"
        />
      </div>
      <div class="form-group">
        <label>폴링 간격 (ms)</label>
        <input
          v-model.number="settings.pollIntervalMs"
          type="number"
          min="500"
        />
      </div>
      <div class="form-group">
        <label>데이터 보존 기간 (일)</label>
        <input
          v-model.number="settings.dataRetentionDays"
          type="number"
          min="1"
        />
      </div>
      <div class="form-group">
        <label>트래픽 임계값 (Mbps)</label>
        <input
          v-model.number="settings.trafficThresholdMbps"
          type="number"
          min="0"
        />
      </div>
      <button
        type="submit"
        class="btn-save"
      >
        저장
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
interface AppSettings {
  routerIp: string;
  snmpCommunity: string;
  snmpIfIndex: number;
  pollIntervalMs: number;
  dataRetentionDays: number;
  speedtestSchedule: string;
  trafficThresholdMbps: number;
}

const config = useRuntimeConfig();
const settings = ref<AppSettings | null>(null);

async function load() {
  settings.value = await $fetch<AppSettings>(`${config.public.apiUrl}/api/settings`);
}

async function save() {
  if (!settings.value) return;
  settings.value = await $fetch<AppSettings>(`${config.public.apiUrl}/api/settings`, {
    method: 'PUT',
    body: settings.value,
  });
}

onMounted(load);
</script>

<style scoped>
.page-title { font-size: 1.4rem; margin-bottom: 1.5rem; color: #00e676; }
.form { max-width: 480px; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; font-size: 0.85rem; color: #888; margin-bottom: 0.4rem; }
.form-group input {
  width: 100%;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  padding: 0.5rem 0.8rem;
  font-size: 0.95rem;
}
.btn-save {
  background: #00e676;
  color: #1a1a2e;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.6rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
