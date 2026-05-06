import { FormEvent, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Home,
  LogIn,
  MapPin,
  Menu,
  MonitorCog,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
  UserRound,
} from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { getAuth, logout } from '../services/AuthService';
import { fetchCategories } from '../services/CategoryService';
import type { Category } from '../types';

function BaseLayout() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [auth, setAuth] = useState(getAuth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(`/products${keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ''}`);
  }

  function handleLogout() {
    logout();
    setAuth(null);
    window.location.href = '/';
  }

  const visibleNavItems = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/products', label: 'Sản phẩm', icon: Package },
    { to: '/cart', label: 'Giỏ hàng', icon: ShoppingCart },
    ...(auth ? [{ to: '/account', label: 'Tài khoản', icon: UserRound }] : []),
    ...(auth?.role === 'ROLE_ADMIN' ? [{ to: '/admin/dashboard', label: 'Quản trị', icon: ShieldCheck }] : []),
    ...(!auth
      ? [
          { to: '/login', label: 'Đăng nhập', icon: LogIn },
          { to: '/register', label: 'Đăng ký', icon: UserPlus },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f2f3f5] text-slate-900">
      <header className="bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-900 text-xs text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-400" />
                Hà Nội: 83-85 Thái Hà
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-400" />
                TP.HCM: 83A Cửu Long
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold text-red-300">
                <Phone className="h-3.5 w-3.5" />
                Hotline mua hàng: 098.655.2233
              </span>
              {auth && (
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 text-red-300" />
                  {auth.username}
                  <button type="button" onClick={handleLogout} className="font-semibold text-red-300 hover:text-white">
                    Đăng xuất
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#d71920] text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <NavLink to="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-white text-[#d71920]">
                <MonitorCog className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-2xl font-black leading-6 tracking-wide">TTG SALES</span>
                <span className="block text-xs font-semibold uppercase text-red-100">
                  PC cao cấp - hiệu năng cao
                </span>
              </span>
            </NavLink>

            <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center rounded-md bg-white p-1 shadow-sm">
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhập tên sản phẩm, cấu hình PC, linh kiện cần tìm..."
                className="min-w-0 flex-1 px-3 py-2 text-sm text-slate-900 outline-none"
              />
              <button type="submit" className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </button>
            </form>

            <NavLink to="/cart" className="relative inline-flex h-11 items-center gap-2 rounded-md bg-yellow-400 px-4 text-sm font-bold text-slate-950">
              <ShoppingCart className="h-5 w-5" />
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-slate-950 px-1 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>

        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-visible px-4 sm:px-6 lg:px-8">
            <div className="group relative flex h-11 shrink-0 items-center gap-2 bg-slate-900 px-4 text-sm font-bold uppercase text-white">
              <Menu className="h-4 w-4" />
              Danh mục sản phẩm
              <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
              <div className="invisible absolute left-0 top-full z-30 w-72 translate-y-2 rounded-b-md border border-slate-200 bg-white py-2 text-slate-800 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {categories.map((category) => (
                  <NavLink
                    key={category.id}
                    to={`/products?categoryId=${category.id}`}
                    className="block px-4 py-2.5 text-sm font-bold uppercase text-slate-700 hover:bg-red-50 hover:text-[#d71920]"
                  >
                    {category.name}
                  </NavLink>
                ))}
                {categories.length === 0 && (
                  <span className="block px-4 py-2.5 text-sm font-semibold text-slate-500">Chưa có danh mục.</span>
                )}
              </div>
            </div>
            {visibleNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-semibold transition',
                    isActive ? 'text-[#d71920]' : 'text-slate-700 hover:text-[#d71920]',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            <div className="hidden min-w-0 items-center gap-4 pl-2 text-sm font-medium text-slate-600 xl:flex">
              {categories.slice(0, 5).map((category) => (
                <NavLink key={category.id} to={`/products?categoryId=${category.id}`} className="shrink-0 hover:text-[#d71920]">
                  {category.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default BaseLayout;
