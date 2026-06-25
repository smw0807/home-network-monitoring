interface WsMessage<T = unknown> {
  event: string;
  data: T;
}

type WsHandler<T = unknown> = (data: T) => void;

export function useWebSocket() {
  const config = useRuntimeConfig();
  let ws: WebSocket | null = null;
  const handlers = new Map<string, WsHandler[]>();

  function resolveWsUrl(): string {
    const configured = config.public.wsUrl as string;
    if (configured) return configured;
    // Docker/nginx 배포 시: nginx가 /ws를 백엔드로 프록시하므로 현재 호스트 기반으로 결정
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}/ws`;
  }

  function connect() {
    ws = new WebSocket(resolveWsUrl());

    ws.onmessage = (e: MessageEvent<string>) => {
      const msg = JSON.parse(e.data) as WsMessage;
      const eventHandlers = handlers.get(msg.event);
      eventHandlers?.forEach((h) => h(msg.data));
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
  }

  function on<T>(event: string, handler: WsHandler<T>) {
    const list = handlers.get(event) ?? [];
    list.push(handler as WsHandler);
    handlers.set(event, list);
  }

  function off(event: string) {
    handlers.delete(event);
  }

  onMounted(connect);
  onUnmounted(() => {
    ws?.close();
    handlers.clear();
  });

  return { on, off };
}
