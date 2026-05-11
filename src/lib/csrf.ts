import { createHmac } from 'crypto';  // Use Node.js built-in crypto

const SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function generateCsrfToken(userId: number): Promise<string> {
  const data = `${userId}:${Date.now()}`;
  const hmacValue = createHmac('sha256', SECRET).update(data).digest('hex');
  return `${data}:${hmacValue}`;
}

export async function validateCsrfToken(token: string, userId: number): Promise<boolean> {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return false;
    const [tokenUserId, timestamp, signature] = parts;
    if (parseInt(tokenUserId) !== userId) return false;
    if (Date.now() - parseInt(timestamp) > 86400000) return false;  // 24h expiry
    const data = `${tokenUserId}:${timestamp}`;
    const hmacValue = createHmac('sha256', SECRET).update(data).digest('hex');
    return signature === hmacValue;
  } catch {
    return false;
  }
}