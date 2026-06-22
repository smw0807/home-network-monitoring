interface TrafficRate {
  timestamp: string;
  inBps: number;
  outBps: number;
  totalIn: number;
  totalOut: number;
}

export function useTraffic() {
  const current = ref<TrafficRate | null>(null);
  const history = ref<TrafficRate[]>([]);
  const maxPoints = 60;

  const { on } = useWebSocket();

  on<TrafficRate>('traffic', (rate) => {
    current.value = rate;
    history.value.push(rate);
    if (history.value.length > maxPoints) {
      history.value.shift();
    }
  });

  const inMbps = computed(() =>
    current.value ? (current.value.inBps * 8) / 1_000_000 : 0,
  );

  const outMbps = computed(() =>
    current.value ? (current.value.outBps * 8) / 1_000_000 : 0,
  );

  return { current, history, inMbps, outMbps };
}
