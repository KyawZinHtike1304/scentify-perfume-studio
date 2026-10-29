import {
  DbUser,
  DbOrder,
  DbShipping,
  DbPayment,
  DbFormula,
  DbFormulaDetail,
  DbIngredient,
  DbBottle,
  DbOrderItem,
  EnrichedOrder,
} from '../types';

export const INITIAL_DB_USERS: DbUser[] = [
  {
    id: 1,
    name: 'Somchai Prasert',
    email: 'somchai.p@gmail.com',
    phone: '+66 81 234 5678',
    address: '88 Sukhumvit Soi 55, Thong Lo, Watthana, Bangkok 10110',
    role: 'customer',
  },
  {
    id: 2,
    name: 'Apinya Srisuk',
    email: 'apinya.s@outlook.com',
    phone: '+66 89 876 5432',
    address: '42 Nimmanahaeminda Rd, Suthep, Mueang Chiang Mai 50200',
    role: 'customer',
  },
  {
    id: 3,
    name: 'Krit Charoenpol',
    email: 'krit.c@techcorp.co.th',
    phone: '+66 92 345 6789',
    address: '15/2 Silom Rd, Suriyawong, Bang Rak, Bangkok 10500',
    role: 'customer',
  },
  {
    id: 4,
    name: 'Napat Wongsuwan',
    email: 'napat.w@yahoo.com',
    phone: '+66 84 567 8901',
    address: '109 Beach Road, Patong, Kathu, Phuket 83150',
    role: 'customer',
  },
  {
    id: 99,
    name: 'LOREM Studio Master Perfumer',
    email: 'admin@lorem.com',
    phone: '+66 2 123 4567',
    address: '123 Riverside Botanical Studio, Muang District, Chiang Rai 57000',
    role: 'admin',
  },
];

export const INITIAL_DB_INGREDIENTS: DbIngredient[] = [
  { ingredient_id: 1, name: 'Bergamot', category: 'Citrus', stock_qty: 142 },
  { ingredient_id: 2, name: 'Lemon', category: 'Citrus', stock_qty: 85 },
  { ingredient_id: 3, name: 'Grapefruit', category: 'Citrus', stock_qty: 60 },
  { ingredient_id: 4, name: 'Orange', category: 'Citrus', stock_qty: 94 },
  { ingredient_id: 5, name: 'Rose', category: 'Floral', stock_qty: 48 },
  { ingredient_id: 6, name: 'Jasmine', category: 'Floral', stock_qty: 18 }, // Low stock
  { ingredient_id: 7, name: 'Ylang Ylang', category: 'Floral', stock_qty: 73 },
  { ingredient_id: 8, name: 'Lavender', category: 'Floral', stock_qty: 110 },
  { ingredient_id: 9, name: 'Sandalwood', category: 'Woody', stock_qty: 64 },
  { ingredient_id: 10, name: 'Cedarwood', category: 'Woody', stock_qty: 92 },
  { ingredient_id: 11, name: 'Vetiver', category: 'Woody', stock_qty: 55 },
  { ingredient_id: 12, name: 'Oud (Agarwood)', category: 'Woody', stock_qty: 12 }, // Critical low stock
  { ingredient_id: 13, name: 'Peach', category: 'Fruity', stock_qty: 88 },
  { ingredient_id: 14, name: 'Raspberry', category: 'Fruity', stock_qty: 67 },
  { ingredient_id: 15, name: 'Vanilla', category: 'Sweet', stock_qty: 130 },
  { ingredient_id: 16, name: 'Amber', category: 'Sweet', stock_qty: 42 },
  { ingredient_id: 17, name: 'Green Tea', category: 'Fresh', stock_qty: 95 },
  { ingredient_id: 18, name: 'Mint', category: 'Fresh', stock_qty: 76 },
];

export const INITIAL_DB_BOTTLES: DbBottle[] = [
  { bottle_id: 1, size: 50, price: 1680 },
  { bottle_id: 2, size: 100, price: 2580 },
  { bottle_id: 3, size: 30, price: 522 },
];

export const INITIAL_DB_FORMULAS: DbFormula[] = [
  { formula_id: 101, formula_name: 'Golden Dawn (Bergamot · Jasmine · Sandalwood)', created_at: '2026-10-24T09:15:00Z' },
  { formula_id: 102, formula_name: 'Imperial Oud (Lemon · Rose · Oud)', created_at: '2026-10-25T11:30:00Z' },
  { formula_id: 103, formula_name: 'Botanical Solitude (Grapefruit · Lavender · Cedarwood)', created_at: '2026-10-26T14:20:00Z' },
  { formula_id: 104, formula_name: 'Siam Bloom (Orange · Ylang Ylang · Amber)', created_at: '2026-10-27T10:05:00Z' },
  { formula_id: 105, formula_name: 'Highland Serenity (Green Tea · Mint · Vetiver)', created_at: '2026-10-28T08:40:00Z' },
];

