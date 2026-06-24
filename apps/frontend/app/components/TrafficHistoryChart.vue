<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

interface Bucket {
  key_as_string: string;
  avg_in: { value: number | null };
  avg_out: { value: number | null };
}

const props = defineProps<{
  buckets: Bucket[];
  range: string;
}>();

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.buckets.map((b) => formatLabel(b.key_as_string, props.range)),
  datasets: [
    {
      label: '평균 수신 (↓)',
      data: props.buckets.map((b) => bpsToMbps(b.avg_in.value ?? 0)),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: props.buckets.length <= 60 ? 3 : 0,
      pointHoverRadius: 5,
    },
    {
      label: '평균 송신 (↑)',
      data: props.buckets.map((b) => bpsToMbps(b.avg_out.value ?? 0)),
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: props.buckets.length <= 60 ? 3 : 0,
      pointHoverRadius: 5,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
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
        title: (items) => items[0]?.label ?? '',
        label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(2)} Mbps`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(128,128,128,0.15)' },
      ticks: {
        maxTicksLimit: 10,
        maxRotation: 0,
        color: 'rgba(156,163,175,0.9)',
        font: { size: 11 },
      },
    },
    y: {
      grid: { color: 'rgba(128,128,128,0.15)' },
      ticks: {
        color: 'rgba(156,163,175,0.9)',
        font: { size: 11 },
        callback: (value) => `${value} Mbps`,
      },
      min: 0,
    },
  },
}));

function bpsToMbps(bps: number): number {
  return Math.round((bps * 8) / 1_000_000 * 100) / 100;
}

function formatLabel(iso: string, range: string): string {
  const d = new Date(iso);
  if (range === '1h' || range === '6h') {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
  if (range === '24h') {
    return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' });
}
</script>
