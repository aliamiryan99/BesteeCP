"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@backend/api";
import {
  registerServiceWorker,
  urlBase64ToUint8Array,
  playChimeSound,
} from "@/lib/pushNotifications";
import toast from "react-hot-toast";

export const FALLBACK_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BIrWFvf24nDE_FFIzIFYNiZeWBml_Ts8ia-598FK_ZK76yI4VHwFlftzueSGRmo3TXvd0qzcGVYGCLOmnrLJuBU";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLocalSubscribed, setIsLocalSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const vapidPublicKey = useQuery(api.notifications.push.getVapidPublicKey);
  const subscriptionStatus = useQuery(api.notifications.push.getSubscriptionStatus);
  const preferences = useQuery(api.notifications.push.getPreferences);

  const saveSubscription = useMutation(api.notifications.push.saveSubscription);
  const removeSubscription = useMutation(api.notifications.push.removeSubscription);
  const updatePreferencesMutation = useMutation(api.notifications.push.updatePreferences);
  const sendTestPushAction = useAction(api.notifications.push.sendTestPush);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "Notification" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      if ("PushManager" in window) {
        registerServiceWorker().then(async (reg) => {
          if (reg) {
            setSwRegistration(reg);
            try {
              const sub = await reg.pushManager.getSubscription();
              setIsLocalSubscribed(!!sub);
            } catch (e) {
              console.warn("[CP Push] Error checking local push subscription:", e);
            }
          }
        });
      }
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error("مرورگر شما از اعلان‌های سیستمی پشتیبانی نمی‌کند.");
      return false;
    }

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        if (result === "denied") {
          toast.error("دسترسی اعلان‌ها مسدود شده است. لطفاً از تنظیمات مرورگر فعال کنید.");
        }
        setIsLoading(false);
        return false;
      }

      let reg = swRegistration;
      if (!reg) {
        reg = await registerServiceWorker();
        if (reg) setSwRegistration(reg);
      }

      if (!reg) {
        toast.error("خطا در راه‌اندازی سرویس‌ورکر.");
        setIsLoading(false);
        return false;
      }

      const activeKey = vapidPublicKey || FALLBACK_VAPID_PUBLIC_KEY;
      const convertedKey = urlBase64ToUint8Array(activeKey);
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as any,
        });
      }

      const rawKey = sub.getKey ? sub.getKey("p256dh") : null;
      const rawAuth = sub.getKey ? sub.getKey("auth") : null;

      const p256dh = rawKey
        ? btoa(String.fromCharCode(...new Uint8Array(rawKey)))
        : "";
      const auth = rawAuth
        ? btoa(String.fromCharCode(...new Uint8Array(rawAuth)))
        : "";

      await saveSubscription({
        endpoint: sub.endpoint,
        keys: { p256dh, auth },
        userAgent: navigator.userAgent,
        device: navigator.userAgent.includes("Mobile") ? "گوشی موبایل" : "سیستم دسکتاپ",
      });

      setIsLocalSubscribed(true);
      playChimeSound();
      toast.success("اعلان‌های مرورگر با موفقیت فعال شدند!");
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("[CP Push] Subscribe error:", err);
      toast.error("خطا در فعال‌سازی اعلان‌ها: " + (err.message || ""));
      setIsLoading(false);
      return false;
    }
  }, [isSupported, vapidPublicKey, swRegistration, saveSubscription]);

  const unsubscribe = useCallback(async () => {
    if (!swRegistration) return false;
    setIsLoading(true);

    try {
      const sub = await swRegistration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await removeSubscription({ endpoint: sub.endpoint });
      }
      setIsLocalSubscribed(false);
      toast.success("اعلان‌های مرورگر غیرفعال شدند.");
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("[CP Push] Unsubscribe error:", err);
      setIsLoading(false);
      return false;
    }
  }, [swRegistration, removeSubscription]);

  const updatePreferences = useCallback(
    async (newPrefs: {
      pushEnabled: boolean;
      soundEnabled: boolean;
      categories?: {
        bookings?: boolean;
        cancellations?: boolean;
        comments?: boolean;
        vacations?: boolean;
        support?: boolean;
        system?: boolean;
      };
    }) => {
      try {
        await updatePreferencesMutation(newPrefs);
        toast.success("تنظیمات اعلان‌ها به‌روزرسانی شد.");
      } catch (err: any) {
        toast.error("خطا در ذخیره تنظیمات: " + (err.message || ""));
      }
    },
    [updatePreferencesMutation]
  );

  const sendTest = useCallback(async () => {
    setIsLoading(true);
    try {
      playChimeSound();
      await sendTestPushAction({
        title: "🔔 بستی CP: اعلان آزمایشی",
        message: "اعلان‌های پنل مدیریت با موفقیت متصل هستند!",
      });
      toast.success("اعلان آزمایشی ارسال شد!");
    } catch (err: any) {
      console.error("[CP Push] Test push error:", err);
      toast.error("خطا در ارسال اعلان آزمایشی: " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  }, [sendTestPushAction]);

  return {
    isSupported,
    permission,
    isSubscribed: isLocalSubscribed || (subscriptionStatus?.isSubscribed ?? false),
    isLocalSubscribed,
    isLoading,
    preferences: preferences ?? {
      pushEnabled: true,
      soundEnabled: true,
      categories: {
        bookings: true,
        cancellations: true,
        comments: true,
        vacations: true,
        support: true,
        system: true,
      },
    },
    subscribe,
    requestPermission: subscribe,
    unsubscribe,
    updatePreferences,
    sendTest,
  };
}
