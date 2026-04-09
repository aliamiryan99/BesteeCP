/**
 * Sanitizes error messages from the backend (specifically Convex server errors)
 * to prevent technical implementation details from being shown to the user.
 */
export function sanitizeError(error: any): string {
    if (!error) return "مشکلی پیش آمد. لطفا دوباره تلاش کنید.";

    // 1. Check for ConvexError data (this is the cleanest way)
    if (error.data && typeof error.data === "string") {
        return error.data;
    }
    
    let message = typeof error === "string" ? error : error.message || "مشکلی پیش آمد.";

    // Remove the "Uncaught Error: " prefix often added by Convex
    message = message.replace(/^Uncaught Error:\s*/, "");
    
    // Check if the message contains Persian characters.
    const persianRegex = /[\u0600-\u06FF]+/;
    const hasPersian = persianRegex.test(message);

    if (hasPersian) {
        // Find the first part that contains Persian, splitting by common technical markers
        const parts = message.split(/:\s*Server Error|Server Error\s*|\[CONVEX[^\]]*\]\s*|Called by client(\s*\([^)]+\))?\s*\.?|Error:\s*/i);
        const persianPart = parts.find((p: string) => persianRegex.test(p));
        if (persianPart) {
            return persianPart.trim().replace(/\s+$/, ""); // Trim and clean trailing spaces
        }
    }

    // Fallback logic for technical markers if no clean Persian text found
    if (message.includes("Server Error") || message.includes("[CONVEX]")) {
        return "خطایی در سیستم رخ داد. لطفا بعدا تلاش کنید.";
    }

    return message;
}
