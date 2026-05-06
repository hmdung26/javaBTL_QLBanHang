import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  BrainCircuit,
  FolderTree,
  Image,
  LayoutDashboard,
  PackagePlus,
  ReceiptText,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'react-toastify';
import MonthlyRevenueChart from '../components/MonthlyRevenueChart';
import RichTextEditor from '../components/RichTextEditor';
import { fetchAdminUsers, fetchDashboardStats, fetchMonthlyRevenue } from '../services/AdminService';
import { generateAdminReport } from '../services/AiService';
import {
  createBanner,
  deleteBanner,
  fetchBanners,
  updateBanner,
} from '../services/BannerService';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../services/CategoryService';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../services/ProductService';
import { fetchOrders, updateOrderStatus } from '../services/OrderService';
import { uploadImage } from '../services/UploadService';
import type {
  AdminUser,
  Banner,
  BannerRequest,
  Category,
  CategoryRequest,
  DashboardStats,
  MonthlyRevenue,
  OrderResponse,
  OrderStatus,
  Product,
  ProductRequest,
} from '../types';

type AdminTab = 'overview' | 'products' | 'categories' | 'banners' | 'orders' | 'users';

const emptyProductForm: ProductRequest = {
  name: '',
  description: '',
  specifications: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  warrantyPeriod: '',
  categoryId: null,
};

const emptyCategoryForm: CategoryRequest = {
  name: '',
  description: '',
};

const emptyBannerForm: BannerRequest = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  active: true,
  sortOrder: 0,
};

