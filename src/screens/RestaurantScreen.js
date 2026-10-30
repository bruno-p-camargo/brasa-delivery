import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, brl, img, num } from '../theme';
import { getFoods, getRestaurant } from '../api';
import { useAsync } from '../hooks';
import { useApp } from '../context/AppContext';
import { Ic, Loading, Logo, Message, Rating, Round, T } from '../components/ui';

export default function RestaurantScreen({ navigation, route }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const { favs, toggleFav, cart, count } = useApp();
  const [cat, setCat] = useState('Mais pedidos');
  const { data, loading, error, reload } = useAsync(() => Promise.all([getRestaurant(id), getFoods()]), [id]);

  if (loading) return <Loading />;
  if (error || !data[0]) return <Message title="Restaurante não encontrado" action="Voltar" onAction={() => navigation.goBack()} />;

  const [r, allFoods] = data;
  // Pratos do restaurante (campo restaurantId). Se a API não trouxer esse vínculo, mostramos todos.
  const mine = allFoods.filter((f) => f.restaurantId === r.id);
  const foods = mine.length ? mine : allFoods;
  const isTop = (f) => f.top !== false;
  const cats = ['Mais pedidos', ...new Set(foods.map((f) => f.category).filter((c) => c && c !== 'Mais pedidos'))];
  const list = foods.filter((f) => (cat === 'Mais pedidos' ? isTop(f) : f.category === cat));
  const c = r.coupon;
  const showBag = count > 0 && cart.restaurant?.id === r.id;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: showBag ? 110 : 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 190 }}>
          {(r.cover || r.image) && <Image source={img(r.cover || r.image)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
          <View style={[s.bt, { top: insets.top + 8, left: 24 }]}><Round n="left" label="Voltar" onPress={() => navigation.goBack()} /></View>
          <View style={[s.bt, { top: insets.top + 8, right: 24 }]}>
            <Round n={favs[r.id] ? 'heartOn' : 'heart'} label="Favoritar" onPress={() => toggleFav(r.id)} />
            <Round n="search" label="Buscar" onPress={() => navigation.navigate('Search')} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ marginTop: -34, marginBottom: 12, alignSelf: 'flex-start' }}><Logo r={r} /></View>
          <View style={s.row}><T style={{ fontFamily: F.xb, fontSize: 28, letterSpacing: -0.6, flex: 1 }}>{r.name}</T><Ic n="verified" s={28} c={C.red} /></View>
          <T style={{ color: C.muted, fontSize: 13, marginVertical: 8 }}>
            {r.description} · {num(r.distance)} km · <T style={{ color: r.open ? C.green : C.muted, fontSize: 13 }}>{r.open ? 'Aberto' : 'Fechado'}</T>
          </T>
          <View style={s.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Rating value={num(r.rating)} s={15} /><T style={{ color: C.muted }}>(mais de {r.reviews} avaliações)</T>
            </View>
            <Ic n="right" s={16} c={C.red} />
          </View>
          <View style={[s.row, { justifyContent: 'flex-start', gap: 8, marginTop: 12, marginBottom: 16 }]}>
            <Ic n="bike" s={22} /><T style={{ fontFamily: F.b, fontSize: 13 }}>{r.time}</T>
            <T style={{ color: C.muted, fontSize: 13 }}>· {r.free ? 'Entrega grátis' : brl(r.fee)} · Mín. {brl(r.minOrder).replace(',00', '')}</T>
          </View>
          {c && (
            <View style={s.coupon}>
              <Ic n="ticket" s={26} c={C.red} />
              <View style={{ flex: 1 }}>
                <T style={{ color: C.red, fontFamily: F.xb }}>{c.title}</T>
                <T style={{ fontSize: 12.5, color: '#6b6b6b' }}>Use {c.code} em pedidos acima de {brl(c.above).replace(',00', '')}</T>
              </View>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap} contentContainerStyle={{ paddingHorizontal: 24, gap: 26 }}>
          {cats.map((k) => (
            <Pressable key={k} onPress={() => setCat(k)} style={[s.tab, cat === k && { borderBottomColor: C.red }]}>
              <T style={{ fontSize: 15, fontFamily: cat === k ? F.xb : F.r, color: cat === k ? C.red : C.muted }}>{k}</T>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 24 }}>
          <T style={{ fontFamily: F.xb, fontSize: 24, letterSpacing: -0.5, marginTop: 22, marginBottom: 6 }}>{cat === 'Mais pedidos' ? 'Os favoritos da galera' : cat}</T>
          {list.map((f) => (
            <Pressable key={f.id} style={s.dish} onPress={() => navigation.navigate('Dish', { id: f.id })}>
              <View style={{ flex: 1 }}>
                {!!f.tag && <T style={{ color: C.red, fontFamily: F.xb, fontSize: 10.5 }}>{f.tag.toUpperCase()}</T>}
                <T style={{ fontFamily: F.xb, fontSize: 16 }}>{f.name}</T>
                <T style={{ color: C.muted, fontSize: 13, marginVertical: 6 }} numberOfLines={3}>{f.description}</T>
                <T style={{ fontFamily: F.xb, fontSize: 16 }}>{brl(f.price)}</T>
              </View>
              <View>
                {f.image && <Image source={img(f.image)} style={{ width: 93, height: 93, borderRadius: 14 }} />}
                <View style={s.plus}><Ic n="plus" s={18} c={C.red} /></View>
              </View>
            </Pressable>
          ))}
          {list.length === 0 && <Message title="Sem pratos nesta categoria" />}
        </View>
      </ScrollView>

      {showBag && (
        <View style={[s.foot, { paddingBottom: insets.bottom + 14 }]}>
          <Pressable style={s.bag} onPress={() => navigation.navigate('Bag')}>
            <T style={s.bagTx}>Ver sacola</T><T style={s.bagTx}>{count} {count > 1 ? 'itens' : 'item'}</T>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bt: { position: 'absolute', flexDirection: 'row', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coupon: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.pink, borderRadius: 12, padding: 14 },
  tabsWrap: { marginTop: 20, borderBottomWidth: 1, borderBottomColor: C.line, flexGrow: 0 },
  tab: { paddingTop: 10, paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: 'transparent', marginBottom: -1 },
  dish: { flexDirection: 'row', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  plus: { position: 'absolute', right: 6, bottom: 6, width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  foot: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 14, paddingHorizontal: 24 },
  bag: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52, borderRadius: 12, backgroundColor: C.red, paddingHorizontal: 20 },
  bagTx: { color: '#fff', fontFamily: F.xb, fontSize: 16 },
});
