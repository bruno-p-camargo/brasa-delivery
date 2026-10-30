import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { AppProvider } from './src/context/AppContext';
import { C, F } from './src/theme';
import { Ic, Loading } from './src/components/ui';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import DishScreen from './src/screens/DishScreen';
import BagScreen from './src/screens/BagScreen';
import OrderScreen, { OrdersTab } from './src/screens/OrderScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TABS = { Home: ['home', 'Início'], Search: ['search', 'Busca'], Orders: ['receipt', 'Pedidos'], Profile: ['user', 'Perfil'] };

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: C.red, tabBarInactiveTintColor: C.muted,
      tabBarLabel: TABS[route.name][1], tabBarLabelStyle: { fontFamily: F.b, fontSize: 11 },
      tabBarStyle: { borderTopColor: C.line },
      tabBarIcon: ({ color }) => <Ic n={TABS[route.name][0]} s={24} c={color} />,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Orders" component={OrdersTab} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#fff', primary: C.red } };

export default function App() {
  const [loaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  if (!loaded) return <Loading />;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Restaurant" component={RestaurantScreen} />
            <Stack.Screen name="Dish" component={DishScreen} />
            <Stack.Screen name="Bag" component={BagScreen} />
            <Stack.Screen name="Order" component={OrderScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
