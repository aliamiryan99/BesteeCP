"use client";

import { useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiClock,
  FiTag,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiBookOpen,
  FiExternalLink,
  FiLayers,
  FiFileText,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
  FiImage,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/api";
import { Doc, Id } from "@backend/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";

const CATEGORIES = [
  { id: "barbers", title: "مدل مو و استایل آقایان" },
  { id: "barbies", title: "زیبایی و میکاپ بانوان" },
  { id: "care", title: "مراقبت و سلامت پوست و مو" },
  { id: "guide", title: "راهنما و اخبار بستی" },
];

export default function MagAdminPage() {
  const me = useQuery(api.users.auth.me);
  const posts = useQuery(api.blog.posts.listAll);
  const createPost = useMutation(api.blog.posts.createPost);
  const updatePost = useMutation(api.blog.posts.updatePost);
  const deletePost = useMutation(api.blog.posts.deletePost);
  const togglePublish = useMutation(api.blog.posts.togglePublish);
  const seedInitialPosts = useMutation(api.blog.posts.seedInitialPosts);
  const pushToast = useToastStore((state) => state.push);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Doc<"blog_posts"> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"blog_posts"> | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "barbers",
    tags: "",
    authorName: "تحریریه بستی",
    authorRole: "متخصص استایل و زیبایی",
    readingTime: 5,
    published: true,
    featured: false,
    seoTitle: "",
    seoDescription: "",
  });

  const isCreator = me?.role === "creator";

  // Reset or initialize form
  const openNewModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "/images/mag/men-haircut-guide.jpg",
      category: "barbers",
      tags: "مشاوره مدل مو, بستی, استایل",
      authorName: "تحریریه بستی",
      authorRole: "متخصص استایل و زیبایی",
      readingTime: 5,
      published: true,
      featured: false,
      seoTitle: "",
      seoDescription: "",
    });
    setPreviewTab("write");
    setModalOpen(true);
  };

  const openEditModal = (post: Doc<"blog_posts">) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category,
      tags: (post.tags || []).join(", "),
      authorName: post.author.name,
      authorRole: post.author.role || "",
      readingTime: post.readingTime,
      published: post.published,
      featured: post.featured ?? false,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    });
    setPreviewTab("write");
    setModalOpen(true);
  };

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    const updated: any = { title: val };
    if (!editingPost) {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
        .replace(/-+/g, "-");
      updated.slug = generatedSlug;
    }
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  // Insert markdown syntax at cursor
  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.content;
    const selected = current.substring(start, end);
    const replacement = `${prefix}${selected || "متن مورد نظر"}${suffix}`;
    const newContent = current.substring(0, start) + replacement + current.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  // Submit Post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      pushToast({
        type: "error",
        title: "خطا در ورودی‌ها",
        message: "عنوان، اسلاگ و متن مقاله الزامی هستند.",
      });
      return;
    }

    const catObj = CATEGORIES.find((c) => c.id === formData.category);
    const categoryTitle = catObj ? catObj.title : "عمومی";
    const tagList = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      if (editingPost) {
        await updatePost({
          id: editingPost._id,
          slug: formData.slug.trim(),
          title: formData.title.trim(),
          excerpt: formData.excerpt.trim(),
          content: formData.content,
          coverImage: formData.coverImage.trim() || undefined,
          category: formData.category,
          categoryTitle,
          tags: tagList,
          authorName: formData.authorName.trim(),
          authorRole: formData.authorRole.trim(),
          readingTime: Number(formData.readingTime) || 5,
          published: formData.published,
          featured: formData.featured,
          seoTitle: formData.seoTitle.trim() || undefined,
          seoDescription: formData.seoDescription.trim() || undefined,
        });
        pushToast({
          type: "success",
          title: "مقاله ویرایش شد",
          message: "تغییرات مقاله با موفقیت ذخیره گردید.",
        });
      } else {
        await createPost({
          slug: formData.slug.trim(),
          title: formData.title.trim(),
          excerpt: formData.excerpt.trim(),
          content: formData.content,
          coverImage: formData.coverImage.trim() || undefined,
          category: formData.category,
          categoryTitle,
          tags: tagList,
          authorName: formData.authorName.trim(),
          authorRole: formData.authorRole.trim(),
          readingTime: Number(formData.readingTime) || 5,
          published: formData.published,
          featured: formData.featured,
          seoTitle: formData.seoTitle.trim() || undefined,
          seoDescription: formData.seoDescription.trim() || undefined,
        });
        pushToast({
          type: "success",
          title: "مقاله منتشر شد",
          message: "مقاله جدید با موفقیت به مجله بستی اضافه گردید.",
        });
      }
      setModalOpen(false);
    } catch (err: any) {
      pushToast({
        type: "error",
        title: "خطا در ذخیره‌سازی",
        message: err.message || "عملیات با خطا مواجه شد.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Post
  const handleDelete = async (id: Id<"blog_posts">) => {
    try {
      await deletePost({ id });
      pushToast({
        type: "success",
        title: "مقاله حذف شد",
        message: "مقاله با موفقیت از سیستم حذف گردید.",
      });
      setDeleteConfirmId(null);
    } catch (err: any) {
      pushToast({
        type: "error",
        title: "خطا",
        message: err.message,
      });
    }
  };

  // Seed Initial Posts
  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedInitialPosts();
      pushToast({
        type: "success",
        title: "مقالات اولیه درج شد",
        message: `${res.inserted} مقاله سئوشده اولیه با موفقیت در دیتابیس ثبت گردید.`,
      });
    } catch (err: any) {
      pushToast({
        type: "error",
        title: "خطا در ایجاد مقالات اولیه",
        message: err.message,
      });
    } finally {
      setSeeding(false);
    }
  };

  // Filtering
  const filteredPosts = ((posts as any[]) || []).filter((p: any) => {
    const matchesSearch =
      (p.title || "").includes(searchTerm) ||
      (p.slug || "").includes(searchTerm) ||
      ((p.tags as string[]) || []).some((t: string) => t.includes(searchTerm));
    const matchesCat =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (!isCreator) {
    return (
      <div className="p-10 text-center text-slate-400">
        شما دسترسی به بخش مدیریت مجله و مقالات را ندارید.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <FiBookOpen className="text-teal-400" />
            <span>مدیریت مجله تخصصی بستی (Bestiee Mag)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تولید و انتشار مقالات تخصصی سئو برای رتبه‌گیری در کلمات کلیدی زیبایی، مدل مو و نوبت‌دهی
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-teal-500/30 transition-all flex items-center gap-2"
            title="درج خودکار ۳ مقاله جامع سئو پیرامون مدل مو، ترندهای رنگ و رزرو آنلاین نوبت"
          >
            <HiOutlineSparkles className="text-teal-400" />
            <span>{seeding ? "درحال درج..." : "بارگذاری مقالات اولیه سئو"}</span>
          </button>

          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
          >
            <FiPlus size={16} />
            <span>مقاله جدید</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="جستجو در عنوان، اسلاگ یا برچسب‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiFilter className="text-slate-400 shrink-0" size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 transition-colors"
          >
            <option value="all" className="bg-slate-900">همه دسته‌بندی‌ها</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Posts Table ─── */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <th className="p-4 font-semibold">مقاله</th>
                <th className="p-4 font-semibold">دسته‌بندی</th>
                <th className="p-4 font-semibold">وضعیت</th>
                <th className="p-4 font-semibold text-center">بازدید</th>
                <th className="p-4 font-semibold">تاریخ انتشار</th>
                <th className="p-4 font-semibold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {posts === undefined ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    درحال بارگذاری مقالات...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    مقاله‌ای با این مشخصات یافت نشد. می‌توانید با دکمه «بارگذاری مقالات اولیه سئو» مقالات استاندارد را ثبت کنید.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post: any) => (
                  <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover bg-white/5 border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                            <FiFileText size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                            {post.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                ویژه
                              </span>
                            )}
                            <span className="truncate">{post.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                            /mag/{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-slate-300">
                        {post.categoryTitle}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => togglePublish({ id: post._id })}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          post.published
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-slate-500/10 border border-slate-500/30 text-slate-400 hover:bg-slate-500/20"
                        }`}
                      >
                        {post.published ? (
                          <>
                            <FiCheck size={12} />
                            <span>منتشر شده</span>
                          </>
                        ) : (
                          <>
                            <FiX size={12} />
                            <span>پیش‌نویس</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-4 text-center font-mono text-slate-300">
                      {post.views || 0}
                    </td>

                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(post.publishedAt).toLocaleDateString("fa-IR")}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`https://bestiee.ir/mag/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-teal-300 transition-colors"
                          title="مشاهده در سایت"
                        >
                          <FiExternalLink size={15} />
                        </a>

                        <button
                          onClick={() => openEditModal(post)}
                          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-blue-300 transition-colors"
                          title="ویرایش"
                        >
                          <FiEdit2 size={15} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(post._id)}
                          className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-rose-400 transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Delete Confirmation Dialog ─── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-white/15 text-center shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <FiTrash2 size={22} />
              </div>
              <h3 className="text-base font-bold text-white">حذف مقاله</h3>
              <p className="text-xs text-slate-400">
                آیا از حذف این مقاله اطمینان دارید؟ این عمل غیرقابل بازگشت است.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition-colors"
                >
                  تأیید و حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Create / Edit Post Modal ─── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-950 border border-white/15 shadow-2xl overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FiBookOpen className="text-teal-400" />
                  <span>{editingPost ? "ویرایش مقاله" : "نوشتن مقاله جدید"}</span>
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Title and Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      عنوان مقاله <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: راهنمای انتخاب مدل مو بر اساس فرم چهره"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      اسلاگ URL (انگلیسی یا فارسی) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: face-shape-haircut-guide"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono text-teal-300 focus:outline-none focus:border-teal-400 dir-ltr text-right"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    چکیده کوتاه (برای کارت‌ها و توضیحات متای گوگل) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="خلاصه‌ای جذاب در ۱ تا ۲ جمله درباره آنچه کاربر در این مقاله یاد می‌گیرد..."
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* Category, Cover Image, Reading Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">دسته‌بندی</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900">
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">تصویر شاخص (URL)</label>
                    <input
                      type="text"
                      placeholder="/images/BestieeBarber.webp یا لینک مستقیم"
                      value={formData.coverImage}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">زمان مطالعه (دقیقه)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formData.readingTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          readingTime: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Tags and Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      برچسب‌ها (با کاما جدا کنید)
                    </label>
                    <input
                      type="text"
                      placeholder="مشاوره مدل مو, ریش, آرایشگاه مردانه"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tags: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">نام نویسنده</label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, authorName: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Markdown Editor Section */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                      <FiFileText />
                      <span>متن کامل مقاله (فرمت Markdown)</span>
                    </label>

                    {/* Tabs */}
                    <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewTab("write")}
                        className={`px-3 py-1 rounded-md transition-all ${
                          previewTab === "write"
                            ? "bg-teal-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ویرایشگر
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab("preview")}
                        className={`px-3 py-1 rounded-md transition-all ${
                          previewTab === "preview"
                            ? "bg-teal-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        پیش‌نمایش
                      </button>
                    </div>
                  </div>

                  {/* Toolbar (Only visible in Write tab) */}
                  {previewTab === "write" && (
                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("## ")}
                        className="px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white font-bold"
                        title="تیتر ۲"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("### ")}
                        className="px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white font-bold"
                        title="تیتر ۳"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**")}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="ضخیم (Bold)"
                      >
                        <FiBold />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("*", "*")}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="مورب (Italic)"
                      >
                        <FiItalic />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("- ")}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="لیست"
                      >
                        <FiList />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("> ")}
                        className="px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="نقل‌قول"
                      >
                        «»
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("[متن لینک](", ")")}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="افزودن لینک"
                      >
                        <FiLink />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("![توضیح عکس](", ")")}
                        className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                        title="افزودن عکس"
                      >
                        <FiImage />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n---\n")}
                        className="px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white text-[10px]"
                        title="خط جداکننده"
                      >
                        خط جداکننده
                      </button>
                    </div>
                  )}

                  {/* Editor or Preview */}
                  {previewTab === "write" ? (
                    <textarea
                      id="content-editor"
                      rows={14}
                      required
                      placeholder="متن کامل مقاله خود را با مارک‌داون بنویسید..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, content: e.target.value }))
                      }
                      className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:border-teal-400 leading-relaxed resize-y"
                    />
                  ) : (
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-slate-300 min-h-[300px] max-h-[450px] overflow-y-auto space-y-3 prose prose-invert max-w-none">
                      <div className="font-sans whitespace-pre-wrap leading-relaxed">
                        {formData.content || "(هنوز متنی وارد نشده است)"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Flags: Published & Featured */}
                <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-white/10 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, published: e.target.checked }))
                      }
                      className="rounded bg-white/10 border-white/20 text-teal-500 focus:ring-0"
                    />
                    <span className="font-semibold">انتشار عمومی در مجله</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                      }
                      className="rounded bg-white/10 border-white/20 text-amber-500 focus:ring-0"
                    />
                    <span className="font-semibold">نمایش به عنوان مقاله ویژه (Hero)</span>
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-teal-500/20"
                  >
                    {submitting
                      ? "درحال ذخیره‌سازی..."
                      : editingPost
                      ? "ذخیره تغییرات"
                      : "انتشار مقاله"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
