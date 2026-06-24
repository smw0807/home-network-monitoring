<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

interface TrafficPoint {
  timestamp: string;
  inBps: number;
  outBps: number;
}

const props = defineProps<{ points: TrafficPoint[] }>();

const labels = computed(() => props.points.map((p) => formatTime(p.timestamp)));

const chartData = computed<ChartData<'line'>>(() => ({
  labels: labels.value,
  datasets: [
    {
      label: '수신 (↓)',
      data: props.points.map((p) => bpsToMbps(p.inBps)),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
    {
      label: '송신 (↑)',
      data: props.points.map((p) => bpsToMbps(p.outBps)),
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.12)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(2)} Mbps`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(128,128,128,0.15)' },
      ticks: {
        maxTicksLimit: 8,
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
</script>
