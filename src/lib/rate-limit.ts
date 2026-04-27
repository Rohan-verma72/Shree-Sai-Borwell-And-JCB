type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

const requestsByKey = new Map<string, RateLimitEntry>();

const DEFAULT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const DEFAULT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 20);

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

function getConfig() {
  const windowMs = Number.isFinite(DEFAULT_WINDOW_MS) && DEFAULT_WINDOW_MS > 0 ? DEFAULT_WINDOW_MS : 60_000;
  const maxRequests =
    Number.isFinite(DEFAULT_MAX_REQUESTS) && DEFAULT_MAX_REQUESTS > 0 ? DEFAULT_MAX_REQUESTS : 20;

  return { windowMs, maxRequests };
}

export function applyRateLimit(request: Request, namespace: string): RateLimitResult {
  const now = Date.now();
  const { windowMs, maxRequests } = getConfig();
  const key = `${namespace}:${getClientIdentifier(request)}`;
  const existing = requestsByKey.get(key);

  if (!existing || existing.resetAt <= now) {
    requestsByKey.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: Math.max(maxRequests - 1, 0),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  existing.count += 1;
  requestsByKey.set(key, existing);
  return {
    success: true,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    remaining: Math.max(maxRequests - existing.count, 0),
  };
}
