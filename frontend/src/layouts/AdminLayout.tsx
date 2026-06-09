import { Link, Outlet, useLocation } from 'react-router-dom';
import { Boxes, FolderTree, LayoutDashboard, LogOut, ReceiptText, Store, Image, UserRound, Tags, Warehouse, ShieldCheck, BadgePercent } from 'lucide-react';
import { getAuth, logout } from '../services/AuthService';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/admin/dashboard?tab=products', label: 'Sản phẩm', icon: Boxes },
  { to: '/admin/dashboard?tab=categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/dashboard?tab=brands', label: 'Thương hiệu', icon: Tags },
  { to: '/admin/dashboard?tab=promotions', label: 'Khuyến mãi', icon: BadgePercent },
  { to: '/admin/dashboard?tab=warehouse', label: 'Kho', icon: Warehouse },
  { to: '/admin/dashboard?tab=warranties', label: 'Bảo hành', icon: ShieldCheck },
  { to: '/admin/dashboard?tab=banners', label: 'Banner', icon: Image },
  { to: '/admin/dashboard?tab=orders', label: 'Đơn hàng', icon: ReceiptText },
  { to: '/admin/dashboard?tab=users', label: 'Người dùng', icon: UserRound },
  { to: '/admin/dashboard?tab=access', label: 'Phân quyền', icon: ShieldCheck },
];

function AdminLayout() {
  const auth = getAuth();
  const location = useLocation();
  const visibleLinks = auth?.role === 'ROLE_STAFF'
    ? adminLinks.filter((link) =>
        link.to === '/admin/dashboard'
        || link.to.includes('tab=orders')
        || link.to.includes('tab=warehouse')
        || link.to.includes('tab=warranties'))
    : adminLinks;

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-[#d71920]">
              <Store className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xl font-black uppercase">Quản trị cửa hàng</p>
              <p className="text-sm text-slate-300">Điều hành sản phẩm, banner, đơn hàng và tồn kho</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>{auth?.username ?? 'Admin'}</span>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 font-bold hover:bg-white/20">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {visibleLinks.map(({ to, label, icon: Icon }) => {
              const isActive = `${location.pathname}${location.search}` === to
                || (to === '/admin/dashboard' && location.pathname === '/admin/dashboard' && !location.search);

              return (
              <Link
                key={to}
                to={to}
                className={[
                  'inline-flex h-12 shrink-0 items-center gap-2 px-3 text-sm font-black uppercase',
                  isActive ? 'text-yellow-300' : 'text-slate-200 hover:text-white',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )})}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
