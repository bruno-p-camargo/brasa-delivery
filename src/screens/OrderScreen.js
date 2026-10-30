import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { C, F, brl, hhmm } from '../theme';
import { useApp } from '../context/AppContext';
import { Ic, Logo, Message, Round, T } from '../components/ui';

// A API não tem rota de pedidos: o acompanhamento é simulado pelo tempo decorrido desde o pedido (15 s, 40 s e 3 min).
const THRESHOLDS = [15e3, 40e3, 180e3];
const COPY = [['Pedido recebido!', (n) => `A ${n} confirmou seu pedido.`], ['Tá saindo da chapa!', () => 'Seu pedido está pronto e já vai sair.'],
  ['Tá chegando coisa boa!', (n) => `Seu pedido saiu da ${n} e está a caminho.`], ['Bom apetite!', () => 'Seu pedido foi entregue. Aproveite!']];
const STEPS = [['Confirmado', 'check'], ['Preparado', 'check'], ['A caminho', 'bike'], ['Entregue', 'home']];
const ROUTE = [[71, 170], [71, 102], [181, 102], [286, 60]]; // posição do entregador em cada etapa (mapa 354×222)
const soon = () => Alert.alert('Em breve', 'Esta função ainda não está disponível no protótipo.');

function RouteMap({ step }) {
  const { width } = useWindowDimensions();
  const w = Math.min(width, 430) - 48; const k = w / 354; const h = 222 * k;
  const Dot = ({ x, y, size = 28, bg, children, halo }) => (
    <>
      {halo && <View style={{ position: 'absolute', left: x * k - 20, top: y * k - 20, width: 40, height: 40, borderRadius: 20, backgroundColor: C.red, opacity: 0.16 }} />}
      <View style={[s.dot, { left: x * k - size / 2, top: y * k - size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>{children}</View>
    </>
  );
  const [bx, by] = ROUTE[step];
  return (
    <View style={{ width: w, height: h, borderRadius: 16, overflow: 'hidden', marginVertical: 16 }}>
      <Svg width={w} height={h} viewBox="0 0 354 222">
        <Rect width="354" height="222" fill="#f1eee8" />
        {[[0, 0, 64, 60], [104, 14, 86, 56], [225, 0, 129, 30], [0, 130, 64, 92], [92, 134, 106, 72], [225, 86, 40, 40]].map(([x, y, rw, rh], i) => <Rect key={i} x={x} y={y} width={rw} height={rh} rx="8" fill="#e6e2db" />)}
        <Rect x="262" y="130" width="70" height="70" rx="10" fill="#dbe7d3" />
        <SvgText x="12" y="38" fontSize="9" fill="#9a958b">PINHEIROS</SvgText>
        <SvgText x="108" y="108" fontSize="9" fill="#9a958b">Rua dos Pinheiros</SvgText>
        <SvgText x="268" y="168" fontSize="9" fill="#9a958b">Praça</SvgText><SvgText x="268" y="180" fontSize="9" fill="#9a958b">Benedito</SvgText>
        <Polyline points="71,170 71,102 224,102 224,60 286,60" fill="none" stroke={C.red} strokeWidth="4" strokeLinejoin="round" />
      </Svg>
      <Dot x={71} y={170} bg="#fff"><Ic n="fire" s={16} c={C.red} /></Dot>
      <Dot x={286} y={60} bg={C.ink}><Ic n="home" s={14} c="#fff" /></Dot>
      {step >= 2 && step < 3 && <Dot x={bx} y={by} size={26} bg={C.red} halo><Ic n="bike" s={16} c="#fff" /></Dot>}
      <View style={s.live}><View style={s.liveDot} /><T style={{ fontFamily: F.xb, fontSize: 10 }}>AO VIVO</T></View>
    </View>
  );
}

export default function OrderScreen({ navigation, embedded }) {
  const { order } = useApp();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 2000); return () => clearInterval(t); }, []);
  if (!order) return null;

  const step = THRESHOLDS.filter((t) => now - order.createdAt >= t).length;
  const [kicker, text] = COPY[step]; const name = order.restaurant.name;
  const qty = order.items.reduce((a, i) => a + i.qty, 0);
  const eta = step === 3 ? 'Entregue' : `${hhmm(order.createdAt + 30 * 60e3)} – ${hhmm(order.createdAt + 40 * 60e3)}`;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={s.top}>
        {embedded ? <View style={{ width: 36 }} /> : <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Voltar"><Ic n="left" s={24} c={C.red} /></Pressable>}
        <T style={{ fontFamily: F.b, fontSize: 16 }}>Pedido #{order.id}</T>
        <Round n="help" size={30} bg="#fff" ring label="Ajuda" onPress={soon} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <T style={{ color: C.red, fontFamily: F.xb, marginTop: 6 }}>{kicker}</T>
        <T style={{ fontFamily: F.xb, fontSize: 36, letterSpacing: -1, marginVertical: 4 }}>{eta}</T>
        <T style={{ color: C.muted }}>{text(name)}</T>

        <View style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}>
          {STEPS.map(([label, icon], x) => {
            const cur = x === step && x >= 2 && step < 3;
            return (
              <View key={label} style={{ flex: 1 }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: x <= step ? C.red : '#e4e4e4', marginBottom: 8 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ic n={x < step ? 'check' : icon} s={13} c={cur ? C.red : x <= step ? C.ink : C.muted} />
                  <T numberOfLines={1} style={{ fontSize: 11, fontFamily: cur ? F.xb : F.r, color: cur ? C.red : x <= step ? C.ink : C.muted }}>{label}</T>
                </View>
              </View>
            );
          })}
        </View>

        <RouteMap step={step} />

        <View style={s.courier}>
          <View style={s.avatar}><T style={{ color: C.gold, fontFamily: F.xb }}>LP</T></View>
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: F.xb, fontSize: 16 }}>Lucas Pereira</T>
            <T style={{ color: C.muted, fontSize: 12.5 }}>De bike · <T style={{ color: C.gold, fontSize: 12.5 }}>★</T> 4,9 · Seu entregador</T>
          </View>
          <Round n="chat" size={44} bg={C.pink} label="Chat" onPress={soon} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}>
          <Ic n="pin" s={22} c={C.red} />
          <View style={{ flex: 1 }}><T style={{ fontFamily: F.xb, fontSize: 15 }}>Entregar em casa</T><T style={{ color: C.muted, fontSize: 13 }}>{order.address} · Apto 42</T></View>
        </View>

        <Pressable style={s.summary} onPress={() => Alert.alert(`Pedido #${order.id}`, order.items.map((i) => `${i.qty}× ${i.name}`).join('\n'))}>
          <Logo r={order.restaurant} size={34} />
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: F.b }}>{qty} {order.items[0].name}{order.items.length > 1 ? ' + mais' : ''} · {brl(order.total)}</T>
            <T style={{ color: C.green, fontSize: 12.5 }}>Pago com {order.payment}</T>
          </View>
          <Ic n="right" s={16} c={C.red} />
        </Pressable>

        <Pressable onPress={soon} style={{ alignItems: 'center', marginTop: 26 }}><T style={{ color: C.red, fontFamily: F.b }}>Precisa de ajuda com o pedido?</T></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Aba "Pedidos": mostra o acompanhamento do último pedido ou um estado vazio
export function OrdersTab({ navigation }) {
  const { order } = useApp();
  if (order) return <OrderScreen navigation={navigation} embedded />;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <T style={{ fontFamily: F.xb, fontSize: 24, padding: 24 }}>Pedidos</T>
      <Message title="Nenhum pedido por enquanto" text="Quando você fizer um pedido, ele aparece aqui." action="Ver restaurantes" onAction={() => navigation.navigate('Home')} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 24 },
  dot: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.red },
  live: { position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  courier: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.soft, borderRadius: 14, padding: 12 },
});
