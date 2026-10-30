import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, brl, img } from '../theme';
import { getUser } from '../api';
import { useAsync } from '../hooks';
import { useApp } from '../context/AppContext';
import { Btn, Ic, Logo, Message, Stepper, T } from '../components/ui';

const SERVICE_FEE = 0.99;

export default function BagScreen({ navigation }) {
  const { cart, setQty, clearCart, placeOrder, userId } = useApp();
  const { data: user } = useAsync(() => getUser(userId), [userId]);
  const r = cart.restaurant;

  const Header = ({ trash }) => (
    <View style={s.top}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Voltar"><Ic n="left" s={24} c={C.red} /></Pressable>
      <T style={{ fontFamily: F.b, fontSize: 16 }}>Sua sacola</T>
      {trash ? <Pressable onPress={() => Alert.alert('Esvaziar a sacola?', '', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Esvaziar', style: 'destructive', onPress: clearCart }])} hitSlop={8} accessibilityLabel="Esvaziar sacola"><Ic n="trash" s={22} c={C.red} /></Pressable> : <View style={{ width: 24 }} />}
    </View>
  );

  if (!cart.items.length) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}><Header />
      <Message title="Sua sacola está vazia" text="Escolha um prato e ele aparece aqui." action="Ver restaurantes" onAction={() => navigation.navigate('Tabs')} />
    </SafeAreaView>
  );

  const subtotal = cart.items.reduce((a, i) => a + i.unit * i.qty, 0);
  const cp = r.coupon; const discount = cp && subtotal >= cp.above ? cp.off : 0;
  const total = subtotal + r.fee + SERVICE_FEE - discount;
  const address = user ? user.address : '';

  const checkout = () => {
    placeOrder(total, address);
    navigation.reset({ index: 1, routes: [{ name: 'Tabs' }, { name: 'Order' }] }); // voltar leva à Home, não à sacola
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header trash />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={[s.row, { gap: 12, marginTop: 6 }]}>
          <Logo r={r} size={48} />
          <View style={{ flex: 1 }}><T style={{ fontFamily: F.xb, fontSize: 17 }}>{r.name}</T><T style={{ color: C.muted, fontSize: 13 }}>Entrega em {r.time}</T></View>
          <Pressable onPress={() => navigation.navigate('Restaurant', { id: r.id })}><T style={s.link}>Ver cardápio</T></Pressable>
        </View>

        {cart.items.map((i) => (
          <View key={i.key} style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            {i.image && <Image source={img(i.image)} style={{ width: 72, height: 80, borderRadius: 12 }} />}
            <View style={{ flex: 1 }}>
              <View style={s.row}><T style={{ fontFamily: F.xb, fontSize: 15, flex: 1 }}>{i.name}</T><T style={{ fontFamily: F.xb }}>{brl(i.unit * i.qty)}</T></View>
              {i.summary.map((l, k) => <T key={k} style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{l}</T>)}
              {!!i.notes && <T style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', marginTop: 3 }}>“{i.notes}”</T>}
              <View style={[s.row, { marginTop: 6 }]}>
                <Pressable onPress={() => navigation.navigate('Dish', { id: i.foodId, editKey: i.key })}><T style={s.link}>Editar</T></Pressable>
                <Stepper qty={i.qty} min={0} onChange={(n) => setQty(i.key, n)} />
              </View>
            </View>
          </View>
        ))}

        <Pressable onPress={() => navigation.navigate('Restaurant', { id: r.id })} style={s.add}><T style={s.link}>+ Adicionar mais itens</T></Pressable>

        <View style={s.line}>
          <Ic n="pin" s={24} c={C.red} />
          <View style={{ flex: 1 }}>
            <T style={s.lt}>Entregar em casa</T>
            <T style={s.ls}>{address} · Apto 42</T><T style={s.ls}>Pinheiros, São Paulo · SP</T>
          </View>
          <Ic n="right" s={16} c={C.red} />
        </View>
        <View style={s.line}>
          <Ic n="pix" s={26} c={C.green} />
          <View style={{ flex: 1 }}><T style={s.lt}>Pagar com Pix</T><T style={s.ls}>Rápido, seguro e sem complicação</T></View>
          <Pressable onPress={() => Alert.alert('Forma de pagamento', 'Por enquanto, só Pix.')}><T style={s.link}>Trocar</T></Pressable>
        </View>

        {discount > 0 && (
          <View style={s.ok}><Ic n="ticket" s={22} c={C.green} /><T style={{ flex: 1, color: C.green, fontFamily: F.b, fontSize: 13 }}>{cp.code} aplicado · você economizou {brl(discount)}!</T><Ic n="check" s={18} c={C.green} /></View>
        )}

        <T style={{ fontFamily: F.xb, fontSize: 19, marginTop: 24, marginBottom: 12 }}>Resumo do pedido</T>
        <Sum label="Subtotal" value={brl(subtotal)} />
        <Sum label="Taxa de entrega" value={r.free ? 'Grátis' : brl(r.fee)} />
        <Sum label="Taxa de serviço" value={brl(SERVICE_FEE)} />
        {discount > 0 && <Sum label={`Cupom ${cp.code}`} value={'− ' + brl(discount)} green />}
      </ScrollView>

      <View style={s.foot}>
        <View style={[s.row, { alignItems: 'baseline', marginBottom: 12 }]}>
          <T style={{ fontFamily: F.b, fontSize: 15 }}>Total <T style={{ color: C.muted, fontSize: 11.5 }}>com taxas</T></T>
          <T style={{ fontFamily: F.xb, fontSize: 26, letterSpacing: -0.5 }}>{brl(total)}</T>
        </View>
        <Btn label="Fazer pedido" onPress={checkout} disabled={!user} icon={<Ic n="lock" s={18} c="#fff" />} />
      </View>
    </SafeAreaView>
  );
}

const Sum = ({ label, value, green }) => (
  <View style={[s.row, { marginBottom: 9 }]}>
    <T style={{ color: green ? C.green : '#555' }}>{label}</T><T style={{ fontFamily: F.sb, color: green ? C.green : C.ink }}>{value}</T>
  </View>
);

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: C.red, fontFamily: F.b, fontSize: 13 },
  add: { alignItems: 'center', paddingTop: 18, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.line },
  line: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  lt: { fontFamily: F.xb, fontSize: 15, marginBottom: 2 }, ls: { fontSize: 12.5, color: C.muted },
  ok: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.greenBg, borderRadius: 12, padding: 14, marginTop: 16 },
  foot: { borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, backgroundColor: '#fff' },
});
