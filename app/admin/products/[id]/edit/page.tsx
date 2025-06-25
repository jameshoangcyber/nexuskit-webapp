"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from "@/lib/api"

const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  stock: z.number().min(0, "Số lượng không được âm"),
  image: z.string().url("URL hình ảnh không hợp lệ").optional(),
})

type ProductForm = z.infer<typeof productSchema>

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [specifications, setSpecifications] = useState<Record<string, string>>({})
  const [product, setProduct] = useState<any>(null)
  const router = useRouter()

  const categories = [
    { id: "smartphone", name: "Smartphone" },
    { id: "laptop", name: "Laptop" },
    { id: "tablet", name: "Tablet" },
    { id: "smartwatch", name: "Smartwatch" },
    { id: "audio", name: "Audio" },
    { id: "gaming", name: "Gaming" },
    { id: "smarthome", name: "Smart Home" },
    { id: "accessories", name: "Phụ kiện" },
  ]

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const productData = await api.getProduct(params.id)
      setProduct(productData)
      setSpecifications(productData.specifications || {})

      // Set form values
      form.reset({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        stock: productData.stock,
        image: productData.image,
      })
    } catch (error) {
      toast.error("Không thể tải thông tin sản phẩm")
      router.push("/admin")
    }
  }

  const handleSubmit = async (data: ProductForm) => {
    setIsLoading(true)
    try {
      await api.updateProduct(params.id, {
        ...data,
        specifications,
      })
      toast.success("Cập nhật sản phẩm thành công!")
      router.push("/admin")
    } catch (error) {
      toast.error("Lỗi khi cập nhật sản phẩm")
    } finally {
      setIsLoading(false)
    }
  }

  const addSpecification = () => {
    const key = prompt("Nhập tên thông số:")
    const value = prompt("Nhập giá trị:")
    if (key && value) {
      setSpecifications((prev) => ({ ...prev, [key]: value }))
    }
  }

  const removeSpecification = (key: string) => {
    setSpecifications((prev) => {
      const newSpecs = { ...prev }
      delete newSpecs[key]
      return newSpecs
    })
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center mb-8">
            <Link href="/admin" className="mr-4">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Chỉnh sửa sản phẩm</h1>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Tên sản phẩm
                    </Label>
                    <Input id="name" {...form.register("name")} className="bg-gray-700 border-gray-600 text-white" />
                    {form.formState.errors.name && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-gray-300">
                      Giá (VNĐ)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      {...form.register("price", { valueAsNumber: true })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-gray-300">
                      Danh mục
                    </Label>
                    <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stock" className="text-gray-300">
                      Số lượng trong kho
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      {...form.register("stock", { valueAsNumber: true })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {form.formState.errors.stock && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.stock.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Mô tả sản phẩm
                  </Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="image" className="text-gray-300">
                    URL hình ảnh
                  </Label>
                  <Input
                    id="image"
                    {...form.register("image")}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.formState.errors.image && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.image.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-gray-300">Thông số kỹ thuật</Label>
                    <Button
                      type="button"
                      onClick={addSpecification}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300"
                    >
                      Thêm thông số
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                        <div className="text-white">
                          <strong>{key}:</strong> {value}
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
                  </Button>
                  <Link href="/admin">
                    <Button type="button" variant="outline" className="border-gray-600 text-gray-300">
                      Hủy
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
