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

export function useDevices() {
  const config = useRuntimeConfig();
  const devices = ref<Device[]>([]);
  const newDeviceAlert = ref<Device | null>(null);

  async function fetchDevices() {
    const data = await $fetch<Device[]>(`${config.public.apiUrl}/api/devices`);
    devices.value = data;
  }

  async function updateDevice(mac: string, payload: Partial<Pick<Device, 'alias' | 'isWhitelisted'>>) {
    const updated = await $fetch<Device>(`${config.public.apiUrl}/api/devices/${mac}`, {
      method: 'PATCH',
      body: payload,
    });
    const idx = devices.value.findIndex((d) => d.mac === mac);
    if (idx !== -1) devices.value[idx] = updated;
  }

  const { on } = useWebSocket();

  on<{ devices: Device[] }>('devices', ({ devices: list }) => {
    devices.value = list;
  });

  on<Device>('new_device', (device) => {
    newDeviceAlert.value = device;
  });

  onMounted(fetchDevices);

  return { devices, newDeviceAlert, updateDevice };
}
