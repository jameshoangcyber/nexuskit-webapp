// Payment error types
export interface PaymentError {
    code: string
    message: string
    type: "card_error" | "validation_error" | "api_error" | "network_error" | "unknown_error"
    retryable: boolean
    suggestions?: string[]
  }
  
  // Payment result types
  export interface PaymentResult {
    success: boolean
    paymentIntentId?: string
    error?: PaymentError
    requiresAction?: boolean
    actionUrl?: string
  }
  
  // Payment validation
  export class PaymentValidator {
    static validateAmount(amount: number): { valid: boolean; error?: string } {
      if (!amount || amount <= 0) {
        return { valid: false, error: "Số tiền phải lớn hơn 0" }
      }
      if (amount < 1000) {
        return { valid: false, error: "Số tiền tối thiểu là 1,000 VND" }
      }
      if (amount > 50000000) {
        return { valid: false, error: "Số tiền tối đa là 50,000,000 VND" }
      }
      return { valid: true }
    }
  
    static validateCardNumber(cardNumber: string): { valid: boolean; error?: string } {
      const cleaned = cardNumber.replace(/\s/g, "")
      if (!/^\d{13,19}$/.test(cleaned)) {
        return { valid: false, error: "Số thẻ phải có 13-19 chữ số" }
      }
  
      // Luhn algorithm validation
      let sum = 0
      let isEven = false
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = Number.parseInt(cleaned[i])
        if (isEven) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
        isEven = !isEven
      }
  
      if (sum % 10 !== 0) {
        return { valid: false, error: "Số thẻ không hợp lệ" }
      }
  
      return { valid: true }
    }
  
    static validateExpiryDate(month: string, year: string): { valid: boolean; error?: string } {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
  
      const expMonth = Number.parseInt(month)
      const expYear = Number.parseInt(year)
  
      if (expMonth < 1 || expMonth > 12) {
        return { valid: false, error: "Tháng hết hạn không hợp lệ" }
      }
  
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return { valid: false, error: "Thẻ đã hết hạn" }
      }
  
      return { valid: true }
    }
  
    static validateCVC(cvc: string): { valid: boolean; error?: string } {
      if (!/^\d{3,4}$/.test(cvc)) {
        return { valid: false, error: "CVC phải có 3-4 chữ số" }
      }
      return { valid: true }
    }
  }
  
  // Payment error handler
  export class PaymentErrorHandler {
    static handleStripeError(error: any): PaymentError {
      console.error("Stripe Error:", error)
  
      switch (error.type) {
        case "card_error":
          return this.handleCardError(error)
        case "validation_error":
          return {
            code: "VALIDATION_ERROR",
            message: "Thông tin thanh toán không hợp lệ",
            type: "validation_error",
            retryable: true,
            suggestions: ["Kiểm tra lại thông tin thẻ", "Đảm bảo thẻ chưa hết hạn"],
          }
        case "api_connection_error":
          return {
            code: "CONNECTION_ERROR",
            message: "Không thể kết nối đến hệ thống thanh toán",
            type: "network_error",
            retryable: true,
            suggestions: ["Kiểm tra kết nối internet", "Thử lại sau vài phút"],
          }
        case "api_error":
          return {
            code: "API_ERROR",
            message: "Lỗi hệ thống thanh toán",
            type: "api_error",
            retryable: true,
            suggestions: ["Thử lại sau vài phút", "Liên hệ hỗ trợ nếu lỗi tiếp tục"],
          }
        case "authentication_error":
          return {
            code: "AUTH_ERROR",
            message: "Lỗi xác thực hệ thống",
            type: "api_error",
            retryable: false,
            suggestions: ["Liên hệ hỗ trợ khách hàng"],
          }
        case "rate_limit_error":
          return {
            code: "RATE_LIMIT",
            message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
            type: "api_error",
            retryable: true,
            suggestions: ["Đợi 1-2 phút trước khi thử lại"],
          }
        default:
          return {
            code: "UNKNOWN_ERROR",
            message: error.message || "Có lỗi không xác định xảy ra",
            type: "unknown_error",
            retryable: true,
            suggestions: ["Thử lại hoặc liên hệ hỗ trợ"],
          }
      }
    }
  
    private static handleCardError(error: any): PaymentError {
      const code = error.code || "card_error"
  
      switch (code) {
        case "card_declined":
          return {
            code: "CARD_DECLINED",
            message: "Thẻ của bạn bị từ chối",
            type: "card_error",
            retryable: true,
            suggestions: ["Kiểm tra số dư tài khoản", "Liên hệ ngân hàng để kích hoạt thẻ", "Thử sử dụng thẻ khác"],
          }
        case "insufficient_funds":
          return {
            code: "INSUFFICIENT_FUNDS",
            message: "Số dư tài khoản không đủ",
            type: "card_error",
            retryable: true,
            suggestions: ["Nạp thêm tiền vào tài khoản", "Sử dụng thẻ khác", "Giảm số tiền thanh toán"],
          }
        case "expired_card":
          return {
            code: "EXPIRED_CARD",
            message: "Thẻ đã hết hạn",
            type: "card_error",
            retryable: true,
            suggestions: ["Sử dụng thẻ còn hiệu lực", "Liên hệ ngân hàng để gia hạn thẻ"],
          }
        case "incorrect_cvc":
          return {
            code: "INCORRECT_CVC",
            message: "Mã CVC không đúng",
            type: "card_error",
            retryable: true,
            suggestions: ["Kiểm tra lại mã CVC ở mặt sau thẻ", "Đảm bảo nhập đúng 3-4 chữ số"],
          }
        case "processing_error":
          return {
            code: "PROCESSING_ERROR",
            message: "Lỗi xử lý thanh toán",
            type: "card_error",
            retryable: true,
            suggestions: ["Thử lại sau vài phút", "Liên hệ ngân hàng nếu lỗi tiếp tục"],
          }
        default:
          return {
            code: "CARD_ERROR",
            message: error.message || "Có lỗi với thẻ của bạn",
            type: "card_error",
            retryable: true,
            suggestions: ["Kiểm tra lại thông tin thẻ", "Thử sử dụng thẻ khác"],
          }
      }
    }
  }
  
  // Payment service
  export class PaymentService {
    private static instance: PaymentService
    private retryAttempts = new Map<string, number>()
    private maxRetries = 3
  
    static getInstance(): PaymentService {
      if (!PaymentService.instance) {
        PaymentService.instance = new PaymentService()
      }
      return PaymentService.instance
    }
  
    async createPaymentIntent(amount: number, currency = "vnd", metadata = {}): Promise<PaymentResult> {
      try {
        // Validate amount
        const amountValidation = PaymentValidator.validateAmount(amount)
        if (!amountValidation.valid) {
          return {
            success: false,
            error: {
              code: "INVALID_AMOUNT",
              message: amountValidation.error!,
              type: "validation_error",
              retryable: false,
            },
          }
        }
  
        const response = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(amount),
            currency,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
            },
          }),
        })
  
        const data = await response.json()
  
        if (!response.ok) {
          return {
            success: false,
            error: {
              code: data.code || "API_ERROR",
              message: data.error || "Không thể tạo thanh toán",
              type: "api_error",
              retryable: response.status >= 500,
              suggestions: response.status >= 500 ? ["Thử lại sau vài phút"] : ["Kiểm tra thông tin và thử lại"],
            },
          }
        }
  
        return {
          success: true,
          paymentIntentId: data.paymentIntentId,
        }
      } catch (error: any) {
        console.error("Payment intent creation failed:", error)
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Không thể kết nối đến server",
            type: "network_error",
            retryable: true,
            suggestions: ["Kiểm tra kết nối internet", "Thử lại sau"],
          },
        }
      }
    }
  
    async retryPayment(paymentIntentId: string): Promise<PaymentResult> {
      const attempts = this.retryAttempts.get(paymentIntentId) || 0
  
      if (attempts >= this.maxRetries) {
        return {
          success: false,
          error: {
            code: "MAX_RETRIES_EXCEEDED",
            message: "Đã vượt quá số lần thử lại cho phép",
            type: "validation_error",
            retryable: false,
            suggestions: ["Liên hệ hỗ trợ khách hàng", "Thử sử dụng phương thức thanh toán khác"],
          },
        }
      }
  
      this.retryAttempts.set(paymentIntentId, attempts + 1)
  
      // Add delay between retries
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempts + 1)))
  
      return { success: true }
    }
  
    clearRetryAttempts(paymentIntentId: string) {
      this.retryAttempts.delete(paymentIntentId)
    }
  
    getRetryAttempts(paymentIntentId: string): number {
      return this.retryAttempts.get(paymentIntentId) || 0
    }
  }
  