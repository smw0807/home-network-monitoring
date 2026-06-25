<template>
  <UDashboardNavbar title="대시보드" />

  <UDashboardPanel class="overflow-y-auto">
    <div class="p-6 space-y-6">
      <!-- 실시간 속도 카드 -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <UCard>
          <div class="text-xs text-muted mb-1">
            ↓ 수신 속도
          </div>
          <div class="text-2xl font-bold">
            {{ inMbps.toFixed(2) }}
            <span class="text-sm font-normal text-muted">Mbps</span>
          </div>
        </UCard>

        <UCard>
          <div class="text-xs text-muted mb-1">
            ↑ 송신 속도
          </div>
          <div class="text-2xl font-bold">
            {{ outMbps.toFixed(2) }}
            <span class="text-sm font-normal text-muted">Mbps</span>
          </div>
        </UCard>

        <UCard>
          <div class="text-xs text-muted mb-1">
            총 수신량
          </div>
          <div class="text-2xl font-bold">
            {{ formatBytes(current?.totalIn ?? 0) }}
          </div>
        </UCard>

        <UCard>
          <div class="text-xs text-muted mb-1">
            총 송신량
          </div>
          <div class="text-2xl font-bold">
            {{ formatBytes(current?.totalOut ?? 0) }}
          </div>
        </UCard>
      </div>

      <!-- 실시간 차트 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">실시간 트래픽</span>
            <div class="flex items-center gap-3 text-xs text-muted">
              <span class="flex items-center gap-1.5">
                <span class="inline-block w-4 h-0.5 rounded bg-emerald-500" />수신 (↓)
              </span>
              <span class="flex items-center gap-1.5">
                <span class="inline-block w-4 h-0.5 rounded bg-rose-500" />송신 (↑)
              </span>
            </div>
          </div>
        </template>
        <div class="h-56">
          <ClientOnly>
            <TrafficRealtimeChart :points="history" />
          </ClientOnly>
        </div>
      </UCard>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const { current, history, inMbps, outMbps } = useTraffic();

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
</script>
