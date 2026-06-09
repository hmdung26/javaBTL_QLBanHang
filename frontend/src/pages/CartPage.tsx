import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { fetchCurrentUser, getAuth, updateCurrentUser } from '../services/AuthService';
import { createOrder } from '../services/OrderService';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function CartPage() {
  const {
    cartItems,
    cartTotal,
    clearCart,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const auth = useMemo(() => getAuth(), []);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'E_WALLET'>('COD');
  const [transactionCode, setTransactionCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth) {
      return;
    }

    fetchCurrentUser()
      .then((profile) => {
        setCustomerName(profile.fullName || '');
        setCustomerPhone(profile.phone || '');
        setCustomerAddress(profile.address || '');
      })
      .catch(() => undefined);
  }, [auth]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    if (!auth) {
      toast.info('Vui lòng đăng nhập trước khi đặt hàng');
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrder({
        customerName,
        customerPhone,
        customerAddress,
        promotionCode,
        paymentMethod,
        transactionCode,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (auth && saveAddress) {
        await updateCurrentUser({
          fullName: customerName,
          phone: customerPhone,
          address: customerAddress,
        });
      }

      clearCart();
      toast.success('Đặt hàng thành công');
    } catch {
      toast.error('Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase text-slate-950">Giỏ hàng</h1>
        <p className="text-slate-600">Kiểm tra sản phẩm và nhập thông tin đặt hàng.</p>
      </div>

      {!auth && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          Bạn cần <Link to="/login" className="font-black underline">đăng nhập</Link> trước khi đặt hàng.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cartItems.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-600">
              Giỏ hàng của bạn đang trống.
            </div>
          )}

          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
            >
              <img
                src={item.product.imageUrl || 'https://placehold.co/400x400/e5e7eb/334155?text=No+Image'}
                alt={item.product.name}
                className="h-24 w-24 rounded object-cover"
              />

              <div className="space-y-1">
                <h2 className="font-semibold text-slate-950">{item.product.name}</h2>
                {item.product.categoryName && (
                  <p className="text-sm text-slate-500">{item.product.categoryName}</p>
                )}
                <p className="text-lg font-black text-[#d71920]">
                  {currencyFormatter.format(item.product.price)}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
                <div className="flex h-10 items-center rounded-md border border-slate-200">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="grid h-10 w-10 place-items-center text-slate-600 hover:bg-slate-100"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.product.id, Number(event.target.value))
                    }
                    className="h-10 w-14 border-x border-slate-200 text-center text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="grid h-10 w-10 place-items-center text-slate-600 hover:bg-slate-100"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.product.id)}
                  className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleCheckout}
          className="h-fit space-y-4 rounded-md border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <span className="font-bold uppercase text-slate-700">Tổng tiền</span>
            <span className="text-xl font-black text-[#d71920]">
              {currencyFormatter.format(cartTotal)}
            </span>
          </div>

          <CheckoutInput label="Họ tên" value={customerName} onChange={setCustomerName} />
          <CheckoutInput label="Số điện thoại" value={customerPhone} onChange={setCustomerPhone} type="tel" />
          <CheckoutInput label="Mã khuyến mãi" value={promotionCode} onChange={setPromotionCode} />

          <label className="block text-sm font-medium text-slate-700">
            Phương thức thanh toán
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="COD">Thanh toán khi nhận hàng</option>
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="E_WALLET">Ví điện tử</option>
            </select>
          </label>

          {paymentMethod !== 'COD' && (
            <CheckoutInput
              label="Mã giao dịch"
              value={transactionCode}
              onChange={setTransactionCode}
            />
          )}

          <label htmlFor="customerAddress" className="block text-sm font-medium text-slate-700">
            Địa chỉ
            <textarea
              id="customerAddress"
              value={customerAddress}
              onChange={(event) => setCustomerAddress(event.target.value)}
              required
              rows={3}
              className="mt-1 w-full resize-none rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {auth && (
            <label className="flex items-start gap-2 rounded bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
                className="mt-1"
              />
              Lưu thông tin này làm địa chỉ nhận hàng mặc định cho lần mua sau
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0 || !auth}
            className="inline-flex w-full items-center justify-center rounded bg-[#d71920] px-4 py-2.5 text-sm font-black uppercase text-white hover:bg-[#b91319] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </button>
        </form>
      </div>
    </section>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}

export default CartPage;
