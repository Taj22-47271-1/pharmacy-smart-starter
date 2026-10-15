const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Medicine {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  unitPrice: number | string;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
  supplierId: string | null;
  supplier?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  _count?: {
    medicines: number;
  };
}

export interface DashboardStats {
  totalMedicines: number;
  lowStockItems: number;
  totalSuppliers: number;
  totalStockValue: number;
}

export interface ReorderRecommendation {
  medicineId: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  reason: string;
  suggestedReorderQuantity: number;
  unitPrice: number;
  estimatedCost: number;
  supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface ReorderResponse {
  generatedAt: string;
  ruleExplanation: string;
  itemsCount: number;
  totalEstimatedCost: number;
  recommendations: ReorderRecommendation[];
}

export interface StockMovement {
  id: string;
  medicineId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  note: string | null;
  createdAt: string;
  medicine?: {
    id: string;
    name: string;
    sku: string;
  };
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pharmly_token');
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `API Error ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.message) {
        errorMessage = Array.isArray(errJson.message)
          ? errJson.message.join(', ')
          : errJson.message;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { name: string; email: string; password: string; role?: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<AuthUser>('/auth/me'),

  // Medicines
  getStats: () => request<DashboardStats>('/medicines/stats'),

  getMedicines: (search?: string, lowStock?: boolean) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (lowStock) params.append('lowStock', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Medicine[]>(`/medicines${query}`);
  },

  createMedicine: (data: Partial<Medicine>) =>
    request<Medicine>('/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMedicine: (id: string, data: Partial<Medicine>) =>
    request<Medicine>(`/medicines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMedicine: (id: string) =>
    request<void>(`/medicines/${id}`, {
      method: 'DELETE',
    }),

  // Suppliers
  getSuppliers: () => request<Supplier[]>('/suppliers'),

  createSupplier: (data: { name: string; email?: string; phone?: string }) =>
    request<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stock Movements
  createStockMovement: (data: {
    medicineId: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    note?: string;
  }) =>
    request<{ movement: StockMovement; medicine: Medicine }>(
      '/stock-movements',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),

  getStockMovements: (medicineId?: string) => {
    const query = medicineId ? `?medicineId=${medicineId}` : '';
    return request<StockMovement[]>(`/stock-movements${query}`);
  },

  // Recommendations
  getRecommendations: () => request<ReorderResponse>('/recommendations/reorder'),

  checkHealth: () => request<{ status: string }>('/health'),
};
