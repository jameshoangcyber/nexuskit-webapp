"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, setUser } = useStore()

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  })

  const handleSubmit = async (data: ProfileForm) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const result = await response.json()
      setUser(result.user)
      toast.success("Cập nhật thông tin thành công!")
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Cập nhật thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Họ tên
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Nguyễn Văn A"
              />
              {form.formState.errors.name && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-300">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="0123456789"
              />
              {form.formState.errors.phone && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="text-gray-300">
                Địa chỉ
              </Label>
              <Input
                id="address"
                {...form.register("address")}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
              {form.formState.errors.address && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
