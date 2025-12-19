export const PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  CREDIT_CARD: /\b(?:\d{4}[ -]?){3}\d{4}\b/g,
  IP_ADDRESS: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
};

export const REDACTION_MASKS = {
  EMAIL: '[REDACTED_EMAIL]',
  PHONE: '[REDACTED_PHONE]',
  CREDIT_CARD: '[REDACTED_CC]',
  IP_ADDRESS: '[REDACTED_IP]'
};

/**
 * Redacts PII (Personally Identifiable Information) from a string value.
 */
export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;
  redacted = redacted.replace(PATTERNS.EMAIL, REDACTION_MASKS.EMAIL);
  redacted = redacted.replace(PATTERNS.PHONE, REDACTION_MASKS.PHONE);
  redacted = redacted.replace(PATTERNS.CREDIT_CARD, REDACTION_MASKS.CREDIT_CARD);
  // IP Address redaction can be aggressive and match version numbers, so use with caution or specific context.
  // For general CSV data, it's safer to enable it.
  redacted = redacted.replace(PATTERNS.IP_ADDRESS, REDACTION_MASKS.IP_ADDRESS);

  return redacted;
}

/**
 * Deeply redacts PII from an object or array.
 */
export function redactData<T>(data: T): T {
  if (typeof data === 'string') {
    return redactPII(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactData(item)) as unknown as T;
  }

  if (typeof data === 'object' && data !== null) {
    const redactedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      redactedObj[key] = redactData(value);
    }
    return redactedObj as unknown as T;
  }

  return data;
}
