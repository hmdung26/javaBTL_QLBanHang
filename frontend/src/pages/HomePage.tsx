import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import PromoHero from '../components/PromoHero';
import ProductCard from '../components/ProductCard';
import { fetchBanners } from '../services/BannerService';
import { fetchCategories } from '../services/CategoryService';
import { fetchBestSellingProducts, fetchProducts, fetchTopRatedProducts } from '../services/ProductService';
import type { Banner, Category, Product } from '../types';

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const newestProducts = useMemo(() => products.slice(0, 10), [products]);
  const pcProducts = useMemo(
    () => products.filter((product) => product.categoryName?.toLowerCase().includes('pc')).slice(0, 10),
    [products],
  );
  const accessoryProducts = useMemo(
    () => products.filter((product) => !product.categoryName?.toLowerCase().includes('pc')).slice(0, 10),
    [products],
  );

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts(), fetchBanners(true), fetchBestSellingProducts(10), fetchTopRatedProducts(10)])
      .then(([categoriesData, productsData, bannersData, bestSellingData, topRatedData]) => {
        setCategories(categoriesData);
        setProducts(productsData);
        setBanners(bannersData);
        setBestSellingProducts(bestSellingData);
        setTopRatedProducts(topRatedData);
      })
      .catch(() => {
        setCategories([]);
        setProducts([]);
        setBanners([]);
        setBestSellingProducts([]);
        setTopRatedProducts([]);
      });
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <CategorySidebar categories={categories} />
        <PromoHero banners={banners} />
      </div>

      <HomeSection title="Sản phẩm mới" products={newestProducts} />
      <HomeSection title="PC bán chạy" products={pcProducts.length ? pcProducts : newestProducts} />
      <HomeSection title="Linh kiện & Gaming Gear" products={accessoryProducts.length ? accessoryProducts : newestProducts} />
      <HomeSection title="Top 10 đánh giá cao" products={topRatedProducts.length ? topRatedProducts : newestProducts} />
      <HomeSection title="Sản phẩm bán chạy" products={bestSellingProducts.length ? bestSellingProducts : newestProducts} />

      <section className="grid gap-4 md:grid-cols-4">
        {['Miễn phí tư vấn cấu hình', 'Hỗ trợ trả góp', 'Giao hàng toàn quốc', 'Bảo hành chính hãng'].map((item) => (
          <div key={item} className="rounded-md border border-slate-200 bg-white p-4 text-center text-sm font-black uppercase text-slate-700">
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}

function HomeSection({ title, products }: { title: string; products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (products.length <= 4) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const container = scrollRef.current;
      if (!container) {
        return;
      }

      const nextLeft = container.scrollLeft + container.clientWidth;
      if (nextLeft >= container.scrollWidth - 8) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollTo({ left: nextLeft, behavior: 'smooth' });
      }
    }, 4500);

    return () => window.clearInterval(timer);
  }, [products.length]);

  function slide(direction: number) {
    scrollRef.current?.scrollBy({
      left: direction * (scrollRef.current.clientWidth || 320),
      behavior: 'smooth',
    });
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-xl font-black uppercase text-slate-950">{title}</h2>
        <div className="flex items-center gap-2">
          {products.length > 4 && (
            <>
              <button
                type="button"
                onClick={() => slide(-1)}
                className="grid h-9 w-9 place-items-center rounded bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-[#d71920]"
                aria-label="Sản phẩm trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => slide(1)}
                className="grid h-9 w-9 place-items-center rounded bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-[#d71920]"
                aria-label="Sản phẩm sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <Link to="/products" className="text-sm font-black uppercase text-[#d71920]">Xem tất cả</Link>
        </div>
      </div>
      <div ref={scrollRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="min-w-[260px] snap-start sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(25%-0.75rem)]">
            <ProductCard product={product} />
          </div>
        ))}
        {products.length === 0 && (
          <p className="w-full p-4 text-center text-sm text-slate-500">Chưa có sản phẩm.</p>
        )}
      </div>
    </section>
  );
}

export default HomePage;
