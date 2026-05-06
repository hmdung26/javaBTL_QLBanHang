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

function formatRole(role?: string) {
  if (role === 'ROLE_ADMIN') {
    return 'Admin';
  }

  return 'Người dùng';
}

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
      toast.error('Không tải được dữ liệu quản trị. Vui lòng đăng nhập tài khoản admin.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productForm);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await createProduct(productForm);
        toast.success('Đã thêm sản phẩm');
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadDashboard();
    } catch {
      toast.error('Không lưu được sản phẩm');
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
    if (!window.confirm('Xóa sản phẩm này?')) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      await loadDashboard();
    } catch {
      toast.error('Không xóa được sản phẩm');
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryForm);
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCategory(categoryForm);
        toast.success('Đã thêm danh mục');
      }

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadDashboard();
    } catch {
      toast.error('Không lưu được danh mục');
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
    if (!window.confirm('Xóa danh mục này?')) {
      return;
    }

    try {
      await deleteCategory(id);
      toast.success('Đã xóa danh mục');
      await loadDashboard();
    } catch {
      toast.error('Không xóa được danh mục');
    }
  }

  async function handleBannerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingBannerId) {
        await updateBanner(editingBannerId, bannerForm);
        toast.success('Đã cập nhật banner');
      } else {
        await createBanner(bannerForm);
        toast.success('Đã thêm banner');
      }

      setBannerForm(emptyBannerForm);
      setEditingBannerId(null);
      await loadDashboard();
    } catch {
      toast.error('Không lưu được banner');
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
    if (!window.confirm('Xóa banner này?')) {
      return;
    }

    try {
      await deleteBanner(id);
      toast.success('Đã xóa banner');
      await loadDashboard();
    } catch {
      toast.error('Không xóa được banner');
    }
  }

  async function handleOrderStatusChange(id: number, status: OrderStatus) {
    try {
      await updateOrderStatus(id, status);
      toast.success('Đã cập nhật trạng thái đơn hàng');
      await loadDashboard();
    } catch {
      toast.error('Không cập nhật được trạng thái đơn hàng');
    }
  }

  async function handleGenerateAiReport() {
    setIsGeneratingReport(true);

    try {
      const response = await generateAdminReport();
      setAiReport(response.answer);
    } catch {
      toast.error('Không tạo được báo cáo AI. Kiểm tra GEMINI_API_KEY trên backend.');
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-md bg-slate-950 p-5 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-red-300">Trang quản trị</p>
            <h1 className="text-2xl font-black uppercase">Điều hành cửa hàng</h1>
            <p className="text-sm text-slate-300">
              Quản lý sản phẩm, danh mục, tồn kho và đơn hàng ở một nơi.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white hover:bg-[#b91319]"
          >
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {false && <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
          { id: 'products', label: 'Sản phẩm', icon: Boxes },
          { id: 'categories', label: 'Danh mục', icon: FolderTree },
          { id: 'banners', label: 'Banner', icon: Image },
          { id: 'users', label: 'Người dùng', icon: UserRound },
          { id: 'orders', label: 'Đơn hàng', icon: ReceiptText },
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
          Đang tải dữ liệu quản trị...
        </div>
      )}

      {!isLoading && activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Sản phẩm" value={stats?.totalProducts ?? 0} />
            <StatCard label="Danh mục" value={stats?.totalCategories ?? 0} />
            <StatCard label="Đơn hàng" value={stats?.totalOrders ?? 0} />
            <StatCard label="Đơn chờ xử lý" value={stats?.pendingOrders ?? 0} />
            <StatCard label="Sắp hết hàng" value={stats?.lowStockProducts ?? 0} />
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
                  Báo cáo AI
                </h2>
                <p className="text-sm text-slate-500">Gemini 2.5 Flash phân tích nhanh tình hình bán hàng.</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiReport}
                disabled={isGeneratingReport}
                className="rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white disabled:bg-slate-300"
              >
                {isGeneratingReport ? 'Đang phân tích...' : 'Tạo báo cáo AI'}
              </button>
            </div>
            <div className="whitespace-pre-line p-4 text-sm leading-7 text-slate-700">
              {aiReport || 'Chưa có báo cáo. Bấm "Tạo báo cáo AI" để xem nhận định và đề xuất vận hành.'}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-black uppercase text-slate-950">Cần chú ý</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {lowStockProducts.length === 0 && (
                <p className="p-4 text-sm text-slate-600">Không có sản phẩm sắp hết hàng.</p>
              )}
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-bold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">Tồn kho: {product.stockQuantity}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditProduct(product)}
                    className="rounded bg-slate-900 px-3 py-2 text-sm font-bold text-white"
                  >
                    Cập nhật
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
            <TableHeader title="Danh sách sản phẩm" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Giá</th>
                    <th className="px-4 py-3">Kho</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
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
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="rounded bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                          >
                            Xóa
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
            <TableHeader title="Danh sách danh mục" />
            <div className="divide-y divide-slate-100">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-bold text-slate-950">{category.name}</p>
                    <p className="text-sm text-slate-500">{category.description || 'Chưa có mô tả'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditCategory(category)}
                      className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="rounded bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      Xóa
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
            <TableHeader title="Danh sách banner" />
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
                    <p className="text-sm text-slate-500">{banner.subtitle || 'Chưa có mô tả'}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                      {banner.active ? 'Đang hiển thị' : 'Đang ẩn'} - Thứ tự {banner.sortOrder}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => startEditBanner(banner)}
                      className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="rounded bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-600">Chưa có banner.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'orders' && (
        <div className="rounded-md border border-slate-200 bg-white">
          <TableHeader title="Quản lý đơn hàng" />
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="grid gap-4 p-4 xl:grid-cols-[1fr_180px_180px]">
                <div>
                  <p className="font-black text-slate-950">Đơn #{order.id}</p>
                  <p className="text-sm text-slate-600">
                    {order.customerName} - {order.customerPhone}
                  </p>
                  <p className="text-sm text-slate-500">{order.customerAddress}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Tổng tiền</p>
                  <p className="font-black text-[#d71920]">
                    {currencyFormatter.format(order.totalAmount)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Trạng thái
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
              <p className="p-6 text-center text-sm text-slate-600">Chưa có đơn hàng.</p>
            )}
          </div>
        </div>
      )}

      {!isLoading && activeTab === 'users' && (
        <div className="rounded-md border border-slate-200 bg-white">
          <TableHeader title="Danh sách người dùng" />
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{user.username}</p>
                    <p className="text-sm font-semibold text-slate-500">{formatRole(user.role)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {[user.fullName, user.phone, user.address].filter(Boolean).join(' · ') || 'Chưa lưu thông tin nhận hàng'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-right text-sm">
                    <span className="rounded bg-slate-100 px-3 py-2 font-bold text-slate-700">
                      {user.orderCount} đơn đã mua
                    </span>
                    <span className="rounded bg-slate-100 px-3 py-2 font-bold text-slate-700">
                      {user.reviewCount} bình luận
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 px-3 py-2 text-xs font-black uppercase text-slate-500">
                      Đơn đã mua
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {user.orders.map((order) => (
                        <div key={order.id} className="p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-black text-slate-900">Đơn #{order.id}</span>
                            <span className="font-black text-[#d71920]">{currencyFormatter.format(order.totalAmount)}</span>
                          </div>
                          <p className="mt-1 text-slate-500">{order.status} · {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                          <p className="mt-1 text-slate-600">{order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}</p>
                        </div>
                      ))}
                      {user.orders.length === 0 && <p className="p-3 text-sm text-slate-500">Chưa có đơn hàng.</p>}
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 px-3 py-2 text-xs font-black uppercase text-slate-500">
                      Bình luận đã gửi
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {user.reviews.map((review) => (
                        <div key={review.id} className="p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-black text-slate-900">{review.productName || 'Sản phẩm đã xóa'}</span>
                            <span className="font-black text-yellow-600">{review.rating}/5 sao</span>
                          </div>
                          {review.comment && <p className="mt-1 text-slate-700">{review.comment}</p>}
                          <p className="mt-1 text-xs text-slate-500">{new Date(review.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      ))}
                      {user.reviews.length === 0 && <p className="p-3 text-sm text-slate-500">Chưa có bình luận.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-600">Chưa có người dùng.</p>
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
          <h2 className="font-black uppercase text-slate-950">Doanh thu theo tháng</h2>
          <p className="text-sm text-slate-500">Bấm vào cột hoặc chọn tháng để xem chỉ số riêng từng tháng.</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(event) => onSelectMonth(event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-[#d71920]"
        >
          <option value="">Tất cả tháng</option>
          {data.map((item) => {
            const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
            return (
              <option key={monthKey} value={monthKey}>
                Tháng {item.month}/{item.year}
              </option>
            );
          })}
        </select>
      </div>
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_260px]">
        <MonthlyRevenueChart data={data} selectedMonth={selectedMonth} onSelectMonth={onSelectMonth} />
        <div className="rounded-md bg-slate-950 p-4 text-white">
          <p className="text-xs font-black uppercase text-red-300">
            {selectedData ? `Tháng ${selectedData.month}/${selectedData.year}` : 'Tổng quan'}
          </p>
          <p className="mt-3 text-2xl font-black">
            {currencyFormatter.format(selectedData?.revenue ?? data.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {selectedData?.orderCount ?? data.reduce((sum, item) => sum + item.orderCount, 0)} đơn hàng đã tính doanh thu
          </p>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Doanh thu chỉ tính các đơn ở trạng thái PROCESSING, SHIPPED hoặc DELIVERED.
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
    { label: 'Có hoạt động', value: activeUsers },
    { label: 'Chưa hoạt động', value: Math.max(users.length - activeUsers, 0) },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div className="rounded-md border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <BarChart3 className="h-5 w-5 text-[#d71920]" />
          <h2 className="font-black uppercase text-slate-950">Biểu đồ đơn hàng</h2>
        </div>
        <div className="space-y-3 p-4">
          {statusRows.map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>{row.label}</span>
                <span>{row.value} đơn</span>
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
          <h2 className="font-black uppercase text-slate-950">Người dùng</h2>
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
          <h2 className="font-black uppercase text-slate-950">Top sản phẩm bán chạy</h2>
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
              <p className="mt-1 text-sm font-black text-[#d71920]">Đã bán {product.purchaseCount || 0}</p>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="col-span-full p-4 text-center text-sm text-slate-500">Chưa có dữ liệu sản phẩm.</p>
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
      toast.success('Đã tải ảnh sản phẩm');
    } catch {
      toast.error('Không tải được ảnh');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <PackagePlus className="h-5 w-5 text-[#d71920]" />
        <h2 className="font-black uppercase text-slate-950">
          {editingProductId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
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
        label="Ảnh sản phẩm"
        value={productForm.imageUrl}
        onChange={(value) => setProductForm({ ...productForm, imageUrl: value })}
      />
      <label className="block text-sm font-bold text-slate-700">
        Tải ảnh từ máy
        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event.target.files?.[0])}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        {isUploading && <span className="mt-1 block text-xs text-slate-500">Đang tải ảnh...</span>}
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminInput
          label="Giá"
          type="number"
          value={String(productForm.price)}
          required
          onChange={(value) => setProductForm({ ...productForm, price: Number(value) })}
        />
        <AdminInput
          label="Tồn kho"
          type="number"
          value={String(productForm.stockQuantity)}
          required
          onChange={(value) =>
            setProductForm({ ...productForm, stockQuantity: Number(value) })
          }
        />
      </div>

      <label className="block text-sm font-bold text-slate-700">
        Danh mục
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
          <option value="">Chưa chọn danh mục</option>
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
          Lưu
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
            Hủy
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
        {editingCategoryId ? 'Sửa danh mục' : 'Thêm danh mục'}
      </h2>
      <AdminInput
        label="Tên danh mục"
        value={categoryForm.name}
        required
        onChange={(value) => setCategoryForm({ ...categoryForm, name: value })}
      />
      <AdminInput
        label="Mô tả"
        value={categoryForm.description}
        onChange={(value) => setCategoryForm({ ...categoryForm, description: value })}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white"
        >
          <Save className="h-4 w-4" />
          Lưu
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
            Hủy
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
      toast.success('Đã tải ảnh banner');
    } catch {
      toast.error('Không tải được ảnh banner');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="font-black uppercase text-slate-950">
        {editingBannerId ? 'Sửa banner' : 'Thêm banner'}
      </h2>
      <AdminInput
        label="Tiêu đề"
        value={bannerForm.title}
        required
        onChange={(value) => setBannerForm({ ...bannerForm, title: value })}
      />
      <AdminInput
        label="Mô tả ngắn"
        value={bannerForm.subtitle}
        onChange={(value) => setBannerForm({ ...bannerForm, subtitle: value })}
      />
      <AdminInput
        label="Ảnh banner"
        value={bannerForm.imageUrl}
        required
        onChange={(value) => setBannerForm({ ...bannerForm, imageUrl: value })}
      />
      <label className="block text-sm font-bold text-slate-700">
        Tải ảnh từ máy
        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event.target.files?.[0])}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        {isUploading && <span className="mt-1 block text-xs text-slate-500">Đang tải ảnh...</span>}
      </label>
      <AdminInput
        label="Link khi bấm"
        value={bannerForm.linkUrl}
        onChange={(value) => setBannerForm({ ...bannerForm, linkUrl: value })}
      />
      <AdminInput
        label="Thứ tự hiển thị"
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
        Hiển thị ngoài trang chủ
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white"
        >
          <Save className="h-4 w-4" />
          Lưu
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
            Hủy
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



