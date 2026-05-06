import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '../types';

interface PromoHeroProps {
  banners?: Banner[];
}

function PromoHero({ banners = [] }: PromoHeroProps) {
  const fallbackBanner = useMemo<Banner>(
    () => ({
      id: 0,
      title: 'Siêu sale PC và linh kiện',
      subtitle: 'Ưu đãi mới mỗi ngày, đặt hàng nhanh trên TTG Sales.',
      imageUrl: 'https://placehold.co/1400x520/0f172a/ffffff?text=TTG+SALES',
      linkUrl: '/products',
      active: true,
      sortOrder: 0,
      createdAt: '',
    }),
    [],
  );
  const slides = banners.length ? banners : [fallbackBanner];
  const [activeIndex, setActiveIndex] = useState(0);
  const mainBanner = slides[activeIndex] || slides[0];

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  function goToSlide(direction: number) {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="relative min-h-[320px] overflow-hidden rounded-md bg-slate-950 shadow-sm sm:min-h-[380px]">
      <img
        src={mainBanner.imageUrl || fallbackBanner.imageUrl}
        alt={mainBanner.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" />
      <div className="relative flex min-h-[320px] max-w-3xl flex-col justify-center p-6 text-white sm:min-h-[380px] sm:p-10">
        <span className="mb-4 w-fit rounded bg-yellow-400 px-3 py-1 text-xs font-black uppercase text-slate-950">
          Deal hot mỗi ngày
        </span>
        <h1 className="text-3xl font-black uppercase leading-tight sm:text-5xl">{mainBanner.title}</h1>
        {mainBanner.subtitle && <p className="mt-3 max-w-xl text-base font-medium text-slate-100 sm:text-lg">{mainBanner.subtitle}</p>}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToSlide(-1)}
            className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Banner trước"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goToSlide(1)}
            className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Banner sau"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  'h-2 rounded-full transition-all',
                  index === activeIndex ? 'w-10 bg-yellow-300' : 'w-2 bg-white/60 hover:bg-white',
                ].join(' ')}
                aria-label={`Chọn banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default PromoHero;