const orderStatuses: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>((searchParams.get('tab') as AdminTab) || 'overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [selectedRevenueMonth, setSelectedRevenueMonth] = useState('');
  const [productForm, setProductForm] = useState<ProductRequest>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryRequest>(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerRequest>(emptyBannerForm);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stockQuantity <= 5),
    [products],
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setActiveTab((searchParams.get('tab') as AdminTab) || 'overview');
  }, [searchParams]);

  function changeTab(tab: AdminTab) {
    setActiveTab(tab);
    setSearchParams(tab === 'overview' ? {} : { tab });
  }

  async function loadDashboard() {
    setIsLoading(true);

    try {
      const [statsData, productsData, categoriesData, bannersData, ordersData, usersData, monthlyRevenueData] = await Promise.all([
        fetchDashboardStats(),
        fetchProducts(),
        fetchCategories(),
        fetchBanners(false),
        fetchOrders(),
        fetchAdminUsers(),
        fetchMonthlyRevenue(),
      ]);

      setStats(statsData);
      setProducts(productsData);
      setCategories(categoriesData);
      setBanners(bannersData);
      setOrders(ordersData);
      setUsers(usersData);
      setMonthlyRevenue(monthlyRevenueData);
      setSelectedRevenueMonth((current) => {
        if (current || monthlyRevenueData.length === 0) {
          return current;
        }

        const latestMonth = monthlyRevenueData[monthlyRevenueData.length - 1];
        return `${latestMonth.year}-${String(latestMonth.month).padStart(2, '0')}`;
      });
    } catch {
      toast.error('KhÃ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u quáº£n trá»‹. Vui lÃ²ng Ä‘Äƒng nháº­p tÃ i khoáº£n admin.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productForm);
        toast.success('ÄÃ£ cáº­p nháº­t sáº£n pháº©m');
      } else {
        await createProduct(productForm);
        toast.success('ÄÃ£ thÃªm sáº£n pháº©m');
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng lÆ°u Ä‘Æ°á»£c sáº£n pháº©m');
    }
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description ?? '',
      specifications: product.specifications ?? '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl ?? '',
      warrantyPeriod: product.warrantyPeriod ?? '',
      categoryId: product.categoryId,
    });
    setActiveTab('products');
  }

  async function handleDeleteProduct(id: number) {
    if (!window.confirm('XÃ³a sáº£n pháº©m nÃ y?')) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success('ÄÃ£ xÃ³a sáº£n pháº©m');
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng xÃ³a Ä‘Æ°á»£c sáº£n pháº©m');
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryForm);
        toast.success('ÄÃ£ cáº­p nháº­t danh má»¥c');
      } else {
        await createCategory(categoryForm);
        toast.success('ÄÃ£ thÃªm danh má»¥c');
      }

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng lÆ°u Ä‘Æ°á»£c danh má»¥c');
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description ?? '',
    });
    setActiveTab('categories');
  }

  async function handleDeleteCategory(id: number) {
    if (!window.confirm('XÃ³a danh má»¥c nÃ y?')) {
      return;
    }

    try {
      await deleteCategory(id);
      toast.success('ÄÃ£ xÃ³a danh má»¥c');
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng xÃ³a Ä‘Æ°á»£c danh má»¥c');
    }
  }

  async function handleBannerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingBannerId) {
        await updateBanner(editingBannerId, bannerForm);
        toast.success('ÄÃ£ cáº­p nháº­t banner');
      } else {
        await createBanner(bannerForm);
        toast.success('ÄÃ£ thÃªm banner');
      }

      setBannerForm(emptyBannerForm);
      setEditingBannerId(null);
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng lÆ°u Ä‘Æ°á»£c banner');
    }
  }

  function startEditBanner(banner: Banner) {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      active: banner.active,
      sortOrder: banner.sortOrder,
    });
    changeTab('banners');
  }

  async function handleDeleteBanner(id: number) {
    if (!window.confirm('XÃ³a banner nÃ y?')) {
      return;
    }

    try {
      await deleteBanner(id);
      toast.success('ÄÃ£ xÃ³a banner');
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng xÃ³a Ä‘Æ°á»£c banner');
    }
  }

  async function handleOrderStatusChange(id: number, status: OrderStatus) {
    try {
      await updateOrderStatus(id, status);
      toast.success('ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng');
      await loadDashboard();
    } catch {
      toast.error('KhÃ´ng cáº­p nháº­t Ä‘Æ°á»£c tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng');
    }
  }

  async function handleGenerateAiReport() {
    setIsGeneratingReport(true);

    try {
      const response = await generateAdminReport();
      setAiReport(response.answer);
    } catch {
      toast.error('KhÃ´ng táº¡o Ä‘Æ°á»£c bÃ¡o cÃ¡o AI. Kiá»ƒm tra GEMINI_API_KEY trÃªn backend.');
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-md bg-slate-950 p-5 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-red-300">Trang quáº£n trá»‹</p>
            <h1 className="text-2xl font-black uppercase">Äiá»u hÃ nh cá»­a hÃ ng</h1>
            <p className="text-sm text-slate-300">
              Quáº£n lÃ½ sáº£n pháº©m, danh má»¥c, tá»“n kho vÃ  Ä‘Æ¡n hÃ ng á»Ÿ má»™t nÆ¡i.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white hover:bg-[#b91319]"
          >
            LÃ m má»›i dá»¯ liá»‡u
          </button>
        </div>
      </div>

      {false && <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Tá»•ng quan', icon: LayoutDashboard },
          { id: 'products', label: 'Sáº£n pháº©m', icon: Boxes },
          { id: 'categories', label: 'Danh má»¥c', icon: FolderTree },
          { id: 'banners', label: 'Banner', icon: Image },
          { id: 'users', label: 'NgÆ°á»i dÃ¹ng', icon: UserRound },
          { id: 'orders', label: 'ÄÆ¡n hÃ ng', icon: ReceiptText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => changeTab(id as AdminTab)}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded px-4 py-2 text-sm font-black uppercase',
              activeTab === id
                ? 'bg-[#d71920] text-white'
                : 'bg-white text-slate-700 hover:bg-red-50 hover:text-[#d71920]',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>}

      {isLoading && (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-600">
          Äang táº£i dá»¯ liá»‡u quáº£n trá»‹...
        </div>
      )}

      {!isLoading && activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Sáº£n pháº©m" value={stats?.totalProducts ?? 0} />
            <StatCard label="Danh má»¥c" value={stats?.totalCategories ?? 0} />
            <StatCard label="ÄÆ¡n hÃ ng" value={stats?.totalOrders ?? 0} />
            <StatCard label="ÄÆ¡n chá» xá»­ lÃ½" value={stats?.pendingOrders ?? 0} />
            <StatCard label="Sáº¯p háº¿t hÃ ng" value={stats?.lowStockProducts ?? 0} />
            <StatCard
              label="Doanh thu"
              value={currencyFormatter.format(stats?.totalRevenue ?? 0)}
            />
          </div>

          <MonthlyRevenuePanel
            data={monthlyRevenue}
            selectedMonth={selectedRevenueMonth}
            onSelectMonth={setSelectedRevenueMonth}
          />

          <DashboardCharts stats={stats} products={products} orders={orders} users={users} />

          <div className="animate-fade-up rounded-md border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-black uppercase text-slate-950">
                  <BrainCircuit className="h-5 w-5 text-[#d71920]" />
                  BÃ¡o cÃ¡o AI
                </h2>
                <p className="text-sm text-slate-500">Gemini 2.5 Flash phÃ¢n tÃ­ch nhanh tÃ¬nh hÃ¬nh bÃ¡n hÃ ng.</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiReport}
                disabled={isGeneratingReport}
                className="rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white disabled:bg-slate-300"
              >
                {isGeneratingReport ? 'Äang phÃ¢n tÃ­ch...' : 'Táº¡o bÃ¡o cÃ¡o AI'}
              </button>
            </div>
            <div className="whitespace-pre-line p-4 text-sm leading-7 text-slate-700">
              {aiReport || 'ChÆ°a cÃ³ bÃ¡o cÃ¡o. Báº¥m "Táº¡o bÃ¡o cÃ¡o AI" Ä‘á»ƒ xem nháº­n Ä‘á»‹nh vÃ  Ä‘á» xuáº¥t váº­n hÃ nh.'}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-black uppercase text-slate-950">Cáº§n chÃº Ã½</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {lowStockProducts.length === 0 && (
                <p className="p-4 text-sm text-slate-600">KhÃ´ng cÃ³ sáº£n pháº©m sáº¯p háº¿t hÃ ng.</p>
              )}
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-bold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">Tá»“n kho: {product.stockQuantity}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditProduct(product)}
                    className="rounded bg-slate-900 px-3 py-2 text-sm font-bold text-white"
                  >
                    Cáº­p nháº­t
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'products' && (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <ProductForm
            categories={categories}
            editingProductId={editingProductId}
            productForm={productForm}
            setEditingProductId={setEditingProductId}
            setProductForm={setProductForm}
            onSubmit={handleProductSubmit}
          />
          <div className="rounded-md border border-slate-200 bg-white">
            <TableHeader title="Danh sÃ¡ch sáº£n pháº©m" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Sáº£n pháº©m</th>
                    <th className="px-4 py-3">Danh má»¥c</th>
                    <th className="px-4 py-3">GiÃ¡</th>
                    <th className="px-4 py-3">Kho</th>
                    <th className="px-4 py-3 text-right">Thao tÃ¡c</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 font-bold text-slate-950">{product.name}</td>
                      <td className="px-4 py-3 text-slate-600">{product.categoryName ?? '-'}</td>
                      <td className="px-4 py-3 font-bold text-[#d71920]">
                        {currencyFormatter.format(product.price)}
                      </td>
                      <td className="px-4 py-3">{product.stockQuantity}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEditProduct(product)}
                            className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                          >
                            Sá»­a
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="rounded bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                          >
                            XÃ³a
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'categories' && (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <CategoryForm
            categoryForm={categoryForm}
            editingCategoryId={editingCategoryId}
            setCategoryForm={setCategoryForm}
            setEditingCategoryId={setEditingCategoryId}
            onSubmit={handleCategorySubmit}
          />
          <div className="rounded-md border border-slate-200 bg-white">
            <TableHeader title="Danh sÃ¡ch danh má»¥c" />
            <div className="divide-y divide-slate-100">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-bold text-slate-950">{category.name}</p>
                    <p className="text-sm text-slate-500">{category.description || 'ChÆ°a cÃ³ mÃ´ táº£'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditCategory(category)}
                      className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      Sá»­a
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="rounded bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      XÃ³a
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'banners' && (
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <BannerForm
            bannerForm={bannerForm}
            editingBannerId={editingBannerId}
            setBannerForm={setBannerForm}
            setEditingBannerId={setEditingBannerId}
            onSubmit={handleBannerSubmit}
          />
          <div className="rounded-md border border-slate-200 bg-white">
            <TableHeader title="Danh sÃ¡ch banner" />
            <div className="divide-y divide-slate-100">
              {banners.map((banner) => (
                <div key={banner.id} className="grid gap-4 p-4 lg:grid-cols-[180px_1fr_auto]">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-28 w-full rounded object-cover"
                  />
                  <div>
                    <p className="font-black text-slate-950">{banner.title}</p>
                    <p className="text-sm text-slate-500">{banner.subtitle || 'ChÆ°a cÃ³ mÃ´ táº£'}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                      {banner.active ? 'Äang hiá»ƒn thá»‹' : 'Äang áº©n'} - Thá»© tá»± {banner.sortOrder}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => startEditBanner(banner)}
                      className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      Sá»­a
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="rounded bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      XÃ³a
                    </button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-600">ChÆ°a cÃ³ banner.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'orders' && (
        <div className="rounded-md border border-slate-200 bg-white">
          <TableHeader title="Quáº£n lÃ½ Ä‘Æ¡n hÃ ng" />
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="grid gap-4 p-4 xl:grid-cols-[1fr_180px_180px]">
                <div>
                  <p className="font-black text-slate-950">ÄÆ¡n #{order.id}</p>
                  <p className="text-sm text-slate-600">
                    {order.customerName} - {order.customerPhone}
                  </p>
                  <p className="text-sm text-slate-500">{order.customerAddress}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Tá»•ng tiá»n</p>
                  <p className="font-black text-[#d71920]">
                    {currencyFormatter.format(order.totalAmount)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Tráº¡ng thÃ¡i
                  </label>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      handleOrderStatusChange(order.id, event.target.value as OrderStatus)
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-[#d71920]"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-600">ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng.</p>
            )}
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'users' && (
        <div className="rounded-md border border-slate-200 bg-white">
          <TableHeader title="Danh sÃ¡ch ngÆ°á»i dÃ¹ng" />
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{user.username}</p>
                    <p className="text-sm font-semibold text-slate-500">{user.role}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {[user.fullName, user.phone, user.address].filter(Boolean).join(' Â· ') || 'ChÆ°a lÆ°u thÃ´ng tin nháº­n hÃ ng'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-right text-sm">
                    <span className="rounded bg-slate-100 px-3 py-2 font-bold text-slate-700">
                      {user.orderCount} Ä‘Æ¡n Ä‘Ã£ mua
                    </span>
                    <span className="rounded bg-slate-100 px-3 py-2 font-bold text-slate-700">
                      {user.reviewCount} bÃ¬nh luáº­n
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 px-3 py-2 text-xs font-black uppercase text-slate-500">
                      ÄÆ¡n Ä‘Ã£ mua
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {user.orders.map((order) => (
                        <div key={order.id} className="p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-black text-slate-900">ÄÆ¡n #{order.id}</span>
                            <span className="font-black text-[#d71920]">{currencyFormatter.format(order.totalAmount)}</span>
                          </div>
                          <p className="mt-1 text-slate-500">{order.status} Â· {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                          <p className="mt-1 text-slate-600">{order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}</p>
                        </div>
                      ))}
                      {user.orders.length === 0 && <p className="p-3 text-sm text-slate-500">ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng.</p>}
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 px-3 py-2 text-xs font-black uppercase text-slate-500">
                      BÃ¬nh luáº­n Ä‘Ã£ gá»­i
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {user.reviews.map((review) => (
                        <div key={review.id} className="p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-black text-slate-900">{review.productName || 'Sáº£n pháº©m Ä‘Ã£ xÃ³a'}</span>
                            <span className="font-black text-yellow-600">{review.rating}/5 sao</span>
                          </div>
                          {review.comment && <p className="mt-1 text-slate-700">{review.comment}</p>}
                          <p className="mt-1 text-xs text-slate-500">{new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      ))}
                      {user.reviews.length === 0 && <p className="p-3 text-sm text-slate-500">ChÆ°a cÃ³ bÃ¬nh luáº­n.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-600">ChÆ°a cÃ³ ngÆ°á»i dÃ¹ng.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function MonthlyRevenuePanel({
  data,
  selectedMonth,
  onSelectMonth,
}: {
  data: MonthlyRevenue[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}) {
  const selectedData = data.find((item) => `${item.year}-${String(item.month).padStart(2, '0')}` === selectedMonth);

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-black uppercase text-slate-950">Doanh thu theo thÃ¡ng</h2>
          <p className="text-sm text-slate-500">Báº¥m vÃ o cá»™t hoáº·c chá»n thÃ¡ng Ä‘á»ƒ xem chá»‰ sá»‘ riÃªng tá»«ng thÃ¡ng.</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(event) => onSelectMonth(event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-[#d71920]"
        >
          <option value="">Táº¥t cáº£ thÃ¡ng</option>
          {data.map((item) => {
            const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
            return (
              <option key={monthKey} value={monthKey}>
                ThÃ¡ng {item.month}/{item.year}
              </option>
            );
          })}
        </select>
      </div>
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_260px]">
        <MonthlyRevenueChart data={data} selectedMonth={selectedMonth} onSelectMonth={onSelectMonth} />
        <div className="rounded-md bg-slate-950 p-4 text-white">
          <p className="text-xs font-black uppercase text-red-300">
            {selectedData ? `ThÃ¡ng ${selectedData.month}/${selectedData.year}` : 'Tá»•ng quan'}
          </p>
          <p className="mt-3 text-2xl font-black">
            {currencyFormatter.format(selectedData?.revenue ?? data.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {selectedData?.orderCount ?? data.reduce((sum, item) => sum + item.orderCount, 0)} Ä‘Æ¡n hÃ ng Ä‘Ã£ tÃ­nh doanh thu
          </p>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Doanh thu chá»‰ tÃ­nh cÃ¡c Ä‘Æ¡n á»Ÿ tráº¡ng thÃ¡i PROCESSING, SHIPPED hoáº·c DELIVERED.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardCharts({
  stats,
  products,
  orders,
  users,
}: {
  stats: DashboardStats | null;
  products: Product[];
  orders: OrderResponse[];
  users: AdminUser[];
}) {
  const totalOrders = Math.max(stats?.totalOrders ?? orders.length, 1);
  const statusRows = orderStatuses.map((status) => ({
    label: status,
    value: orders.filter((order) => order.status === status).length,
  }));
  const topProducts = [...products]
    .sort((first, second) => (second.purchaseCount || 0) - (first.purchaseCount || 0))
    .slice(0, 5);
  const maxPurchase = Math.max(...topProducts.map((product) => product.purchaseCount || 0), 1);
  const activeUsers = users.filter((user) => user.orderCount > 0 || user.reviewCount > 0).length;
  const userActivity = [
    { label: 'CÃ³ hoáº¡t Ä‘á»™ng', value: activeUsers },
    { label: 'ChÆ°a hoáº¡t Ä‘á»™ng', value: Math.max(users.length - activeUsers, 0) },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div className="rounded-md border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <BarChart3 className="h-5 w-5 text-[#d71920]" />
          <h2 className="font-black uppercase text-slate-950">Biá»ƒu Ä‘á»“ Ä‘Æ¡n hÃ ng</h2>
        </div>
        <div className="space-y-3 p-4">
          {statusRows.map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>{row.label}</span>
                <span>{row.value} Ä‘Æ¡n</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#d71920]"
                  style={{ width: `${Math.max((row.value / totalOrders) * 100, row.value > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-black uppercase text-slate-950">NgÆ°á»i dÃ¹ng</h2>
        </div>
        <div className="space-y-3 p-4">
          {userActivity.map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${users.length ? (row.value / users.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white xl:col-span-2">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-black uppercase text-slate-950">Top sáº£n pháº©m bÃ¡n cháº¡y</h2>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-5">
          {topProducts.map((product) => (
            <div key={product.id} className="flex flex-col justify-end rounded bg-slate-50 p-3">
              <div className="mb-3 flex h-36 items-end">
                <div
                  className="w-full rounded-t bg-[#d71920]"
                  style={{ height: `${Math.max(((product.purchaseCount || 0) / maxPurchase) * 100, 6)}%` }}
                />
              </div>
              <p className="line-clamp-2 min-h-10 text-xs font-black uppercase text-slate-800">{product.name}</p>
              <p className="mt-1 text-sm font-black text-[#d71920]">ÄÃ£ bÃ¡n {product.purchaseCount || 0}</p>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="col-span-full p-4 text-center text-sm text-slate-500">ChÆ°a cÃ³ dá»¯ liá»‡u sáº£n pháº©m.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stagger-card rounded-md border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function TableHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-slate-200 px-4 py-3">
      <h2 className="font-black uppercase text-slate-950">{title}</h2>
    </div>
  );
}

interface ProductFormProps {
  categories: Category[];
  productForm: ProductRequest;
  editingProductId: number | null;
  setProductForm: (product: ProductRequest) => void;
  setEditingProductId: (id: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function ProductForm({
  categories,
  productForm,
  editingProductId,
  setProductForm,
  setEditingProductId,
  onSubmit,
}: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setProductForm({ ...productForm, imageUrl });
      toast.success('ÄÃ£ táº£i áº£nh sáº£n pháº©m');
    } catch {
      toast.error('KhÃ´ng táº£i Ä‘Æ°á»£c áº£nh');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <PackagePlus className="h-5 w-5 text-[#d71920]" />
        <h2 className="font-black uppercase text-slate-950">
          {editingProductId ? 'Sá»­a sáº£n pháº©m' : 'ThÃªm sáº£n pháº©m'}
        </h2>
      </div>

            <AdminInput
        label="Tên sản phẩm"
        value={productForm.name}
        required
        onChange={(value) => setProductForm({ ...productForm, name: value })}
      />
            <RichTextEditor
        label="Bài viết mô tả sản phẩm"
        value={productForm.description}
        onChange={(value) => setProductForm({ ...productForm, description: value })}
      />
      <RichTextEditor
        label="Thông số kỹ thuật"
        value={productForm.specifications}
        onChange={(value) => setProductForm({ ...productForm, specifications: value })}
      />
      <AdminInput
        label="Thời gian bảo hành"
        value={productForm.warrantyPeriod}
        onChange={(value) => setProductForm({ ...productForm, warrantyPeriod: value })}
      />
      <AdminInput
        label="áº¢nh sáº£n pháº©m"
        value={productForm.imageUrl}
        onChange={(value) => setProductForm({ ...productForm, imageUrl: value })}
      />
      <label className="block text-sm font-bold text-slate-700">
        Táº£i áº£nh tá»« mÃ¡y
        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event.target.files?.[0])}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        {isUploading && <span className="mt-1 block text-xs text-slate-500">Äang táº£i áº£nh...</span>}
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminInput
          label="GiÃ¡"
          type="number"
          value={String(productForm.price)}
          required
          onChange={(value) => setProductForm({ ...productForm, price: Number(value) })}
        />
        <AdminInput
          label="Tá»“n kho"
          type="number"
          value={String(productForm.stockQuantity)}
          required
          onChange={(value) =>
            setProductForm({ ...productForm, stockQuantity: Number(value) })
          }
        />
      </div>

      <label className="block text-sm font-bold text-slate-700">
        Danh má»¥c
        <select
          value={productForm.categoryId ?? ''}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              categoryId: event.target.value ? Number(event.target.value) : null,
            })
          }
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#d71920]"
        >
          <option value="">ChÆ°a chá»n danh má»¥c</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white"
        >
          <Save className="h-4 w-4" />
          LÆ°u
        </button>
        {editingProductId && (
          <button
            type="button"
            onClick={() => {
              setProductForm(emptyProductForm);
              setEditingProductId(null);
            }}
            className="rounded bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Há»§y
          </button>
        )}
      </div>
    </form>
  );
}

interface CategoryFormProps {
  categoryForm: CategoryRequest;
  editingCategoryId: number | null;
  setCategoryForm: (category: CategoryRequest) => void;
  setEditingCategoryId: (id: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function CategoryForm({
  categoryForm,
  editingCategoryId,
  setCategoryForm,
  setEditingCategoryId,
  onSubmit,
}: CategoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="font-black uppercase text-slate-950">
        {editingCategoryId ? 'Sá»­a danh má»¥c' : 'ThÃªm danh má»¥c'}
      </h2>
      <AdminInput
        label="TÃªn danh má»¥c"
        value={categoryForm.name}
        required
        onChange={(value) => setCategoryForm({ ...categoryForm, name: value })}
      />
      <AdminInput
        label="MÃ´ táº£"
        value={categoryForm.description}
        onChange={(value) => setCategoryForm({ ...categoryForm, description: value })}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white"
        >
          <Save className="h-4 w-4" />
          LÆ°u
        </button>
        {editingCategoryId && (
          <button
            type="button"
            onClick={() => {
              setCategoryForm(emptyCategoryForm);
              setEditingCategoryId(null);
            }}
            className="inline-flex items-center gap-2 rounded bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
          >
            <Trash2 className="h-4 w-4" />
            Há»§y
          </button>
        )}
      </div>
    </form>
  );
}

interface BannerFormProps {
  bannerForm: BannerRequest;
  editingBannerId: number | null;
  setBannerForm: (banner: BannerRequest) => void;
  setEditingBannerId: (id: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function BannerForm({
  bannerForm,
  editingBannerId,
  setBannerForm,
  setEditingBannerId,
  onSubmit,
}: BannerFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setBannerForm({ ...bannerForm, imageUrl });
      toast.success('ÄÃ£ táº£i áº£nh banner');
    } catch {
      toast.error('KhÃ´ng táº£i Ä‘Æ°á»£c áº£nh banner');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="font-black uppercase text-slate-950">
        {editingBannerId ? 'Sá»­a banner' : 'ThÃªm banner'}
      </h2>
      <AdminInput
        label="TiÃªu Ä‘á»"
        value={bannerForm.title}
        required
        onChange={(value) => setBannerForm({ ...bannerForm, title: value })}
      />
      <AdminInput
        label="MÃ´ táº£ ngáº¯n"
        value={bannerForm.subtitle}
        onChange={(value) => setBannerForm({ ...bannerForm, subtitle: value })}
      />
      <AdminInput
        label="áº¢nh banner"
        value={bannerForm.imageUrl}
        required
        onChange={(value) => setBannerForm({ ...bannerForm, imageUrl: value })}
      />
      <label className="block text-sm font-bold text-slate-700">
        Táº£i áº£nh tá»« mÃ¡y
        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event.target.files?.[0])}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        {isUploading && <span className="mt-1 block text-xs text-slate-500">Äang táº£i áº£nh...</span>}
      </label>
      <AdminInput
        label="Link khi báº¥m"
        value={bannerForm.linkUrl}
        onChange={(value) => setBannerForm({ ...bannerForm, linkUrl: value })}
      />
      <AdminInput
        label="Thá»© tá»± hiá»ƒn thá»‹"
        type="number"
        value={String(bannerForm.sortOrder)}
        onChange={(value) => setBannerForm({ ...bannerForm, sortOrder: Number(value) })}
      />
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={bannerForm.active}
          onChange={(event) => setBannerForm({ ...bannerForm, active: event.target.checked })}
        />
        Hiá»ƒn thá»‹ ngoÃ i trang chá»§
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white"
        >
          <Save className="h-4 w-4" />
          LÆ°u
        </button>
        {editingBannerId && (
          <button
            type="button"
            onClick={() => {
              setBannerForm(emptyBannerForm);
              setEditingBannerId(null);
            }}
            className="rounded bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Há»§y
          </button>
        )}
      </div>
    </form>
  );
}

interface AdminInputProps {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

function AdminInput({
  label,
  value,
  type = 'text',
  required = false,
  onChange,
}: AdminInputProps) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#d71920]"
      />
    </label>
  );
}

export default AdminDashboardPage;