export const INITIAL_DB_FORMULA_DETAILS: DbFormulaDetail[] = [
  // Formula 101
  { formula_detail_id: 1, formula_id: 101, ingredient_id: 1 },
  { formula_detail_id: 2, formula_id: 101, ingredient_id: 6 },
  { formula_detail_id: 3, formula_id: 101, ingredient_id: 9 },
  // Formula 102
  { formula_detail_id: 4, formula_id: 102, ingredient_id: 2 },
  { formula_detail_id: 5, formula_id: 102, ingredient_id: 5 },
  { formula_detail_id: 6, formula_id: 102, ingredient_id: 12 },
  // Formula 103
  { formula_detail_id: 7, formula_id: 103, ingredient_id: 3 },
  { formula_detail_id: 8, formula_id: 103, ingredient_id: 8 },
  { formula_detail_id: 9, formula_id: 103, ingredient_id: 10 },
  // Formula 104
  { formula_detail_id: 10, formula_id: 104, ingredient_id: 4 },
  { formula_detail_id: 11, formula_id: 104, ingredient_id: 7 },
  { formula_detail_id: 12, formula_id: 104, ingredient_id: 16 },
  // Formula 105
  { formula_detail_id: 13, formula_id: 105, ingredient_id: 17 },
  { formula_detail_id: 14, formula_id: 105, ingredient_id: 18 },
  { formula_detail_id: 15, formula_id: 105, ingredient_id: 11 },
];

export const INITIAL_DB_SHIPPINGS: DbShipping[] = [
  {
    shipping_id: 501,
    shipping_fee: 0,
    tracking_number: 'TH-DHL-984210',
    courier_name: 'DHL Express',
    shipping_address: '88 Sukhumvit Soi 55, Thong Lo, Watthana, Bangkok 10110',
  },
  {
    shipping_id: 502,
    shipping_fee: 50,
    tracking_number: 'KERRY-CM-47219',
    courier_name: 'Kerry Express',
    shipping_address: '42 Nimmanahaeminda Rd, Suthep, Mueang Chiang Mai 50200',
  },
  {
    shipping_id: 503,
    shipping_fee: 0,
    tracking_number: 'PENDING-DISPATCH',
    courier_name: 'Flash Express',
    shipping_address: '15/2 Silom Rd, Suriyawong, Bang Rak, Bangkok 10500',
  },
  {
    shipping_id: 504,
    shipping_fee: 0,
    tracking_number: 'TH-DHL-984402',
    courier_name: 'DHL Express',
    shipping_address: '109 Beach Road, Patong, Kathu, Phuket 83150',
  },
  {
    shipping_id: 505,
    shipping_fee: 50,
    tracking_number: 'AWAITING_VERIFICATION',
    courier_name: 'DHL Express',
    shipping_address: '88 Sukhumvit Soi 55, Thong Lo, Bangkok 10110',
  },
];

export const INITIAL_DB_PAYMENTS: DbPayment[] = [
  {
    payment_id: 301,
    order_id: 1001,
    qr_receipt_url: '/assets/botanicals/woody.png',
    status: 'verified',
    verified_at: '2026-10-24T10:00:00Z',
  },
  {
    payment_id: 302,
    order_id: 1002,
    qr_receipt_url: '/assets/botanicals/floral.png',
    status: 'verified',
    verified_at: '2026-10-25T12:05:00Z',
  },
  {
    payment_id: 303,
    order_id: 1003,
    qr_receipt_url: '/assets/botanicals/citrus.png',
    status: 'pending',
    verified_at: undefined,
  },
  {
    payment_id: 304,
    order_id: 1004,
    qr_receipt_url: '/assets/botanicals/sweet.png',
    status: 'verified',
    verified_at: '2026-10-27T10:30:00Z',
  },
  {
    payment_id: 305,
    order_id: 1005,
    qr_receipt_url: '',
    status: 'pending',
    verified_at: undefined,
  },
];

