import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createBrand,
  createPromotion,
  createWarehouseItem,
  deleteBrand,
  deletePromotion,
  deleteWarehouseItem,
  fetchBrands,
  fetchPromotions,
  fetchWarehouseItems,
  fetchWarranties,
  updateBrand,
  updatePromotion,
  updateWarranty,
  updateWarehouseItem,
} from '../services/BusinessService';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from '../services/AdminService';
import { fetchProducts } from '../services/ProductService';
import type {
  AdminUser,
  Brand,
  Product,
  Promotion,
  PromotionRequest,
  UserRole,
  WarehouseItem,
  WarehouseItemRequest,
  Warranty,
  WarrantyStatus,
} from '../types';

export type FeatureMode = 'brands' | 'promotions' | 'warehouse' | 'warranties' | 'access';

const fieldClass = 'mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm';
const buttonClass = 'rounded bg-[#d71920] px-4 py-2 text-sm font-black uppercase text-white';

export default function AdminFeaturePanel({ mode }: { mode: FeatureMode }) {
  if (mode === 'brands') return <BrandPanel />;
  if (mode === 'promotions') return <PromotionPanel />;
  if (mode === 'warehouse') return <WarehousePanel />;
  if (mode === 'warranties') return <WarrantyPanel />;
  return <AccessPanel />;
}

function BrandPanel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    setBrands(await fetchBrands());
  }

  useEffect(() => {
    load().catch(() => toast.error('Không tải được thương hiệu'));
  }, []);

  return (
    <Panel title="Quản lý thương hiệu">
      <form
        className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await createBrand({ name, logoUrl, description });
          setName('');
          setLogoUrl('');
          setDescription('');
          await load();
        }}
      >
        <Input label="Tên thương hiệu" value={name} onChange={setName} required />
        <Input label="Logo URL" value={logoUrl} onChange={setLogoUrl} />
        <Input label="Mô tả" value={description} onChange={setDescription} />
        <button className={`${buttonClass} self-end`} type="submit">Thêm thương hiệu</button>
      </form>
      <SimpleTable
        headers={['Tên', 'Mô tả', 'Thao tác']}
        rows={brands.map((brand) => [
          brand.name,
          brand.description || '-',
          <div key={brand.id} className="flex gap-2">
            <button type="button" className="rounded bg-slate-900 px-3 py-1 text-xs font-bold text-white" onClick={async () => {
              const nextName = window.prompt('Tên thương hiệu', brand.name);
              if (!nextName) return;
              await updateBrand(brand.id, {
                name: nextName,
                logoUrl: brand.logoUrl || '',
                description: brand.description || '',
              });
              await load();
            }}>Sửa</button>
            <DeleteButton onClick={async () => {
              await deleteBrand(brand.id);
              await load();
            }} />
          </div>,
        ])}
      />
    </Panel>
  );
}

