export interface AppSettings {
  routerIp: string;
  snmpCommunity: string;
  snmpIfIndex: number;
  pollIntervalMs: number;
  dataRetentionDays: number;
  speedtestSchedule: string;
  trafficThresholdMbps: number;
}
