export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    // Ensure relative paths start with /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${cleanUrl}`;
};
