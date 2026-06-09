import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PackageCheck, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { fetchCurrentUser, getAuth, logout, updateCurrentUser } from '../services/AuthService';
import { fetchMyOrders } from '../services/OrderService';
import { fetchNotifications, fetchWarranties, lookupWarranty, requestWarranty } from '../services/BusinessService';
import type { Notification, OrderResponse, UserProfile, Warranty } from '../types';

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

function AccountPage() {
  const auth = useMemo(() => getAuth(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [warrantySerial, setWarrantySerial] = useState('');
  const [warrantyNote, setWarrantyNote] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (auth) {
      fetchCurrentUser()
        .then((data) => {
          setProfile(data);
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        })
        .catch(() => setProfile(null));
      fetchMyOrders().then(setOrders).catch(() => setOrders([]));
      fetchWarranties().then(setWarranties).catch(() => setWarranties([]));
      fetchNotifications().then(setNotifications).catch(() => setNotifications([]));
    }
  }, [auth]);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-md bg-slate-950 p-6 text-white">
        <p className="text-sm font-black uppercase text-red-300">Trang cá nhân</p>
        <h1 className="mt-1 text-2xl font-black uppercase">{profile?.username || auth.username}</h1>
        <p className="text-sm text-slate-300">Quản lý thông tin tài khoản, đơn hàng và hoạt động mua sắm.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard icon={UserRound} label="Tên đăng nhập" value={profile?.username || auth.username} />
        <InfoCard icon={ShieldCheck} label="Vai trò" value={formatRole(profile?.role || auth.role)} />
        <InfoCard icon={PackageCheck} label="Đơn đã đặt" value={String(orders.length)} />
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSavingProfile(true);
          try {
            const updatedProfile = await updateCurrentUser({ fullName, phone, address });
            setProfile(updatedProfile);
            setFullName(updatedProfile.fullName || '');
            setPhone(updatedProfile.phone || '');
            setAddress(updatedProfile.address || '');
          } finally {
            setIsSavingProfile(false);
          }
        }}
        className="rounded-md border border-slate-200 bg-white p-5"
      >
        <h2 className="font-black uppercase text-slate-950">Thông tin nhận hàng mặc định</h2>
        <p className="mt-1 text-sm text-slate-600">Thông tin này sẽ tự điền khi bạn đặt hàng.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ProfileInput label="Họ tên" value={fullName} onChange={setFullName} />
          <ProfileInput label="Số điện thoại" value={phone} onChange={setPhone} />
          <label className="block text-sm font-bold text-slate-700 md:col-span-2">
            Địa chỉ
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#d71920]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isSavingProfile}
          className="mt-4 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white disabled:bg-slate-300"
        >
          {isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </form>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-black uppercase text-slate-950">Lịch sử mua hàng</h2>
            <p className="mt-1 text-sm text-slate-600">Các đơn hàng được đặt khi bạn đã đăng nhập tài khoản này.</p>
          </div>
          <Link to="/products" className="rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white">
            Mua thêm
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">Đơn hàng #{order.id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString('vi-VN')} · {order.customerName} · {order.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#d71920]">{currencyFormatter.format(order.totalAmount)}</p>
                  <p className="text-xs font-black uppercase text-slate-500">{order.status}</p>
                  <button type="button" onClick={() => window.print()} className="mt-2 text-xs font-black text-slate-700 underline">
                    In hóa đơn {order.invoiceNumber || ''}
                  </button>
                </div>
              </div>
              <div className="mt-3 divide-y divide-slate-100 rounded bg-slate-50 px-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-semibold text-slate-800">{item.productName}</span>
                    <span className="shrink-0 text-slate-500">
                      x{item.quantity} · {currencyFormatter.format(item.subTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
          {orders.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-300 p-6 text-center">
              <p className="font-bold text-slate-700">Bạn chưa có đơn hàng nào.</p>
              <p className="mt-1 text-sm text-slate-500">Hãy đăng nhập trước khi đặt hàng để hệ thống lưu lịch sử tại đây.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="font-black uppercase text-slate-950">Bảo hành sản phẩm</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            const warranty = await requestWarranty(warrantySerial, warrantyNote);
            setWarranties((current) => [warranty, ...current.filter((item) => item.id !== warranty.id)]);
            setWarrantySerial('');
            setWarrantyNote('');
          }}
        >
          <ProfileInput label="Serial sản phẩm" value={warrantySerial} onChange={setWarrantySerial} />
          <ProfileInput label="Mô tả lỗi" value={warrantyNote} onChange={setWarrantyNote} />
          <div className="flex self-end gap-2">
            <button
              type="button"
              className="rounded bg-slate-900 px-4 py-2 text-sm font-black uppercase text-white"
              onClick={async () => {
                const warranty = await lookupWarranty(warrantySerial);
                setWarranties((current) => [warranty, ...current.filter((item) => item.id !== warranty.id)]);
              }}
            >
              Tra cứu
            </button>
            <button type="submit" className="rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white">
              Gửi yêu cầu
            </button>
          </div>
        </form>
        <div className="mt-4 space-y-2">
          {warranties.map((warranty) => (
            <div key={warranty.id} className="rounded border border-slate-200 p-3 text-sm">
              <p className="font-black">{warranty.productName} · {warranty.serialNumber}</p>
              <p className="text-slate-500">{warranty.status} · hạn đến {warranty.endDate}</p>
              <p className="text-slate-600">{warranty.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="font-black uppercase text-slate-950">Thông báo tiến độ</h2>
        <div className="mt-4 space-y-2">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded border border-slate-200 p-3">
              <p className="font-bold">{notification.title}</p>
              <p className="text-sm text-slate-600">{notification.message}</p>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm text-slate-500">Chưa có thông báo.</p>}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="font-black uppercase text-slate-950">Hoạt động tài khoản</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tài khoản khách hàng có thể thêm sản phẩm vào giỏ, đặt hàng, bình luận và đánh giá sản phẩm.
        </p>
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="mt-4 rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white"
        >
          Đăng xuất
        </button>
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <Icon className="h-6 w-6 text-[#d71920]" />
      <p className="mt-3 text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#d71920]"
      />
    </label>
  );
}

export default AccountPage;
