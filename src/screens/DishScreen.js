import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, brl, img } from '../theme';
import { getFood, getRestaurant, getRestaurants } from '../api';
import { useAsync } from '../hooks';
import { useApp } from '../context/AppContext';
import { Btn, Ic, Loading, Message, Round, Stepper, T } from '../components/ui';

// Carrega o prato (/foods/:id) e o restaurante dele (/restaurants/:id); a tela em si fica em <DishForm>
export default function DishScreen({ navigation, route }) {
  const { id, editKey } = route.params;
  const { data, loading, error } = useAsync(async () => {
    const food = await getFood(id);
    if (!food) return null;
    let restaurant = food.restaurantId ? await getRestaurant(food.restaurantId) : null;
    if (!restaurant) restaurant = (await getRestaurants())[0]; // API sem vínculo prato → restaurante
    return { food, restaurant };
  }, [id]);
  if (loading) return <Loading />;
  if (error || !data) return <Message title="Prato não encontrado" action="Voltar" onAction={() => navigation.goBack()} />;
  return <DishForm navigation={navigation} food={data.food} restaurant={data.restaurant} editKey={editKey} />;
}

function DishForm({ navigation, food, restaurant, editKey }) {
  const insets = useSafeAreaInsets();
  const { cart, addItem } = useApp();
  const editing = editKey ? cart.items.find((i) => i.key === editKey) : null;
  const groups = (Array.isArray(food.groups) ? food.groups : []).filter((g) => g && Array.isArray(g.options));

  const [sel, setSel] = useState(() => Object.fromEntries(groups.map((g) => [g.id, editing ? editing.selection[g.id] || [] : g.options.filter((o) => o.default).map((o) => o.id)])));
  const [qty, setQty] = useState(editing ? editing.qty : 1);
  const [notes, setNotes] = useState(editing ? editing.notes : '');

  const extra = groups.reduce((a, g) => a + g.options.filter((o) => sel[g.id].includes(o.id)).reduce((b, o) => b + (o.price || 0), 0), 0);
  const valid = groups.every((g) => !g.required || sel[g.id].length >= 1);
  const unit = food.price + extra;

  const toggle = (g, oid) => setSel((cur) => {
    const now = cur[g.id];
    if (now.includes(oid)) return g.required && g.max === 1 ? cur : { ...cur, [g.id]: now.filter((x) => x !== oid) };
    if (g.max === 1) return { ...cur, [g.id]: [oid] };
    if (now.length < g.max) return { ...cur, [g.id]: [...now, oid] };
    Alert.alert('Limite atingido', `Escolha até ${g.max} opções.`); return cur;
  });

  const add = () => {
    const names = (g) => g.options.filter((o) => sel[g.id].includes(o.id)).map((o) => o.name.replace(' · ', ' '));
    const base = groups.filter((g) => g.id !== 'extra').flatMap(names);
    const adds = groups.filter((g) => g.id === 'extra').flatMap(names).map((n) => '+ ' + n).join(' ');
    const summary = [base.join(' · '), [adds, food.includes].filter(Boolean).join(' · ')].filter(Boolean);
    addItem(restaurant, { foodId: food.id, name: food.name, image: food.image, qty, unit, summary, notes, selection: sel }, editKey);
    editing ? navigation.goBack() : navigation.navigate('Bag');
  };
  const onAdd = () => {
    if (!editing && cart.restaurant && cart.restaurant.id !== restaurant.id && cart.items.length) {
      Alert.alert('Começar novo pedido?', 'Sua sacola tem itens de outro restaurante. Deseja esvaziá-la e adicionar este prato?',
        [{ text: 'Cancelar', style: 'cancel' }, { text: 'Esvaziar e adicionar', onPress: add }]);
    } else add();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ height: 200 }}>
          {(food.hero || food.image) && <Image source={img(food.hero || food.image)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
          <View style={{ position: 'absolute', top: insets.top + 8, left: 24 }}><Round n="left" label="Voltar" onPress={() => navigation.goBack()} /></View>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          <T style={{ color: C.red, fontFamily: F.xb, fontSize: 11.5, marginTop: 14 }}>{(restaurant?.name || '').toUpperCase()}{food.tag ? ' · ' + food.tag.toUpperCase() : ''}</T>
          <View style={s.title}><T style={{ fontFamily: F.xb, fontSize: 28, letterSpacing: -0.6, flex: 1 }}>{food.name}</T><T style={{ fontFamily: F.xb, fontSize: 20 }}>{brl(food.price)}</T></View>
          {!!food.longDescription && <T style={{ color: C.muted, fontSize: 13.5, paddingBottom: 18 }}>{food.longDescription}</T>}
        </View>

        {groups.map((g) => {
          const n = sel[g.id].length;
          return (
            <View key={g.id} style={s.group}>
              <View style={s.gh}>
                <View style={{ flex: 1 }}><T style={{ fontFamily: F.xb, fontSize: 17 }}>{g.title}</T><T style={{ color: C.muted, fontSize: 12 }}>{g.sub}</T></View>
                {g.required ? <Tag text="OBRIGATÓRIO" /> : n > 0 ? <Tag text={`${n} SELECIONADO${n > 1 ? 'S' : ''}`} ok /> : null}
              </View>
              {g.type === 'chips' ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                  {g.options.map((o) => { const on = sel[g.id].includes(o.id); return (
                    <Pressable key={o.id} onPress={() => toggle(g, o.id)} style={[s.opt, on && { borderColor: C.red, borderWidth: 1.5, backgroundColor: C.pink }]}>
                      <T style={{ fontSize: 13, fontFamily: on ? F.xb : F.r, color: on ? C.red : C.ink }}>{o.name}</T></Pressable>); })}
                </View>
              ) : g.options.map((o) => { const on = sel[g.id].includes(o.id); return (
                <Pressable key={o.id} onPress={() => toggle(g, o.id)} style={s.line}>
                  <T style={{ flex: 1 }}>{o.name}</T>
                  {!!o.price && <T style={{ fontFamily: F.b, marginRight: 12 }}>+ {brl(o.price)}</T>}
                  {g.type === 'radio'
                    ? <View style={[s.radio, on && { borderWidth: 0, backgroundColor: C.red }]}>{on && <View style={s.dot} />}</View>
                    : <View style={[s.check, on && { backgroundColor: C.red, borderColor: C.red }]}>{on && <Ic n="check" s={14} c="#fff" />}</View>}
                </Pressable>); })}
            </View>
          );
        })}

        <View style={s.obs}>
          <Ic n="chat" s={18} c="#8a8a8a" />
          <TextInput value={notes} onChangeText={setNotes} placeholder="Alguma observação? Ex.: sem cebola" placeholderTextColor="#8a8a8a" maxLength={120} style={{ flex: 1, fontFamily: F.r, fontSize: 13, color: C.ink, padding: 0 }} />
        </View>
      </ScrollView>

      <View style={[s.foot, { paddingBottom: insets.bottom + 14 }]}>
        <Stepper qty={qty} onChange={(n) => setQty(Math.max(1, n))} boxed />
        <View style={{ flex: 1 }}><Btn label={editing ? 'Salvar' : 'Adicionar'} right={brl(unit * qty)} onPress={onAdd} disabled={!valid} /></View>
      </View>
    </KeyboardAvoidingView>
  );
}

const Tag = ({ text, ok }) => (
  <View style={{ backgroundColor: ok ? '#e4f5e9' : C.soft, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 9 }}>
    <T style={{ fontFamily: F.xb, fontSize: 10, color: ok ? C.green : '#666' }}>{text}</T>
  </View>
);

const s = StyleSheet.create({
  title: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 6, marginBottom: 10 },
  group: { paddingHorizontal: 24, paddingVertical: 18, borderTopWidth: 1, borderTopColor: C.line },
  gh: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  opt: { flex: 1, height: 42, borderWidth: 1, borderColor: C.line, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  obs: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.soft, borderRadius: 12, paddingHorizontal: 14, height: 46, marginHorizontal: 24, marginTop: 6 },
  foot: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 14, paddingHorizontal: 24 },
});
