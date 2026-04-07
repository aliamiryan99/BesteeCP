"use client";

import { useState } from "react";
import { FiArrowRight, FiPlus, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/api";
import { Doc, Id } from "@backend/dataModel";

export default function AnnouncementsPage() {
  const me = useQuery(api.users.auth.me);
  const announcements = useQuery(api.announcements.list);
  const createAnnouncement = useMutation(api.announcements.create);
  const removeAnnouncement = useMutation(api.announcements.remove);

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
    } catch (error) {
      console.error("Failed to add announcement", error);
      alert("خطا در ثبت اطلاعیه");
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
    } catch (error) {
      console.error("Failed to remove announcement", error);
      alert("خطا در حذف اطلاعیه");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for formatting relative time
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10 text-white">
            <FiArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">همه اطلاعیه‌ها</h1>
        </div>
        {isCreator && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 rounded-xl bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/30 transition-colors cursor-pointer"
          >
            <FiPlus />
            {isAdding ? "انصراف" : "افزودن اطلاعیه"}
          </button>
        )}
      </div>

      {isAdding && isCreator && (
        <form onSubmit={handleAdd} className="glass-panel flex flex-col gap-4 rounded-2xl border border-orange-500/30 bg-slate-800/80 p-6">
          <h2 className="text-lg font-bold text-white mb-2">اطلاعیه جدید</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">عنوان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-orange-500/50 focus:bg-white/10 transition-colors"
              placeholder="مثلا: بروزرسانی سیستم..."
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-300">متن اطلاعیه</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-orange-500/50 focus:bg-white/10 transition-colors resize-y"
              placeholder="متن کامل اطلاعیه..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 self-end rounded-xl bg-orange-500 px-6 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ثبت اطلاعیه"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {announcements === undefined ? (
          <div className="glass-panel flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 p-12">
            <p className="text-white/50 animate-pulse">در حال دریافت اطلاعیه‌ها...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="glass-panel flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 p-12">
            <p className="text-white/50">هنوز هیچ اطلاعیه‌ای ثبت نشده است.</p>
          </div>
        ) : (
          announcements.map((announcement: Doc<"announcements">) => (
            <div key={announcement._id} className="glass-panel group flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{announcement.title}</h2>
                <span className="text-sm text-muted-soft">{timeSince(announcement._creationTime)}</span>
              </div>
              <p className="text-sm text-muted-soft leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </p>
              {isCreator && (
                <button
                  onClick={() => setDeleteId(announcement._id)}
                  className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg bg-red-500/20 p-2 text-red-400 leading-none hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 cursor-pointer"
                  title="حذف اطلاعیه"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">حذف اطلاعیه</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              آیا از حذف این اطلاعیه کاملاً اطمینان دارید؟ این عمل غیرقابل بازگشت است و این اطلاعیه برای همه کاربران پاک خواهد شد.
            </p>
            <div className="flex w-full gap-3 mt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmRemove}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "در حال حذف..." : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
