<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

interface SpeedResult {
  timestamp: string;
  download: number;
  upload: number;
  ping: number;
}

const props = defineProps<{ history: SpeedResult[] }>();

// 오래된 순으로 정렬 (차트는 시간 순)
const sorted = computed(() => [...props.history].reverse());

const chartData = computed<ChartData<'line'>>(() => ({
  labels: sorted.value.map((r) =>
    new Date(r.timestamp).toLocaleString('ko-KR', {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
  ),
  datasets: [
    {
      label: '다운로드',
      data: sorted.value.map((r) => r.download),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.12)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      yAxisID: 'y',
    },
    {
      label: '업로드',
      data: sorted.value.map((r) => r.upload),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.12)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      yAxisID: 'y',
    },
    {
      label: '핑',
      data: sorted.value.map((r) => r.ping),
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [4, 4],
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      yAxisID: 'y1',
    },
  ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(156,163,175,0.9)',
        boxWidth: 12,
        boxHeight: 2,
        font: { size: 12 },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed.y as number;
          return ctx.datasetIndex < 2
            ? ` ${ctx.dataset.label}: ${v.toFixed(1)} Mbps`
            : ` ${ctx.dataset.label}: ${v.toFixed(0)} ms`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(128,128,128,0.15)' },
      ticks: { color: 'rgba(156,163,175,0.9)', font: { size: 11 }, maxRotation: 0 },
    },
    y: {
      position: 'left',
      grid: { color: 'rgba(128,128,128,0.15)' },
      ticks: {
        color: 'rgba(156,163,175,0.9)',
        font: { size: 11 },
        callback: (v) => `${v} Mbps`,
      },
      min: 0,
    },
    y1: {
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: {
        color: 'rgba(245,158,11,0.9)',
        font: { size: 11 },
        callback: (v) => `${v} ms`,
      },
      min: 0,
    },
  },
}));
</script>
