import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F } from '../theme';
import { getUser, getUsers } from '../api';
import { useAsync } from '../hooks';
import { useApp } from '../context/AppContext';
import { Ic, Loading, Message, T } from '../components/ui';

// Usa /users/:id (usuário atual) e /users (lista para trocar de conta)
export default function ProfileScreen({ navigation }) {
  const { userId, setUserId, order } = useApp();
  const { data, loading, error, reload } = useAsync(() => Promise.all([getUser(userId), getUsers()]), [userId]);
  if (loading) return <Loading />;
  if (error || !data[0]) return <Message title="Não conseguimos carregar" action="Tentar de novo" onAction={reload} />;
  const [user, users] = data;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <T style={{ fontFamily: F.xb, fontSize: 24, marginBottom: 20 }}>Perfil</T>
        <View style={s.card}>
          <View style={s.avatar}><T style={{ color: C.gold, fontFamily: F.xb, fontSize: 20 }}>{user.name[0]}</T></View>
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: F.xb, fontSize: 18 }}>{user.name}</T>
            {!!user.email && <T style={{ color: C.muted, fontSize: 13 }}>{user.email}</T>}
            <T style={{ color: C.muted, fontSize: 13 }}>{user.address}</T>
          </View>
        </View>

        <Pressable style={s.line} onPress={() => navigation.navigate('Orders')}>
          <Ic n="receipt" s={22} c={C.red} />
          <View style={{ flex: 1 }}><T style={{ fontFamily: F.xb, fontSize: 15 }}>Meus pedidos</T><T style={{ color: C.muted, fontSize: 12.5 }}>{order ? `Pedido #${order.id} em andamento` : 'Nenhum pedido ainda'}</T></View>
          <Ic n="right" s={16} c={C.muted} />
        </Pressable>

        <T style={{ fontFamily: F.xb, fontSize: 17, marginTop: 24, marginBottom: 4 }}>Trocar de conta</T>
        {users.map((u) => {
          const on = u.id === String(user.id);
          return (
            <Pressable key={u.id} style={s.line} onPress={() => setUserId(u.id)}>
              <View style={[s.avatar, { width: 36, height: 36, borderRadius: 18 }]}><T style={{ color: C.gold, fontFamily: F.xb }}>{u.name[0]}</T></View>
              <T style={{ flex: 1, fontFamily: on ? F.b : F.r }}>{u.name}</T>
              <View style={[s.radio, on && { borderWidth: 0, backgroundColor: C.red }]}>{on && <View style={s.dot} />}</View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
