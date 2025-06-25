import type { Product } from "./store"

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "NexusKit Pro Max",
    price: 25000000,
    image: "/placeholder.svg?height=400&width=400",
    description:
      "NexusKit Pro Max là sản phẩm công nghệ hàng đầu, tích hợp AI tiên tiến và khả năng kết nối vượt trội. Thiết kế sang trọng, hiệu suất mạnh mẽ.",
    specifications: {
      "Bộ xử lý": "NexusChip X1 Pro",
      RAM: "16GB LPDDR5",
      "Lưu trữ": "512GB NVMe SSD",
      "Màn hình": '6.8" OLED 4K',
      Pin: "5000mAh",
      "Kết nối": "5G, WiFi 7, Bluetooth 5.3",
    },
    reviews: [
      {
        id: "1",
        user: "Nguyễn Văn A",
        rating: 5,
        comment: "Sản phẩm tuyệt vời, hiệu suất mạnh mẽ!",
        date: "2024-01-15",
      },
      {
        id: "2",
        user: "Trần Thị B",
        rating: 4,
        comment: "Chất lượng tốt, giá hợp lý.",
        date: "2024-01-10",
      },
    ],
  },
  {
    id: "2",
    name: "NexusKit Standard",
    price: 15000000,
    image: "/placeholder.svg?height=400&width=400",
    description:
      "NexusKit Standard mang đến trải nghiệm công nghệ hoàn hảo với mức giá phù hợp. Tính năng đầy đủ cho nhu cầu hàng ngày.",
    specifications: {
      "Bộ xử lý": "NexusChip A1",
      RAM: "8GB LPDDR4",
      "Lưu trữ": "256GB NVMe SSD",
      "Màn hình": '6.1" OLED FHD+',
      Pin: "4000mAh",
      "Kết nối": "4G, WiFi 6, Bluetooth 5.0",
    },
    reviews: [
      {
        id: "3",
        user: "Lê Văn C",
        rating: 4,
        comment: "Tốt cho tầm giá, đáng mua.",
        date: "2024-01-12",
      },
    ],
  },
  {
    id: "3",
    name: "NexusKit Lite",
    price: 8000000,
    image: "/placeholder.svg?height=400&width=400",
    description:
      "NexusKit Lite - Lựa chọn thông minh cho người dùng trẻ. Thiết kế trẻ trung, tính năng cần thiết với mức giá cạnh tranh.",
    specifications: {
      "Bộ xử lý": "NexusChip Lite",
      RAM: "6GB LPDDR4",
      "Lưu trữ": "128GB eMMC",
      "Màn hình": '5.8" LCD FHD',
      Pin: "3500mAh",
      "Kết nối": "4G, WiFi 5, Bluetooth 4.2",
    },
    reviews: [
      {
        id: "4",
        user: "Phạm Thị D",
        rating: 3,
        comment: "Ổn cho nhu cầu cơ bản.",
        date: "2024-01-08",
      },
    ],
  },
]
