"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, RotateCcw, History, Search } from "lucide-react"
import toast from "react-hot-toast"

interface InventoryItem {
  variantId: string
  productId: number
  name: string
  sku: string
  stock: number
  availableStock: number
  reservedStock: number
  lowStockThreshold: number
  isActive: boolean
  price: number
}

interface InventoryLog {
  _id: string
  variantId: string
  type: string
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  performedBy: string
  createdAt: string
}

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [inventoryHistory, setInventoryHistory] = useState<InventoryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Stock adjustment form
  const [adjustmentForm, setAdjustmentForm] = useState({
    variantId: "",
    quantity: 0,
    reason: "",
    action: "add", // 'add', 'adjust'
  })

  useEffect(() => {
    fetchInventoryData()
    fetchLowStockItems()
  }, [])

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("/api/inventory")
      const data = await response.json()
      setInventory(data.variants || [])
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast.error("Không thể tải dữ liệu kho hàng")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch("/api/inventory?action=low-stock")
      const data = await response.json()
      setLowStockItems(data.lowStockItems || [])
    } catch (error) {
      console.error("Error fetching low stock items:", error)
    }
  }

  const fetchInventoryHistory = async (variantId: string) => {
    try {
      const response = await fetch(`/api/inventory?action=history&variantId=${variantId}&limit=20`)
      const data = await response.json()
      setInventoryHistory(data.history || [])
    } catch (error) {
      console.error("Error fetching inventory history:", error)
      toast.error("Không thể tải lịch sử kho hàng")
    }
  }

  const handleStockAdjustment = async () => {
    if (!adjustmentForm.variantId || !adjustmentForm.reason) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: adjustmentForm.action === "add" ? "add-stock" : "adjust-stock",
          variantId: adjustmentForm.variantId,
          quantity: adjustmentForm.quantity,
          reason: adjustmentForm.reason,
          performedBy: "admin",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Cập nhật kho hàng thành công!")
        setAdjustmentForm({ variantId: "", quantity: 0, reason: "", action: "add" })
        fetchInventoryData()
        fetchLowStockItems()
      } else {
        toast.error("Không thể cập nhật kho hàng")
      }
    } catch (error) {
      console.error("Error adjusting stock:", error)
      toast.error("Lỗi khi cập nhật kho hàng")
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterType === "all" ||
      (filterType === "low-stock" && item.availableStock <= item.lowStockThreshold) ||
      (filterType === "out-of-stock" && item.availableStock === 0) ||
      (filterType === "in-stock" && item.availableStock > item.lowStockThreshold)

    return matchesSearch && matchesFilter
  })

  const getStockStatus = (item: InventoryItem) => {
    if (item.availableStock === 0) return { label: "Hết hàng", color: "bg-red-500" }
    if (item.availableStock <= item.lowStockThreshold) return { label: "Sắp hết", color: "bg-yellow-500" }
    return { label: "Còn hàng", color: "bg-green-500" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Quản lý kho hàng</h1>
            <div className="flex gap-4">
              <Button onClick={fetchInventoryData} variant="outline" className="border-gray-600 text-gray-300">
                <RotateCcw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-white">{inventory.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Sắp hết hàng</p>
                    <p className="text-2xl font-bold text-yellow-400">{lowStockItems.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Hết hàng</p>
                    <p className="text-2xl font-bold text-red-400">
                      {inventory.filter((item) => item.availableStock === 0).length}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tổng giá trị kho</p>
                    <p className="text-2xl font-bold text-green-400">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(inventory.reduce((sum, item) => sum + item.stock * item.price, 0))}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="inventory" className="text-gray-300 data-[state=active]:text-white">
                Kho hàng
              </TabsTrigger>
              <TabsTrigger value="adjustments" className="text-gray-300 data-[state=active]:text-white">
                Điều chỉnh
              </TabsTrigger>
              <TabsTrigger value="history" className="text-gray-300 data-[state=active]:text-white">
                Lịch sử
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Danh sách kho hàng</CardTitle>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="all">Tất cả</option>
                        <option value="in-stock">Còn hàng</option>
                        <option value="low-stock">Sắp hết</option>
                        <option value="out-of-stock">Hết hàng</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="pb-3 text-gray-300">Sản phẩm</th>
                          <th className="pb-3 text-gray-300">SKU</th>
                          <th className="pb-3 text-gray-300">Tồn kho</th>
                          <th className="pb-3 text-gray-300">Có sẵn</th>
                          <th className="pb-3 text-gray-300">Đã đặt</th>
                          <th className="pb-3 text-gray-300">Trạng thái</th>
                          <th className="pb-3 text-gray-300">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map((item) => {
                          const status = getStockStatus(item)
                          return (
                            <tr key={item.variantId} className="border-b border-gray-700">
                              <td className="py-3 text-white">{item.name}</td>
                              <td className="py-3 text-gray-300">{item.sku}</td>
                              <td className="py-3 text-white">{item.stock}</td>
                              <td className="py-3 text-white">{item.availableStock}</td>
                              <td className="py-3 text-yellow-400">{item.reservedStock}</td>
                              <td className="py-3">
                                <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600 text-gray-300"
                                    onClick={() => {
                                      setSelectedVariant(item.variantId)
                                      fetchInventoryHistory(item.variantId)
                                    }}
                                  >
                                    <History className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      setAdjustmentForm({
                                        ...adjustmentForm,
                                        variantId: item.variantId,
                                      })
                                    }}
                                  >
                                    Điều chỉnh
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adjustments">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Điều chỉnh kho hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Chọn sản phẩm</Label>
                      <select
                        value={adjustmentForm.variantId}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, variantId: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="">Chọn sản phẩm...</option>
                        {inventory.map((item) => (
                          <option key={item.variantId} value={item.variantId}>
                            {item.name} ({item.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Loại điều chỉnh</Label>
                      <select
                        value={adjustmentForm.action}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, action: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="add">Thêm vào kho</option>
                        <option value="adjust">Điều chỉnh tổng số</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-300">
                        {adjustmentForm.action === "add" ? "Số lượng thêm" : "Tổng số mới"}
                      </Label>
                      <Input
                        type="number"
                        value={adjustmentForm.quantity}
                        onChange={(e) =>
                          setAdjustmentForm({ ...adjustmentForm, quantity: Number.parseInt(e.target.value) })
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Lý do</Label>
                      <Textarea
                        value={adjustmentForm.reason}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Nhập lý do điều chỉnh..."
                      />
                    </div>
                  </div>

                  <Button onClick={handleStockAdjustment} className="bg-blue-600 hover:bg-blue-700">
                    {adjustmentForm.action === "add" ? (
                      <Plus className="w-4 h-4 mr-2" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    Thực hiện điều chỉnh
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Lịch sử kho hàng</CardTitle>
                  {selectedVariant && (
                    <p className="text-gray-400">
                      Hiển thị lịch sử cho: {inventory.find((item) => item.variantId === selectedVariant)?.name}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {inventoryHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="pb-3 text-gray-300">Thời gian</th>
                            <th className="pb-3 text-gray-300">Loại</th>
                            <th className="pb-3 text-gray-300">Số lượng</th>
                            <th className="pb-3 text-gray-300">Trước</th>
                            <th className="pb-3 text-gray-300">Sau</th>
                            <th className="pb-3 text-gray-300">Lý do</th>
                            <th className="pb-3 text-gray-300">Người thực hiện</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryHistory.map((log) => (
                            <tr key={log._id} className="border-b border-gray-700">
                              <td className="py-3 text-gray-300">{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                              <td className="py-3">
                                <Badge
                                  className={
                                    log.type === "sale"
                                      ? "bg-red-600"
                                      : log.type === "restock"
                                        ? "bg-green-600"
                                        : "bg-blue-600"
                                  }
                                >
                                  {log.type}
                                </Badge>
                              </td>
                              <td className="py-3 text-white">{log.quantity}</td>
                              <td className="py-3 text-gray-300">{log.previousStock}</td>
                              <td className="py-3 text-white">{log.newStock}</td>
                              <td className="py-3 text-gray-300">{log.reason}</td>
                              <td className="py-3 text-gray-300">{log.performedBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      {selectedVariant ? "Không có lịch sử cho sản phẩm này" : "Chọn một sản phẩm để xem lịch sử"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
