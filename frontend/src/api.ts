import type { Order, Product, Session } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || data.non_field_errors?.[0] || JSON.stringify(data);
    throw new Error(detail || "Request failed");
  }
  return data as T;
}

export function register(payload: Record<string, unknown>) {
  return request<Session>("/auth/register/", { method: "POST", body: JSON.stringify(payload) });
}

export function login(payload: Record<string, unknown>) {
  return request<Session>("/auth/login/", { method: "POST", body: JSON.stringify(payload) });
}

export function listProducts(params: URLSearchParams, token?: string) {
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<Product[]>(`/products/${suffix}`, {}, token);
}

export function saveProduct(formData: FormData, token: string, id?: number) {
  return request<Product>(`/products/${id ? `${id}/` : ""}`, {
    method: id ? "PATCH" : "POST",
    body: formData
  }, token);
}

export function deleteProduct(id: number, token: string) {
  return request<void>(`/products/${id}/`, { method: "DELETE" }, token);
}

export function checkout(items: { product_id: number; quantity: number }[], token: string) {
  return request<Order>("/orders/", { method: "POST", body: JSON.stringify({ items }) }, token);
}

export function listOrders(token: string) {
  return request<Order[]>("/orders/", {}, token);
}
