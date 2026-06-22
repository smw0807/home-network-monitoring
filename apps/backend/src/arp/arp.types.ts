export interface ArpEntry {
  ip: string;
  mac: string;
  ifIndex: number;
}

export interface Device {
  mac: string;
  ip: string;
  hostname?: string;
  alias?: string;
  vendor?: string;
  isWhitelisted: boolean;
  lastSeen: Date;
  firstSeen: Date;
}
