"use client";

import { useState } from "react";
import { FiArrowRight, FiPlus, FiTrash2, FiClock, FiFileText, FiTag, FiAlertCircle, FiBell } from "react-icons/fi";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/api";
import { Doc, Id } from "@backend/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";

export default function AnnouncementsPage() {
  const me = useQuery(api.users.auth.me);
  const announcements = useQuery(api.announcements.announcements.list);
  const createAnnouncement = useMutation(api.announcements.announcements.create);
  const removeAnnouncement = useMutation(api.announcements.announcements.remove);
  const pushToast = useToastStore((state) => state.push);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"announcements"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreator = me?.role === "creator";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await createAnnouncement({ title, content });
      setTitle("");
      setContent("");
      setIsAdding(false);
      pushToast({
        type: "success",
        title: "اطلاعیه ثبت شد",
        message: "اطلاعیه جدید با موفقیت منتشر گردید.",
      });
    } catch (error) {
      console.error("Failed to add announcement", error);
      pushToast({
        type: "error",
        title: "خطا",
        message: "مشکلی در ثبت اطلاعیه به وجود آمد.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await removeAnnouncement({ announcementId: deleteId });
      setDeleteId(null);
      pushToast({
        type: "success",
        title: "اطلاعیه حذف شد",
        message: "اطلاعیه مورد نظر با موفقیت از سیستم حذف شد.",
      });
    } catch (error) {
      console.error("Failed to remove announcement", error);
      pushToast({
        type: "error",
        title: "خطا",
        message: "حذف اطلاعیه با خطا مواجه شد.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " روز پیش";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ساعت پیش";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " دقیقه پیش";
    return "همین الان";
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ── Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white transition hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            <FiArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight md:text-3xl">اطلاعیه‌ها</h1>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">آخرین اخبار و بروزرسانی‌ها</p>
          </div>
        </div>
        
        {isCreator && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-lg ${
              isAdding 
                ? "bg-white/5 text-white/60 border border-white/10" 
                : "bg-gradient-to-l from-orange-500 to-rose-500 text-white shadow-orange-500/20"
            }`}
          >
            {isAdding ? <FiArrowRight className="rotate-180" /> : <FiPlus />}
            {isAdding ? "انصراف" : "افزودن اطلاعیه"}
          </button>
        )}
      </div>

      {/* ── Add Form Section ── */}
      <AnimatePresence>
        {isAdding && isCreator && (
          <motion.form 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            onSubmit={handleAdd} 
            className="glass-panel overflow-hidden relative flex flex-col gap-6 rounded-[2rem] border border-orange-500/20 bg-slate-900/60 p-6 md:p-8 shadow-2xl"
          >
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-orange-500 to-rose-500 opacity-50" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/10">
                <FiTag />
              </div>
              <h2 className="text-xl font-bold text-white">ثبت اطلاعیه جدید</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/50 px-1">عنوان موضوع</label>
                <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-orange-500/50 focus-within:bg-white/10">
                  <FiFileText className="text-white/30 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    placeholder="مثلا: بروزرسانی سیستم..."
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-white/50 px-1">متن کامل اطلاعیه</label>
                <div className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-orange-500/50 focus-within:bg-white/10">
                  <FiAlertCircle className="mt-1 text-white/30 group-focus-within:text-orange-400 transition-colors" />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[140px] w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20 leading-relaxed resize-none"
                    placeholder="جزئیات و توضیحات را وارد کنید..."
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative self-end flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  ثبت و انتشار
                  <FiPlus className="transition-transform group-hover:rotate-90 duration-300" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── List Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
        {announcements === undefined ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="glass-panel h-48 rounded-[2rem] border border-white/5 bg-slate-900/30 animate-pulse" />
          ))
        ) : announcements.length === 0 ? (
          <div className="glass-panel col-span-full flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-slate-900/50 p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-white/20 mb-4 border border-white/5">
              <FiBell className="h-8 w-8" />
            </div>
            <p className="text-white/40 font-bold">هنوز هیچ اطلاعیه‌ای ثبت نشده است.</p>
          </div>
        ) : (
          announcements.map((announcement: Doc<"announcements">) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={announcement._id} 
              className="glass-panel group relative flex flex-col gap-4 rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 md:p-8 shadow-2xl transition-all hover:border-white/20 active:scale-[0.995]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/10 shrink-0">
                    <FiBell className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{announcement.title}</h2>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-[10px] font-black text-white/40 uppercase tracking-tighter shrink-0">
                  <FiClock className="h-3 w-3" />
                  {timeSince(announcement._creationTime)}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 right-0 h-full w-1 bg-white/5 rounded-full" />
                <p className="text-sm md:text-base text-white/60 leading-relaxed pr-6 whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>

              {isCreator && (
                <button
                  onClick={() => setDeleteId(announcement._id)}
                  className="mt-4 sm:absolute sm:mt-0 sm:bottom-6 sm:left-6 flex items-center justify-center rounded-xl bg-red-500/10 p-3 text-red-500 border border-red-500/10 opacity-60 hover:opacity-100 hover:bg-red-500 hover:text-white transition-all transform active:scale-95 cursor-pointer shadow-lg sm:opacity-0 sm:group-hover:opacity-100"
                  title="حذف اطلاعیه"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="flex w-full max-w-sm flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-slate-950 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-red-500/10 text-red-500 border border-red-500/10 mx-auto">
                <FiTrash2 className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-white">حذف اطلاعیه</h3>
                <p className="text-sm text-white/40 mt-3 leading-relaxed">
                  آیا از حذف این اطلاعیه اطمینان دارید؟ این عمل قابل بازگشت نیست.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-2xl bg-white/5 py-4 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmRemove}
                  className="flex-1 rounded-2xl bg-red-500 py-4 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "حذف دائمی"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
