export const apiClient = async (endpoint, options = {}) => {
    const token = localStorage.getItem('jwt');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
            ...options,
            headers,
        });
    } catch (networkError) {
        // Network failure (backend down, CORS preflight blocked, etc.)
        // Do NOT log the user out — just surface the error
        throw new Error('Network error: could not reach the server.');
    }

    if (!response.ok) {
        // 401 = token is invalid or expired → force logout
        if (response.status === 401) {
            localStorage.removeItem('jwt');
            window.location.reload();
            return;
        }
        // 403 = token is valid but user lacks permission for this resource
        // Do NOT log out — just throw so the caller can handle it
        const errorText = await response.text();
        throw new Error(errorText || `Request failed (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
};
