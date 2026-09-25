import { SetMetadata } from '@nestjs/common';

export const THROTTLE_METADATA = 'THROTTLE_METADATA';
export const SKIP_THROTTLE_METADATA = 'SKIP_THROTTLE_METADATA';

export interface ThrottleOptions {
  limit: number;
  ttl: number; // in milliseconds
}

export function Throttle(
  options: { default: ThrottleOptions } | ThrottleOptions,
) {
  const config = 'default' in options ? options.default : options;
  return SetMetadata(THROTTLE_METADATA, config);
}

export function SkipThrottle() {
  return SetMetadata(SKIP_THROTTLE_METADATA, true);
}
