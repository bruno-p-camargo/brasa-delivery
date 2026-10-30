// Converte o JSON da API para o formato usado pelas telas.
// >>> Se os nomes dos campos da API forem diferentes, ajuste as listas de chaves abaixo. <<<
// Campos ausentes recebem valores padrão para o protótipo não quebrar.
const pick = (o, keys, def) => { for (const k of keys) if (o && o[k] != null && o[k] !== '') return o[k]; return def; };
const toNum = (v, def) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : def; };
const idOf = (v) => (v && typeof v === 'object' ? String(pick(v, ['id', '_id'], '')) : v == null ? '' : String(v));

// Lista pode vir como array direto ou dentro de { data | items | results }
export const list = (d) => (Array.isArray(d) ? d : pick(d, ['data', 'items', 'results', 'users', 'restaurants', 'foods'], []));
// Item único pode vir como objeto, { data: {} } ou array de 1 elemento
export const one = (d) => (Array.isArray(d) ? d[0] : pick(d, ['data', 'result'], d));

const photo = (o, extra = []) => pick(o, ['image', 'imagem', 'img', 'photo', 'picture', 'thumbnail', 'avatar', 'url', ...extra], null);

export function user(u) {
  if (!u || typeof u !== 'object') return null;
  const a = pick(u, ['address', 'endereco'], null);
  const addr = a && typeof a === 'object' ? [pick(a, ['street', 'rua', 'logradouro'], ''), pick(a, ['number', 'numero'], '')].filter(Boolean).join(', ') : a;
  return { id: idOf(u.id ?? u._id), name: pick(u, ['name', 'nome', 'username'], 'Visitante'), email: pick(u, ['email'], ''),
    phone: pick(u, ['phone', 'telefone'], ''), address: addr || 'Rua dos Pinheiros, 870', avatar: photo(u) };
}

export function restaurant(r) {
  if (!r || typeof r !== 'object') return null;
  const time = String(pick(r, ['deliveryTime', 'delivery_time', 'time', 'tempo', 'tempoEntrega'], '30–40 min'));
  const fee = toNum(pick(r, ['deliveryFee', 'delivery_fee', 'fee', 'taxa', 'taxaEntrega'], 4.99), 4.99);
  const image = photo(r, ['cover', 'capa', 'banner']);
  const name = pick(r, ['name', 'nome', 'title'], 'Restaurante');
  return { id: idOf(r.id ?? r._id), name, logo: name.slice(0, 5).toUpperCase(),
    category: pick(r, ['category', 'categoria', 'cuisine', 'type', 'tipo'], 'Restaurante'),
    description: pick(r, ['description', 'descricao'], pick(r, ['category', 'categoria', 'cuisine'], 'Restaurante')),
    rating: toNum(pick(r, ['rating', 'nota', 'stars'], 4.5), 4.5), reviews: toNum(pick(r, ['reviews', 'avaliacoes'], 200), 200),
    distance: toNum(pick(r, ['distance', 'distancia'], 1.2), 1.2), time, timeMax: parseInt(time.split(/[–-]/).pop(), 10) || 40,
    fee, free: fee === 0, minOrder: toNum(pick(r, ['minOrder', 'minimo', 'minimum'], 20), 20), open: pick(r, ['open', 'isOpen', 'aberto'], true) !== false,
    promo: pick(r, ['promo', 'promocao'], ''), badge: pick(r, ['badge'], ''), image, coupon: null };
}

export function food(f) {
  if (!f || typeof f !== 'object') return null;
  const desc = pick(f, ['description', 'descricao', 'details'], '');
  return { id: idOf(f.id ?? f._id), name: pick(f, ['name', 'nome', 'title'], 'Prato'), description: desc, longDescription: desc,
    price: toNum(pick(f, ['price', 'preco', 'valor'], 0), 0), category: pick(f, ['category', 'categoria', 'type'], 'Mais pedidos'),
    restaurantId: idOf(pick(f, ['restaurantId', 'restaurant_id', 'restaurant', 'idRestaurant', 'restaurante'], '')),
    image: photo(f), tag: pick(f, ['tag', 'destaque'], ''), includes: '', groups: pick(f, ['groups', 'grupos', 'options'], []) };
}
