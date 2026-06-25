<template>
  <UDashboardNavbar title="접속 이력" />

  <UDashboardPanel class="overflow-y-auto">
    <div class="p-6">
      <UTable :data="events" :columns="columns">
        <template #timestamp-cell="{ row }">
          {{ formatDate(row.original.timestamp) }}
        </template>
        <template #mac-cell="{ row }">
          <span class="font-mono text-sm">{{ row.original.mac }}</span>
        </template>
      </UTable>
    </div>
  </UDashboardPanel>
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

const columns = [
  { accessorKey: 'timestamp', header: '감지 시각' },
  { accessorKey: 'mac', header: 'MAC' },
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'vendor', header: '제조사' },
];

async function loadEvents() {
  const data = await $fetch<NetworkEvent[]>(`${config.public.apiUrl}/api/events`);
  events.value = data;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

onMounted(loadEvents);
</script>
