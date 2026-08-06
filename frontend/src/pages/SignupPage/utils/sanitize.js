
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/onload=/gi, '')
        .replace(/onerror=/gi, '')
        .trim();
};