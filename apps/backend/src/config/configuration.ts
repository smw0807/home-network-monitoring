export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  router: {
    ip: process.env.ROUTER_IP ?? '192.168.0.1',
    snmpCommunity: process.env.SNMP_COMMUNITY ?? 'public',
    snmpIfIndex: parseInt(process.env.SNMP_IF_INDEX ?? '2', 10),
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS ?? '2000', 10),
  },
  elasticsearch: {
    node: process.env.ES_NODE ?? 'https://localhost:9200',
    username: process.env.ES_USERNAME ?? 'elastic',
    password: process.env.ES_PASSWORD ?? '',
  },
});
