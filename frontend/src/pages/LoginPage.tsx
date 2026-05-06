import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { login, saveAuth } from '../services/AuthService';

function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const auth = await login({ username, password });
      saveAuth(auth);
      toast.success('Đăng nhập thành công');
      window.location.href = auth.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/account';
    } catch {
      toast.error('Sai tài khoản hoặc mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 space-y-1">
        <p className="text-sm font-black uppercase text-[#d71920]">Tài khoản</p>
        <h1 className="text-2xl font-black uppercase text-slate-950">Đăng nhập</h1>
        <p className="text-sm text-slate-600">Đăng nhập để đặt hàng, bình luận và đánh giá sản phẩm.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Tên đăng nhập
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-[#d71920]"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-[#d71920]"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2.5 text-sm font-black uppercase text-white hover:bg-[#b91319] disabled:bg-slate-300"
        >
          <LogIn className="h-4 w-4" />
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between rounded bg-slate-100 p-3 text-sm text-slate-600">
        <span>Chưa có tài khoản?</span>
        <Link to="/register" className="font-black text-[#d71920]">Đăng ký</Link>
      </div>
    </section>
  );
}

export default LoginPage;
