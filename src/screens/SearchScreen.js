import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, brl, img, norm, num } from '../theme';
import { getFoods, getRestaurants } from '../api';
import { useAsync } from '../hooks';
import { useApp } from '../context/AppContext';
import { Ic, Loading, Message, Rating, T } from '../components/ui';

const SORTS = [['relevance', 'Relevância'], ['rating', 'Melhor nota'], ['time', 'Mais rápido'], ['distance', 'Mais perto']];
const SORT_FN = { rating: (a, b) => b.rating - a.rating, time: (a, b) => a.timeMax - b.timeMax, distance: (a, b) => a.distance - b.distance };

export default function SearchScreen({ navigation, route }) {
  const { favs, toggleFav } = useApp();
  const [q, setQ] = useState(route.params?.q || '');
  const [tab, setTab] = useState('restaurants');
  const [fast, setFast] = useState(false);
  const [free, setFree] = useState(false);
  const [sort, setSort] = useState(0);
  const { data, loading, error, reload } = useAsync(() => Promise.all([getRestaurants(), getFoods()]), []);

  // Quando a Home navega para cá já com uma categoria (ex.: "Pizza"), aplica a busca
  React.useEffect(() => { if (route.params?.q !== undefined) setQ(route.params.q); }, [route.params?.q]);

  if (loading) return <Loading />;
  if (error) return <Message title="Não conseguimos carregar" action="Tentar de novo" onAction={reload} />;

  const [all, foods] = data; const nq = norm(q);
  let rs = all.filter((r) => !nq || norm([r.name, r.category, r.description].join(' ')).includes(nq));
  if (fast) rs = rs.filter((r) => r.timeMax <= 40);
  if (free) rs = rs.filter((r) => r.free);
  if (SORT_FN[SORTS[sort][0]]) rs = [...rs].sort(SORT_FN[SORTS[sort][0]]);
  const dishes = foods.filter((f) => !nq || norm(f.name + ' ' + f.description).includes(nq));
  const title = nq === 'hamburguer' ? 'Burger do seu jeito' : q ? `Resultados para “${q}”` : 'Restaurantes perto de você';
  const cycleSort = () => setSort((i) => (i + 1) % SORTS.length);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={s.bar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Voltar"><Ic n="left" s={24} c={C.red} /></Pressable>
          <View style={s.input}>
            <Ic n="search" s={20} c={C.red} />
            <TextInput value={q} onChangeText={setQ} placeholder="O que vai matar sua fome?" placeholderTextColor="#7a7a7a" style={s.tx} returnKeyType="search" />
            {!!q && <Pressable onPress={() => setQ('')} hitSlop={8} accessibilityLabel="Limpar"><Ic n="xc" s={20} c="#8a8a8a" /></Pressable>}
          </View>
        </View>
        <View style={s.tabs}>
          {[['restaurants', 'Restaurantes'], ['dishes', 'Pratos']].map(([k, l]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[s.tab, tab === k && { borderBottomColor: C.red }]}>
              <T style={{ fontSize: 16, fontFamily: tab === k ? F.xb : F.m, color: tab === k ? C.red : C.muted }}>{l}</T>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Filtros" icon="filters" onPress={cycleSort} />
          <Chip label="Até 40 min" on={fast} onPress={() => setFast(!fast)} />
          <Chip label="Entrega grátis" on={free} onPress={() => setFree(!free)} />
        </ScrollView>

        {tab === 'restaurants' ? (
          <>
            <T style={s.title}>{title}</T>
            <View style={s.sub}>
              <T style={{ color: C.muted, fontSize: 13.5 }}>{rs.length} {rs.length === 1 ? 'restaurante' : 'restaurantes'} em Pinheiros</T>
              <Pressable onPress={cycleSort} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <T style={{ color: C.red, fontFamily: F.b, fontSize: 13 }}>{SORTS[sort][1]}</T><Ic n="down" s={14} c={C.red} />
              </Pressable>
            </View>
            {rs.length === 0 && <Message title="Nada por aqui ainda" text="Tire algum filtro ou busque outro prato." />}
            {rs.map((r) => (
              <Pressable key={r.id} style={s.item} onPress={() => navigation.navigate('Restaurant', { id: r.id })}>
                {r.image && <Image source={img(r.image)} style={s.thumb} />}
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: F.xb, fontSize: 17 }}>{r.name}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Rating value={num(r.rating)} s={12} /><T style={s.meta}>· {r.category} · {num(r.distance)} km</T>
                  </View>
                  <T style={s.meta}>{r.time} · {r.free ? <T style={{ color: C.green, fontSize: 13 }}>Grátis</T> : brl(r.fee)}</T>
                  {!!r.promo && <T style={s.promo}>{r.promo}</T>}
                </View>
                <Pressable onPress={() => toggleFav(r.id)} hitSlop={8} accessibilityLabel="Favoritar"><Ic n={favs[r.id] ? 'heartOn' : 'heart'} s={22} c={favs[r.id] ? C.red : C.muted} /></Pressable>
              </Pressable>
            ))}
            <View style={s.note}>
              <Ic n="pin" s={22} c="#b47813" />
              <View style={{ flex: 1 }}>
                <T style={{ fontFamily: F.b, marginBottom: 3 }}>Boa comida, bem pertinho</T>
                <T style={{ fontSize: 13, color: '#7a7a7a' }}>Opções selecionadas para chegar quentinhas na sua casa.</T>
              </View>
            </View>
          </>
        ) : (
          <>
            <T style={s.title}>Pratos</T>
            <T style={[s.sub, { color: C.muted, fontSize: 13.5 }]}>{dishes.length} {dishes.length === 1 ? 'prato encontrado' : 'pratos encontrados'}</T>
            {dishes.length === 0 && <Message title="Nenhum prato por aqui" text="Tente outro nome." />}
            {dishes.map((f) => (
              <Pressable key={f.id} style={s.item} onPress={() => navigation.navigate('Dish', { id: f.id })}>
                {f.image && <Image source={img(f.image)} style={s.thumb} />}
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: F.xb, fontSize: 17 }}>{f.name}</T>
                  <T style={s.meta}>{all.find((r) => r.id === f.restaurantId)?.name || ''}</T>
                  <T style={s.promo}>{brl(f.price)}</T>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Chip = ({ label, icon, on, onPress }) => (
  <Pressable onPress={onPress} style={[s.chip, on && { backgroundColor: C.pink, borderColor: C.red }]}>
    {icon && <Ic n={icon} s={16} />}<T style={{ fontSize: 13, fontFamily: on ? F.b : F.m, color: on ? C.red : C.ink }}>{label}</T>
  </Pressable>
);

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  input: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, borderRadius: 12, backgroundColor: C.soft, paddingHorizontal: 14 },
  tx: { flex: 1, fontFamily: F.r, fontSize: 15, color: C.ink, padding: 0 },
  tabs: { flexDirection: 'row', gap: 26, marginTop: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  tab: { paddingTop: 8, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: 'transparent', marginBottom: -1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 15, borderRadius: 19, borderWidth: 1, borderColor: C.line },
  title: { fontFamily: F.xb, fontSize: 26, letterSpacing: -0.5 },
  sub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 14 },
  item: { flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  thumb: { width: 86, height: 86, borderRadius: 16 },
  meta: { color: C.muted, fontSize: 13, marginTop: 2 }, promo: { color: C.red, fontFamily: F.b, fontSize: 12.5, marginTop: 5 },
  note: { flexDirection: 'row', gap: 12, backgroundColor: C.cream, borderRadius: 14, padding: 16, marginTop: 18 },
});