export const INITIAL_DB_ORDERS: DbOrder[] = [
  {
    order_id: 1001,
    shipping_id: 501,
    user_id: 1,
    order_date: '2026-10-24T09:20:00Z',
    status: 'completed',
    total_price: 1680,
    prep_photo_url: '/assets/botanicals/custom_bottle.png',
  },
  {
    order_id: 1002,
    shipping_id: 502,
    user_id: 2,
    order_date: '2026-10-25T11:45:00Z',
    status: 'completed',
    total_price: 2630, // 2580 + 50 shipping
    prep_photo_url: '/assets/botanicals/custom_bottle.png',
  },
  {
    order_id: 1003,
    shipping_id: 503,
    user_id: 3,
    order_date: '2026-10-26T14:35:00Z',
    status: 'processing',
    total_price: 3360, // Two 50ml bottles
    prep_photo_url: '/assets/botanicals/custom_bottle.png',
  },
  {
    order_id: 1004,
    shipping_id: 504,
    user_id: 4,
    order_date: '2026-10-27T10:15:00Z',
    status: 'completed',
    total_price: 2580,
    prep_photo_url: '/assets/botanicals/custom_bottle.png',
  },
  {
    order_id: 1005,
    shipping_id: 505,
    user_id: 1,
    order_date: '2026-10-28T09:00:00Z',
    status: 'pending',
    total_price: 1730, // 1680 + 50 shipping
    prep_photo_url: '',
  },
];

export const INITIAL_DB_ORDER_ITEMS: DbOrderItem[] = [
  { order_item_id: 801, formula_detail_id: 1, order_id: 1001, bottle_id: 1, qty: 1 },
  { order_item_id: 802, formula_detail_id: 4, order_id: 1002, bottle_id: 2, qty: 1 },
  { order_item_id: 803, formula_detail_id: 7, order_id: 1003, bottle_id: 1, qty: 2 },
  { order_item_id: 804, formula_detail_id: 10, order_id: 1004, bottle_id: 2, qty: 1 },
  { order_item_id: 805, formula_detail_id: 13, order_id: 1005, bottle_id: 1, qty: 1 },
];

// Helper to assemble full relational order graphs
export function buildEnrichedOrders(
  orders: DbOrder[] = INITIAL_DB_ORDERS,
  users: DbUser[] = INITIAL_DB_USERS,
  shippings: DbShipping[] = INITIAL_DB_SHIPPINGS,
  payments: DbPayment[] = INITIAL_DB_PAYMENTS,
  orderItems: DbOrderItem[] = INITIAL_DB_ORDER_ITEMS,
  formulas: DbFormula[] = INITIAL_DB_FORMULAS,
  formulaDetails: DbFormulaDetail[] = INITIAL_DB_FORMULA_DETAILS,
  ingredients: DbIngredient[] = INITIAL_DB_INGREDIENTS,
  bottles: DbBottle[] = INITIAL_DB_BOTTLES
): EnrichedOrder[] {
  return orders.map((order) => {
    const user = users.find((u) => u.id === order.user_id) || {
      id: order.user_id,
      name: `Customer #${order.user_id}`,
      email: 'customer@studio.com',
      phone: '-',
      address: 'Studio Delivery Address',
      role: 'customer',
    };

    const shipping = shippings.find((s) => s.shipping_id === order.shipping_id) || {
      shipping_id: order.shipping_id,
      shipping_fee: 0,
      tracking_number: 'UNASSIGNED',
      courier_name: 'DHL Express',
      shipping_address: user.address,
    };

    const payment = payments.find((p) => p.order_id === order.order_id) || {
      payment_id: 9999 + order.order_id,
      order_id: order.order_id,
      qr_receipt_url: '',
      status: 'pending',
    };

    // Filter order items for this order
    const matchedItems = orderItems.filter((oi) => oi.order_id === order.order_id);
    const enrichedItems = matchedItems.map((oi) => {
      const bottle = bottles.find((b) => b.bottle_id === oi.bottle_id) || {
        bottle_id: oi.bottle_id,
        size: 50,
        price: 1680,
      };

      const detail = formulaDetails.find((fd) => fd.formula_detail_id === oi.formula_detail_id);
      const formula = formulas.find((f) => f.formula_id === detail?.formula_id) || {
        formula_id: 1,
        formula_name: 'Artisanal Perfume Formulation',
        created_at: order.order_date,
      };

      // Gather ingredients associated with this formula
      const allFormulaDetails = formulaDetails.filter((fd) => fd.formula_id === formula.formula_id);
      const ingList = allFormulaDetails
        .map((fd) => ingredients.find((ing) => ing.ingredient_id === fd.ingredient_id))
        .filter((ing): ing is DbIngredient => Boolean(ing));

      return {
        order_item_id: oi.order_item_id,
        formula_name: formula.formula_name,
        ingredients: ingList,
        bottle,
        qty: oi.qty,
        price: bottle.price,
      };
    });

    return {
      order,
      user,
      shipping,
      payment,
      items: enrichedItems,
    };
  });
}
