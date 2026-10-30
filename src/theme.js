// Cores e tipografia extraídas das telas do Figma
export const C = { red: '#ea1d2c', ink: '#242424', muted: '#757575', line: '#e6e6e6', soft: '#f4f4f4',
  cream: '#fff4de', pink: '#fff0f1', green: '#1e7a3c', greenBg: '#edf8f0', gold: '#b47813', white: '#ffffff' };
export const F = { r: 'PlusJakartaSans_400Regular', m: 'PlusJakartaSans_500Medium', sb: 'PlusJakartaSans_600SemiBold',
  b: 'PlusJakartaSans_700Bold', xb: 'PlusJakartaSans_800ExtraBold' };

// Formatação manual (não depende de Intl, que varia entre dispositivos)
export const brl = (n) => 'R$ ' + Number(n).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const num = (n) => String(n).replace('.', ',');
export const hhmm = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
export const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// Aceita URL (vinda da API) ou require() (imagem local)
export const img = (s) => (typeof s === 'string' ? { uri: s } : s);
