"use client";

import { useState } from "react";
import Link from "next/link";
import { FiBell, FiPlus, FiUser, FiLogOut } from "react-icons/fi";
import { AddTenantModal } from "@/components/dashboard/AddTenantModal";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@backend/api";
import { translateRole } from "@/lib/translations";

const navLinks = [
  { href: "/", label: "داشبورد" },
  { href: "/customers", label: "شعبه‌ها" },
  { href: "/members", label: "اعضا" },
];

export function TopNav() {
  const [showAdd, setShowAdd] = useState(false);
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.auth.me);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <header className="glass-panel sticky top-4 z-20 mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 rounded-[2rem] border border-white/10 bg-slate-900/60 px-4 py-3 shadow-xl backdrop-blur-xl md:px-6 md:py-4">
        {/* Right Section: Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-lg font-bold text-white shadow-lg md:h-12 md:w-12 md:text-xl">
            CP
          </div>
          <div className="hidden xs:block">
            <p className="text-sm font-bold text-white md:text-base lg:text-lg">پنل مدیریت</p>
            <p className="hidden text-[10px] text-white/50 md:block lg:text-xs">مدیریت هوشمند شعب و اعضا</p>
          </div>
        </div>

        {/* Center Section: Navigation (Hidden on Mobile) */}
        <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Left Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* New Tenant Button */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-10 items-center gap-2 rounded-2xl bg-white px-3 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-105 active:scale-95 md:h-11 md:px-5 cursor-pointer"
            title="شعبه جدید"
          >
            <FiPlus className="text-lg" />
            <span className="hidden sm:inline">شعبه جدید</span>
          </button>

          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-white/70 transition hover:bg-white/10 md:h-11 md:w-11 cursor-pointer">
            <FiBell />
            <span className="absolute top-2 left-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-900"></span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 hidden sm:block mx-1"></div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-1 md:gap-3 md:bg-transparent md:p-0">
            <div className="hidden flex-col items-end text-right sm:flex">
              <p className="max-w-[100px] truncate text-xs font-bold text-white md:max-w-[150px] md:text-sm">
                {user?.name ?? "ورود نکرده"}
              </p>
              <p className="text-[10px] text-white/40 md:text-xs">
                {translateRole(user?.role) || "مهمان"}
              </p>
            </div>
            
            <div className="group relative">
              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-lg text-white shadow-lg transition hover:from-rose-500 hover:to-rose-600 md:h-11 md:w-11 cursor-pointer"
                title="خروج"
              >
                <FiLogOut className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AddTenantModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
