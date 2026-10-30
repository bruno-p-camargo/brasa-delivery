export const BASE_URL = 'https://apifakedelivery.vercel.app';

// GET com timeout de 8 s. Lança erro se a resposta não for 2xx.
export async function get(path) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch(BASE_URL + path, { signal: ctl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
