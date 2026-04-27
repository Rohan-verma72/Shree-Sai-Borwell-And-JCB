const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function isAdminAuthConfigured() {
  return Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);
}

export function isValidBasicAuthHeader(headerValue: string | null) {
  if (!isAdminAuthConfigured() || !headerValue?.startsWith('Basic ')) {
    return false;
  }

  const encoded = headerValue.slice('Basic '.length);
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separatorIndex = decoded.indexOf(':');

  if (separatorIndex === -1) {
    return false;
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
