import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  FileText,
  Layers,
  Users,
  Database,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Camera,
  RefreshCw,
  Download,
  Check,
  Plus,
  LogOut
} from 'lucide-react';
import {
  DbOrder,
  DbShipping,
  DbPayment,
  DbIngredient,
  DbUser,
  DbFormula,
  DbFormulaDetail,
  DbOrderItem,
  EnrichedOrder,
} from '../types';
import {
  INITIAL_DB_ORDERS,
  INITIAL_DB_USERS,
  INITIAL_DB_SHIPPINGS,
  INITIAL_DB_PAYMENTS,
  INITIAL_DB_INGREDIENTS,
  INITIAL_DB_FORMULAS,
  INITIAL_DB_FORMULA_DETAILS,
  INITIAL_DB_BOTTLES,
  INITIAL_DB_ORDER_ITEMS,
  buildEnrichedOrders,
} from '../data/adminDatabaseData';

interface AdminSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser?: string | null;
  orders?: DbOrder[];
  users?: DbUser[];
  shippings?: DbShipping[];
  payments?: DbPayment[];
  ingredients?: DbIngredient[];
  formulas?: DbFormula[];
  formulaDetails?: DbFormulaDetail[];
  orderItems?: DbOrderItem[];
  onConfirmOrder?: (orderId: number) => void | Promise<void>;
  onCancelOrder?: (orderId: number) => void | Promise<void>;
  onUpdateOrderStatus?: (orderId: number, status: DbOrder['status']) => void | Promise<void>;
  onVerifyPayment?: (paymentId: number, orderId: number) => void | Promise<void>;
}

