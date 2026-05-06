import { useEffect, useMemo, useState } from 'react';
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

  const newestProducts = useMemo(() => products.slice(0, 8), [products]);
  const pcProducts = useMemo(
    () => products.filter((product) => product.categoryName?.toLowerCase().includes('pc')).slice(0, 4),
    [products],
  );
  const accessoryProducts = useMemo(
    () => products.filter((product) => !product.categoryName?.toLowerCase().includes('pc')).slice(0, 4),
    [products],
  );

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts(), fetchBanners(true), fetchBestSellingProducts(8), fetchTopRatedProducts(10)])
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
        <div className="space-y-5">
          <PromoHero banners={banners} />
        </div>
      </div>

      <HomeSection title="Sản phẩm mới" products={newestProducts} />
      <HomeSection title="PC bán chạy" products={pcProducts.length ? pcProducts : newestProducts.slice(0, 4)} />
      <HomeSection title="Linh kiện & Gaming Gear" products={accessoryProducts.length ? accessoryProducts : newestProducts.slice(4, 8)} />

      <HomeSection title="Top 10 đánh giá cao" products={topRatedProducts.length ? topRatedProducts : newestProducts} />
      <HomeSection title="Sản phẩm bán chạy" products={bestSellingProducts.length ? bestSellingProducts : pcProducts.length ? pcProducts : newestProducts.slice(0, 4)} />

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
  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-xl font-black uppercase text-slate-950">{title}</h2>
        <Link to="/products" className="text-sm font-black uppercase text-[#d71920]">Xem tất cả</Link>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full p-4 text-center text-sm text-slate-500">Chưa có sản phẩm.</p>
        )}
      </div>
    </section>
  );
}

export default HomePage;
