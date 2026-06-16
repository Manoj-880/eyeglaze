'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput from '@/components/ui/OtpInput';

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [target, setTarget] = useState<{ mode: string; value: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('otp_target');
    if (stored) setTarget(JSON.parse(stored));
    else router.push('/login');
  }, [router]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const verify = async () => {
    if (!target || otp.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const body = target.mode === 'mobile'
        ? { phone: target.value, otp }
        : { email: target.value, otp };
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        router.push('/products');
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!target) return;
    setTimer(30);
    setError('');
    try {
      const body = target.mode === 'mobile'
        ? { phone: target.value, countryCode: '+91' }
        : { email: target.value };
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-[#C9A84C] text-3xl font-serif tracking-[0.3em] uppercase font-bold">EYEGLAZE</div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
          <button
            onClick={() => router.push('/login')}
            className="text-[#888] text-sm mb-5 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold text-white mb-1">Enter OTP</h1>
          <p className="text-[#888] text-sm mb-6">
            Sent to{' '}
            <span className="text-white">
              {target?.mode === 'mobile' ? `+91 ${target.value}` : target?.value}
            </span>
          </p>

          <OtpInput length={6} onComplete={setOtp} onChange={setOtp} />

          {error && <div className="text-red-400 text-sm text-center mt-3">{error}</div>}

          <div className="text-center mt-4 text-sm text-[#888]">
            {timer > 0 ? (
              <span>Resend OTP in 0:{String(timer).padStart(2, '0')}</span>
            ) : (
              <button onClick={resend} className="text-[#C9A84C] hover:underline">
                Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={verify}
            disabled={loading || otp.length < 6}
            className="w-full mt-6 bg-[#C9A84C] text-black font-bold uppercase py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'VERIFY'}
          </button>
        </div>
      </div>
    </div>
  );
}
