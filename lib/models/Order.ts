import type { ObjectId } from "mongodb"

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

export interface ShippingInfo {
  name: string
  phone: string
  email: string
  address: string
}

export interface Order {
  _id?: ObjectId
  userId: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "cod" | "stripe" | "bank" | "momo"
  paymentStatus: "pending" | "paid" | "failed"
  stripePaymentIntentId?: string
  shippingInfo: ShippingInfo
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderResponse {
  id: string
  userId: string
  items: Array<{
    product: {
      id: string
      name: string
      image: string
      price: number
    }
    quantity: number
  }>
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "cod" | "stripe" | "bank" | "momo"
  paymentStatus: "pending" | "paid" | "failed"
  shippingInfo: ShippingInfo
  notes?: string
  createdAt: string
  updatedAt: string
}

export function transformOrder(order: Order): OrderResponse {
  return {
    id: order._id?.toString() || "",
    userId: order.userId,
    items: order.items.map((item) => ({
      product: {
        id: item.productId,
        name: item.productName,
        image: item.productImage,
        price: item.price,
      },
      quantity: item.quantity,
    })),
    total: order.total,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shippingInfo: order.shippingInfo,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
