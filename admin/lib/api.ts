const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('grainzz_admin_token') || '';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (res.status === 401) {
    localStorage.removeItem('grainzz_admin_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function requestForm<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Auth
export const adminLogin = (email: string, password: string) =>
  request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// Products
export const getProducts = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<any>(`/products/admin/all${qs}`);
};
export const createProduct = (formData: FormData) => requestForm<any>('/products', formData);
export const updateProduct = (id: string, formData: FormData) => requestForm<any>(`/products/${id}`, formData, 'PUT');
export const deleteProduct = (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' });

// Orders
export const getOrders = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<any>(`/orders${qs}`);
};
export const getOrderStats = () => request<any>('/orders/admin/stats');
export const updateOrder = (id: string, data: any) =>
  request<any>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Coupons
export const getCoupons = () => request<any>('/coupons');
export const createCoupon = (data: any) => request<any>('/coupons', { method: 'POST', body: JSON.stringify(data) });
export const deleteCoupon = (id: string) => request<any>(`/coupons/${id}`, { method: 'DELETE' });

// Offers
export const getOffers = () => request<any>('/offers');
export const createOffer = (data: any) => request<any>('/offers', { method: 'POST', body: JSON.stringify(data) });
export const deleteOffer = (id: string) => request<any>(`/offers/${id}`, { method: 'DELETE' });
