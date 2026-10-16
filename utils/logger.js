/**
 * Simple logger with timestamps and colour.
 * Replace with Winston/Pino later if you like.
 */
const colours = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg, ...args) =>
    console.log(`${colours.cyan}[INFO]${colours.reset} ${timestamp()} — ${msg}`, ...args),
  success: (msg, ...args) =>
    console.log(`${colours.green}[OK]${colours.reset}   ${timestamp()} — ${msg}`, ...args),
  warn: (msg, ...args) =>
    console.warn(`${colours.yellow}[WARN]${colours.reset} ${timestamp()} — ${msg}`, ...args),
  error: (msg, ...args) =>
    console.error(`${colours.red}[ERR]${colours.reset}  ${timestamp()} — ${msg}`, ...args),
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colours.magenta}[DBG]${colours.reset}  ${timestamp()} — ${msg}`, ...args);
    }
  },
};