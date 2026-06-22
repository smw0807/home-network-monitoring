<template>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-logo">
        <h1>Network Monitor</h1>
      </div>
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink :to="item.path" class="nav-link" active-class="active">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', label: '대시보드' },
  { path: '/devices', label: '기기 목록' },
  { path: '/history', label: '히스토리' },
  { path: '/speedtest', label: '속도 테스트' },
  { path: '/events', label: '접속 이력' },
  { path: '/settings', label: '설정' },
];
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #1a1a2e;
  color: #fff;
  padding: 1.5rem 1rem;
  flex-shrink: 0;
}

.sidebar-logo h1 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #00e676;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: block;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  color: #aaa;
  text-decoration: none;
  margin-bottom: 0.25rem;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover,
.nav-link.active {
  background: #00e676;
  color: #1a1a2e;
}

.content {
  flex: 1;
  padding: 2rem;
  background: #0f0f1a;
  color: #e0e0e0;
  overflow-y: auto;
}
</style>
