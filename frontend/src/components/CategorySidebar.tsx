import { Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Brand, Category } from '../types';

interface CategorySidebarProps {
  categories: Category[];
  brands?: Brand[];
}

function CategorySidebar({ categories, brands = [] }: CategorySidebarProps) {
  return (
    <aside className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="bg-[#d71920] px-4 py-3 text-sm font-black uppercase text-white">
        Danh mục sản phẩm
      </div>
      <div className="divide-y divide-slate-100">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?categoryId=${category.id}`}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-[#d71920]"
          >
            <Cpu className="h-4 w-4 shrink-0" />
            <span>{category.name}</span>
          </Link>
        ))}
        {categories.length === 0 && (
          <p className="px-4 py-3 text-sm text-slate-500">Chưa có danh mục.</p>
        )}
      </div>
      <div className="border-t border-slate-200 bg-slate-900 px-4 py-3 text-sm font-black uppercase text-white">
        Thương hiệu
      </div>
      <div className="divide-y divide-slate-100">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/products?brandId=${brand.id}`}
            className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-[#d71920]"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default CategorySidebar;
