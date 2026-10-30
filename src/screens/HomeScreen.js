import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, brl, img, num } from '../theme';
import { getRestaurants, getUser } from '../api';
import { useAsync } from '../hooks';
import { useApp } from '../context/AppContext';
import { Ic, Loading, Message, Rating, SourceNotice, T } from '../components/ui';

const CATS = [
  ['Lanches', 'Hambúrguer', require('../../assets/img/cat-lanches.jpg')], ['Pizza', 'Pizza', require('../../assets/img/cat-pizza.jpg')],
  ['Brasileira', 'Brasileira', require('../../assets/img/cat-brasileira.jpg')], ['Japonesa', 'Japonesa', require('../../assets/img/cat-japonesa.jpg')],
];

export default function HomeScreen({ navigation }) {
  const { userId } = useApp();
  const { data, loading, error, reload } = useAsync(() => Promise.all([getUser(userId), getRestaurants()]), [userId]);
  if (loading) return <Loading />;
  if (error || !data[0]) return <Message title="Não conseguimos carregar" text="Verifique sua conexão." action="Tentar de novo" onAction={reload} />;

  const [user, restaurants] = data; const r = restaurants[0];
  const h = new Date().getHours(); const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <SourceNotice />
        <View style={s.addr}>
          <View>
            <T style={{ fontSize: 11, fontFamily: F.sb, color: C.muted }}>ENTREGAR EM CASA</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <T style={{ fontFamily: F.xb, fontSize: 16 }}>{user.address}</T><Ic n="down" s={18} c={C.red} />
            </View>
          </View>
          <View style={s.bell}><Ic n="bell" s={20} /></View>
        </View>

        <Pressable style={s.search} onPress={() => navigation.navigate('Search')} accessibilityRole="search">
          <Ic n="search" s={20} c={C.red} /><T style={{ color: '#7a7a7a' }}>O que vai matar sua fome?</T>
        </Pressable>

        <T style={{ fontFamily: F.xb, fontSize: 24, letterSpacing: -0.4 }}>{greet}, {user.name} <T style={{ color: C.red, fontFamily: F.xb, fontSize: 24 }}>:)</T></T>

        <View style={s.cats}>
          {CATS.map(([label, q, src]) => (
            <Pressable key={label} style={{ alignItems: 'center', width: 68 }} onPress={() => navigation.navigate('Search', { q })}>
              <Image source={src} style={s.catImg} /><T style={{ fontSize: 12.5 }}>{label}</T>
            </Pressable>
          ))}
        </View>

        <View style={s.banner}>
          <View style={{ flex: 1.1, padding: 18, justifyContent: 'space-between' }}>
            <View>
              <T style={{ color: '#fff', fontFamily: F.xb, fontSize: 25, lineHeight: 27, letterSpacing: -0.5 }}>Hoje tem burger.</T>
              <T style={{ color: '#fff', fontSize: 12, marginTop: 6 }}>R$ 5 off no seu jantar</T>
            </View>
            <T style={{ color: '#fff', fontFamily: F.xb, fontSize: 13 }}>Aproveitar →</T>
          </View>
          <Image source={require('../../assets/img/banner.jpg')} style={{ flex: 1 }} resizeMode="cover" />
        </View>

        <View style={s.sec}>
          <T style={{ fontFamily: F.xb, fontSize: 20 }}>Sua próxima boa pedida</T>
          <Pressable onPress={() => navigation.navigate('Search')}><T style={{ color: C.red, fontFamily: F.b, fontSize: 13 }}>Ver todos</T></Pressable>
        </View>

        {r && (
          <Pressable style={s.card} onPress={() => navigation.navigate('Restaurant', { id: r.id })}>
            <View style={{ height: 132 }}>
              {r.image && <Image source={img(r.image)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
              {!!r.badge && <View style={s.pill}><Ic n="award" s={13} c={C.red} /><T style={{ fontFamily: F.xb, fontSize: 10 }}>{r.badge.toUpperCase()}</T></View>}
            </View>
            <View style={{ padding: 14 }}>
              <View style={s.row}><T style={{ fontFamily: F.xb, fontSize: 17 }}>{r.name}</T><Rating value={num(r.rating)} s={14} /></View>
              <T style={s.meta}>{r.category} · {r.time} · {r.free ? 'Grátis' : brl(r.fee)}</T>
              {!!r.promo && <T style={s.promo}>{r.promo}</T>}
            </View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  addr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, borderRadius: 12, backgroundColor: C.soft, paddingHorizontal: 14, marginVertical: 18 },
  cats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 20 },
  catImg: { width: 68, height: 68, borderRadius: 20, marginBottom: 6 },
  banner: { flexDirection: 'row', height: 160, borderRadius: 16, overflow: 'hidden', backgroundColor: C.red },
  sec: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26, marginBottom: 14 },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 14, overflow: 'hidden' },
  pill: { position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: C.muted, fontSize: 13, marginTop: 3 }, promo: { color: C.red, fontFamily: F.b, fontSize: 12.5, marginTop: 5 },
});
