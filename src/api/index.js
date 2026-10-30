// Rotas consumidas:  /users  /users/:id  /restaurants  /restaurants/:id  /foods  /foods/:id
import { get } from './client';
import * as A from './adapters';
import * as mock from './mock';

// 'api' = dados reais; 'mock' = API indisponível (dados de exemplo). A Home mostra um aviso no segundo caso.
export const status = { source: 'api' };

async function load(path, adapt, fallback) {
  try {
    const value = adapt(await get(path));
    if (value && (!Array.isArray(value) || value.length)) { status.source = 'api'; return value; }
    throw new Error('resposta vazia ou em formato inesperado');
  } catch (e) {
    console.warn(`[API] ${path}: ${e.message} → usando dados de exemplo`);
    status.source = 'mock';
    return fallback();
  }
}
const byId = (arr, id) => arr.find((x) => x.id === String(id)) || null;

export const getUsers = () => load('/users', (d) => A.list(d).map(A.user).filter(Boolean), () => mock.users);
export const getUser = (id) => load(`/users/${id}`, (d) => A.user(A.one(d)), () => byId(mock.users, id) || mock.users[0]);
export const getRestaurants = () => load('/restaurants', (d) => A.list(d).map(A.restaurant).filter(Boolean), () => mock.restaurants);
export const getRestaurant = (id) => load(`/restaurants/${id}`, (d) => A.restaurant(A.one(d)), () => byId(mock.restaurants, id));
export const getFoods = () => load('/foods', (d) => A.list(d).map(A.food).filter(Boolean), () => mock.foods);
export const getFood = (id) => load(`/foods/${id}`, (d) => A.food(A.one(d)), () => byId(mock.foods, id));
