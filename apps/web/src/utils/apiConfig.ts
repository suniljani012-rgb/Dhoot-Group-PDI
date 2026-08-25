export const getApiUrl = (path: string = ''): string => {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const base = isLocal ? 'http://localhost:8787' : 'https://dhoot-group-pdi-api.sunilbishnoi.workers.dev';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
