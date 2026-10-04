import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Database,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginUser, registerUser, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
  onSkip?: () => void; // 게스트 둘러보기
}

const POPULAR_STYLES = [
  '조용한 골목길',
  '바다 전망 티룸',
  '전포 LP/바',
  '독립서점',
  '로컬 노포 미식',
  '감성 소품샵',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onSkip,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [travelStyles, setTravelStyles] = useState<string[]>(['조용한 골목길', '전포 LP/바']);
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const supabaseReady = isSupabaseConfigured();

  const toggleStyle = (style: string) => {
    if (travelStyles.includes(style)) {
      setTravelStyles(travelStyles.filter((s) => s !== style));
    } else {
      if (travelStyles.length >= 4) return;
      setTravelStyles([...travelStyles, style]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('아이디(이메일)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('닉네임을 입력해주세요.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage('비밀번호가 일치하지 않습니다.');
        return;
      }

      setIsLoading(true);
      const res = await registerUser({
        email: email.trim(),
        password,
        name: name.trim(),
        travelStyles,
      });
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || '회원가입 중 오류가 발생했습니다.');
      }
    } else {
      // Login
      setIsLoading(true);
      const res = await loginUser(email.trim(), password);
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || '아이디 또는 비밀번호를 다시 확인해주세요.');
      }
    }
  };

  // 데모 계정 빠른 로그인
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginUser('demo@busan.kr', '12341234');
    setIsLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-b from-rose-50/80 to-white px-6 pt-6 pb-4 text-center border-b border-stone-100">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/logo.jpg"
              alt="Hidden Spot IN BUSAN"
              className="h-12 w-auto max-w-[55px] object-contain"
            />
          </div>
          <h2 className="text-base font-black text-stone-900 tracking-tight">
            히든스팟 부산
          </h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            관광객 북적이는 곳을 피해, 현지인의 숨은 취향을 만나보세요
          </p>

          {/* Database Badge */}
          <div className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-semibold text-emerald-700">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>Supabase 클라우드 DB 연동</span>
            {supabaseReady && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </div>
        </div>

        {/* Tab Switcher: 로그인 vs 회원가입 */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            새 계정 만들기
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Email / ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              아이디 (이메일)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@busan.kr"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors"
              />
            </div>
          </div>

          {/* Nickname (Sign up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-bold text-stone-800">
                닉네임
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={12}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 영도골목산책자"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              비밀번호 {mode === 'signup' && <span className="text-[10px] text-stone-400 font-normal">(6자 이상)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full pl-10 pr-10 py-2.5 text-xs font-medium text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Confirm (Sign up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-bold text-stone-800">
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Travel style selection (Sign up only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 pt-1 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800">
                  선호 취향 태그
                </label>
                <span className="text-[10px] text-rose-500 font-bold">{travelStyles.length}/4</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_STYLES.map((style) => {
                  const isSel = travelStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        isSel
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 stroke-[3px]" />}
                      <span>{style}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-black text-xs shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>처리 중...</span>
                </span>
              ) : mode === 'login' ? (
                <>
                  <span>로그인하기</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>회원가입 완료 & 시작</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Login Option */}
          {mode === 'login' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-stone-500" />
                <span>체험용 계정으로 바로 둘러보기 (김서연)</span>
              </button>
            </div>
          )}

          {/* Guest Skip button */}
          {onSkip && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onSkip}
                className="text-[11px] text-stone-400 hover:text-stone-600 font-medium underline underline-offset-4 cursor-pointer"
              >
                로그인 없이 둘러보기
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
