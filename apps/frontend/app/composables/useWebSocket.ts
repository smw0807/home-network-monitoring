interface WsMessage<T = unknown> {
  event: string;
  data: T;
}

type WsHandler<T = unknown> = (data: T) => void;

export function useWebSocket() {
  const config = useRuntimeConfig();
  let ws: WebSocket | null = null;
  const handlers = new Map<string, WsHandler[]>();

  function connect() {
    const url = config.public.wsUrl as string;
    ws = new WebSocket(url);

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
