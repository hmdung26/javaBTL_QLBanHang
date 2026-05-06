import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CategorySidebar from '../components/CategorySidebar';
import PromoHero from '../components/PromoHero';
import ProductCard from '../components/ProductCard';
import { fetchBanners } from '../services/BannerService';
import { fetchCategories } from '../services/CategoryService';
import { fetchProducts } from '../services/ProductService';
import type { Banner, Category, Product } from '../types';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const keyword = searchParams.get('keyword') || undefined;
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      try {
        const [productsData, categoriesData, bannersData] = await Promise.all([
          fetchProducts({ keyword, categoryId }),
          fetchCategories(),
          fetchBanners(true),
        ]);

        if (isMounted) {
          setProducts(productsData);
          setCategories(categoriesData);
          setBanners(bannersData);
          setErrorMessage(null);
        }
      } catch {
        if (isMounted) {
          const message = 'Không tải được sản phẩm. Kiểm tra backend đang chạy.';
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [keyword, categoryId]);

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <CategorySidebar categories={categories} />

      <section className="space-y-5">
        <PromoHero banners={banners} />

        <div className="rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-black uppercase text-slate-950">
                {keyword ? `Kết quả tìm kiếm: ${keyword}` : 'Deal hot mỗi ngày'}
              </h1>
              <p className="text-sm text-slate-600">Sản phẩm PC và linh kiện đang có trong hệ thống.</p>
            </div>
            <p className="rounded bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
              {products.length} sản phẩm
            </p>
          </div>

          <div className="p-4">
            {isLoading && <div className="p-8 text-center text-slate-600">Đang tải sản phẩm...</div>}
            {!isLoading && errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
            )}
            {!isLoading && !errorMessage && products.length === 0 && (
              <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-600">
                Không tìm thấy sản phẩm phù hợp.
              </div>
            )}
            {!isLoading && !errorMessage && products.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;
