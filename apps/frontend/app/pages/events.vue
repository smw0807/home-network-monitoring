<template>
  <div>
    <h2 class="page-title">
      접속 이력
    </h2>

    <table class="table">
      <thead>
        <tr>
          <th>감지 시각</th>
          <th>MAC</th>
          <th>IP</th>
          <th>제조사</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(event, i) in events"
          :key="i"
        >
          <td>{{ formatDate(event.timestamp) }}</td>
          <td class="mono">
            {{ event.mac }}
          </td>
          <td>{{ event.ip }}</td>
          <td>{{ event.vendor ?? '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface NetworkEvent {
  timestamp: string;
  mac: string;
  ip: string;
  vendor?: string;
}

const config = useRuntimeConfig();
const events = ref<NetworkEvent[]>([]);

async function loadEvents() {
  const data = await $fetch<NetworkEvent[]>(`${config.public.apiUrl}/api/events`);
  events.value = data;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

onMounted(loadEvents);
</script>

<style scoped>
.page-title { font-size: 1.4rem; margin-bottom: 1.5rem; color: #00e676; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 0.7rem 0.8rem; text-align: left; border-bottom: 1px solid #2a2a3e; }
.table th { font-size: 0.8rem; color: #888; }
.mono { font-family: monospace; font-size: 0.85rem; }
</style>
