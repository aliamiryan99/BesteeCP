"use client";

import { useState, useEffect } from "react";
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
  FiLoader,
  FiStar,
  FiGlobe,
  FiUsers,
  FiZap,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "@backend/dataModel";

type City = Doc<"cities">;

export default function CitiesPage() {
  const cities = useQuery(api.cities.listAll) as City[] | undefined;
  const createCity = useMutation(api.cities.create);
  const updateCity = useMutation(api.cities.update);
  const toggleActive = useMutation(api.cities.toggleActive);
  const removeCity = useMutation(api.cities.remove);
  
  const pushToast = useToastStore((state) => state.push);
  const me = useQuery(api.users.auth.me);

  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState({
    name: "",
    province: "",
    population: 0,
    IsCapital: false,
    IsProvincialCapital: false
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    province: "",
    population: 0,
    IsCapital: false,
    IsProvincialCapital: false
  });

  const seedCities = useMutation(api.cities.seed);
  const [isSeeding, setIsSeeding] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [capitalFilter, setCapitalFilter] = useState<"all" | "capital" | "provincial">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 32;

  const loading = cities === undefined;

  // Derive unique provinces for filter
  const provinces = (cities
    ? Array.from(new Set(cities.map((c: City) => c.province))).sort()
    : []) as string[];

  const filteredCities = cities?.filter(city => {
    const cityProvince = city.province || "";
    const cityName = city.name || "";
    const matchesSearch = cityName.includes(searchQuery) || cityProvince.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && city.active) || 
      (statusFilter === "inactive" && !city.active);
    const matchesProvince = provinceFilter === "all" || city.province === provinceFilter;
    const matchesCapital = capitalFilter === "all" || 
      (capitalFilter === "capital" && city.IsCapital) || 
      (capitalFilter === "provincial" && city.IsProvincialCapital);
    
    return matchesSearch && matchesStatus && matchesProvince && matchesCapital;
  });

  const totalPages = Math.ceil((filteredCities?.length || 0) / itemsPerPage);
  const paginatedCities = filteredCities?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, provinceFilter, capitalFilter]);

  const handleAdd = async () => {
    if (!newCity.name.trim() || !newCity.province.trim()) return;
    try {
      await createCity({ ...newCity, active: true });
      setNewCity({ name: "", province: "", population: 0, IsCapital: false, IsProvincialCapital: false });
      setIsAdding(false);
      pushToast({ type: "success", title: "موفق", message: "شهر جدید اضافه شد" });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در افزودن شهر" });
    }
  };

  const handleUpdate = async (id: string, active: boolean) => {
    if (!editData.name.trim()) return;
    try {
      await updateCity({ id: id as any, ...editData, active });
      setEditingId(null);
      pushToast({ type: "success", title: "موفق", message: "شهر با موفقیت ویرایش شد" });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در ویرایش شهر" });
    }
  };

  const handleSeed = async () => {
    if (!confirm("آیا از بارگذاری لیست خودکار شهرها اطمینان دارید؟ این کار شهرهای جدید را به لیست اضافه می‌کند.")) return;
    setIsSeeding(true);
    try {
      const res = await seedCities({ purge: false } as any);
      pushToast({ 
        type: "success", 
        title: "موفق", 
        message: `تعداد ${res.added} شهر جدید اضافه شد. (کل لیست: ${res.total})` 
      });
    } catch (e: any) {
      pushToast({ type: "error", title: "خطا", message: e.message || "خطا در بارگذاری لیست" });
    } finally {
      setIsSeeding(false);
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
              <p className="text-sm text-white/40 mt-0.5">مدیریت لیست {cities?.length || 0} شهر پلتفرم</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="group cursor-pointer flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
            >
              {isSeeding ? <FiLoader className="animate-spin" /> : <FiZap className="text-yellow-400 group-hover:scale-125 transition-transform" />}
              بارگذاری لیست هوشمند
            </button>
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

        {/* ── Search and Filter Controls ── */}
        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-5">
          <div className="relative flex-1 min-w-[240px]">
            <FiGlobe className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام شهر یا استان..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/40 py-2.5 pr-11 pl-4 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-slate-900/60 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/40 p-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${statusFilter === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              همه
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${statusFilter === 'active' ? 'bg-emerald-500/20 text-emerald-400 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              فعال
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${statusFilter === 'inactive' ? 'bg-amber-500/20 text-amber-400 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              غیرفعال
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/40 p-1">
            <button
              onClick={() => setCapitalFilter("all")}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-xl transition ${capitalFilter === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              همه رده‌ها
            </button>
            <button
              onClick={() => setCapitalFilter("capital")}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-xl transition ${capitalFilter === 'capital' ? 'bg-amber-500/20 text-amber-400 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              پایتخت
            </button>
            <button
              onClick={() => setCapitalFilter("provincial")}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-xl transition ${capitalFilter === 'provincial' ? 'bg-blue-500/20 text-blue-400 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              مراکز استان
            </button>
          </div>

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition cursor-pointer"
          >
            <option value="all">تمام استان‌ها</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>


      {/* ── Add New City Form ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4 rounded-3xl border border-blue-500/30 bg-blue-500/5 p-6 backdrop-blur-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 mr-2 font-bold uppercase tracking-wider">نام شهر</label>
                <div className="flex items-center rounded-xl bg-slate-900/50 px-3 py-2 border border-white/10 focus-within:border-blue-500/50 transition-colors">
                  <FiMapPin className="text-white/40 ml-2" />
                  <input
                    autoFocus
                    value={newCity.name}
                    onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                    placeholder="مثال: تهران"
                    className="bg-transparent text-white outline-none w-full text-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 mr-2 font-bold uppercase tracking-wider">استان</label>
                <div className="flex items-center rounded-xl bg-slate-900/50 px-3 py-2 border border-white/10 focus-within:border-blue-500/50 transition-colors">
                  <FiGlobe className="text-white/40 ml-2" />
                  <input
                    value={newCity.province}
                    onChange={(e) => setNewCity({ ...newCity, province: e.target.value })}
                    placeholder="مثال: تهران"
                    className="bg-transparent text-white outline-none w-full text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 mr-2 font-bold uppercase tracking-wider">جمعیت</label>
                <div className="flex items-center rounded-xl bg-slate-900/50 px-3 py-2 border border-white/10 focus-within:border-blue-500/50 transition-colors">
                  <FiUsers className="text-white/40 ml-2" />
                  <input
                    type="number"
                    value={newCity.population}
                    onChange={(e) => setNewCity({ ...newCity, population: parseInt(e.target.value) || 0 })}
                    placeholder="جمعیت"
                    className="bg-transparent text-white outline-none w-full text-sm"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newCity.IsProvincialCapital}
                    onChange={(e) => setNewCity({ ...newCity, IsProvincialCapital: e.target.checked })}
                    className="hidden"
                  />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${newCity.IsProvincialCapital ? 'bg-blue-500 border-blue-500' : 'border-white/20 group-hover:border-white/40'}`}>
                    {newCity.IsProvincialCapital && <FiCheck className="text-white text-xs" />}
                  </div>
                  <span className="text-xs text-white/60 group-hover:text-white transition-colors">مرکز استان</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newCity.IsCapital}
                    onChange={(e) => setNewCity({ ...newCity, IsCapital: e.target.checked })}
                    className="hidden"
                  />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${newCity.IsCapital ? 'bg-amber-500 border-amber-500' : 'border-white/20 group-hover:border-white/40'}`}>
                    {newCity.IsCapital && <FiCheck className="text-white text-xs" />}
                  </div>
                  <span className="text-xs text-white/60 group-hover:text-white transition-colors">پایتخت</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
              <button
                onClick={() => { setIsAdding(false); setNewCity({ name: "", province: "", population: 0, IsCapital: false, IsProvincialCapital: false }); }}
                className="rounded-xl border border-white/10 px-6 py-2 text-sm text-white/60 transition hover:bg-white/10"
              >
                انصراف
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 hover:scale-105 active:scale-95"
              >
                <FiCheck /> ثبت نهایی
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cities List ── */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-20 rounded-2xl border border-white/5 bg-white/5" />
          ))
        ) : paginatedCities?.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 border border-white/10">
              <FiSearch className="text-2xl text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-medium">شهری با این مشخصات پیدا نشد.</p>
          </div>
        ) : (
          paginatedCities?.map((city: any) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={city._id}
              className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-white/4 p-4 transition-all hover:bg-white/7 hover:border-white/10"
            >
              {editingId === city._id ? (
                // ... (existing editing UI)
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-white/40 mr-1">نام شهر</label>
                      <input
                        autoFocus
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-white outline-none border border-white/20 focus:border-blue-400/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-white/40 mr-1">استان</label>
                      <input
                        value={editData.province}
                        onChange={(e) => setEditData({ ...editData, province: e.target.value })}
                        className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-white outline-none border border-white/20 focus:border-blue-400/50"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/40 mr-1">جمعیت</label>
                    <input
                      type="number"
                      value={editData.population}
                      onChange={(e) => setEditData({ ...editData, population: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-white outline-none border border-white/20 focus:border-blue-400/50"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => setEditingId(null)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 transition">
                      <FiX />
                    </button>
                    <button onClick={() => handleUpdate(city._id, city.active)} className="rounded-lg bg-emerald-500 px-4 py-2 text-white text-xs font-bold transition hover:bg-emerald-400">
                      بروزرسانی
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base">{city.name}</span>
                        {city.IsCapital && (
                          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[8px] font-black text-amber-400 border border-amber-500/30">
                            <FiStar className="fill-current" /> پایتخت
                          </span>
                        )}
                        {city.IsProvincialCapital && !city.IsCapital && (
                          <span className="flex items-center gap-1 rounded bg-blue-500/20 px-1.5 py-0.5 text-[8px] font-black text-blue-400 border border-blue-500/30">
                            مرکز استان
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <FiGlobe className="text-[8px]" /> {city.province}
                      </span>
                    </div>
                    {city.active ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <FiActivity className="text-[10px]" />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        <FiSlash className="text-[10px]" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">جمعیت</span>
                      <span className="text-xs font-mono text-white/70">{city.population?.toLocaleString()} نفر</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                    <button
                      onClick={() => handleToggle(city._id, city.active)}
                      className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-bold transition ${city.active ? 'border-amber-500/20 text-amber-500/60 hover:bg-amber-500/10' : 'border-emerald-500/20 text-emerald-500/60 hover:bg-emerald-500/10'}`}
                    >
                      {city.active ? "غیرفعال" : "فعال"}
                    </button>
                    <button
                      onClick={() => { 
                        setEditingId(city._id); 
                        setEditData({ 
                          name: city.name, 
                          province: city.province, 
                          population: city.population,
                          IsCapital: city.IsCapital,
                          IsProvincialCapital: city.IsProvincialCapital
                        }); 
                      }}
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
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8 border-t border-white/5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="text-lg" />
          </button>
          
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-slate-900/40 border border-white/5 shadow-inner">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Show limited pages if many
              if (totalPages > 7) {
                if (
                  pageNum !== 1 && 
                  pageNum !== totalPages && 
                  (pageNum < currentPage - 1 || pageNum > currentPage + 1)
                ) {
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-white/20 pb-1">.</span>;
                  }
                  return null;
                }
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[36px] h-8 rounded-lg text-xs font-black transition-all ${currentPage === pageNum ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="text-lg" />
          </button>
        </div>
      )}
    </div>
  );
}
