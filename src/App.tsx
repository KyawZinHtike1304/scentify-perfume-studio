import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { IngredientLibraryView } from './components/IngredientLibraryView';
import { ScentifyView } from './components/ScentifyView';
import { ReviewFragranceView } from './components/ReviewFragranceView';
import { CartView } from './components/CartView';
import { ReviewOrderView } from './components/ReviewOrderView';
import { PaymentView } from './components/PaymentView';
import { CustomerCareView } from './components/CustomerCareView';
import { ProfileView } from './components/ProfileView';
import { AboutView } from './components/AboutView';
import { JournalView } from './components/JournalView';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { StoryModal } from './components/StoryModal';
import { AdminSidePanel } from './components/AdminSidePanel';

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

import {
  Composition,
  CartItem,
  OrderDetails,
  ChatMessage,
  ViewMode,
  Ingredient,
  DbOrder,
  DbUser,
  DbShipping,
  DbPayment,
  DbIngredient,
  DbFormula,
  DbFormulaDetail,
  DbOrderItem,
  PurchaseHistoryOrder,
} from './types';
import {
  INITIAL_ORDER,
  INITIAL_CHAT_MESSAGES,
} from './data/perfumeData';
import {
  INITIAL_DB_ORDERS,
  INITIAL_DB_USERS,
  INITIAL_DB_SHIPPINGS,
  INITIAL_DB_PAYMENTS,
  INITIAL_DB_INGREDIENTS,
  INITIAL_DB_FORMULAS,
  INITIAL_DB_FORMULA_DETAILS,
  INITIAL_DB_ORDER_ITEMS,
} from './data/adminDatabaseData';

function parseOrderItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];

    const record = entry as Record<string, unknown>;
    const rawDetails = record.details;
    const details =
      typeof rawDetails === 'object' && rawDetails !== null && !Array.isArray(rawDetails)
        ? (rawDetails as Record<string, unknown>)
        : null;
    const itemSize = typeof record.size === 'string' ? record.size : undefined;
    const notes = Array.isArray(details?.notes)
      ? details.notes.filter((note): note is string => typeof note === 'string')
      : undefined;
    const price = typeof record.price === 'number' && Number.isFinite(record.price)
      ? record.price
      : 0;
    const quantity = typeof record.quantity === 'number' && Number.isFinite(record.quantity)
      ? record.quantity
      : 1;

    return [{
      id: typeof record.id === 'string' ? record.id : `order-item-${index + 1}`,
      title: typeof record.title === 'string' ? record.title : 'Perfume',
      subtitle: typeof record.subtitle === 'string' ? record.subtitle : '',
      description: typeof record.description === 'string' ? record.description : undefined,
      price,
      quantity,
      image: typeof record.image === 'string' ? record.image : '',
      details: details
        ? {
            notes,
            size: typeof details.size === 'string' ? details.size : itemSize,
          }
        : itemSize
        ? { size: itemSize }
        : undefined,
    }];
  });
}

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  
  // Custom Perfume Formulation State
  const [composition, setComposition] = useState<Composition>({
    topNote: 'Bergamot',
    heartNote: 'Jasmine',
    baseNote: 'Sandalwood',
    bottleSize: '50 ml',
    bottleType: 'Classic',
  });

  // Shopping Bag / Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Active Order State
  const [order, setOrder] = useState<OrderDetails>(INITIAL_ORDER);

  // Relational Database State for Admin Panel
  const [dbOrders, setDbOrders] = useState<DbOrder[]>(INITIAL_DB_ORDERS);
  const [dbUsers, setDbUsers] = useState<DbUser[]>(INITIAL_DB_USERS);
  const [dbShippings, setDbShippings] = useState<DbShipping[]>(INITIAL_DB_SHIPPINGS);
  const [dbPayments, setDbPayments] = useState<DbPayment[]>(INITIAL_DB_PAYMENTS);
  const [dbIngredients, setDbIngredients] = useState<DbIngredient[]>(INITIAL_DB_INGREDIENTS);
  const [dbFormulas, setDbFormulas] = useState<DbFormula[]>(INITIAL_DB_FORMULAS);
  const [dbFormulaDetails, setDbFormulaDetails] = useState<DbFormulaDetail[]>(INITIAL_DB_FORMULA_DETAILS);
  const [dbOrderItems, setDbOrderItems] = useState<DbOrderItem[]>(INITIAL_DB_ORDER_ITEMS);

  // Customer Care Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  // User State: start without log in (null)
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryOrder[]>([]);
  const [purchaseHistoryError, setPurchaseHistoryError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('Scentify Studio Master Perfumer');
  const [isAuthResolved, setIsAuthResolved] = useState<boolean>(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'admin'>('signup');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  // Resolve the current Supabase session and load the signed-in user's profile.
  useEffect(() => {
    let active = true;

    const resolveUser = async (user: User | null) => {
      if (!user) {
        if (active) {
          setAuthenticatedUser(null);
          setCurrentUser(null);
          setIsAdminUser(false);
          setPurchaseHistory([]);
          setPurchaseHistoryError(null);
          setIsAuthResolved(true);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, shipping_address')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Failed to load the Supabase profile:', profileError);
      }

      const name =
        profile?.display_name ||
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Studio Member';
      const isAdmin = user.app_metadata?.role === 'admin';

      if (active) {
        setAuthenticatedUser(user);
        setIsAdminUser(isAdmin);
        setAdminUser(name);
        setCurrentUser(isAdmin ? null : name);

        if (!isAdmin) {
          const { data: customerOrders, error: customerOrdersError } = await supabase
            .from('orders')
            .select('order_id, order_number, status, payment_status, total, items, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (customerOrdersError) {
            console.error('Failed to load purchase history from Supabase:', customerOrdersError);
            if (active) {
              setPurchaseHistory([]);
              setPurchaseHistoryError(
                `Could not load purchase history: ${customerOrdersError.message}`
              );
            }
          } else if (active && customerOrders) {
            setPurchaseHistory(
              customerOrders.map((row) => ({
                orderId: row.order_number || String(row.order_id),
                date: row.created_at,
                status:
                  row.status === 'cancelled'
                    ? 'Cancelled'
                    : row.status === 'completed'
                    ? 'Completed'
                    : row.status === 'processing'
                    ? 'Preparing'
                    : row.payment_status === 'verified'
                    ? 'Payment verified'
                    : row.payment_status === 'failed'
                    ? 'Payment failed'
                    : 'Awaiting payment verification',
                total: Number(row.total),
                items: parseOrderItems(row.items),
              }))
            );
            setPurchaseHistoryError(null);
          }

          const savedAddress = profile?.shipping_address || {};
          setOrder((prev) => ({
            ...prev,
            customerName: name,
            address: savedAddress.address || prev.address,
            city: savedAddress.city || prev.city,
            province: savedAddress.province || prev.province,
            postalCode: savedAddress.postalCode || prev.postalCode,
            country: savedAddress.country || prev.country,
            phone: savedAddress.phone || prev.phone,
          }));
        } else {
          setPurchaseHistory([]);
          setPurchaseHistoryError(null);
          const { data: rows, error: ordersError } = await supabase
            .from('orders')
            .select(
              'order_id, user_id, customer_name, customer_email, customer_phone, shipping_address, total, status, payment_status, payment_slip_url, items, created_at, verified_at'
            )
            .order('created_at', { ascending: false });

          if (ordersError) {
            console.error('Failed to load orders from Supabase:', ordersError);
            window.alert(`Could not load saved orders: ${ordersError.message}`);
          } else if (active && rows) {
            const savedOrders = rows.map((row) => {
              const id = Number(row.order_id);
              const adminId = 1_000_000 + id;
              const status: DbOrder['status'] =
                row.status === 'processing' ||
                row.status === 'completed' ||
                row.status === 'cancelled'
                  ? row.status
                  : 'pending';

              return {
                row,
                adminId,
                order: {
                  order_id: id,
                  shipping_id: adminId,
                  user_id: adminId,
                  order_date: row.created_at,
                  status,
                  total_price: Number(row.total),
                  prep_photo_url: '',
                  items: parseOrderItems(row.items),
                } satisfies DbOrder,
              };
            });

            setDbOrders((current) => [
              ...savedOrders.map((entry) => entry.order),
              ...current.filter(
                (existing) =>
                  !savedOrders.some((entry) => entry.order.order_id === existing.order_id)
              ),
            ]);
            setDbUsers((current) => [
              ...savedOrders.map(({ row, adminId }) => ({
                id: adminId,
                name: row.customer_name,
                email: row.customer_email,
                phone: row.customer_phone,
                address: row.shipping_address,
                role: 'customer' as const,
              })),
              ...current.filter(
                (existing) => !savedOrders.some((entry) => entry.adminId === existing.id)
              ),
            ]);
            setDbShippings((current) => [
              ...savedOrders.map(({ row, adminId }) => ({
                shipping_id: adminId,
                shipping_fee: Number(row.total) > 1500 ? 0 : 50,
                tracking_number: 'PENDING-VERIFICATION',
                courier_name: 'DHL Express',
                shipping_address: row.shipping_address,
              })),
              ...current.filter(
                (existing) => !savedOrders.some((entry) => entry.adminId === existing.shipping_id)
              ),
            ]);
            setDbPayments((current) => [
              ...savedOrders.map(({ row, order }) => ({
                payment_id: 1_000_000 + order.order_id,
                order_id: order.order_id,
                qr_receipt_url: row.payment_slip_url || '',
                status:
                  row.payment_status === 'verified' || row.payment_status === 'failed'
                    ? row.payment_status
                    : 'pending',
                verified_at: row.verified_at || undefined,
              })),
              ...current.filter(
                (existing) =>
                  !savedOrders.some((entry) => entry.order.order_id === existing.order_id)
              ),
            ]);
          }
        }
      }

      if (active) {
        setIsAuthResolved(true);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        void resolveUser(session?.user ?? null);
      });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Cart operations
  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmAndShipCustom = (customItem: CartItem) => {
    // Add to cart and proceed to cart
    setCartItems((prev) => [customItem, ...prev]);
    if (!currentUser) {
      setAuthModalMode('signup');
      setAuthModalOpen(true);
    }
    setCurrentView('cart');
  };

  const handleAddIngredientToScentify = (ingredient: Ingredient) => {
    if (ingredient.familyId === 'citrus') {
      setComposition((prev) => ({ ...prev, topNote: ingredient.name }));
    } else if (ingredient.familyId === 'floral') {
      setComposition((prev) => ({ ...prev, heartNote: ingredient.name }));
    } else {
      setComposition((prev) => ({ ...prev, baseNote: ingredient.name }));
    }
  };

  // Chat message send handler with automatic studio perfumer response
  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Intelligent studio reply based on context
    setTimeout(() => {
      let reply = 'Thank you for reaching out to the studio. Our master perfumer has noted your request.';
      const lower = text.toLowerCase();
      if (lower.includes('oud') || lower.includes('soft') || lower.includes('adjust') || lower.includes('change')) {
        reply = 'Of course! We have adjusted your formula notes in Scentify to balance the warmth and let the floral heart shine. 🌿';
      } else if (lower.includes('delivery') || lower.includes('timeline') || lower.includes('order')) {
        reply = `Your order #${order.orderId} is currently prepared with care. Standard delivery to ${order.city} is 2–4 business days with DHL Express tracking.`;
      } else if (lower.includes('slip') || lower.includes('payment') || lower.includes('promptpay')) {
        reply = 'We have received your PromptPay slip! Our accounts team has verified it and passed your custom flacon to the blending station.';
        setOrder((prev) => ({ ...prev, status: 'verified' }));
      } else if (lower.includes('ingredient') || lower.includes('jasmine') || lower.includes('bergamot')) {
        reply = 'We harvest our Sambac Jasmine in small organic mountain estates at dusk, followed by gentle enfleurage to preserve its luminous freshness.';
      }

      const studioMsg: ChatMessage = {
        id: `std-${Date.now()}`,
        sender: 'studio',
        text: reply,
        timestamp: timeStr,
      };
      setChatMessages((prev) => [...prev, studioMsg]);
    }, 1200);
  };

  const handleAddressUpdate = (newAddress: Partial<OrderDetails>) => {
    setOrder((prev) => ({ ...prev, ...newAddress }));
  };

  const handleSlipUploaded = async (fileDataUrl: string) => {
    setOrder((prev) => ({
      ...prev,
      paymentSlipUrl: fileDataUrl,
      status: 'slip_uploaded',
    }));
  };

  // Place Order handler: triggers when customer attaches slip and clicks "Place Order"
  const handlePlaceOrder = async (payload: { slipUrl: string; orderId: string; total: number }) => {
    if (!authenticatedUser) {
      throw new Error('Please sign in before placing your order.');
    }

    const custName = order.customerName || currentUser || 'Studio Client';
    const custEmail = authenticatedUser.email || '';
    const custPhone = order.phone || '';
    const fullAddr = `${order.address}, ${order.city}, ${order.province} ${order.postalCode}, ${order.country}`;
    const { data: savedOrder, error } = await supabase
      .from('orders')
      .insert({
        order_number: payload.orderId,
        user_id: authenticatedUser.id,
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone,
        shipping_address: fullAddr,
        total: payload.total,
        status: 'pending',
        payment_status: 'pending',
        payment_slip_url: payload.slipUrl,
        items: cartItems.map((item) => ({ ...item })),
      })
      .select('order_id, created_at')
      .single();

    if (error) {
      throw error;
    }

    setPurchaseHistory((previous) => [
      {
        orderId: payload.orderId,
        date: savedOrder.created_at,
        status: 'Awaiting payment verification',
        total: payload.total,
        items: cartItems.map((item) => ({ ...item })),
      },
      ...previous,
    ]);
    setPurchaseHistoryError(null);

    const numericOrderId = Number(savedOrder.order_id);
    const newUserId = 1_000_000 + numericOrderId;
    const newShippingId = newUserId;
    const newPaymentId = newUserId;
    const newDbUser: DbUser = {
      id: newUserId,
      name: custName,
      email: custEmail,
      phone: custPhone,
      address: fullAddr,
      role: 'customer',
    };
    const newDbShipping: DbShipping = {
      shipping_id: newShippingId,
      shipping_fee: payload.total > 1500 ? 0 : 50,
      tracking_number: 'PENDING-VERIFICATION',
      courier_name: 'DHL Express',
      shipping_address: fullAddr,
    };
    const newDbPayment: DbPayment = {
      payment_id: newPaymentId,
      order_id: numericOrderId,
      qr_receipt_url: payload.slipUrl,
      status: 'pending',
    };
    const newDbOrder: DbOrder = {
      order_id: numericOrderId,
      shipping_id: newShippingId,
      user_id: newUserId,
      order_date: savedOrder.created_at,
      status: 'pending',
      total_price: payload.total,
      prep_photo_url: '',
    };
    const newFormulaId = 1_000_000 + numericOrderId;
    const formulaName =
      cartItems[0]?.title ||
      `Bespoke Blend (${composition.topNote} · ${composition.heartNote} · ${composition.baseNote})`;
    const newDbFormula: DbFormula = {
      formula_id: newFormulaId,
      formula_name: formulaName,
      created_at: savedOrder.created_at,
    };
    const newDbOrderItem: DbOrderItem = {
      order_item_id: newFormulaId,
      formula_detail_id: 1,
      order_id: numericOrderId,
      bottle_id: composition.bottleSize === '100 ml' ? 2 : 1,
      qty: cartItems.reduce((acc, item) => acc + item.quantity, 0) || 1,
    };

    setDbUsers((prev) => [newDbUser, ...prev]);
    setDbShippings((prev) => [newDbShipping, ...prev]);
    setDbPayments((prev) => [newDbPayment, ...prev]);
    setDbFormulas((prev) => [newDbFormula, ...prev]);
    setDbOrderItems((prev) => [newDbOrderItem, ...prev]);
    setDbOrders((prev) => [newDbOrder, ...prev]);
    setOrder((prev) => ({
      ...prev,
      orderId: payload.orderId,
      paymentSlipUrl: payload.slipUrl,
      status: 'slip_uploaded',
      total: payload.total,
    }));
  };

  // Admin verifies slip and confirms the order
  const handleAdminConfirmOrder = async (orderId: number) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ status: 'processing', payment_status: 'verified', verified_at: now })
      .eq('order_id', orderId);
    if (error) {
      console.error('Failed to confirm Supabase order:', error);
      throw new Error(`Could not confirm order: ${error.message}`);
    }

    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'processing' } : o))
    );
    setDbPayments((prev) =>
      prev.map((p) =>
        p.order_id === orderId ? { ...p, status: 'verified', verified_at: now } : p
      )
    );
    setOrder((prev) =>
      Number(prev.orderId.replace(/\D/g, '')) === orderId
        ? { ...prev, status: 'verified' }
        : prev
    );
  };

  // Admin cancels the order
  const handleAdminCancelOrder = async (orderId: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'failed' })
      .eq('order_id', orderId);
    if (error) {
      console.error('Failed to cancel Supabase order:', error);
      throw new Error(`Could not cancel order: ${error.message}`);
    }

    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setDbPayments((prev) =>
      prev.map((p) => (p.order_id === orderId ? { ...p, status: 'failed' } : p))
    );
    setOrder((prev) =>
      Number(prev.orderId.replace(/\D/g, '')) === orderId
        ? { ...prev, status: 'cancelled' }
        : prev
    );
  };

  const handleAdminUpdateOrderStatus = async (orderId: number, status: DbOrder['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('order_id', orderId);
    if (error) {
      console.error('Failed to update Supabase order status:', error);
      throw new Error(`Could not update order status: ${error.message}`);
    }

    setDbOrders((prev) =>
      prev.map((order) => (order.order_id === orderId ? { ...order, status } : order))
    );
  };

  const handleAdminVerifyPayment = async (_paymentId: number, orderId: number) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'verified', verified_at: now })
      .eq('order_id', orderId);
    if (error) {
      console.error('Failed to verify Supabase payment:', error);
      throw new Error(`Could not verify payment: ${error.message}`);
    }

    setDbPayments((prev) =>
      prev.map((payment) =>
        payment.order_id === orderId
          ? { ...payment, status: 'verified', verified_at: now }
          : payment
      )
    );
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Failed to sign out of Supabase:', error);
      window.alert(`Could not sign out: ${error.message}`);
      return;
    }
    setCurrentUser(null);
    setAuthenticatedUser(null);
    setIsAdminUser(false);
    setOrder((prev) => ({ ...prev, customerName: '' }));
    setCurrentView('home');
  };

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthResolved) {
    return <div className="min-h-screen bg-[#FFFDF8]" aria-busy="true" />;
  }

  if (isAdminUser) {
    return (
      <AdminSidePanel
        isOpen
        onClose={handleLogout}
        adminUser={adminUser}
        orders={dbOrders}
        users={dbUsers}
        shippings={dbShippings}
        payments={dbPayments}
        ingredients={dbIngredients}
        formulas={dbFormulas}
        formulaDetails={dbFormulaDetails}
        orderItems={dbOrderItems}
        onConfirmOrder={handleAdminConfirmOrder}
        onCancelOrder={handleAdminCancelOrder}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onVerifyPayment={handleAdminVerifyPayment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#28192A] flex flex-col font-sans selection:bg-[#C9A25C]/20">
      
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        userName={currentUser}
        onOpenAuth={(mode = 'signup') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onOpenStoryModal={() => setStoryModalOpen(true)}
          />
        )}

        {currentView === 'collection' && (
          <IngredientLibraryView
            onNavigate={navigateTo}
            onSelectIngredientToScentify={handleAddIngredientToScentify}
          />
        )}

        {currentView === 'scentify' && (
          <ScentifyView
            composition={composition}
            onUpdateComposition={setComposition}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'review-fragrance' && (
          <ReviewFragranceView
            composition={composition}
            onConfirmAndShip={handleConfirmAndShipCustom}
            onRequestChange={() => navigateTo('chat')}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            items={cartItems}
            currentUser={currentUser}
            onOpenAuth={(mode = 'signup') => {
              setAuthModalMode(mode);
              setAuthModalOpen(true);
            }}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToOrder={() => {
              if (!currentUser) {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              } else {
                navigateTo('review-order');
              }
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'review-order' && (
          <ReviewOrderView
            order={order}
            items={cartItems}
            currentUser={currentUser}
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setAuthModalOpen(true);
            }}
            onUpdateAddress={handleAddressUpdate}
            onProceedToPayment={() => {
              if (!currentUser) {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              } else {
                navigateTo('payment');
              }
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'payment' && (
          <PaymentView
            order={order}
            items={cartItems}
            onSlipUploaded={handleSlipUploaded}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'chat' && (
          <CustomerCareView
            order={order}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            userName={currentUser || 'Studio Member'}
            userEmail={authenticatedUser?.email || undefined}
            order={order}
            purchaseHistory={purchaseHistory}
            purchaseHistoryError={purchaseHistoryError}
            onUpdateAddress={handleAddressUpdate}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'about' && (
          <AboutView onNavigate={navigateTo} />
        )}

        {currentView === 'journal' && (
          <JournalView onNavigate={navigateTo} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(name, email, role) => {
          if (role === 'admin') {
            setIsAdminUser(true);
            setAdminUser(name);
            setCurrentUser(null); // Admin should not access to normal user role!
          } else {
            setCurrentUser(name);
            setIsAdminUser(false);
            setOrder((prev) => ({ ...prev, customerName: name }));
          }
        }}
        onAdminLogin={() => {
          setIsAdminUser(true);
          setCurrentUser(null); // Admin should not access to normal user role!
        }}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectIngredient={handleAddIngredientToScentify}
        onNavigate={navigateTo}
      />

      <StoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        onOpenScentify={() => {
          setStoryModalOpen(false);
          navigateTo('scentify');
        }}
      />

    </div>
  );
}
