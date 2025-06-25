const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }
    return response.json()
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Registration failed")
    }
    return response.json()
  },

  logout: async () => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
    })
    return response.json()
  },

  // Products
  getProducts: async (params?: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(`${API_BASE}/products?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    return response.json()
  },

  getProduct: async (id: string) => {
    const response = await fetch(`${API_BASE}/products/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch product")
    }
    return response.json()
  },

  createProduct: async (product: any) => {
    const response = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create product")
    }
    return response.json()
  },

  updateProduct: async (id: string, product: any) => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update product")
    }
    return response.json()
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete product")
    }
    return response.json()
  },

  // Orders
  getOrders: async () => {
    const response = await fetch(`${API_BASE}/orders`)
    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }
    return response.json()
  },

  getOrder: async (id: string) => {
    const response = await fetch(`${API_BASE}/orders/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch order")
    }
    return response.json()
  },

  createOrder: async (order: any) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create order")
    }
    return response.json()
  },

  updateOrder: async (id: string, order: any) => {
    const response = await fetch(`${API_BASE}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update order")
    }
    return response.json()
  },

  // Payment
  createPaymentIntent: async (amount: number) => {
    const response = await fetch(`${API_BASE}/payment/create-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
    if (!response.ok) {
      throw new Error("Failed to create payment intent")
    }
    return response.json()
  },

  // Categories
  getCategories: async () => {
    return [
      { id: "premium", name: "Premium", count: 1 },
      { id: "standard", name: "Standard", count: 1 },
      { id: "lite", name: "Lite", count: 1 },
      { id: "gaming", name: "Gaming", count: 1 },
      { id: "business", name: "Business", count: 1 },
    ]
  },
}