function PromotionPanel() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState<PromotionRequest>({
    code: '',
    name: '',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderValue: 0,
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    usageLimit: 100,
    active: true,
  });

  async function load() {
    setPromotions(await fetchPromotions());
  }

  useEffect(() => {
    load().catch(() => toast.error('Không tải được khuyến mãi'));
  }, []);

  return (
    <Panel title="Quản lý khuyến mãi">
      <form
        className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await createPromotion(form);
          setForm({ ...form, code: '', name: '' });
          await load();
        }}
      >
        <Input label="Mã voucher" value={form.code} onChange={(value) => setForm({ ...form, code: value })} required />
        <Input label="Tên chương trình" value={form.name ?? ''} onChange={(value) => setForm({ ...form, name: value })} />
        <label className="text-sm font-bold text-slate-700">
          Loại giảm
          <select className={fieldClass} value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as PromotionRequest['discountType'] })}>
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Số tiền</option>
          </select>
        </label>
        <Input label="Giá trị giảm" type="number" value={String(form.discountValue)} onChange={(value) => setForm({ ...form, discountValue: Number(value) })} required />
        <Input label="Đơn tối thiểu" type="number" value={String(form.minOrderValue)} onChange={(value) => setForm({ ...form, minOrderValue: Number(value) })} />
        <Input label="Bắt đầu" type="datetime-local" value={form.startAt} onChange={(value) => setForm({ ...form, startAt: value })} required />
        <Input label="Kết thúc" type="datetime-local" value={form.endAt} onChange={(value) => setForm({ ...form, endAt: value })} required />
        <Input label="Lượt sử dụng" type="number" value={String(form.usageLimit)} onChange={(value) => setForm({ ...form, usageLimit: Number(value) })} required />
        <button className={buttonClass} type="submit">Tạo voucher</button>
      </form>
      <SimpleTable
        headers={['Mã', 'Mức giảm', 'Điều kiện', 'Lượt dùng', 'Thao tác']}
        rows={promotions.map((promotion) => [
          promotion.code,
          `${promotion.discountValue}${promotion.discountType === 'PERCENT' ? '%' : 'đ'}`,
          `Từ ${promotion.minOrderValue.toLocaleString('vi-VN')}đ`,
          `${promotion.usedCount}/${promotion.usageLimit}`,
          <div key={promotion.id} className="flex gap-2">
            <button type="button" className="rounded bg-slate-900 px-3 py-1 text-xs font-bold text-white" onClick={async () => {
              const nextValue = window.prompt('Giá trị giảm mới', String(promotion.discountValue));
              if (!nextValue) return;
              await updatePromotion(promotion.id, {
                code: promotion.code,
                name: promotion.name,
                discountType: promotion.discountType,
                discountValue: Number(nextValue),
                minOrderValue: promotion.minOrderValue,
                startAt: promotion.startAt,
                endAt: promotion.endAt,
                usageLimit: promotion.usageLimit,
                active: promotion.active,
              });
              await load();
            }}>Sửa</button>
            <DeleteButton onClick={async () => {
              await deletePromotion(promotion.id);
              await load();
            }} />
          </div>,
        ])}
      />
    </Panel>
  );
}

function WarehousePanel() {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<WarehouseItemRequest>({
    productId: 0,
    barcode: '',
    serialNumber: '',
    shelfLocation: '',
    status: 'AVAILABLE',
  });

  async function load() {
    const [warehouseData, productData] = await Promise.all([fetchWarehouseItems(), fetchProducts()]);
    setItems(warehouseData);
    setProducts(productData);
    if (productData[0]) {
      setForm((current) => current.productId
        ? current
        : { ...current, productId: productData[0].id });
    }
  }

  useEffect(() => {
    load().catch(() => toast.error('Không tải được kho'));
  }, []);

  return (
    <Panel title="Kho vật lý và barcode">
      <form
        className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-5"
        onSubmit={async (event) => {
          event.preventDefault();
          await createWarehouseItem(form);
          setForm({ ...form, barcode: '', serialNumber: '', shelfLocation: '' });
          await load();
        }}
      >
        <label className="text-sm font-bold text-slate-700">
          Sản phẩm
          <select className={fieldClass} value={form.productId} onChange={(event) => setForm({ ...form, productId: Number(event.target.value) })}>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </label>
        <Input label="Barcode" value={form.barcode} onChange={(value) => setForm({ ...form, barcode: value })} required />
        <Input label="Serial" value={form.serialNumber} onChange={(value) => setForm({ ...form, serialNumber: value })} required />
        <Input label="Vị trí kệ" value={form.shelfLocation} onChange={(value) => setForm({ ...form, shelfLocation: value })} required />
        <button className={`${buttonClass} self-end`} type="submit">Nhập kho</button>
      </form>
      <SimpleTable
        headers={['Sản phẩm', 'Serial / Barcode', 'Vị trí', 'Trạng thái', 'Thao tác']}
        rows={items.map((item) => [
          item.productName,
          `${item.serialNumber} / ${item.barcode}`,
          item.shelfLocation,
          <select
            key={`${item.id}-status`}
            className={fieldClass}
            value={item.status}
            onChange={async (event) => {
              await updateWarehouseItem(item.id, {
                productId: item.productId,
                barcode: item.barcode,
                serialNumber: item.serialNumber,
                shelfLocation: item.shelfLocation,
                status: event.target.value as WarehouseItemRequest['status'],
              });
              await load();
            }}
          >
            {['AVAILABLE', 'RESERVED', 'SOLD', 'DAMAGED', 'WARRANTY']
              .map((status) => <option key={status}>{status}</option>)}
          </select>,
          <DeleteButton key={item.id} onClick={async () => {
            await deleteWarehouseItem(item.id);
            await load();
          }} />,
        ])}
      />
    </Panel>
  );
}

