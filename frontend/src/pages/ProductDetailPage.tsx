import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronRight,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { getAuth } from '../services/AuthService';
import { fetchProductById, fetchProducts } from '../services/ProductService';
import { createProductReview, deleteProductReview, fetchProductReviews } from '../services/ReviewService';
import type { Product, ProductReview } from '../types';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadProduct() {
      try {
        const productData = await fetchProductById(Number(id));
        setProduct(productData);
        setSelectedImage(productData.imageUrl || 'https://placehold.co/900x700/e5e7eb/334155?text=No+Image');
        setReviews(await fetchProductReviews(productData.id));

        const related = await fetchProducts({
          categoryId: productData.categoryId ?? undefined,
          inStock: true,
        });
        setRelatedProducts(related.filter((item) => item.id !== productData.id).slice(0, 4));
      } catch {
        toast.error('Không tải được chi tiết sản phẩm');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (isLoading) {
    return <div className="animate-fade-up rounded-md bg-white p-8 text-center text-slate-600">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="rounded-md bg-white p-8 text-center text-slate-600">Không tìm thấy sản phẩm.</div>;
  }

  const oldPrice = Math.round(product.price * 1.04);
  const saving = oldPrice - product.price;
  const imageList = [
    product.imageUrl || 'https://placehold.co/900x700/e5e7eb/334155?text=No+Image',
    'https://placehold.co/900x700/111827/ffffff?text=TTG+SALES',
    'https://placehold.co/900x700/d71920/ffffff?text=PC+DETAIL',
  ];
  const descriptionItems = (product.description || 'Sản phẩm cấu hình ổn định, phù hợp nhu cầu học tập, làm việc và giải trí.')
    .split(/\n|\. /)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  function handleAddToCart() {
    for (let index = 0; index < quantity; index += 1) {
      addToCart(product as Product);
    }
    toast.success('Đã thêm sản phẩm vào giỏ');
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !auth) {
      toast.info('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await createProductReview(product.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      const [updatedProduct, updatedReviews] = await Promise.all([
        fetchProductById(product.id),
        fetchProductReviews(product.id),
      ]);
      setProduct(updatedProduct);
      setReviews(updatedReviews);
      toast.success('Đã gửi đánh giá sản phẩm');
    } catch {
      toast.error('Không gửi được đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: number) {
    if (!product || !window.confirm('Xóa bình luận này?')) {
      return;
    }

    try {
      await deleteProductReview(product.id, reviewId);
      const [updatedProduct, updatedReviews] = await Promise.all([
        fetchProductById(product.id),
        fetchProductReviews(product.id),
      ]);
      setProduct(updatedProduct);
      setReviews(updatedReviews);
      toast.success('Đã xóa bình luận');
    } catch {
      toast.error('Không xóa được bình luận');
    }
  }

  return (
    <div className="space-y-5">
      <nav className="animate-fade-up flex flex-wrap items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-500">
        <Link to="/" className="hover:text-[#d71920]">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-[#d71920]">Sản phẩm</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-bold text-slate-900">{product.categoryName || 'Chi tiet'}</span>
      </nav>

      <section className="animate-fade-up grid gap-5 rounded-md border border-slate-200 bg-white p-4 lg:grid-cols-[520px_1fr]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            <img src={selectedImage} alt={product.name} className="aspect-square w-full object-cover transition duration-500 hover:scale-105" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {imageList.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={[
                  'overflow-hidden rounded border bg-slate-100 p-1',
                  selectedImage === image ? 'border-[#d71920]' : 'border-slate-200',
                ].join(' ')}
              >
                <img src={image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase text-[#d71920]">{product.categoryName || 'TTG SALES'}</p>
            <h1 className="mt-2 text-2xl font-black uppercase leading-tight text-slate-950 lg:text-3xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
              <span className="inline-flex items-center gap-1 text-yellow-600">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {(product.averageRating || 0).toFixed(1)} / 5
              </span>
              <span>{product.reviewCount || 0} đánh giá</span>
              <span>Đã bán {product.purchaseCount || 0}</span>
            </div>
          </div>

          <div className="rounded-md border border-red-100 bg-red-50 p-4">
            <p className="text-3xl font-black text-[#d71920]">{currencyFormatter.format(product.price)}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              <span className="text-slate-500 line-through">{currencyFormatter.format(oldPrice)}</span>
              <span className="font-bold text-emerald-600">Tiet kiem: {currencyFormatter.format(saving)}</span>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <InfoBadge icon={ShieldCheck} title="Bảo hành" value={product.warrantyPeriod || '36 tháng'} />
            <InfoBadge icon={BadgeCheck} title="Tình trạng" value={product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'} />
            <InfoBadge icon={Truck} title="Giao hàng" value="Toàn quốc" />
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <h2 className="font-black uppercase text-slate-950">Mô tả sản phẩm</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {descriptionItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d71920]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-dashed border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            <p className="font-black uppercase">Khuyến mại</p>
            <p className="mt-1">Tư vấn nâng cấp miễn phí, hỗ trợ lắp đặt và bảo hành chính hãng.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center rounded border border-slate-300">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-11 w-11 place-items-center">
                <Minus className="h-4 w-4" />
              </button>
              <span className="grid h-11 w-12 place-items-center border-x border-slate-200 font-bold">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="grid h-11 w-11 place-items-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={product.stockQuantity <= 0}
              onClick={handleAddToCart}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded bg-[#d71920] px-5 text-sm font-black uppercase text-white hover:bg-[#b91319] disabled:bg-slate-300"
            >
              <ShoppingCart className="h-5 w-5" />
              Thêm vào giỏ
            </button>
            <Link
              to="/cart"
              onClick={handleAddToCart}
              className="inline-flex h-11 flex-1 items-center justify-center rounded bg-slate-950 px-5 text-sm font-black uppercase text-white hover:bg-slate-800"
            >
              Đặt hàng
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-fade-up rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-black uppercase text-slate-950">Thông số kỹ thuật</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {descriptionItems.map((item, index) => (
                <tr key={item}>
                  <td className="w-16 px-3 py-3 font-bold text-slate-500">{index + 1}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{item}</td>
                  <td className="w-20 px-3 py-3 text-center">1</td>
                  <td className="w-24 px-3 py-3 text-center">36th</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="animate-fade-up rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="font-black uppercase text-slate-950">Đánh giá và bình luận</h2>
            <p className="text-sm text-slate-500">
              Điểm trung bình {(product.averageRating || 0).toFixed(1)} từ {product.reviewCount || 0} đánh giá.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded bg-yellow-50 px-3 py-2 font-black text-yellow-700">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            {(product.averageRating || 0).toFixed(1)}
          </div>
        </div>
        <div className="grid gap-5 p-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-md border border-slate-200 p-4">
            {auth ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <label className="block text-sm font-black uppercase text-slate-700">
                  Điểm đánh giá
                  <select
                    value={reviewRating}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                    className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-[#d71920]"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} sao
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-black uppercase text-slate-700">
                  Bình luận
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
                    className="mt-2 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-[#d71920]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2.5 text-sm font-black uppercase text-white disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" />
                  Gửi đánh giá
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-sm text-slate-600">
                <p>Bạn cần đăng nhập tài khoản khách hàng để đánh giá và bình luận sản phẩm.</p>
                <Link to="/login" className="inline-flex rounded bg-slate-950 px-4 py-2 font-black uppercase text-white">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{review.username}</p>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-yellow-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {review.rating}/5
                    </span>
                    {auth?.role === 'ROLE_ADMIN' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-black uppercase text-red-600 hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && <p className="mt-2 text-sm leading-6 text-slate-700">{review.comment}</p>}
              </article>
            ))}
            {reviews.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="animate-fade-up rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-black uppercase text-slate-950">Sản phẩm tương tự</h2>
          <Link to="/products" className="text-sm font-black uppercase text-[#d71920]">Xem tất cả</Link>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
          {relatedProducts.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-500">Chưa có sản phẩm tương tự.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoBadge({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-slate-200 p-3">
      <Icon className="h-5 w-5 text-[#d71920]" />
      <span>
        <span className="block text-xs uppercase text-slate-500">{title}</span>
        <span className="font-bold text-slate-900">{value}</span>
      </span>
    </div>
  );
}

export default ProductDetailPage;
