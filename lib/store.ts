import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  specifications: Record<string, string>
  reviews: Review[]
}

export interface Review {
  id: string
  user: string
  rating: number
  comment: string
  date: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered"
  createdAt: string
  shippingInfo: {
    name: string
    phone: string
    address: string
    email: string
  }
}

interface AppState {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number

  // User
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: () => boolean

  // Orders
  orders: Order[]
  addOrder: (order: Order) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart state
      cart: [],
      addToCart: (product) => {
        const cart = get().cart
        const existingItem = cart.find((item) => item.product.id === product.id)

        if (existingItem) {
          set({
            cart: cart.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            ),
          })
        } else {
          set({ cart: [...cart, { product, quantity: 1 }] })
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        set({
          cart: get().cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        })
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },
      getCartItemsCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0)
      },

      // User state
      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: () => get().user !== null,

      // Orders state
      orders: [],
      addOrder: (order) => set({ orders: [...get().orders, order] }),
    }),
    {
      name: "nexuskit-store",
    },
  ),
)
