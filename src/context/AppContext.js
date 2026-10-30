import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const EMPTY = { restaurant: null, items: [] };

// Estado global do app: sacola, favoritos e último pedido (tudo em memória, por ser um protótipo).
export function AppProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [favs, setFavs] = useState({});
  const [order, setOrder] = useState(null);
  const [userId, setUserId] = useState('1'); // usuário logado (rota /users/:id)
  const nextId = useRef(4821);

  const value = useMemo(() => ({
    cart, favs, order, userId, setUserId,
    count: cart.items.reduce((a, i) => a + i.qty, 0),
    toggleFav: (id) => setFavs((f) => ({ ...f, [id]: !f[id] })),
    // Adiciona (ou, com editKey, substitui) um item. Se for de outro restaurante, começa uma sacola nova.
    addItem: (restaurant, item, editKey) => setCart((c) => {
      const base = c.restaurant && c.restaurant.id === restaurant.id ? c : { restaurant, items: [] };
      const items = editKey ? base.items.map((i) => (i.key === editKey ? { ...item, key: editKey } : i))
        : [...base.items, { ...item, key: String(Date.now() + Math.random()) }];
      return { ...base, items };
    }),
    setQty: (key, qty) => setCart((c) => {
      const items = qty <= 0 ? c.items.filter((i) => i.key !== key) : c.items.map((i) => (i.key === key ? { ...i, qty } : i));
      return items.length ? { ...c, items } : EMPTY;
    }),
    clearCart: () => setCart(EMPTY),
    placeOrder: (total, address) => {
      const o = { id: nextId.current++, createdAt: Date.now(), restaurant: cart.restaurant, items: cart.items, total, address, payment: 'Pix' };
      setOrder(o); setCart(EMPTY); return o;
    },
  }), [cart, favs, order]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
