<template>
  <div>
    <h2 class="page-title">기기 목록</h2>

    <div v-if="newDeviceAlert" class="alert">
      새 기기 감지: {{ newDeviceAlert.mac }} ({{ newDeviceAlert.ip }})
      <button @click="newDeviceAlert = null">닫기</button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>IP</th>
          <th>MAC</th>
          <th>제조사</th>
          <th>별명</th>
          <th>마지막 접속</th>
          <th>화이트리스트</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="device in devices" :key="device.mac">
          <td>{{ device.ip }}</td>
          <td class="mono">{{ device.mac }}</td>
          <td>{{ device.vendor ?? '-' }}</td>
          <td>
            <input
              v-model="editAlias[device.mac]"
              class="alias-input"
              placeholder="별명 없음"
              @blur="saveAlias(device.mac)"
            />
          </td>
          <td>{{ formatDate(device.lastSeen) }}</td>
          <td>
            <input
              type="checkbox"
              :checked="device.isWhitelisted"
              @change="toggleWhitelist(device.mac, !device.isWhitelisted)"
            />
          </td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const { devices, newDeviceAlert, updateDevice } = useDevices();
const editAlias = ref<Record<string, string>>({});

watch(devices, (list) => {
  list.forEach((d) => {
    if (!(d.mac in editAlias.value)) {
      editAlias.value[d.mac] = d.alias ?? '';
    }
  });
}, { immediate: true });

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

<style scoped>
.page-title { font-size: 1.4rem; margin-bottom: 1.5rem; color: #00e676; }

.alert {
  background: #2a1a1a;
  border: 1px solid #ff6b6b;
  border-radius: 6px;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table { width: 100%; border-collapse: collapse; }
.table th, .table td {
  padding: 0.7rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid #2a2a3e;
}
.table th { font-size: 0.8rem; color: #888; }
.mono { font-family: monospace; font-size: 0.85rem; }

.alias-input {
  background: transparent;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  padding: 0.2rem 0.4rem;
  width: 120px;
}
</style>
