export interface TrafficSnapshot {
  timestamp: Date;
  inOctets: number;
  outOctets: number;
}

export interface TrafficRate {
  timestamp: Date;
  inBps: number;
  outBps: number;
  totalIn: number;
  totalOut: number;
}