function WarrantyPanel() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);

  async function load() {
    setWarranties(await fetchWarranties());
  }

  useEffect(() => {
    load().catch(() => toast.error('Không tải được bảo hành'));
  }, []);

  return (
    <Panel title="Tiếp nhận và xử lý bảo hành">
      <div className="space-y-3">
        {warranties.map((warranty) => (
          <div key={warranty.id} className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-[1fr_220px_1fr_auto]">
            <div>
              <p className="font-black">{warranty.productName || 'Sản phẩm'}</p>
              <p className="text-sm text-slate-500">{warranty.serialNumber} · {warranty.username}</p>
              <p className="text-sm text-slate-600">{warranty.note || 'Chưa có ghi chú'}</p>
            </div>
            <select
              className={fieldClass}
              value={warranty.status}
              onChange={async (event) => {
                await updateWarranty(warranty.id, event.target.value as WarrantyStatus, warranty.note || '');
                await load();
              }}
            >
              {['ACTIVE', 'REQUESTED', 'INSPECTING', 'REPAIRING', 'REPLACED', 'COMPLETED', 'REJECTED', 'EXPIRED']
                .map((status) => <option key={status}>{status}</option>)}
            </select>
            <div className="text-xs text-slate-500">
              {warranty.history.slice(-3).map((history) => (
                <p key={`${history.status}-${history.createdAt}`}>{history.status}: {history.note}</p>
              ))}
            </div>
            <button type="button" className="rounded bg-slate-900 px-3 py-2 text-sm font-bold text-white" onClick={() => window.print()}>
              In phiếu
            </button>
          </div>
        ))}
        {warranties.length === 0 && <p className="p-6 text-center text-slate-500">Chưa có phiếu bảo hành.</p>}
      </div>
    </Panel>
  );
}

function AccessPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_STAFF');

  async function load() {
    setUsers(await fetchAdminUsers());
  }

  useEffect(() => {
    load().catch(() => toast.error('Không tải được tài khoản'));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      await updateAdminUser(editing.id, {
        password,
        fullName,
        phone: editing.phone || '',
        address: editing.address || '',
        role,
      });
    } else {
      await createAdminUser({
        username,
        password,
        fullName,
        phone: '',
        address: '',
        role,
      });
    }
    setEditing(null);
    setUsername('');
    setPassword('');
    setFullName('');
    await load();
  }

  return (
    <Panel title="Tài khoản và phân quyền">
      <form className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-5" onSubmit={submit}>
        <Input label="Tên đăng nhập" value={editing?.username ?? username} onChange={setUsername} required={!editing} />
        <Input label="Mật khẩu" type="password" value={password} onChange={setPassword} required={!editing} />
        <Input label="Họ tên" value={fullName} onChange={setFullName} />
        <label className="text-sm font-bold text-slate-700">
          Vai trò
          <select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="ROLE_USER">Khách hàng</option>
            <option value="ROLE_STAFF">Nhân viên kho</option>
            <option value="ROLE_ADMIN">Quản trị viên</option>
          </select>
        </label>
        <button className={`${buttonClass} self-end`} type="submit">{editing ? 'Cập nhật' : 'Tạo tài khoản'}</button>
      </form>
      <SimpleTable
        headers={['Tài khoản', 'Họ tên', 'Vai trò', 'Thao tác']}
        rows={users.map((user) => [
          user.username,
          user.fullName || '-',
          user.role,
          <div key={user.id} className="flex gap-2">
            <button type="button" className="rounded bg-slate-900 px-3 py-1 text-xs font-bold text-white" onClick={() => {
              setEditing(user);
              setFullName(user.fullName || '');
              setRole(user.role);
              setPassword('');
            }}>Sửa</button>
            <DeleteButton onClick={async () => {
              await deleteAdminUser(user.id);
              await load();
            }} />
          </div>,
        ])}
      />
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-black uppercase text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label}
      <input className={fieldClass} type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function DeleteButton({ onClick }: { onClick: () => Promise<void> }) {
  return (
    <button
      type="button"
      className="rounded bg-red-50 px-3 py-1 text-xs font-black text-red-600"
      onClick={() => {
        if (window.confirm('Bạn chắc chắn muốn xóa?')) onClick().catch(() => toast.error('Không thể xóa dữ liệu'));
      }}
    >
      Xóa
    </button>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
