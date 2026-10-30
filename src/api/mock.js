// Dados de exemplo (conteúdo do Figma). Usados só quando a API não responde.
const I = {
  brasaCapa: require('../../assets/img/brasa-capa.jpg'), brasaHero: require('../../assets/img/brasa-hero.jpg'),
  smash: require('../../assets/img/smash-thumb.jpg'), vila: require('../../assets/img/vila-thumb.jpg'),
  pizza: require('../../assets/img/cat-pizza.jpg'), brasileira: require('../../assets/img/cat-brasileira.jpg'), japonesa: require('../../assets/img/cat-japonesa.jpg'),
  combo: require('../../assets/img/combo-thumb.jpg'), comboHero: require('../../assets/img/combo-hero.jpg'),
  burger: require('../../assets/img/burger-thumb.jpg'), fritas: require('../../assets/img/fritas-thumb.jpg'),
};
const R = (o) => ({ rating: 4.7, reviews: 200, minOrder: 20, open: true, coupon: null, badge: '', ...o, free: o.fee === 0 });

export const users = [{ id: '1', name: 'Marina', email: 'marina@email.com', phone: '', address: 'Rua dos Pinheiros, 870', avatar: null }];

export const restaurants = [
  R({ id: '1', name: 'Brasa Burger', logo: 'BRASA', category: 'Hambúrguer', description: 'Hambúrguer artesanal', rating: 4.9, reviews: 500, distance: 1.2,
    time: '30–40 min', timeMax: 40, fee: 4.99, promo: 'R$ 5 off com BRASA5', badge: 'Queridinho do bairro', image: I.brasaCapa, cover: I.brasaHero,
    coupon: { code: 'BRASA5', off: 5, above: 30, title: 'R$ 5 off pra matar a fome' } }),
  R({ id: '2', name: 'Ponto do Smash', logo: 'SMASH', category: 'Hambúrguer', description: 'Smash burger', rating: 4.8, distance: 0.8, time: '25–35 min', timeMax: 35, fee: 0, promo: 'Peça a partir de R$ 24,90', image: I.smash }),
  R({ id: '3', name: 'Burger da Vila', logo: 'VILA', category: 'Hambúrguer', description: 'Hambúrguer de vila', distance: 1.6, time: '30–40 min', timeMax: 40, fee: 5.99, promo: 'Combos a partir de R$ 32,90', image: I.vila }),
  R({ id: '4', name: 'Forno a Lenha', logo: 'FORNO', category: 'Pizza', description: 'Pizza napolitana', rating: 4.6, distance: 1.9, time: '40–55 min', timeMax: 55, fee: 6.9, promo: 'Pizzas a partir de R$ 39,90', image: I.pizza }),
  R({ id: '5', name: 'Tempero da Vó', logo: 'VÓ', category: 'Brasileira', description: 'Comida caseira', rating: 4.8, distance: 1.1, time: '30–45 min', timeMax: 45, fee: 0, promo: 'Marmitas a partir de R$ 22,90', image: I.brasileira }),
  R({ id: '6', name: 'Sakura Sushi', logo: 'SAKURA', category: 'Japonesa', description: 'Culinária japonesa', distance: 2.3, time: '45–60 min', timeMax: 60, fee: 7.9, promo: 'Combinados a partir de R$ 44,90', image: I.japonesa }),
];

const ponto = { id: 'ponto', title: 'Qual o ponto da carne?', sub: 'Escolha 1 opção', type: 'chips', required: true, max: 1,
  options: [{ id: 'mal', name: 'Malpassado' }, { id: 'ao', name: 'Ao ponto', default: true }, { id: 'bem', name: 'Bem-passado' }] };
const bebida = { id: 'bebida', title: 'E pra beber?', sub: 'Escolha 1 bebida · inclusa no combo', type: 'radio', required: true, max: 1,
  options: [{ id: 'coca', name: 'Coca-Cola Zero · 350 ml', default: true }, { id: 'guarana', name: 'Guaraná Antarctica · 350 ml' }] };
const extra = { id: 'extra', title: 'Um toque a mais', sub: 'Opcional · escolha até 1 adicional', type: 'check', max: 1,
  options: [{ id: 'bacon', name: 'Bacon crocante', price: 5, default: true }] };

export const foods = [
  { id: '1', restaurantId: '1', name: 'Combo Brasa', category: 'Burgers', top: true, tag: 'O mais pedido', price: 39.9,
    description: 'Brasa Burger + fritas crocantes + bebida. O trio perfeito.',
    longDescription: 'Brioche, blend de 160 g, cheddar e molho da casa. Acompanha fritas de 150 g e bebida de 350 ml.',
    includes: 'Fritas 150 g', image: I.combo, hero: I.comboHero, groups: [ponto, bebida, extra] },
  { id: '2', restaurantId: '1', name: 'Brasa Burger', category: 'Burgers', top: true, price: 29.9,
    description: 'Pão brioche, blend de 160 g, cheddar e molho da casa.', longDescription: 'Pão brioche, blend de 160 g, cheddar e molho da casa.',
    includes: '', image: I.burger, groups: [ponto, extra] },
  { id: '3', restaurantId: '1', name: 'Fritas da casa', category: 'Porções', top: true, price: 14.9,
    description: 'Douradinhas e sequinhas. Porção de 150 g.', longDescription: 'Douradinhas e sequinhas. Porção de 150 g.', includes: '', image: I.fritas, groups: [] },
  ...restaurants.slice(1).map((r, i) => ({ id: String(4 + i), restaurantId: r.id, name: 'Prato da casa', category: 'Mais pedidos', top: true,
    price: 32.9, description: 'Especialidade da casa, preparada na hora.', longDescription: 'Especialidade da casa, preparada na hora.', includes: '', image: r.image, groups: [] })),
];
