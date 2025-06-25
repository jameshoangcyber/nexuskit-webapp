"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useStore()
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)

    try {
      const response = await api.login(data.email, data.password)
      setUser(response.user)
      toast.success("Đăng nhập thành công!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Đăng nhập thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      const response = await api.register(data.name, data.email, data.password)
      setUser(response.user)
      toast.success("Đăng ký thành công!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Chào mừng đến với NexusKit</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white">
                    Đăng nhập
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-white">
                    Đăng ký
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        {...loginForm.register("email")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="your@email.com"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="login-password" className="text-gray-300">
                        Mật khẩu
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        {...loginForm.register("password")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="••••••••"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name" className="text-gray-300">
                        Họ tên
                      </Label>
                      <Input
                        id="register-name"
                        {...registerForm.register("name")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Nguyễn Văn A"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="register-email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        {...registerForm.register("email")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="your@email.com"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="register-password" className="text-gray-300">
                        Mật khẩu
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        {...registerForm.register("password")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="••••••••"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-red-400 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="register-confirm-password" className="text-gray-300">
                        Xác nhận mật khẩu
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        {...registerForm.register("confirmPassword")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="••••••••"
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
