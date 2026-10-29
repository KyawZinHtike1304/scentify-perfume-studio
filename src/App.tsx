import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { IngredientLibraryView } from './components/IngredientLibraryView';
import { AtelierView } from './components/AtelierView';
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

import {
  auth,
  db,
  testConnection,
} from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
} from './types';
import {
  INITIAL_CART_ITEMS,
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
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

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
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('LOREM Studio Master Perfumer');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'admin'>('signup');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  // Test connection to Firestore on mount and sync auth state
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          const name =
            snap.exists() && snap.data()?.displayName
              ? snap.data().displayName
              : firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Studio Member';
          setCurrentUser(name);
          
          if (snap.exists()) {
            const data = snap.data();
            const savedAddr = data.shippingAddress;
            setOrder((prev) => ({
              ...prev,
              customerName: name,
              address: savedAddr?.address || prev.address,
              city: savedAddr?.city || prev.city,
              province: savedAddr?.province || prev.province,
              postalCode: savedAddr?.postalCode || prev.postalCode,
              country: savedAddr?.country || prev.country,
              phone: savedAddr?.phone || prev.phone,
            }));
          } else {
            setOrder((prev) => ({ ...prev, customerName: name }));
          }
          const isAdmin =
            Boolean(snap.exists() && snap.data()?.role === 'admin') ||
            Boolean(firebaseUser.email?.toLowerCase().includes('admin'));
          setIsAdminUser(isAdmin);
        } catch (e) {
          console.warn('Notice reading user profile from Firestore:', e);
          const fallback =
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Studio Member';
          setCurrentUser(fallback);
          setIsAdminUser(Boolean(firebaseUser.email?.toLowerCase().includes('admin')));
          setOrder((prev) => ({ ...prev, customerName: fallback }));
        }
      } else {
        setCurrentUser(null);
        setIsAdminUser(false);
        setIsAdminOpen(false);
      }
    });

    return () => unsubscribe();
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

  const handleAddIngredientToAtelier = (ingredient: Ingredient) => {
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
        reply = 'Of course! We have adjusted your formula notes in the atelier to balance the warmth and let the floral heart shine. 🌿';
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
    // 1. Update customer active order state
    setOrder((prev) => ({
      ...prev,
      orderId: payload.orderId,
      paymentSlipUrl: payload.slipUrl,
      status: 'slip_uploaded',
      total: payload.total,
    }));

    // 2. Parse numeric order ID
    const numericOrderId =
      parseInt(payload.orderId.replace(/\D/g, ''), 10) || 1000 + dbOrders.length + 1;
    const newUserId = 10;
    const newShippingId = 500 + dbShippings.length + 1;
    const newPaymentId = 300 + dbPayments.length + 1;

    const custName = order.customerName || currentUser || 'Studio Client';
    const custEmail = auth.currentUser?.email || 'customer@studio.lorem.com';
    const custPhone = order.phone || '+66 81 234 5678';
    const fullAddr = `${order.address}, ${order.city}, ${order.province} ${order.postalCode}, ${order.country}`;

    // 3. Create relational records matching user's database diagram
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
      order_date: new Date().toISOString(),
      status: 'pending',
      total_price: payload.total,
      prep_photo_url: '',
    };

    const newFormulaId = 200 + dbFormulas.length + 1;
    const formulaName =
      cartItems[0]?.title ||
      `Bespoke Blend (${composition.topNote} · ${composition.heartNote} · ${composition.baseNote})`;
    const newDbFormula: DbFormula = {
      formula_id: newFormulaId,
      formula_name: formulaName,
      created_at: new Date().toISOString(),
    };

    const newDbOrderItem: DbOrderItem = {
      order_item_id: 800 + dbOrderItems.length + 1,
      formula_detail_id: 1,
      order_id: numericOrderId,
      bottle_id: composition.bottleSize === '100 ml' ? 2 : 1,
      qty: cartItems.reduce((acc, i) => acc + i.quantity, 0) || 1,
    };

    // Prepend to Admin panel state so it immediately shows at the top of the orders table!
    setDbUsers((prev) => [newDbUser, ...prev.filter((u) => u.id !== newUserId)]);
    setDbShippings((prev) => [newDbShipping, ...prev]);
    setDbPayments((prev) => [newDbPayment, ...prev]);
    setDbFormulas((prev) => [newDbFormula, ...prev]);
    setDbOrderItems((prev) => [newDbOrderItem, ...prev]);
    setDbOrders((prev) => [newDbOrder, ...prev]);

    // Persist to Firestore
    try {
      const orderRef = doc(db, 'orders', String(numericOrderId));
      await setDoc(
        orderRef,
        {
          orderId: numericOrderId,
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: custPhone,
          address: fullAddr,
          total: payload.total,
          status: 'pending',
          paymentStatus: 'pending',
          paymentSlipUrl: payload.slipUrl,
          items: cartItems.map((c) => ({
            title: c.title,
            price: c.price,
            quantity: c.quantity,
            size: c.details?.size || '50 ml',
          })),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (auth.currentUser) {
        const userOrderRef = doc(db, 'users', auth.currentUser.uid, 'orders', String(numericOrderId));
        await setDoc(
          userOrderRef,
          {
            orderId: numericOrderId,
            total: payload.total,
            status: 'pending',
            paymentStatus: 'pending',
            paymentSlipUrl: payload.slipUrl,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Notice saving order to Firestore:', e);
    }
  };

  // Admin verifies slip and confirms the order
  const handleAdminConfirmOrder = async (orderId: number) => {
    const now = new Date().toISOString();
    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'processing' } : o))
    );
    setDbPayments((prev) =>
      prev.map((p) =>
        p.order_id === orderId ? { ...p, status: 'verified', verified_at: now } : p
      )
    );
    setOrder((prev) => {
      const numActive = parseInt(prev.orderId.replace(/\D/g, ''), 10);
      if (numActive === orderId) {
        return { ...prev, status: 'verified' };
      }
      return prev;
    });

    try {
      const orderRef = doc(db, 'orders', String(orderId));
      await setDoc(
        orderRef,
        { status: 'processing', paymentStatus: 'verified', verifiedAt: now },
        { merge: true }
      );
      if (auth.currentUser) {
        const userOrderRef = doc(db, 'users', auth.currentUser.uid, 'orders', String(orderId));
        await setDoc(
          userOrderRef,
          { status: 'processing', paymentStatus: 'verified', verifiedAt: now },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Notice confirming order in Firestore:', e);
    }
  };

  // Admin cancels the order
  const handleAdminCancelOrder = async (orderId: number) => {
    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setDbPayments((prev) =>
      prev.map((p) => (p.order_id === orderId ? { ...p, status: 'failed' } : p))
    );
    setOrder((prev) => {
      const numActive = parseInt(prev.orderId.replace(/\D/g, ''), 10);
      if (numActive === orderId) {
        return { ...prev, status: 'cancelled' };
      }
      return prev;
    });

    try {
      const orderRef = doc(db, 'orders', String(orderId));
      await setDoc(
        orderRef,
        { status: 'cancelled', paymentStatus: 'failed' },
        { merge: true }
      );
      if (auth.currentUser) {
        const userOrderRef = doc(db, 'users', auth.currentUser.uid, 'orders', String(orderId));
        await setDoc(
          userOrderRef,
          { status: 'cancelled', paymentStatus: 'failed' },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Notice cancelling order in Firestore:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Notice signing out:', e);
    }
    setCurrentUser(null);
    setIsAdminUser(false);
    setIsAdminOpen(false);
    setOrder((prev) => ({ ...prev, customerName: '' }));
    setCurrentView('home');
  };

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#28192A] flex flex-col font-sans selection:bg-[#C9A25C]/20">
      
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        userName={isAdminUser ? adminUser : currentUser}
        isAdmin={isAdminUser}
        onOpenAdmin={() => setIsAdminOpen(true)}
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
            onSelectIngredientToAtelier={handleAddIngredientToAtelier}
          />
        )}

        {currentView === 'atelier' && (
          <AtelierView
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
            onOpenAdmin={() => setIsAdminOpen(true)}
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
          isAdminUser ? (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#FFFDF8]">
              <div className="max-w-md w-full p-8 bg-[#FBF7F0] border border-[#DAD1C5] text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#28192A] text-[#C9A25C] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h2 className="font-serif text-2xl text-[#28192A]">Admin Console Session</h2>
                <p className="text-xs text-[#6B6166] leading-relaxed">
                  You are currently authenticated as <strong>{adminUser}</strong>. Customer profiles, shopping bag checkout, and personal shipping addresses are reserved strictly for customer store roles.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="w-full py-3 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540] transition-colors"
                  >
                    Open Admin Console
                  </button>
                  <button
                    onClick={() => navigateTo('home')}
                    className="text-xs text-[#6B6166] hover:text-[#28192A] underline py-1"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ProfileView
              userName={currentUser || 'Studio Member'}
              userEmail={auth.currentUser?.email || undefined}
              order={order}
              onUpdateAddress={handleAddressUpdate}
              onLogout={handleLogout}
              onNavigate={navigateTo}
            />
          )
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
            setIsAdminOpen(true);
          } else {
            setCurrentUser(name);
            setIsAdminUser(false);
            setOrder((prev) => ({ ...prev, customerName: name }));
          }
        }}
        onAdminLogin={() => {
          setIsAdminUser(true);
          setCurrentUser(null); // Admin should not access to normal user role!
          setIsAdminOpen(true);
        }}
      />

      {/* Admin Side Panel based on Database Diagram */}
      <AdminSidePanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
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
        onUpdateOrderStatus={(orderId, status) => {
          setDbOrders((prev) =>
            prev.map((o) => (o.order_id === orderId ? { ...o, status } : o))
          );
        }}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectIngredient={handleAddIngredientToAtelier}
        onNavigate={navigateTo}
      />

      <StoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        onOpenAtelier={() => {
          setStoryModalOpen(false);
          navigateTo('atelier');
        }}
      />

    </div>
  );
}
