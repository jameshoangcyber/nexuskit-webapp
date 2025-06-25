const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://hoangtrongtra2004:JJH9lWYzBo3rNiwQ@cluster0.yakut8l.mongodb.net/nexuskit"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("nexuskit")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.collection("users").deleteMany({})
    await db.collection("products").deleteMany({})
    await db.collection("orders").deleteMany({})

    // Create admin user
    console.log("👤 Creating users...")
    const hashedPassword = await bcrypt.hash("password", 12)

    const adminUser = {
      name: "Admin User",
      email: "admin@nexuskit.vn",
      password: hashedPassword,
      role: "admin",
      phone: "0123456789",
      address: "123 Admin Street, Ho Chi Minh City",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const testUser = {
      name: "Test User",
      email: "user@nexuskit.vn",
      password: hashedPassword,
      role: "user",
      phone: "0987654321",
      address: "456 User Avenue, Ho Chi Minh City",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("users").insertMany([adminUser, testUser])

    // Create sample products
    console.log("📦 Creating products...")
    const products = [
      {
        name: "NexusKit Pro Max",
        description:
          "NexusKit Pro Max là sản phẩm công nghệ hàng đầu, tích hợp AI tiên tiến và khả năng kết nối vượt trội. Thiết kế sang trọng, hiệu suất mạnh mẽ.",
        price: 25000000,
        images: ["/placeholder.svg?height=400&width=400"],
        category: "premium",
        specifications: {
          "Bộ xử lý": "NexusChip X1 Pro",
          RAM: "16GB LPDDR5",
          "Lưu trữ": "512GB NVMe SSD",
          "Màn hình": '6.8" OLED 4K',
          Pin: "5000mAh",
          "Kết nối": "5G, WiFi 7, Bluetooth 5.3",
        },
        stock: 50,
        reviews: [
          {
            userId: "user1",
            userName: "Nguyễn Văn A",
            rating: 5,
            comment: "Sản phẩm tuyệt vời, hiệu suất mạnh mẽ!",
            createdAt: new Date("2024-01-15"),
          },
          {
            userId: "user2",
            userName: "Trần Thị B",
            rating: 4,
            comment: "Chất lượng tốt, giá hợp lý.",
            createdAt: new Date("2024-01-10"),
          },
        ],
        averageRating: 4.5,
        totalReviews: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "NexusKit Standard",
        description:
          "NexusKit Standard mang đến trải nghiệm công nghệ hoàn hảo với mức giá phù hợp. Tính năng đầy đủ cho nhu cầu hàng ngày.",
        price: 15000000,
        images: ["/placeholder.svg?height=400&width=400"],
        category: "standard",
        specifications: {
          "Bộ xử lý": "NexusChip A1",
          RAM: "8GB LPDDR4",
          "Lưu trữ": "256GB NVMe SSD",
          "Màn hình": '6.1" OLED FHD+',
          Pin: "4000mAh",
          "Kết nối": "4G, WiFi 6, Bluetooth 5.0",
        },
        stock: 100,
        reviews: [
          {
            userId: "user3",
            userName: "Lê Văn C",
            rating: 4,
            comment: "Tốt cho tầm giá, đáng mua.",
            createdAt: new Date("2024-01-12"),
          },
        ],
        averageRating: 4.0,
        totalReviews: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "NexusKit Lite",
        description:
          "NexusKit Lite - Lựa chọn thông minh cho người dùng trẻ. Thiết kế trẻ trung, tính năng cần thiết với mức giá cạnh tranh.",
        price: 8000000,
        images: ["/placeholder.svg?height=400&width=400"],
        category: "lite",
        specifications: {
          "Bộ xử lý": "NexusChip Lite",
          RAM: "6GB LPDDR4",
          "Lưu trữ": "128GB eMMC",
          "Màn hình": '5.8" LCD FHD',
          Pin: "3500mAh",
          "Kết nối": "4G, WiFi 5, Bluetooth 4.2",
        },
        stock: 200,
        reviews: [
          {
            userId: "user4",
            userName: "Phạm Thị D",
            rating: 3,
            comment: "Ổn cho nhu cầu cơ bản.",
            createdAt: new Date("2024-01-08"),
          },
        ],
        averageRating: 3.0,
        totalReviews: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "NexusKit Gaming",
        description:
          "NexusKit Gaming được thiết kế đặc biệt cho game thủ với hiệu suất đồ họa vượt trội và hệ thống tản nhiệt tiên tiến.",
        price: 35000000,
        images: ["/placeholder.svg?height=400&width=400"],
        category: "gaming",
        specifications: {
          "Bộ xử lý": "NexusChip Gaming X2",
          RAM: "32GB LPDDR5",
          "Lưu trữ": "1TB NVMe SSD",
          "Màn hình": '7.2" OLED 4K 120Hz',
          Pin: "6000mAh",
          "Kết nối": "5G, WiFi 7, Bluetooth 5.4",
          "Đồ họa": "NexusGPU Pro",
        },
        stock: 25,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "NexusKit Business",
        description:
          "NexusKit Business tối ưu cho doanh nghiệp với tính năng bảo mật cao và khả năng quản lý từ xa chuyên nghiệp.",
        price: 20000000,
        images: ["/placeholder.svg?height=400&width=400"],
        category: "business",
        specifications: {
          "Bộ xử lý": "NexusChip Business",
          RAM: "16GB LPDDR5",
          "Lưu trữ": "512GB NVMe SSD (Encrypted)",
          "Màn hình": '6.5" OLED FHD+',
          Pin: "4500mAh",
          "Kết nối": "5G, WiFi 6E, Bluetooth 5.2",
          "Bảo mật": "Knox Security, Fingerprint, Face ID",
        },
        stock: 75,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("products").insertMany(products)

    // Create sample orders
    console.log("🛒 Creating sample orders...")
    const sampleOrders = [
      {
        userId: testUser._id?.toString() || "test-user-id",
        items: [
          {
            productId: "product1",
            productName: "NexusKit Pro Max",
            productImage: "/placeholder.svg?height=400&width=400",
            price: 25000000,
            quantity: 1,
          },
        ],
        total: 25000000,
        status: "delivered",
        paymentMethod: "cod",
        paymentStatus: "paid",
        shippingInfo: {
          name: "Test User",
          phone: "0987654321",
          email: "user@nexuskit.vn",
          address: "456 User Avenue, Ho Chi Minh City",
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-05"),
      },
      {
        userId: testUser._id?.toString() || "test-user-id",
        items: [
          {
            productId: "product2",
            productName: "NexusKit Standard",
            productImage: "/placeholder.svg?height=400&width=400",
            price: 15000000,
            quantity: 2,
          },
        ],
        total: 30000000,
        status: "shipped",
        paymentMethod: "stripe",
        paymentStatus: "paid",
        shippingInfo: {
          name: "Test User",
          phone: "0987654321",
          email: "user@nexuskit.vn",
          address: "456 User Avenue, Ho Chi Minh City",
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-16"),
      },
    ]

    await db.collection("orders").insertMany(sampleOrders)

    // Create indexes for better performance
    console.log("🔍 Creating database indexes...")
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("products").createIndex({ name: "text", description: "text" })
    await db.collection("products").createIndex({ category: 1 })
    await db.collection("products").createIndex({ price: 1 })
    await db.collection("products").createIndex({ isActive: 1 })
    await db.collection("orders").createIndex({ userId: 1 })
    await db.collection("orders").createIndex({ status: 1 })
    await db.collection("orders").createIndex({ createdAt: -1 })

    console.log("✅ Database seeded successfully!")

    console.log("\n🎉 === NexusKit Setup Complete ===")
    console.log("🔐 Login Credentials:")
    console.log("   Admin: admin@nexuskit.vn / password")
    console.log("   User:  user@nexuskit.vn / password")
    console.log("\n🚀 Start the application with: npm run dev")
    console.log("🌐 Visit: http://localhost:3000")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
