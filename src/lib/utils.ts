/**
 * Sanitizes error messages from the backend (specifically Convex server errors)
 * to show meaningful, clean messages to the user without technical stack traces.
 */
export function sanitizeError(error: any): string {
    if (!error) return "مشکلی پیش آمد. لطفا دوباره تلاش کنید.";

    // 1. Check for ConvexError data (Convex passes application errors directly in data)
    if (error.data) {
        if (typeof error.data === "string") {
            return error.data;
        }
        if (typeof error.data === "object") {
            if (typeof error.data.message === "string") return error.data.message;
            if (typeof error.data.error === "string") return error.data.error;
        }
    }
    
    const rawMessage = typeof error === "string" ? error : error.message || "";
    if (!rawMessage) return "مشکلی پیش آمد. لطفا دوباره تلاش کنید.";

    // 2. Check if message contains 'Uncaught Error: ...'
    const uncaughtMatch = rawMessage.match(/Uncaught Error:\s*([^\n\r]+)/);
    if (uncaughtMatch && uncaughtMatch[1]) {
        const extracted = uncaughtMatch[1].trim();
        if (extracted) return extracted;
    }

    // 3. Extract any line containing Persian characters (stripping stack traces and technical markers)
    const persianRegex = /[\u0600-\u06FF]+/;
    const lines = rawMessage.split(/[\r\n]+/);
    for (const line of lines) {
        // Skip stack trace lines (e.g. 'at handler (convex/...)')
        if (/^\s*at\s+/i.test(line)) continue;
        if (persianRegex.test(line)) {
            const cleaned = line
                .replace(/^(\[[^\]]*\]|\s|Error:|Uncaught Error:)+/i, "")
                .trim();
            if (persianRegex.test(cleaned)) {
                return cleaned;
            }
        }
    }

    // 4. Map standard English/Convex error keys to friendly Persian messages
    const lowerMsg = rawMessage.toLowerCase();
    if (lowerMsg.includes("unauthenticated") || lowerMsg.includes("not logged in")) {
        return "برای انجام این عملیات ابتدا باید وارد حساب کاربری خود شوید.";
    }
    if (lowerMsg.includes("unauthorized") || lowerMsg.includes("forbidden")) {
        return "شما دسترسی لازم برای انجام این عملیات را ندارید.";
    }
    if (lowerMsg.includes("user not found") || lowerMsg.includes("could not find user")) {
        return "کاربر مورد نظر یافت نشد.";
    }
    if (lowerMsg.includes("already taken") || lowerMsg.includes("already exists")) {
        return "این شناسه یا اطلاعات قبلاً در سیستم ثبت شده است.";
    }
    if (lowerMsg.includes("plan limit reached") || lowerMsg.includes("staff limit")) {
        return "محدودیت طرح اشتراک: به حداکثر تعداد مجاز اعضای تیم رسیده‌اید.";
    }
    if (lowerMsg.includes("failed to fetch") || lowerMsg.includes("network error") || lowerMsg.includes("fetch failed")) {
        return "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
    }

    // 5. Fallback for internal technical server crashes
    if (rawMessage.includes("Server Error") || rawMessage.includes("[CONVEX")) {
        return "خطایی در سیستم رخ داد. لطفا بعدا تلاش کنید.";
    }

    return rawMessage;
}
