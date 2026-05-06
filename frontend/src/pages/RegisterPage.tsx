import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { register, saveAuth } from '../services/AuthService';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = await register({ username, password });
      saveAuth(auth);
      toast.success('Đăng ký thành công');
      window.location.href = '/account';
    } catch {
      toast.error('Không đăng ký được tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 space-y-1">
        <p className="text-sm font-black uppercase text-[#d71920]">Khách hàng mới</p>
        <h1 className="text-2xl font-black uppercase text-slate-950">Đăng ký tài khoản</h1>
        <p className="text-sm text-slate-600">Tạo tài khoản để bình luận, đánh giá và theo dõi thông tin mua hàng.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AccountInput label="Tên đăng nhập" value={username} onChange={setUsername} />
        <AccountInput label="Mật khẩu" type="password" value={password} onChange={setPassword} />
        <AccountInput label="Nhập lại mật khẩu" type="password" value={confirmPassword} onChange={setConfirmPassword} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#d71920] px-4 py-2.5 text-sm font-black uppercase text-white hover:bg-[#b91319] disabled:bg-slate-300"
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between rounded bg-slate-100 p-3 text-sm text-slate-600">
        <span>Đã có tài khoản?</span>
        <Link to="/login" className="font-black text-[#d71920]">Đăng nhập</Link>
      </div>
    </section>
  );
}

function AccountInput({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-[#d71920]"
      />
    </label>
  );
}

export default RegisterPage;
