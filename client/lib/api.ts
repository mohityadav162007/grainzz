const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Products
export const getProducts = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<any>(`/products${qs}`);
};
export const getProductBySlug = (slug: string) => request<any>(`/products/${slug}`);

// Orders
export const createOrder = (body: any) =>
  request<any>('/orders', { method: 'POST', body: JSON.stringify(body) });
export const getOrderById = (id: string) => request<any>(`/orders/${id}`);

// Coupons
export const applyCoupon = (code: string, orderTotal: number) =>
  request<any>('/coupons/apply', { method: 'POST', body: JSON.stringify({ code, orderTotal }) });

// Payment
export const initiatePayment = (body: { orderId: string; amount: number; userPhone: string }) =>
  request<any>('/payment/initiate', { method: 'POST', body: JSON.stringify(body) });
export const checkPaymentStatus = (merchantTransactionId: string) =>
  request<any>(`/payment/status/${merchantTransactionId}`);
