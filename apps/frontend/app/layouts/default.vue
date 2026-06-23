<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <template #header>
        <div class="flex items-center gap-2 px-2 py-1">
          <UIcon name="i-heroicons-signal" class="size-5 text-primary" />
          <span class="font-bold text-sm">Network Monitor</span>
        </div>
      </template>

      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        :ui="{ root: 'w-full', list: 'flex flex-col gap-0.5' }"
      />
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
const navItems = [
  [
    { label: '대시보드', to: '/', icon: 'i-heroicons-home' },
    { label: '기기 목록', to: '/devices', icon: 'i-heroicons-device-tablet' },
    { label: '히스토리', to: '/history', icon: 'i-heroicons-chart-bar' },
    { label: '속도 테스트', to: '/speedtest', icon: 'i-heroicons-signal' },
    { label: '접속 이력', to: '/events', icon: 'i-heroicons-shield-check' },
    { label: '설정', to: '/settings', icon: 'i-heroicons-cog-6-tooth' },
  ],
]
</script>
