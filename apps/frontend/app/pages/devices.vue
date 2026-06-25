<template>
  <UDashboardNavbar title="기기 목록" />

  <UDashboardPanel class="overflow-y-auto">
    <div class="p-6 space-y-4">
      <UAlert
        v-if="newDeviceAlert"
        icon="i-heroicons-exclamation-triangle"
        color="warning"
        variant="soft"
        :title="`새 기기 감지: ${newDeviceAlert.mac}`"
        :description="`IP: ${newDeviceAlert.ip}`"
        :close-button="{ icon: 'i-heroicons-x-mark', color: 'neutral', variant: 'link' }"
        @close="newDeviceAlert = null"
      />

      <UTable :data="devices" :columns="columns">
        <template #alias-cell="{ row }">
          <UInput
            v-model="editAlias[row.original.mac]"
            size="xs"
            placeholder="별명 없음"
            @blur="saveAlias(row.original.mac)"
          />
        </template>
        <template #isWhitelisted-cell="{ row }">
          <UToggle
            :model-value="row.original.isWhitelisted"
            @update:model-value="(v: boolean) => toggleWhitelist(row.original.mac, v)"
          />
        </template>
        <template #lastSeen-cell="{ row }">
          {{ formatDate(row.original.lastSeen) }}
        </template>
      </UTable>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
interface Device {
  mac: string;
  ip: string;
  hostname?: string;
  alias?: string;
  vendor?: string;
  isWhitelisted: boolean;
  lastSeen: string;
  firstSeen: string;
}

const { devices, newDeviceAlert, updateDevice } = useDevices();
const editAlias = ref<Record<string, string>>({});

const columns = [
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'mac', header: 'MAC' },
  { accessorKey: 'vendor', header: '제조사' },
  { accessorKey: 'alias', header: '별명' },
  { accessorKey: 'lastSeen', header: '마지막 접속' },
  { accessorKey: 'isWhitelisted', header: '화이트리스트' },
];

watch(
  devices,
  (list) => {
    list.forEach((d: Device) => {
      if (!(d.mac in editAlias.value)) {
        editAlias.value[d.mac] = d.alias ?? '';
      }
    });
  },
  { immediate: true },
);

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

async function saveAlias(mac: string) {
  await updateDevice(mac, { alias: editAlias.value[mac] });
}

async function toggleWhitelist(mac: string, value: boolean) {
  await updateDevice(mac, { isWhitelisted: value });
}
</script>
