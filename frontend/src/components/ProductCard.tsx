import { BadgeCheck, Gift, ImageOff, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const placeholderImage =
  'https://placehold.co/800x600/e5e7eb/334155?text=No+Image';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || placeholderImage;
  const { addToCart } = useCart();

  function handleAddToCart() {
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ`);
  }

  return (
    <article className="stagger-card group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-2 top-2 rounded-sm bg-[#d71920] px-2 py-1 text-xs font-bold text-white">
          HOT SALE
        </span>
        {!product.imageUrl && (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm">
            <ImageOff className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-3">
        <div className="space-y-1">
          <div className="space-y-2">
            <Link to={`/products/${product.id}`} className="block min-h-12 text-sm font-bold uppercase leading-5 text-slate-950 group-hover:text-[#d71920]">
              {product.name}
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <BadgeCheck className="h-4 w-4" />
              {product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
            </div>
          </div>

          {product.categoryName && (
            <p className="text-sm text-slate-500">{product.categoryName}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1 text-yellow-600">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {(product.averageRating || 0).toFixed(1)}
              <span className="text-slate-400">({product.reviewCount || 0})</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#d71920]" />
              Đã bán {product.purchaseCount || 0}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xl font-black text-[#d71920]">
            {currencyFormatter.format(product.price)}
          </p>
          <div className="rounded border border-dashed border-yellow-300 bg-yellow-50 px-2 py-1.5 text-xs text-yellow-800">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Gift className="h-3.5 w-3.5" />
              Khuyến mại:
            </span>{' '}
            Hỗ trợ tư vấn cấu hình và bảo hành chính hãng.
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stockQuantity <= 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2.5 text-sm font-black uppercase text-white transition hover:bg-[#b91319] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
