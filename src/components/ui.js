import React from 'react';
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { C, F } from '../theme';
import { status } from '../api';

export const T = ({ style, ...p }) => <Text {...p} style={[{ fontFamily: F.r, color: C.ink, fontSize: 14 }, style]} />;

const ICONS = {
  home: ['f', 'home'], search: ['f', 'search'], receipt: ['f', 'file-text'], user: ['f', 'user'], bell: ['f', 'bell'],
  down: ['f', 'chevron-down'], right: ['f', 'chevron-right'], left: ['f', 'chevron-left'], xc: ['f', 'x-circle'],
  pin: ['f', 'map-pin'], plus: ['f', 'plus'], minus: ['f', 'minus'], check: ['f', 'check'], trash: ['f', 'trash-2'],
  lock: ['f', 'lock'], chat: ['f', 'message-square'], help: ['f', 'help-circle'], filters: ['f', 'sliders'], award: ['f', 'award'],
  heart: ['m', 'heart-outline'], heartOn: ['m', 'heart'], ticket: ['m', 'ticket-percent-outline'], bike: ['m', 'bike'],
  verified: ['m', 'check-decagram-outline'], pix: ['m', 'qrcode'], fire: ['m', 'fire'], star: ['m', 'star'],
};
export const Ic = ({ n, s = 20, c = C.ink }) => {
  const [lib, name] = ICONS[n];
  const Lib = lib === 'm' ? MaterialCommunityIcons : Feather;
  return <Lib name={name} size={s} color={c} />;
};

export const Rating = ({ value, s = 13 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <Ic n="star" s={s} c={C.gold} /><T style={{ fontFamily: F.b, color: C.gold, fontSize: s }}>{String(value).replace('.', ',')}</T>
  </View>
);

export const Logo = ({ r, size = 62 }) => (
  <View style={[st.logo, { width: size, height: size, borderRadius: size * 0.26, borderWidth: size > 55 ? 3 : 0 }]}>
    <Ic n="fire" s={size * 0.38} c="#fff" />
    {size > 40 && <T style={{ color: '#fff', fontFamily: F.xb, fontSize: size > 55 ? 8.5 : 7 }}>{r.logo || r.name.slice(0, 5).toUpperCase()}</T>}
  </View>
);

export const Btn = ({ label, right, onPress, disabled, icon }) => (
  <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
    style={[st.btn, { justifyContent: right ? 'space-between' : 'center', opacity: disabled ? 0.45 : 1 }]}>
    {icon}<T style={st.btnTx}>{label}</T>{right ? <T style={st.btnTx}>{right}</T> : null}
  </Pressable>
);

export const Round = ({ n, onPress, bg = C.white, label, size = 36, c = C.red, ring }) => (
  <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={8}
    style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: ring ? 1.5 : 0, borderColor: C.red }}>
    <Ic n={n} s={size * 0.55} c={c} />
  </Pressable>
);

export const Stepper = ({ qty, onChange, min = 1, boxed }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: boxed ? 4 : 10 }, boxed && st.box]}>
    <Pressable onPress={() => onChange(qty - 1)} disabled={qty <= min && boxed} hitSlop={8} style={st.step} accessibilityLabel="Menos">
      <Ic n="minus" s={16} c={qty <= min && boxed ? '#c9c9c9' : C.red} /></Pressable>
    <T style={{ fontFamily: F.b, minWidth: 18, textAlign: 'center' }}>{qty}</T>
    <Pressable onPress={() => onChange(qty + 1)} hitSlop={8} style={st.step} accessibilityLabel="Mais"><Ic n="plus" s={16} c={C.red} /></Pressable>
  </View>
);

export const Loading = () => <View style={st.center}><ActivityIndicator size="large" color={C.red} /></View>;
export const Message = ({ title, text, action, onAction }) => (
  <View style={st.center}>
    <T style={{ fontFamily: F.xb, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>{title}</T>
    {text ? <T style={{ color: C.muted, textAlign: 'center' }}>{text}</T> : null}
    {action ? <View style={{ marginTop: 20, alignSelf: 'stretch' }}><Btn label={action} onPress={onAction} /></View> : null}
  </View>
);

// Aviso exibido quando a API não respondeu e o app usou os dados de exemplo
export const SourceNotice = () => status.source === 'mock' ? (
  <View style={{ backgroundColor: C.cream, borderRadius: 10, padding: 10, marginTop: 10 }}>
    <T style={{ fontSize: 12, color: '#7b5a14' }}>Modo demonstração: não foi possível acessar a API, então estamos mostrando dados de exemplo.</T>
  </View>
) : null;

export const st = StyleSheet.create({
  logo: { backgroundColor: C.red, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 1 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, borderRadius: 12, backgroundColor: C.red, paddingHorizontal: 20 },
  btnTx: { color: '#fff', fontFamily: F.xb, fontSize: 16 },
  box: { borderWidth: 1, borderColor: C.line, borderRadius: 12, height: 52, paddingHorizontal: 8 },
  step: { width: 28, height: 36, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
