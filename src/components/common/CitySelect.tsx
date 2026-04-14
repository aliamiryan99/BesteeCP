"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@backend/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiSearch, FiChevronDown, FiCheck, FiStar } from "react-icons/fi";

interface CitySelectProps {
  label: string;
  icon?: React.ReactNode;
  value?: string; // cityId
  onChange: (cityId: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export default function CitySelect({
  label,
  icon = <FiMapPin />,
  value,
  onChange,
  error,
  placeholder = "انتخاب شهر...",
  required = false,
}: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const cities = useQuery(api.cities.listActive);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCity = useMemo(() => {
    if (!cities || !value) return null;
    return cities.find((c: any) => c._id === value);
  }, [cities, value]);

  const filteredCities = useMemo(() => {
    if (!cities) return [];
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c: any) =>
        c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    );
  }, [cities, search]);

  const groupedCities = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredCities.forEach((city: any) => {
      if (!groups[city.province]) groups[city.province] = [];
      groups[city.province].push(city);
    });
    return groups;
  }, [filteredCities]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-white/50">
        {icon}
        {label}
        {required && <span className="text-rose-400 font-black mr-0.5">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
          isOpen
            ? "border-amber-500/50 bg-white/10 ring-2 ring-amber-500/10"
            : error
            ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedCity ? (
            <>
              <span className="font-bold text-white truncate">{selectedCity.name}</span>
              <span className="text-[10px] text-white/40 truncate">({selectedCity.province})</span>
            </>
          ) : (
            <span className="text-white/20">{placeholder}</span>
          )}
        </div>
        <FiChevronDown
          className={`text-white/30 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-amber-400" : "group-hover:text-white/50"
          }`}
        />
      </button>

      {error && <p className="mt-1.5 text-[11px] font-medium text-rose-400 px-1">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] mt-1 w-full overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl"
            style={{ maxHeight: "350px" }}
          >
            {/* Search Input */}
            <div className="sticky top-0 z-10 mb-2 px-1">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-within:border-amber-500/30">
                <FiSearch className="text-white/20" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجوی شهر یا استان..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* List */}
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 max-h-[260px] overflow-y-auto px-1 space-y-4 pb-2">
              {!cities ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/20">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40 mb-2" />
                  <span className="text-[10px] font-bold">در حال بارگذاری...</span>
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/20">
                  <FiMapPin className="text-2xl mb-2" />
                  <span className="text-[10px] font-bold">شهری پیدا نشد</span>
                </div>
              ) : (
                Object.entries(groupedCities).map(([province, provinceCities]) => (
                  <div key={province} className="space-y-1">
                    <div className="sticky top-0 bg-slate-900/95 px-2 py-1 text-[10px] font-black text-amber-400/60 uppercase tracking-widest">
                      {province}
                    </div>
                    {provinceCities.map((city: any) => (
                      <button
                        key={city._id}
                        type="button"
                        onClick={() => {
                          onChange(city._id);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition-all ${
                          value === city._id
                            ? "bg-amber-500/20 text-amber-200"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{city.name}</span>
                          {city.IsCapital && (
                            <span className="flex items-center gap-0.5 rounded-lg bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-black text-orange-400 border border-orange-500/20">
                              <FiStar className="text-[8px] fill-current" />
                              پایتخت
                            </span>
                          )}
                          {city.IsProvincialCapital && !city.IsCapital && (
                            <span className="rounded-lg bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-black text-blue-400 border border-blue-500/20">
                              مرکز استان
                            </span>
                          )}
                        </div>
                        {value === city._id && <FiCheck className="text-amber-400" />}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
