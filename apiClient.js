export const apiClient = async (endpoint, options = {}) => {
    const token = localStorage.getItem('jwt');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwt');
            window.location.reload();
        }
        const errorText = await response.text();
        throw new Error(errorText || 'API Error');
    }

    if (response.status === 204) return null; // No content
    return response.json();
};
