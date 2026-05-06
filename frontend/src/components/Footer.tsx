import { MapPin, Phone, ShieldCheck } from 'lucide-react';

function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-lg font-black text-[#d71920]">TTG SALES</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hệ thống bán PC, linh kiện và thiết bị gaming cho người dùng cá nhân, văn phòng và doanh nghiệp.
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-black uppercase text-slate-950">Showroom</p>
          <p className="flex gap-2"><MapPin className="h-4 w-4 text-[#d71920]" /> Hà Nội: 83-85 Thái Hà</p>
          <p className="flex gap-2"><MapPin className="h-4 w-4 text-[#d71920]" /> TP.HCM: 83A Cửu Long</p>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-black uppercase text-slate-950">Hỗ trợ khách hàng</p>
          <p className="flex gap-2"><Phone className="h-4 w-4 text-[#d71920]" /> Hotline: 098.655.2233</p>
          <p className="flex gap-2"><ShieldCheck className="h-4 w-4 text-[#d71920]" /> Bảo hành rõ ràng, tư vấn cấu hình trước khi mua</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
