import { networkInterfaces } from 'os';

import { NetworkType } from '../types';

/**
 * Detects and returns a list of local IP addresses to display at startup.
 * @param networkType @type {NetworkType} - The network type to resolve.
 * @param includeInternal @type {boolean} - Whether to include internal addresses.
 * @returns @type {string[]} - The list of local IP addresses.
 */
export function resolveListenAddresses(networkType: NetworkType = NetworkType.ipv4, includeInternal = false): string[] {
  const interfaces = networkInterfaces();
  const addresses: string[] = [];

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const addr of iface) {
      const isIPv4 = addr.family === 'IPv4';
      const isIPv6 = addr.family === 'IPv6';
      const matchesType =
        networkType === NetworkType.both ? isIPv4 || isIPv6 : networkType === NetworkType.ipv4 ? isIPv4 : isIPv6;
      if (matchesType && (includeInternal || !addr.internal)) {
        addresses.push(addr.address);
      }
    }
  }

  if (networkType !== NetworkType.ipv6) addresses.push('127.0.0.1');
  if (networkType !== NetworkType.ipv4) addresses.push('::1');
  addresses.push('localhost');
  return Array.from(new Set(addresses));
}
