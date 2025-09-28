import { type NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory-service"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const productId = searchParams.get("productId")
    const variantId = searchParams.get("variantId")

    switch (action) {
      case "low-stock":
        const lowStockItems = await InventoryService.getLowStockItems()
        return NextResponse.json({ lowStockItems })

      case "product-summary":
        if (!productId) {
          return NextResponse.json({ error: "Product ID required" }, { status: 400 })
        }
        const summary = await InventoryService.getProductStockSummary(Number.parseInt(productId))
        return NextResponse.json(summary)

      case "history":
        if (!variantId) {
          return NextResponse.json({ error: "Variant ID required" }, { status: 400 })
        }
        const limit = Number.parseInt(searchParams.get("limit") || "50")
        const history = await InventoryService.getInventoryHistory(variantId, limit)
        return NextResponse.json({ history })

      case "check-stock":
        if (!variantId) {
          return NextResponse.json({ error: "Variant ID required" }, { status: 400 })
        }
        const quantity = Number.parseInt(searchParams.get("quantity") || "1")
        const available = await InventoryService.checkStock(variantId, quantity)
        return NextResponse.json({ available, variantId, requestedQuantity: quantity })

      default:
        // Get all inventory data
        const db = await getDatabase()
        const variants = await db.collection("product_variants").find({ isActive: true }).toArray()
        return NextResponse.json({ variants })
    }
  } catch (error) {
    console.error("Inventory API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, variantId, quantity, reason, performedBy = "admin" } = body

    switch (action) {
      case "add-stock":
        const addResult = await InventoryService.addStock(variantId, quantity, reason, performedBy)
        return NextResponse.json({ success: addResult })

      case "adjust-stock":
        const adjustResult = await InventoryService.adjustStock(variantId, quantity, reason, performedBy)
        return NextResponse.json({ success: adjustResult })

      case "reserve-stock":
        const { orderId } = body
        if (!orderId) {
          return NextResponse.json({ error: "Order ID required for reservation" }, { status: 400 })
        }
        const reserveResult = await InventoryService.reserveStock(variantId, quantity, orderId)
        return NextResponse.json({ success: reserveResult })

      case "release-stock":
        const { orderId: releaseOrderId } = body
        if (!releaseOrderId) {
          return NextResponse.json({ error: "Order ID required for release" }, { status: 400 })
        }
        const releaseResult = await InventoryService.releaseReservedStock(variantId, quantity, releaseOrderId)
        return NextResponse.json({ success: releaseResult })

      case "confirm-sale":
        const { orderId: saleOrderId } = body
        if (!saleOrderId) {
          return NextResponse.json({ error: "Order ID required for sale confirmation" }, { status: 400 })
        }
        const saleResult = await InventoryService.confirmSale(variantId, quantity, saleOrderId)
        return NextResponse.json({ success: saleResult })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Inventory POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
