"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiPhone, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiUsers, FiBarChart2 } from "react-icons/fi";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useToastStore } from "@/store/toastStore";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  { icon: FiShield, title: "امنیت بالا", desc: "ورود امن با احراز هویت پیشرفته" },
  { icon: FiUsers, title: "مدیریت شعب", desc: "کنترل کامل شعبات و اعضا در یک مکان" },
  { icon: FiBarChart2, title: "گزارش‌گیری", desc: "آمار و تحلیل لحظه‌ای عملکرد" },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [loading, setLoading] = useState(false);
  const pushToast = useToastStore((state) => state.push);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const originalConsoleError = console.error;
    console.error = () => { };

    try {
      await signIn("custom-password", { phone, password, flow: "signIn" });
      pushToast({
        type: "success",
        title: "ورود موفق",
        message: "در حال انتقال به داشبورد",
      });
    } catch (error: any) {
      const errMsg = error?.message?.toLowerCase() ?? "";
      let message = "شماره موبایل یا رمز عبور اشتباه است.";

      if (errMsg.includes("ban")) {
        message = "امکان ورود وجود ندارد. حساب شما مسدود شده است.";
      }

      pushToast({
        type: "error",
        title: "ورود ناموفق",
        message,
      });
    } finally {
      setLoading(false);
      setTimeout(() => { console.error = originalConsoleError; }, 50);
    }
  };

  return (
    <div className="relative flex w-full min-h-screen overflow-hidden">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,146,60,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(244,63,94,0.15),transparent_60%)]" />
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-24 right-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-24 left-24 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-12 max-w-md w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-2 shadow-lg backdrop-blur-md border border-white/10">
              <Image
                src="/BestieeLogo.webp"
                alt="Bestiee Logo"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xl font-bold text-white">BestieeCP</p>
              <p className="text-xs text-white/40">پنل مدیریت سازمانی</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-4xl font-bold leading-tight text-white">
              مدیریت هوشمند
              <br />
              <span className="bg-gradient-to-l from-orange-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
                شعب
              </span>
            </h2>
            <p className="text-base text-white/50 leading-relaxed">
              پلتفرم یکپارچه برای مدیریت شعب، اعضا، و عملکرد کسب‌وکار در یک داشبورد مدرن.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 px-5 py-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/20">
                  <f.icon className="text-lg text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-white/40">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle right-panel background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/60 to-slate-900/80 lg:from-slate-900/40 lg:to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.08),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">

            {/* Mobile logo — only visible on small screens */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5 p-1.5 border border-white/10">
                <Image
                  src="/BestieeLogo.webp"
                  alt="Bestiee Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <p className="font-bold text-white">BestieeCP</p>
            </div>

            {/* Header */}
            <div className="mb-8">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-orange-400/80">
                پنل مدیریت
              </p>
              <h1 className="text-2xl font-bold text-white">خوش آمدید</h1>
              <p className="mt-2 text-sm text-white/40">
                برای ادامه با اطلاعات حساب خود وارد شوید.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Phone field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/60">شماره موبایل</label>
                <div className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${phoneFocused
                  ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_0_3px_rgba(251,191,36,0.08)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}>
                  <FiPhone className={`shrink-0 text-base transition-colors duration-200 ${phoneFocused ? "text-amber-400" : "text-white/30"}`} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20 text-left"
                    placeholder="09xxxxxxxxx"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/60">رمز عبور</label>
                <div className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${passwordFocused
                  ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_0_3px_rgba(251,191,36,0.08)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}>
                  <FiLock className={`shrink-0 text-base transition-colors duration-200 ${passwordFocused ? "text-amber-400" : "text-white/30"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-white/30 transition hover:text-white/70 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-l from-orange-500 via-amber-500 to-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
              >
                {/* Shine sweep on hover */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    در حال ورود...
                  </>
                ) : (
                  <>
                    ورود به پنل
                    <FiArrowLeft className="text-base transition-transform duration-200 group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-white/25">
              © {new Date().getFullYear()} Bestiee — تمام حقوق محفوظ است
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
