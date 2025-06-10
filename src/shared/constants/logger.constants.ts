export const LOGGER_TOKEN = 'LOGGER_TOKEN';

// Log Prefixes
export const LOG_PREFIXES = {
  LOG: '[LOG]',
  ERROR: '[ERROR]',
  WARN: '[WARN]',
  DEBUG: '[DEBUG]',
  VERBOSE: '[VERBOSE]',
} as const;

// Log Levels
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly',
} as const;
