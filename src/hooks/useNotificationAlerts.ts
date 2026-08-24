"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@backend/api";
import { playChimeSound, showLocalNotification } from "@/lib/pushNotifications";

export function useNotificationAlerts() {
  const notifData = useQuery(api.notifications.notifications.getMyNotifications);
  const preferences = useQuery(api.notifications.push.getPreferences);

  const prevTotalUnreadRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!notifData) return;

    const currentTotalUnread = notifData.totalUnread || 0;

    if (isInitialLoadRef.current) {
      prevTotalUnreadRef.current = currentTotalUnread;
      isInitialLoadRef.current = false;
      return;
    }

    if (prevTotalUnreadRef.current !== null && currentTotalUnread > prevTotalUnreadRef.current) {
      const soundEnabled = preferences?.soundEnabled ?? true;

      // Play synthesized chime
      if (soundEnabled) {
        playChimeSound();
      }

      // If document hidden, trigger local system notification
      if (typeof document !== "undefined" && document.hidden) {
        showLocalNotification("🔔 اعلان جدید در پنل مدیریت", {
          body: `شما ${currentTotalUnread} اعلان خوانده‌نشده جدید دارید.`,
          url: "/",
          tag: "bestiee-cp-alert",
        });
      }
    }

    prevTotalUnreadRef.current = currentTotalUnread;
  }, [notifData, preferences]);
}
