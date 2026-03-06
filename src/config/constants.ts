Set-Content -Path "src/config/constants.ts" -Value @"
export const FILE_SIZE_LIMIT_MB = 50;
export const FILE_SIZE_LIMIT_BYTES = FILE_SIZE_LIMIT_MB * 1024 * 1024;

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/html',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const FILE_EXPIRY_DAYS = 14;

export const PRINT_STATUS = {
  QUEUED: 'queued',
  PRINTING: 'printing',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;
"@