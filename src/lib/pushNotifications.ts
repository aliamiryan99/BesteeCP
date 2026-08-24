/**
 * Converts a base64 URL-safe string to a Uint8Array (required for applicationServerKey).
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker for push notifications in BestieeCP.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (error) {
    console.error("[CP Push] Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Plays a modern crystal chime synthesized via the Web Audio API.
 */
export function playChimeSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First Tone: F5 (698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(698.46, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second Tone: A5 (880 Hz) harmonic chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.08);

    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.65);
  } catch (err) {
    // Silent fail if audio context blocked by browser autoplay policy
  }
}

/**
 * Displays a local browser system notification if tab is in background.
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions & { url?: string }
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const defaultOptions: any = {
    icon: "/BestieeMiniLogoBlue.png",
    badge: "/BestieeMiniLogoBlue.png",
    vibrate: [200, 100, 200],
    dir: "rtl",
    lang: "fa-IR",
    ...options,
  };

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return;
      }
    }

    // Fallback to Window Notification constructor
    const notif = new Notification(title, defaultOptions);
    if (options?.url) {
      notif.onclick = () => {
        window.focus();
        if (options.url && options.url !== "/") {
          window.location.href = options.url;
        }
      };
    }
  } catch (err) {
    console.warn("[CP Push] Could not display local notification:", err);
  }
}
