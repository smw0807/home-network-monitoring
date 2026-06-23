<template>
  <UDashboardNavbar title="설정" />

  <UDashboardPanel>
    <div class="p-6 max-w-xl space-y-6">
      <UCard>
        <template #header>
          <span class="text-sm font-medium">공유기 / SNMP 설정</span>
        </template>

        <UForm v-if="settings" :state="settings" class="space-y-4" @submit="save">
          <UFormField label="공유기 IP" name="routerIp">
            <UInput v-model="settings.routerIp" placeholder="192.168.0.1" class="w-full" />
          </UFormField>

          <UFormField label="SNMP 커뮤니티" name="snmpCommunity">
            <UInput v-model="settings.snmpCommunity" placeholder="public" class="w-full" />
          </UFormField>

          <UFormField label="WAN 인터페이스 인덱스" name="snmpIfIndex">
            <UInput
              v-model.number="settings.snmpIfIndex"
              type="number"
              :min="1"
              class="w-full"
            />
          </UFormField>

          <UFormField label="폴링 간격 (ms)" name="pollIntervalMs">
            <UInput
              v-model.number="settings.pollIntervalMs"
              type="number"
              :min="500"
              class="w-full"
            />
          </UFormField>

          <UFormField label="데이터 보존 기간 (일)" name="dataRetentionDays">
            <UInput
              v-model.number="settings.dataRetentionDays"
              type="number"
              :min="1"
              class="w-full"
            />
          </UFormField>

          <UFormField label="트래픽 임계값 (Mbps)" name="trafficThresholdMbps">
            <UInput
              v-model.number="settings.trafficThresholdMbps"
              type="number"
              :min="0"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end pt-2">
            <UButton type="submit" :loading="saving">
              저장
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UDashboardPanel>
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
const saving = ref(false);

async function load() {
  settings.value = await $fetch<AppSettings>(`${config.public.apiUrl}/api/settings`);
}

async function save() {
  if (!settings.value) return;
  saving.value = true;
  settings.value = await $fetch<AppSettings>(`${config.public.apiUrl}/api/settings`, {
    method: 'PUT',
    body: settings.value,
  }).finally(() => {
    saving.value = false;
  });
}

onMounted(load);
</script>
