"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/api";
import { useToastStore } from "@/store/toastStore";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiActivity,
  FiSlash,
  FiLoader
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function CitiesPage() {
  const cities = useQuery(api.cities.listAll);
  const createCity = useMutation(api.cities.create);
  const updateCity = useMutation(api.cities.update);
  const toggleActive = useMutation(api.cities.toggleActive);
  const removeCity = useMutation(api.cities.remove);
  
  const pushToast = useToastStore((state) => state.push);
  const me = useQuery(api.users.auth.me);

  const [isAdding, setIsAdding] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loading = cities === undefined;

  const handleAdd = async () => {
    if (!newCityName.trim()) return;
    try {
      await createCity({ name: newCityName.trim(), active: true });
      setNewCityName("");
      setIsAdding(false);
      pushToast({ type: "success", title: "موفق", message: "شهر جدید اضافه شد" });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در افزودن شهر" });
    }
  };

  const handleUpdate = async (id: string, active: boolean) => {
    if (!editName.trim()) return;
    try {
      await updateCity({ id: id as any, name: editName.trim(), active });
      setEditingId(null);
      pushToast({ type: "success", title: "موفق", message: "شهر با موفقیت ویرایش شد" });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در ویرایش شهر" });
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await toggleActive({ id: id as any, active: !currentActive });
      pushToast({ type: "success", title: "موفق", message: "وضعیت شهر تغییر کرد" });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در تغییر وضعیت" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این شهر اطمینان دارید؟")) return;
    try {
      await removeCity({ id: id as any });
      pushToast({ type: "success", title: "موفق", message: "شهر با موفقیت حذف شد" });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در حذف شهر" });
    }
  };

  if (!me || (me.role !== "creator" && me.role !== "promoter")) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/20">
          <FiSlash className="text-2xl text-rose-400" />
        </div>
        <p className="text-lg font-bold text-white">دسترسی ندارید</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-5 rounded-3xl border border-white/8 bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-6 shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20">
              <FiMapPin className="text-xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">مدیریت شهرها</h1>
              <p className="text-sm text-white/40 mt-0.5">افزودن و ویرایش لیست شهرهای پلتفرم</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="cursor-pointer flex items-center gap-2 rounded-2xl bg-gradient-to-l from-blue-500 via-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <FiPlus />
            شهر جدید
          </button>
        </div>
      </div>

      {/* ── Add New City Form ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4"
          >
            <div className="flex flex-1 items-center rounded-xl bg-white/5 px-3 py-2 border border-white/10">
              <FiMapPin className="text-white/40 ml-2" />
              <input
                autoFocus
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="نام شهر (مثال: تهران)"
                className="bg-transparent text-white outline-none w-full text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
            >
              <FiCheck /> ثبت
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewCityName(""); }}
              className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10"
            >
              انصراف
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cities List ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-20 rounded-2xl border border-white/5 bg-white/5" />
          ))
        ) : cities?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/40">
            هیچ شهری وارد نشده است.
          </div>
        ) : (
          cities?.map((city: any) => (
            <div key={city._id} className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-white/4 p-4 transition-all hover:bg-white/7 hover:border-white/10">
              {editingId === city._id ? (
                <div className="flex flex-col gap-3">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none border border-white/20 focus:border-blue-400/50"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 transition">
                      <FiX />
                    </button>
                    <button onClick={() => handleUpdate(city._id, city.active)} className="rounded-lg bg-blue-500 p-1.5 text-white transition hover:bg-blue-400">
                      <FiCheck />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                        <FiMapPin className="text-white/60 text-xs" />
                      </div>
                      <span className="font-bold text-white text-sm">{city.name}</span>
                    </div>
                    {city.active ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <FiActivity /> فعال
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-500/20">
                        <FiSlash /> غیرفعال
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggle(city._id, city.active)}
                      className="cursor-pointer rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/60 transition hover:bg-white/10"
                    >
                      {city.active ? "غیرفعال کن" : "فعال کن"}
                    </button>
                    <button
                      onClick={() => { setEditingId(city._id); setEditName(city.name); }}
                      className="cursor-pointer rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-1.5 text-indigo-300 transition hover:bg-indigo-500/20"
                    >
                      <FiEdit2 className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(city._id)}
                      className="cursor-pointer rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400 transition hover:bg-rose-500/20"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