export const AdminSidePanel: React.FC<AdminSidePanelProps> = ({
  isOpen,
  onClose,
  adminUser = 'Scentify Studio Master Perfumer',
  orders: propOrders,
  users: propUsers,
  shippings: propShippings,
  payments: propPayments,
  ingredients: propIngredients,
  formulas: propFormulas,
  formulaDetails: propFormulaDetails,
  orderItems: propOrderItems,
  onConfirmOrder,
  onCancelOrder,
  onUpdateOrderStatus,
  onVerifyPayment,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'sales' | 'orders' | 'inventory' | 'users'>('sales');

  // Relational Database State
  const [orders, setOrders] = useState<DbOrder[]>(propOrders || INITIAL_DB_ORDERS);
  const [users, setUsers] = useState<DbUser[]>(propUsers || INITIAL_DB_USERS);
  const [shippings, setShippings] = useState<DbShipping[]>(propShippings || INITIAL_DB_SHIPPINGS);
  const [payments, setPayments] = useState<DbPayment[]>(propPayments || INITIAL_DB_PAYMENTS);
  const [ingredients, setIngredients] = useState<DbIngredient[]>(propIngredients || INITIAL_DB_INGREDIENTS);
  const [formulas, setFormulas] = useState<DbFormula[]>(propFormulas || INITIAL_DB_FORMULAS);
  const [formulaDetails, setFormulaDetails] = useState<DbFormulaDetail[]>(propFormulaDetails || INITIAL_DB_FORMULA_DETAILS);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>(propOrderItems || INITIAL_DB_ORDER_ITEMS);

  // Sync state whenever props update (e.g. customer places a new order)
  React.useEffect(() => {
    if (propOrders) setOrders(propOrders);
  }, [propOrders]);

  React.useEffect(() => {
    if (propUsers) setUsers(propUsers);
  }, [propUsers]);

  React.useEffect(() => {
    if (propShippings) setShippings(propShippings);
  }, [propShippings]);

  React.useEffect(() => {
    if (propPayments) setPayments(propPayments);
  }, [propPayments]);

  React.useEffect(() => {
    if (propIngredients) setIngredients(propIngredients);
  }, [propIngredients]);

  React.useEffect(() => {
    if (propFormulas) setFormulas(propFormulas);
  }, [propFormulas]);

  React.useEffect(() => {
    if (propFormulaDetails) setFormulaDetails(propFormulaDetails);
  }, [propFormulaDetails]);

  React.useEffect(() => {
    if (propOrderItems) setOrderItems(propOrderItems);
  }, [propOrderItems]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'verified' | 'pending' | 'failed'>('all');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState<{ courier: string; tracking: string }>({ courier: '', tracking: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Success Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Build joined orders
  const enrichedOrders = useMemo(() => {
    return buildEnrichedOrders(
      orders,
      users,
      shippings,
      payments,
      orderItems,
      formulas,
      formulaDetails,
      ingredients,
      INITIAL_DB_BOTTLES
    );
  }, [orders, users, shippings, payments, orderItems, formulas, formulaDetails, ingredients]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter((item) => {
      const matchSearch =
        item.order.order_id.toString().includes(searchQuery) ||
        item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shipping.tracking_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.order.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || item.payment.status === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [enrichedOrders, searchQuery, statusFilter, paymentFilter]);

  // Sales Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_price, 0);
  }, [orders]);

  const verifiedPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.status === 'verified').length;
  }, [payments]);

  const pendingPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.status === 'pending').length;
  }, [payments]);

  const averageOrderValue = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled');
    return valid.length > 0 ? Math.round(totalRevenue / valid.length) : 0;
  }, [orders, totalRevenue]);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: number, newStatus: DbOrder['status']) => {
    try {
      await onUpdateOrderStatus?.(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      showToast(error instanceof Error ? error.message : 'Order status could not be saved.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Order #${orderId} status updated to "${newStatus.toUpperCase()}"`);

    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, order: { ...prev.order, status: newStatus } } : null));
    }
  };

  // Handle Payment Status Update
  const handleVerifyPayment = async (paymentId: number, orderId: number) => {
    const now = new Date().toISOString();
    try {
      await onVerifyPayment?.(paymentId, orderId);
    } catch (error) {
      console.error('Failed to verify payment:', error);
      showToast(error instanceof Error ? error.message : 'Payment verification could not be saved.');
      return;
    }

    setPayments((prev) =>
      prev.map((p) => (p.payment_id === paymentId ? { ...p, status: 'verified', verified_at: now } : p))
    );
    showToast(`PromptPay payment verified for Order #${orderId}`);

    if (selectedOrder && selectedOrder.payment.payment_id === paymentId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              payment: { ...prev.payment, status: 'verified', verified_at: now },
            }
          : null
      );
    }
  };

  // Handle Admin Confirm Order (verifies slip & advances status to processing)
  const handleConfirmOrder = async (orderId: number) => {
    const now = new Date().toISOString();
    try {
      if (onConfirmOrder) {
        await onConfirmOrder(orderId);
      } else {
        await onUpdateOrderStatus?.(orderId, 'processing');
      }
    } catch (error) {
      console.error('Failed to confirm order:', error);
      showToast(error instanceof Error ? error.message : 'Order confirmation could not be saved.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: 'processing' } : ord))
    );
    setPayments((prev) =>
      prev.map((p) => (p.order_id === orderId ? { ...p, status: 'verified', verified_at: now } : p))
    );

    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              order: { ...prev.order, status: 'processing' },
              payment: { ...prev.payment, status: 'verified', verified_at: now },
            }
          : null
      );
    }

    showToast(`Order #${orderId} CONFIRMED! Payment slip approved.`);
  };

  // Handle Admin Cancel Order
  const handleCancelOrder = async (orderId: number) => {
    try {
      if (onCancelOrder) {
        await onCancelOrder(orderId);
      } else {
        await onUpdateOrderStatus?.(orderId, 'cancelled');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      showToast(error instanceof Error ? error.message : 'Order cancellation could not be saved.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: 'cancelled' } : ord))
    );
    setPayments((prev) =>
      prev.map((p) => (p.order_id === orderId ? { ...p, status: 'failed' } : p))
    );

    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              order: { ...prev.order, status: 'cancelled' },
              payment: { ...prev.payment, status: 'failed' },
            }
          : null
      );
    }

    showToast(`Order #${orderId} CANCELLED by Admin.`);
  };

  // Handle Shipping Tracking Update
  const handleSaveShipping = (shippingId: number) => {
    setShippings((prev) =>
      prev.map((s) =>
        s.shipping_id === shippingId
          ? {
              ...s,
              courier_name: shippingForm.courier || s.courier_name,
              tracking_number: shippingForm.tracking || s.tracking_number,
            }
          : s
      )
    );
    setIsEditingShipping(false);
    showToast('Shipping courier and tracking details updated.');

    if (selectedOrder && selectedOrder.shipping.shipping_id === shippingId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              shipping: {
                ...prev.shipping,
                courier_name: shippingForm.courier || prev.shipping.courier_name,
                tracking_number: shippingForm.tracking || prev.shipping.tracking_number,
              },
            }
          : null
      );
    }
  };

  // Handle Prep Photo Update
  const handleSetPrepPhoto = (orderId: number, photoUrl: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, prep_photo_url: photoUrl } : ord))
    );
    showToast(`Preparation flacon photo assigned to Order #${orderId}`);
    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, order: { ...prev.order, prep_photo_url: photoUrl } } : null
      );
    }
  };

  // Handle Ingredient Stock Adjustment
  const handleAdjustStock = (ingredientId: number, delta: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId
          ? { ...ing, stock_qty: Math.max(0, ing.stock_qty + delta) }
          : ing
      )
    );
    showToast(`Ingredient stock adjusted.`);
  };

  // Export Sales Report CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Order Date', 'Customer Name', 'Customer Email', 'Status', 'Payment Status', 'Courier', 'Tracking', 'Total (THB)'];
    const rows = enrichedOrders.map((eo) => [
      eo.order.order_id,
      eo.order.order_date,
      `"${eo.user.name}"`,
      eo.user.email,
      eo.order.status,
      eo.payment.status,
      eo.shipping.courier_name,
      eo.shipping.tracking_number,
      eo.order.total_price,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scentify_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sales report CSV successfully exported.');
  };

  if (!isOpen) return null;

  return (
    <div className="h-dvh min-h-screen w-full overflow-hidden overscroll-none bg-[#FFFDF8] flex">
      
      {/* Toast notification */}
      {notification && (
        <div className="fixed top-3 left-3 right-3 sm:top-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-60 bg-[#28192A] text-[#FFFDF8] border border-[#C9A25C] px-4 sm:px-5 py-3 rounded-none shadow-2xl text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#C9A25C]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Admin Panel Container */}
      <div className="w-full min-w-0 h-full min-h-0 bg-[#FFFDF8] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="bg-[#28192A] text-[#FFFDF8] px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 border-b border-[#C9A25C]/30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-none border border-[#C9A25C] bg-[#3D2540] flex items-center justify-center text-[#C9A25C]">
              <Database className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-serif text-sm sm:text-lg tracking-wider text-[#FFFDF8] truncate">
                  SCENTIFY STUDIO ADMIN PANEL
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#DAD1C5]/70 font-light">
                Reporting Orders, Sales Analytics &amp; Inventory Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 bg-[#FFFDF8]/10 hover:bg-[#FFFDF8]/20 border border-[#DAD1C5]/30 text-xs text-[#FFFDF8] flex items-center gap-1.5 transition-colors"
              title="Export complete orders and revenue table to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A25C]" />
              <span className="hidden sm:inline">Export Sales CSV</span>
            </button>

            <button
              onClick={onClose}
              className="px-2 sm:px-3 py-2 text-[#DAD1C5] hover:text-[#FFFDF8] hover:bg-[#FFFDF8]/10 transition-colors flex items-center gap-2"
              aria-label="Log out of admin panel"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">Log out</span>
            </button>
          </div>
        </div>

        {/* Database Diagram Entity Badges */}
        <div className="hidden sm:flex bg-[#FBF7F0] border-b border-[#DAD1C5] px-4 sm:px-6 py-2 items-center gap-2 overflow-x-auto text-[10px] font-mono text-[#6B6166] shrink-0">
          <span className="font-bold text-[#28192A] uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#C9A25C]" />
            Schema Tables:
          </span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">user</span>
          <span className="text-[#DAD1C5]">→</span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">order</span>
          <span className="text-[#DAD1C5]">→</span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">shipping</span>
          <span className="text-[#DAD1C5]">|</span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">payment</span>
          <span className="text-[#DAD1C5]">|</span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">order_item</span>
          <span className="text-[#DAD1C5]">→</span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">formula_detail</span>
          <span className="text-[#DAD1C5]">→</span>
          <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#DAD1C5]">formula / ingredient / bottle</span>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[#DAD1C5] px-2 sm:px-6 grid grid-cols-4 sm:flex sm:space-x-8 bg-[#FFFDF8] shrink-0">
          <button
            onClick={() => setActiveTab('sales')}
            className={`min-w-0 justify-center px-1 sm:px-0 py-2.5 sm:py-3.5 text-[9px] sm:text-xs uppercase tracking-wider font-medium border-b-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sales'
                ? 'border-[#28192A] text-[#28192A] font-semibold'
                : 'border-transparent text-[#6B6166] hover:text-[#28192A]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C9A25C]" />
            <span className="sm:hidden">Sales</span>
            <span className="hidden sm:inline">Sales Reports &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`min-w-0 justify-center px-1 sm:px-0 py-2.5 sm:py-3.5 text-[9px] sm:text-xs uppercase tracking-wider font-medium border-b-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#28192A] text-[#28192A] font-semibold'
                : 'border-transparent text-[#6B6166] hover:text-[#28192A]'
            }`}
          >
            <Package className="w-4 h-4 text-[#C9A25C]" />
            <span className="sm:hidden">Orders</span>
            <span className="hidden sm:inline">Order Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`min-w-0 justify-center px-1 sm:px-0 py-2.5 sm:py-3.5 text-[9px] sm:text-xs uppercase tracking-wider font-medium border-b-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#28192A] text-[#28192A] font-semibold'
                : 'border-transparent text-[#6B6166] hover:text-[#28192A]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C9A25C]" />
            <span className="sm:hidden">Stock</span>
            <span className="hidden sm:inline">Formulas &amp; Ingredients ({ingredients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`min-w-0 justify-center px-1 sm:px-0 py-2.5 sm:py-3.5 text-[9px] sm:text-xs uppercase tracking-wider font-medium border-b-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#28192A] text-[#28192A] font-semibold'
                : 'border-transparent text-[#6B6166] hover:text-[#28192A]'
            }`}
          >
            <Users className="w-4 h-4 text-[#C9A25C]" />
            <span className="sm:hidden">Users</span>
            <span className="hidden sm:inline">Customer Directory ({users.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 bg-[#FFFDF8]">
          
          {/* TAB 1: SALES REPORTS & ANALYTICS */}
          {activeTab === 'sales' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-5 bg-[#FBF7F0] border border-[#DAD1C5] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6166] font-mono">
                      TOTAL REVENUE
                    </span>
                    <DollarSign className="w-4 h-4 text-[#C9A25C]" />
                  </div>
                  <div className="mt-3 font-serif text-2xl sm:text-3xl font-medium text-[#28192A]">
                    ฿ {totalRevenue.toLocaleString()}
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+24.6% vs last week</span>
                  </div>
                </div>

                <div className="p-5 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6166] font-mono">
                      ACTIVE ORDERS
                    </span>
                    <Package className="w-4 h-4 text-[#C9A25C]" />
                  </div>
                  <div className="mt-3 font-serif text-2xl sm:text-3xl font-medium text-[#28192A]">
                    {orders.length} <span className="text-sm font-sans text-[#6B6166]">orders</span>
                  </div>
                  <div className="mt-2 text-[11px] text-[#6B6166]">
                    {orders.filter((o) => o.status === 'completed').length} completed · {orders.filter((o) => o.status === 'processing').length} in lab
                  </div>
                </div>

                <div className="p-5 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6166] font-mono">
                      AVG ORDER VALUE
                    </span>
                    <TrendingUp className="w-4 h-4 text-[#C9A25C]" />
                  </div>
                  <div className="mt-3 font-serif text-2xl sm:text-3xl font-medium text-[#28192A]">
                    ฿ {averageOrderValue.toLocaleString()}
                  </div>
                  <div className="mt-2 text-[11px] text-[#6B6166]">
                    Popular bottle: 50 ml Eau de Parfum
                  </div>
                </div>

                <div className="p-5 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6166] font-mono">
                      PAYMENT SETTLEMENTS
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#C9A25C]" />
                  </div>
                  <div className="mt-3 font-serif text-2xl sm:text-3xl font-medium text-[#28192A]">
                    {verifiedPaymentsCount} / {payments.length}
                  </div>
                  <div className="mt-2 text-[11px] text-amber-800 font-medium">
                    {pendingPaymentsCount > 0 ? `${pendingPaymentsCount} PromptPay slips need review` : 'All slips verified'}
                  </div>
                </div>

              </div>

              {/* Reports Visual Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Revenue by Formula & Bottle Size */}
                <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#DAD1C5] p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5]/50 mb-5">
                    <div>
                      <h3 className="font-serif text-xl text-[#28192A]">Sales by Bespoke Formulation</h3>
                      <p className="text-xs text-[#6B6166]">Performance across top scent formulas (`formula` table)</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#FBF7F0] border border-[#DAD1C5]">
                      LIVE
                    </span>
                  </div>

                  <div className="space-y-4">
                    {INITIAL_DB_FORMULAS.map((formula, idx) => {
                      const share = [40, 25, 18, 12, 5][idx] || 10;
                      return (
                        <div key={formula.formula_id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-[#28192A]">{formula.formula_name}</span>
                            <span className="font-mono text-[#6B6166]">{share}% share</span>
                          </div>
                          <div className="w-full h-2 bg-[#FBF7F0] border border-[#DAD1C5]/40 overflow-hidden">
                            <div
                              className="h-full bg-[#28192A]"
                              style={{ width: `${share}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#DAD1C5]/40 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#FBF7F0] border border-[#DAD1C5]/60">
                      <span className="text-[10px] uppercase font-mono text-[#6B6166] block">50 ml Standard Bottle</span>
                      <span className="font-serif text-lg text-[#28192A]">฿ 1,680 / unit</span>
                      <span className="text-[11px] text-[#C9A25C] block mt-0.5">64% volume preference</span>
                    </div>
                    <div className="p-3 bg-[#FBF7F0] border border-[#DAD1C5]/60">
                      <span className="text-[10px] uppercase font-mono text-[#6B6166] block">100 ml Luxury Flacon</span>
                      <span className="font-serif text-lg text-[#28192A]">฿ 2,580 / unit</span>
                      <span className="text-[11px] text-[#C9A25C] block mt-0.5">36% volume preference</span>
                    </div>
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="lg:col-span-5 bg-[#FFFDF8] border border-[#DAD1C5] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5]/50 mb-5">
                      <div>
                        <h3 className="font-serif text-xl text-[#28192A]">Fulfillment Pipeline</h3>
                        <p className="text-xs text-[#6B6166]">Status counts from `order` table</p>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span className="font-medium text-emerald-950">Completed &amp; Delivered</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-900">
                          {orders.filter((o) => o.status === 'completed').length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-blue-700" />
                          <span className="font-medium text-blue-950">Processing in Lab</span>
                        </div>
                        <span className="font-mono font-bold text-blue-900">
                          {orders.filter((o) => o.status === 'processing').length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span className="font-medium text-amber-950">Pending Verification</span>
                        </div>
                        <span className="font-mono font-bold text-amber-900">
                          {orders.filter((o) => o.status === 'pending').length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-stone-100 border border-stone-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <X className="w-4 h-4 text-stone-500" />
                          <span className="font-medium text-stone-700">Cancelled</span>
                        </div>
                        <span className="font-mono font-bold text-stone-700">
                          {orders.filter((o) => o.status === 'cancelled').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#DAD1C5]/40 text-center">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#28192A] hover:text-[#C9A25C] underline font-medium flex items-center justify-center gap-1 mx-auto"
                    >
                      <span>Manage All Orders</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#FBF7F0] border border-[#DAD1C5]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6166]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, customer name, email, or tracking..."
                    className="w-full bg-[#FFFDF8] border border-[#DAD1C5] pl-9 pr-3.5 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#28192A]"
                  />
                </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs min-w-0">
                    <span className="text-[#6B6166] text-[11px] uppercase">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full sm:w-auto min-w-0 bg-[#FFFDF8] border border-[#DAD1C5] px-2.5 py-2 text-xs text-[#28192A] focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs min-w-0">
                    <span className="text-[#6B6166] text-[11px] uppercase">Payment:</span>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value as any)}
                      className="w-full sm:w-auto min-w-0 bg-[#FFFDF8] border border-[#DAD1C5] px-2.5 py-2 text-xs text-[#28192A] focus:outline-none"
                    >
                      <option value="all">All Payments</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="max-w-full bg-[#FFFDF8] border border-[#DAD1C5] overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FBF7F0] border-b border-[#DAD1C5] text-[10px] uppercase font-mono tracking-wider text-[#6B6166]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer (`user`)</th>
                      <th className="py-3 px-4">Bespoke Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment (`payment`)</th>
                      <th className="py-3 px-4">Order Status (`order`)</th>
                      <th className="py-3 px-4">Tracking (`shipping`)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DAD1C5]/40">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#6B6166]">
                          No orders matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((eo) => (
                        <tr key={eo.order.order_id} className="hover:bg-[#FBF7F0]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#28192A]">
                            #{eo.order.order_id}
                          </td>
                          <td className="py-3.5 px-4 text-[#6B6166]">
                            {new Date(eo.order.order_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#28192A]">{eo.user.name}</div>
                            <div className="text-[11px] text-[#6B6166]">{eo.user.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate">
                            {eo.items.map((i) => (
                              <div key={i.order_item_id} className="truncate">
                                <span className="font-medium text-[#28192A]">{i.formula_name.split('(')[0]}</span>
                                <span className="text-[11px] text-[#6B6166] ml-1">({i.bottle.size}ml · x{i.qty})</span>
                              </div>
                            ))}
                          </td>
                          <td className="py-3.5 px-4 font-serif text-sm font-medium text-[#28192A]">
                            ฿ {eo.order.total_price.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {eo.payment.qr_receipt_url ? (
                                <img
                                  src={eo.payment.qr_receipt_url}
                                  alt="PromptPay Slip"
                                  className="w-9 h-9 object-cover border border-[#DAD1C5] rounded-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                                  onClick={() => setPreviewImage(eo.payment.qr_receipt_url)}
                                  title="Click to view full PromptPay receipt"
                                />
                              ) : (
                                <div className="w-9 h-9 bg-[#FBF7F0] border border-dashed border-[#DAD1C5] flex items-center justify-center text-[9px] text-[#6B6166] shrink-0">
                                  No Slip
                                </div>
                              )}
                              <div className="space-y-0.5">
                                {eo.payment.status === 'verified' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-mono font-bold">
                                    <Check className="w-3 h-3" />
                                    Verified
                                  </span>
                                ) : eo.payment.status === 'pending' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] uppercase font-mono font-bold">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    Pending Slip
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] uppercase font-mono">
                                    Failed
                                  </span>
                                )}
                                {eo.payment.qr_receipt_url && (
                                  <button
                                    onClick={() => setPreviewImage(eo.payment.qr_receipt_url)}
                                    className="text-[10px] text-[#6B6166] hover:text-[#28192A] underline block"
                                  >
                                    View slip
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={eo.order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(eo.order.order_id, e.target.value as any)
                              }
                              className={`text-[11px] font-medium border px-2 py-1 bg-[#FFFDF8] focus:outline-none ${
                                eo.order.status === 'completed'
                                  ? 'border-emerald-300 text-emerald-900'
                                  : eo.order.status === 'processing'
                                  ? 'border-blue-300 text-blue-900'
                                  : eo.order.status === 'pending'
                                  ? 'border-amber-300 text-amber-900'
                                  : 'border-stone-300 text-stone-700'
                              }`}
                            >
                              <option value="pending">pending</option>
                              <option value="processing">processing</option>
                              <option value="completed">completed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B6166]">
                            <div className="font-medium text-[#28192A]">{eo.shipping.courier_name}</div>
                            <div className="text-[10px] truncate max-w-[100px]">{eo.shipping.tracking_number}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {eo.order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleConfirmOrder(eo.order.order_id)}
                                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
                                    title="Confirm Order & Verify Payment"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Confirm</span>
                                  </button>
                                  <button
                                    onClick={() => handleCancelOrder(eo.order.order_id)}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                                    title="Cancel Order"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedOrder(eo);
                                  setShippingForm({
                                    courier: eo.shipping.courier_name,
                                    tracking: eo.shipping.tracking_number,
                                  });
                                }}
                                className="px-2.5 py-1 bg-[#28192A] text-[#FFFDF8] hover:bg-[#3D2540] text-xs transition-colors inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: FORMULAS & INGREDIENTS INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Ingredients Table */}
              <div className="bg-[#FFFDF8] border border-[#DAD1C5] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DAD1C5]/50 mb-6 gap-2">
                  <div>
                    <h3 className="font-serif text-2xl text-[#28192A]">Ingredient Library Inventory</h3>
                    <p className="text-xs text-[#6B6166]">
                      Tracks raw botanical essences from `ingredient` table used in Scentify
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6166]">Stock Status:</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono">Good</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono">Low (&lt;25)</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono">Critical (&lt;15)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.map((ing) => (
                    <div
                      key={ing.ingredient_id}
                      className="p-4 bg-[#FBF7F0] border border-[#DAD1C5] flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6166]">
                            ID #{ing.ingredient_id} · {ing.category}
                          </span>
                          <h4 className="font-serif text-lg text-[#28192A] mt-0.5">{ing.name}</h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono uppercase border ${
                            ing.stock_qty < 15
                              ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                              : ing.stock_qty < 25
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {ing.stock_qty} fl oz in stock
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#DAD1C5]/40 flex items-center justify-between">
                        <span className="text-[11px] text-[#6B6166]">Quick Restock:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(ing.ingredient_id, 10)}
                            className="px-2 py-1 bg-[#FFFDF8] border border-[#DAD1C5] hover:bg-[#28192A] hover:text-[#FFFDF8] text-[11px] transition-colors"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleAdjustStock(ing.ingredient_id, 50)}
                            className="px-2 py-1 bg-[#FFFDF8] border border-[#DAD1C5] hover:bg-[#28192A] hover:text-[#FFFDF8] text-[11px] transition-colors"
                          >
                            +50
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottle Specifications Table */}
              <div className="bg-[#FFFDF8] border border-[#DAD1C5] p-4 sm:p-6">
                <h3 className="font-serif text-2xl text-[#28192A] mb-1">Bottle Catalog (`bottle` table)</h3>
                <p className="text-xs text-[#6B6166] mb-5">Flacon sizes and retail prices configured for custom perfumes</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {INITIAL_DB_BOTTLES.map((bottle) => (
                    <div key={bottle.bottle_id} className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]">
                      <span className="text-[10px] font-mono uppercase text-[#6B6166] block">BOTTLE #{bottle.bottle_id}</span>
                      <h4 className="font-serif text-xl text-[#28192A] mt-1">{bottle.size} ml Flacon</h4>
                      <div className="mt-3 font-serif text-2xl font-medium text-[#28192A]">
                        ฿ {bottle.price.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-[#6B6166] block mt-1">
                        Artisanal Italian glass with gold atomizer
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CUSTOMER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-[#FFFDF8] border border-[#DAD1C5] p-4 sm:p-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5]/50 mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-[#28192A]">Registered Users (`user` table)</h3>
                    <p className="text-xs text-[#6B6166]">Customer accounts and administrative roles</p>
                  </div>
                  <span className="text-xs text-[#6B6166]">
                    Total Accounts: <strong>{users.length}</strong>
                  </span>
                </div>

                <div className="max-w-full overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FBF7F0] border-b border-[#DAD1C5] text-[10px] uppercase font-mono tracking-wider text-[#6B6166]">
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Delivery Address</th>
                        <th className="py-3 px-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DAD1C5]/40">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FBF7F0]/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#28192A]">#{u.id}</td>
                          <td className="py-3.5 px-4 font-medium text-[#28192A]">{u.name}</td>
                          <td className="py-3.5 px-4 text-[#6B6166]">{u.email}</td>
                          <td className="py-3.5 px-4 text-[#6B6166]">{u.phone}</td>
                          <td className="py-3.5 px-4 max-w-xs text-[#6B6166] truncate">{u.address}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] uppercase font-mono border ${
                                u.role === 'admin'
                                  ? 'bg-[#28192A] text-[#FFFDF8] border-[#28192A] font-bold'
                                  : 'bg-[#FBF7F0] text-[#6B6166] border-[#DAD1C5]'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DETAIL MODAL: RELATIONAL ORDER INSPECTION */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-[#28192A]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#FFFDF8] border border-[#DAD1C5] max-w-3xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#DAD1C5] mb-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A25C] block">
                  ORDER RECORD #{selectedOrder.order.order_id}
                </span>
                <h3 className="font-serif text-2xl text-[#28192A]">Relational Order Management</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setIsEditingShipping(false);
                }}
                className="p-1.5 text-[#6B6166] hover:text-[#28192A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              
              {/* PRIMARY ADMIN SLIP REVIEW & ACTION BANNER */}
              <div className="p-4 bg-[#FBF7F0] border border-[#C9A25C] shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {selectedOrder.payment.qr_receipt_url ? (
                      <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => setPreviewImage(selectedOrder.payment.qr_receipt_url)}
                      >
                        <img
                          src={selectedOrder.payment.qr_receipt_url}
                          alt="Attached PromptPay Slip"
                          className="w-16 h-16 object-cover border border-[#DAD1C5] rounded-xs shadow-xs group-hover:opacity-85 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xs text-white text-[10px] font-medium">
                          <Eye className="w-3.5 h-3.5 mr-0.5" />
                          <span>Zoom</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#FFFDF8] border border-dashed border-[#DAD1C5] flex items-center justify-center text-[10px] text-[#6B6166] text-center px-1 shrink-0">
                        No Slip Attached
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#28192A]">
                          Admin Order Decision
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold ${
                            selectedOrder.payment.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : selectedOrder.payment.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          Payment: {selectedOrder.payment.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold ${
                            selectedOrder.order.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-900'
                              : selectedOrder.order.status === 'processing'
                              ? 'bg-blue-100 text-blue-900'
                              : selectedOrder.order.status === 'pending'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          Order: {selectedOrder.order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#28192A] mt-1">
                        Total Order Amount: <strong className="font-serif text-sm">฿ {selectedOrder.order.total_price.toLocaleString()}.00</strong>
                        {selectedOrder.payment.qr_receipt_url && (
                          <button
                            onClick={() => setPreviewImage(selectedOrder.payment.qr_receipt_url)}
                            className="text-[11px] text-[#28192A] underline hover:text-[#C9A25C] ml-2 inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect attached transfer slip</span>
                          </button>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Two Main Admin Action Buttons: Confirm or Cancel */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleConfirmOrder(selectedOrder.order.order_id)}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        selectedOrder.order.status === 'processing' || selectedOrder.order.status === 'completed'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Order</span>
                    </button>

                    <button
                      onClick={() => handleCancelOrder(selectedOrder.order.order_id)}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        selectedOrder.order.status === 'cancelled'
                          ? 'bg-stone-800 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel Order</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <span className="text-[10px] font-mono uppercase text-[#C9A25C] block mb-2 font-bold">
                    01 / CUSTOMER (`user`)
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-[#28192A]">{selectedOrder.user.name}</p>
                    <p className="text-[#6B6166]">Email: {selectedOrder.user.email}</p>
                    <p className="text-[#6B6166]">Phone: {selectedOrder.user.phone}</p>
                    <p className="text-[#6B6166]">Role: {selectedOrder.user.role}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#C9A25C] font-bold">
                      02 / SHIPPING (`shipping`)
                    </span>
                    <button
                      onClick={() => setIsEditingShipping(!isEditingShipping)}
                      className="text-[11px] underline text-[#28192A] hover:text-[#C9A25C]"
                    >
                      {isEditingShipping ? 'Cancel' : 'Edit Tracking'}
                    </button>
                  </div>

                  {isEditingShipping ? (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label className="text-[10px] uppercase text-[#6B6166] block">Courier Name</label>
                        <input
                          type="text"
                          value={shippingForm.courier}
                          onChange={(e) => setShippingForm({ ...shippingForm, courier: e.target.value })}
                          className="w-full bg-[#FFFDF8] border border-[#DAD1C5] px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-[#6B6166] block">Tracking Number</label>
                        <input
                          type="text"
                          value={shippingForm.tracking}
                          onChange={(e) => setShippingForm({ ...shippingForm, tracking: e.target.value })}
                          className="w-full bg-[#FFFDF8] border border-[#DAD1C5] px-2 py-1 text-xs"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveShipping(selectedOrder.shipping.shipping_id)}
                        className="px-3 py-1 bg-[#28192A] text-[#FFFDF8] text-[11px] uppercase tracking-wider"
                      >
                        Save Tracking
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[#28192A]">
                        Courier: <strong>{selectedOrder.shipping.courier_name}</strong>
                      </p>
                      <p className="text-[#28192A]">
                        Tracking: <strong className="font-mono">{selectedOrder.shipping.tracking_number}</strong>
                      </p>
                      <p className="text-[#6B6166]">Destination: {selectedOrder.shipping.shipping_address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="p-4 bg-[#FFFDF8] border border-[#DAD1C5]">
                <span className="text-[10px] font-mono uppercase text-[#C9A25C] block mb-3 font-bold">
                  03 / ORDER ITEMS (`order_item`, `formula`, `formula_detail`, `ingredient`)
                </span>

                <div className="space-y-3 divide-y divide-[#DAD1C5]/30">
                  {selectedOrder.items.map((item) => (
                    <div key={item.order_item_id} className="pt-3 first:pt-0 flex items-start justify-between">
                      <div>
                        <h4 className="font-serif text-base text-[#28192A]">{item.formula_name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] uppercase font-mono text-[#6B6166]">Notes:</span>
                          <span className="text-xs text-[#28192A]">
                            {item.ingredients.map((ing) => ing.name).join(' · ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6B6166]">
                          {item.bottle.size} ml Flacon · Quantity: {item.qty}
                        </span>
                      </div>
                      <div className="font-serif text-base text-[#28192A] font-medium">
                        ฿ {(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment and Preparation Photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Payment Verification Card */}
                <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <span className="text-[10px] font-mono uppercase text-[#C9A25C] block mb-2 font-bold">
                    04 / PAYMENT (`payment`)
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B6166]">Payment Status:</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold ${
                          selectedOrder.payment.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {selectedOrder.payment.status}
                      </span>
                    </div>

                    {selectedOrder.payment.qr_receipt_url ? (
                      <div>
                        <span className="text-[11px] text-[#6B6166] block mb-1">Attached Receipt / PromptPay Slip:</span>
                        <div className="w-24 h-24 bg-[#FFFDF8] border border-[#DAD1C5] p-1 flex items-center justify-center">
                          <img
                            src={selectedOrder.payment.qr_receipt_url}
                            alt="PromptPay Slip"
                            className="max-h-full max-w-full object-contain cursor-pointer hover:opacity-80"
                            onClick={() => setPreviewImage(selectedOrder.payment.qr_receipt_url)}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#6B6166]">No receipt slip uploaded yet.</p>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmOrder(selectedOrder.order.order_id)}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Order</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.order.order_id)}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Perfumer Preparation Photo */}
                <div className="p-4 bg-[#FBF7F0] border border-[#DAD1C5]">
                  <span className="text-[10px] font-mono uppercase text-[#C9A25C] block mb-2 font-bold">
                    05 / DISPATCH PHOTO (`prep_photo_url`)
                  </span>
                  <p className="text-[11px] text-[#6B6166] mb-2">
                    Photo of blended custom flacon before packaging
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 bg-[#FFFDF8] border border-[#DAD1C5] flex items-center justify-center overflow-hidden">
                      {selectedOrder.order.prep_photo_url ? (
                        <img
                          src={selectedOrder.order.prep_photo_url}
                          alt="Preparation flacon"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-[#DAD1C5]" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <button
                        onClick={() =>
                          handleSetPrepPhoto(selectedOrder.order.order_id, '/assets/botanicals/custom_bottle.png')
                        }
                        className="w-full py-1.5 px-2 bg-[#FFFDF8] border border-[#DAD1C5] text-[11px] text-[#28192A] hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors"
                      >
                        Attach Custom Flacon Photo
                      </button>
                      <button
                        onClick={() =>
                          handleSetPrepPhoto(selectedOrder.order.order_id, '/assets/botanicals/woody.png')
                        }
                        className="w-full py-1.5 px-2 bg-[#FFFDF8] border border-[#DAD1C5] text-[11px] text-[#28192A] hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors"
                      >
                        Attach Artisanal Studio Study
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-[#DAD1C5] flex justify-end">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setIsEditingShipping(false);
                }}
                className="px-6 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540] transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Slip Zoom Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-70 bg-[#28192A]/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-md bg-[#FFFDF8] p-4 border border-[#DAD1C5]">
            <img src={previewImage} alt="Payment Receipt" className="w-full h-auto object-contain" />
            <p className="text-center text-xs text-[#6B6166] mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}

    </div>
  );
};
