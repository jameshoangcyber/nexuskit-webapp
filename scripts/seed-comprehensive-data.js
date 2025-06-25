const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://hoangtrongtra2004:JJH9lWYzBo3rNiwQ@cluster0.yakut8l.mongodb.net/nexuskit"

async function seedComprehensiveData() {
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

    // Create users
    console.log("👤 Creating admin and user accounts...")
    const hashedPassword = await bcrypt.hash("password123", 12)

    const adminUser = {
      name: "Admin NexusKit",
      email: "admin@nexuskit.vn",
      password: hashedPassword,
      role: "admin",
      phone: "0123456789",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      avatar: "/placeholder.svg?height=100&width=100",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const regularUser = {
      name: "Nguyễn Văn Nam",
      email: "user@nexuskit.vn",
      password: hashedPassword,
      role: "user",
      phone: "0987654321",
      address: "456 Lê Lợi, Quận 3, TP.HCM",
      avatar: "/placeholder.svg?height=100&width=100",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const userResult = await db.collection("users").insertMany([adminUser, regularUser])
    console.log(`✅ Created ${userResult.insertedCount} users`)

    // Create 20 comprehensive products
    console.log("📦 Creating 20 diverse products...")

    const products = [
      // Premium Smartphones
      {
        name: "NexusKit Pro Max 2024",
        description:
          "Flagship smartphone với chip AI thế hệ mới, camera 200MP và màn hình OLED 6.8 inch. Thiết kế titan cao cấp, pin 5000mAh sạc nhanh 120W.",
        price: 32000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smartphone",
        specifications: {
          "Chip xử lý": "NexusChip A17 Pro",
          RAM: "12GB LPDDR5",
          "Bộ nhớ": "512GB UFS 4.0",
          "Màn hình": '6.8" OLED 120Hz',
          "Camera chính": "200MP f/1.8",
          "Camera selfie": "32MP f/2.2",
          Pin: "5000mAh, sạc 120W",
          "Hệ điều hành": "NexusOS 14",
          "Kết nối": "5G, WiFi 7, Bluetooth 5.4",
        },
        stock: 50,
        reviews: [
          {
            userId: userResult.insertedIds[1].toString(),
            userName: "Nguyễn Văn Nam",
            rating: 5,
            comment: "Điện thoại tuyệt vời! Camera chụp ảnh cực đẹp, hiệu suất mượt mà.",
            createdAt: new Date("2024-01-15"),
          },
        ],
        averageRating: 5.0,
        totalReviews: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusKit Standard Plus",
        description:
          "Smartphone tầm trung với hiệu suất ổn định, camera AI 108MP và pin 4500mAh. Lựa chọn hoàn hảo cho nhu cầu hàng ngày.",
        price: 18000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smartphone",
        specifications: {
          "Chip xử lý": "NexusChip A15",
          RAM: "8GB LPDDR4X",
          "Bộ nhớ": "256GB UFS 3.1",
          "Màn hình": '6.4" AMOLED 90Hz',
          "Camera chính": "108MP f/1.9",
          "Camera selfie": "20MP f/2.4",
          Pin: "4500mAh, sạc 67W",
          "Hệ điều hành": "NexusOS 14",
          "Kết nối": "5G, WiFi 6, Bluetooth 5.2",
        },
        stock: 100,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusKit Lite 2024",
        description:
          "Smartphone giá rẻ nhưng không rẻ tiền. Camera 64MP, pin 4000mAh và thiết kế trẻ trung, năng động.",
        price: 9500000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smartphone",
        specifications: {
          "Chip xử lý": "NexusChip A12",
          RAM: "6GB LPDDR4",
          "Bộ nhớ": "128GB eMMC 5.1",
          "Màn hình": '6.1" IPS LCD 60Hz',
          "Camera chính": "64MP f/2.0",
          "Camera selfie": "16MP f/2.2",
          Pin: "4000mAh, sạc 33W",
          "Hệ điều hành": "NexusOS 14",
          "Kết nối": "4G, WiFi 5, Bluetooth 5.0",
        },
        stock: 200,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Laptops
      {
        name: 'NexusBook Pro 16"',
        description:
          "Laptop cao cấp cho chuyên gia sáng tạo. Chip M2 Pro, RAM 32GB, SSD 1TB và màn hình Retina 16 inch tuyệt đẹp.",
        price: 65000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "laptop",
        specifications: {
          "Chip xử lý": "NexusChip M2 Pro",
          RAM: "32GB Unified Memory",
          "Bộ nhớ": "1TB SSD",
          "Màn hình": '16" Retina 3456x2234',
          "Card đồ họa": "GPU 19-core",
          Pin: "100Wh, 22 giờ",
          "Cổng kết nối": "4x Thunderbolt 4, HDMI, SD",
          "Trọng lượng": "2.15kg",
          "Hệ điều hành": "NexusOS Desktop",
        },
        stock: 30,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'NexusBook Air 13"',
        description:
          "Laptop mỏng nhẹ hoàn hảo cho sinh viên và dân văn phòng. Thiết kế sang trọng, pin 18 giờ sử dụng.",
        price: 28000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "laptop",
        specifications: {
          "Chip xử lý": "NexusChip M2",
          RAM: "16GB Unified Memory",
          "Bộ nhớ": "512GB SSD",
          "Màn hình": '13.6" Retina 2560x1664',
          "Card đồ họa": "GPU 10-core",
          Pin: "52.6Wh, 18 giờ",
          "Cổng kết nối": "2x Thunderbolt 4, MagSafe",
          "Trọng lượng": "1.24kg",
          "Hệ điều hành": "NexusOS Desktop",
        },
        stock: 75,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusBook Gaming X1",
        description:
          "Laptop gaming mạnh mẽ với RTX 4080, Intel i9 và màn hình 165Hz. Hệ thống tản nhiệt tiên tiến cho game thủ chuyên nghiệp.",
        price: 85000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "laptop",
        specifications: {
          "Chip xử lý": "Intel Core i9-13900HX",
          RAM: "32GB DDR5-5600",
          "Bộ nhớ": "2TB NVMe SSD",
          "Màn hình": '17.3" QHD 165Hz',
          "Card đồ họa": "RTX 4080 12GB",
          Pin: "90Wh, 6 giờ",
          "Cổng kết nối": "USB-C, USB-A, HDMI 2.1, Ethernet",
          "Trọng lượng": "2.8kg",
          "Hệ điều hành": "Windows 11 Pro",
        },
        stock: 20,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Tablets
      {
        name: 'NexusPad Pro 12.9"',
        description:
          "Tablet chuyên nghiệp với chip M2, hỗ trợ Apple Pencil và Magic Keyboard. Hoàn hảo cho công việc sáng tạo và giải trí.",
        price: 35000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "tablet",
        specifications: {
          "Chip xử lý": "NexusChip M2",
          RAM: "16GB",
          "Bộ nhớ": "512GB",
          "Màn hình": '12.9" Liquid Retina XDR',
          Camera: "12MP Wide + 10MP Ultra Wide",
          Pin: "10 giờ sử dụng",
          "Kết nối": "WiFi 6E + 5G",
          "Phụ kiện": "Hỗ trợ NexusPencil, Magic Keyboard",
          "Trọng lượng": "682g",
        },
        stock: 40,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: 'NexusPad Air 10.9"',
        description: "Tablet tầm trung với hiệu suất mạnh mẽ, thiết kế mỏng nhẹ và màn hình Liquid Retina sắc nét.",
        price: 18000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "tablet",
        specifications: {
          "Chip xử lý": "NexusChip A15 Bionic",
          RAM: "8GB",
          "Bộ nhớ": "256GB",
          "Màn hình": '10.9" Liquid Retina',
          Camera: "12MP Wide",
          Pin: "10 giờ sử dụng",
          "Kết nối": "WiFi 6",
          "Phụ kiện": "Hỗ trợ NexusPencil Gen 2",
          "Trọng lượng": "461g",
        },
        stock: 60,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Smartwatches
      {
        name: "NexusWatch Ultra",
        description:
          "Smartwatch cao cấp với GPS chính xác, theo dõi sức khỏe toàn diện và pin 36 giờ. Thiết kế titan bền bỉ.",
        price: 22000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smartwatch",
        specifications: {
          "Màn hình": "49mm Always-On Retina",
          "Chip xử lý": "S9 SiP",
          "Bộ nhớ": "64GB",
          Pin: "36 giờ sử dụng",
          "Kháng nước": "100m",
          "Cảm biến": "GPS, Heart Rate, SpO2, ECG",
          "Kết nối": "WiFi, Bluetooth, Cellular",
          "Vật liệu": "Titanium",
          "Dây đeo": "Alpine Loop, Trail Loop",
        },
        stock: 35,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusWatch Series 9",
        description: "Smartwatch thông minh với tính năng theo dõi sức khỏe tiên tiến, Always-On display và sạc nhanh.",
        price: 12000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smartwatch",
        specifications: {
          "Màn hình": "45mm Always-On Retina",
          "Chip xử lý": "S9 SiP",
          "Bộ nhớ": "64GB",
          Pin: "18 giờ sử dụng",
          "Kháng nước": "50m",
          "Cảm biến": "Heart Rate, SpO2, ECG",
          "Kết nối": "WiFi, Bluetooth",
          "Vật liệu": "Aluminum",
          "Dây đeo": "Sport Band, Sport Loop",
        },
        stock: 80,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Headphones & Audio
      {
        name: "NexusPods Pro Max",
        description: "Tai nghe over-ear cao cấp với chống ồn chủ động, âm thanh Hi-Fi và thiết kế sang trọng.",
        price: 15000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "audio",
        specifications: {
          Driver: "40mm Dynamic",
          "Chống ồn": "Active Noise Cancellation",
          Pin: "20 giờ (ANC bật)",
          "Kết nối": "Bluetooth 5.3, USB-C",
          Codec: "AAC, LDAC, aptX HD",
          "Trọng lượng": "384g",
          "Vật liệu": "Aluminum, Memory Foam",
          "Màu sắc": "Space Gray, Silver, Pink, Blue, Green",
        },
        stock: 45,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusPods Pro",
        description: "Tai nghe true wireless với chống ồn thông minh, âm thanh spatial và sạc không dây tiện lợi.",
        price: 7500000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "audio",
        specifications: {
          Driver: "11mm Dynamic",
          "Chống ồn": "Adaptive ANC",
          Pin: "6h + 24h (case)",
          "Kết nối": "Bluetooth 5.3",
          Codec: "AAC, SBC",
          Sạc: "Lightning, Wireless, USB-C",
          "Kháng nước": "IPX4",
          "Tính năng": "Spatial Audio, Transparency Mode",
        },
        stock: 120,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Gaming
      {
        name: "NexusStation 5 Pro",
        description:
          "Console game thế hệ mới với chip 8K, SSD tốc độ cao và ray tracing thời gian thực. Trải nghiệm gaming đỉnh cao.",
        price: 18000000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "gaming",
        specifications: {
          "Chip xử lý": "Custom AMD Zen 4",
          GPU: "RDNA 3 với Ray Tracing",
          RAM: "16GB GDDR6",
          "Bộ nhớ": "1TB NVMe SSD",
          "Độ phân giải": "8K/60fps, 4K/120fps",
          "Cổng kết nối": "HDMI 2.1, USB-A, USB-C",
          "Kết nối": "WiFi 6E, Bluetooth 5.2",
          "Tương thích": "PS4, PS5 games",
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
        name: "NexusController Pro",
        description: "Tay cầm game chuyên nghiệp với haptic feedback, adaptive triggers và pin 40 giờ sử dụng.",
        price: 2500000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "gaming",
        specifications: {
          "Kết nối": "Bluetooth 5.2, USB-C",
          Pin: "40 giờ sử dụng",
          "Tính năng": "Haptic Feedback, Adaptive Triggers",
          "Cảm biến": "Gyroscope, Accelerometer",
          "Tương thích": "PC, Mobile, Console",
          "Trọng lượng": "280g",
          "Màu sắc": "Black, White, Blue, Red",
        },
        stock: 100,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Smart Home
      {
        name: "NexusHome Hub",
        description:
          "Trung tâm điều khiển nhà thông minh với AI assistant, màn hình cảm ứng 10 inch và kết nối đa thiết bị.",
        price: 8500000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smarthome",
        specifications: {
          "Màn hình": '10" Touchscreen 1920x1200',
          "Chip xử lý": "Quad-core ARM",
          RAM: "4GB",
          "Bộ nhớ": "32GB eMMC",
          "Kết nối": "WiFi 6, Bluetooth 5.2, Zigbee",
          Camera: "8MP với privacy shutter",
          Loa: "2x 10W stereo",
          "AI Assistant": "NexusAI tích hợp",
        },
        stock: 40,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusCam Security Pro",
        description: "Camera an ninh thông minh 4K với AI nhận diện, night vision và lưu trữ cloud miễn phí 30 ngày.",
        price: 4500000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "smarthome",
        specifications: {
          "Độ phân giải": "4K UHD 3840x2160",
          "Góc nhìn": "130° diagonal",
          "Night Vision": "Color Night Vision",
          "AI Features": "Person/Vehicle Detection",
          "Lưu trữ": "Cloud 30 ngày miễn phí",
          "Kết nối": "WiFi 6, Ethernet",
          Nguồn: "PoE hoặc adapter",
          "Kháng thời tiết": "IP67",
        },
        stock: 60,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Accessories
      {
        name: "NexusCharger MagSafe 3-in-1",
        description: "Đế sạc không dây 3-in-1 cho iPhone, AirPods và Apple Watch. Thiết kế gọn gàng, sạc nhanh 15W.",
        price: 3200000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "accessories",
        specifications: {
          "Công suất": "15W MagSafe, 5W AirPods, 5W Watch",
          "Tương thích": "iPhone 12+, AirPods Pro/3, Apple Watch",
          "Kết nối": "USB-C input",
          "Vật liệu": "Aluminum, Silicone",
          "Tính năng": "Foldable, Travel-friendly",
          "Màu sắc": "White, Black",
          "Kích thước": "23 x 7 x 1.5 cm",
        },
        stock: 80,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusCase Pro Max",
        description:
          "Ốp lưng cao cấp với chống sốc quân đội, chống nước IP68 và hỗ trợ MagSafe. Bảo vệ toàn diện cho iPhone.",
        price: 1200000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "accessories",
        specifications: {
          "Chống sốc": "Military Grade (MIL-STD-810G)",
          "Chống nước": "IP68 waterproof",
          MagSafe: "Compatible",
          "Vật liệu": "TPU + PC + Metal",
          "Tính năng": "Screen protector built-in",
          "Màu sắc": "Clear, Black, Blue, Red",
          "Tương thích": "iPhone 15 Pro Max",
        },
        stock: 150,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusKeyboard Mechanical Pro",
        description:
          "Bàn phím cơ cao cấp với switch Cherry MX, đèn RGB và kết nối đa thiết bị. Hoàn hảo cho game và văn phòng.",
        price: 4800000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "accessories",
        specifications: {
          Switch: "Cherry MX Blue/Red/Brown",
          Layout: "Full-size 104 keys",
          "Đèn LED": "Per-key RGB",
          "Kết nối": "USB-C, Bluetooth 5.2, 2.4GHz",
          Pin: "4000mAh, 200h sử dụng",
          "Vật liệu": "Aluminum frame, PBT keycaps",
          "Tính năng": "Hot-swappable, Programmable",
          "Tương thích": "Windows, Mac, Linux",
        },
        stock: 35,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        name: "NexusMouse Gaming Wireless",
        description:
          "Chuột gaming không dây với sensor 25,000 DPI, pin 70 giờ và thiết kế ergonomic cho game thủ chuyên nghiệp.",
        price: 2800000,
        images: ["/placeholder.svg?height=600&width=600"],
        category: "accessories",
        specifications: {
          Sensor: "PixArt PMW3395, 25,000 DPI",
          "Polling Rate": "1000Hz",
          Pin: "70 giờ sử dụng",
          "Kết nối": "2.4GHz, Bluetooth, USB-C",
          Switches: "Omron 80M clicks",
          "Trọng lượng": "63g",
          RGB: "16.8M colors",
          "Tương thích": "Windows, Mac",
        },
        stock: 70,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const productResult = await db.collection("products").insertMany(products)
    console.log(`✅ Created ${productResult.insertedCount} products`)

    // Create sample orders
    console.log("🛒 Creating sample orders...")
    const sampleOrders = [
      {
        userId: userResult.insertedIds[1].toString(),
        items: [
          {
            productId: productResult.insertedIds[0].toString(),
            productName: "NexusKit Pro Max 2024",
            productImage: "/placeholder.svg?height=600&width=600",
            price: 32000000,
            quantity: 1,
          },
          {
            productId: productResult.insertedIds[10].toString(),
            productName: "NexusPods Pro Max",
            productImage: "/placeholder.svg?height=600&width=600",
            price: 15000000,
            quantity: 1,
          },
        ],
        total: 47000000,
        status: "delivered",
        paymentMethod: "stripe",
        paymentStatus: "paid",
        shippingInfo: {
          name: "Nguyễn Văn Nam",
          phone: "0987654321",
          email: "user@nexuskit.vn",
          address: "456 Lê Lợi, Quận 3, TP.HCM",
        },
        notes: "Giao hàng giờ hành chính",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-05"),
      },
      {
        userId: userResult.insertedIds[1].toString(),
        items: [
          {
            productId: productResult.insertedIds[3].toString(),
            productName: 'NexusBook Pro 16"',
            productImage: "/placeholder.svg?height=600&width=600",
            price: 65000000,
            quantity: 1,
          },
        ],
        total: 65000000,
        status: "shipped",
        paymentMethod: "cod",
        paymentStatus: "pending",
        shippingInfo: {
          name: "Nguyễn Văn Nam",
          phone: "0987654321",
          email: "user@nexuskit.vn",
          address: "456 Lê Lợi, Quận 3, TP.HCM",
        },
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-22"),
      },
    ]

    const orderResult = await db.collection("orders").insertMany(sampleOrders)
    console.log(`✅ Created ${orderResult.insertedCount} sample orders`)

    // Create indexes for better performance
    console.log("🔍 Creating database indexes...")
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("products").createIndex({ name: "text", description: "text" })
    await db.collection("products").createIndex({ category: 1 })
    await db.collection("products").createIndex({ price: 1 })
    await db.collection("products").createIndex({ isActive: 1 })
    await db.collection("products").createIndex({ averageRating: -1 })
    await db.collection("orders").createIndex({ userId: 1 })
    await db.collection("orders").createIndex({ status: 1 })
    await db.collection("orders").createIndex({ createdAt: -1 })

    console.log("✅ Database indexes created successfully!")

    console.log("\n🎉 === NexusKit Database Setup Complete ===")
    console.log("👥 User Accounts Created:")
    console.log("   🔐 Admin: admin@nexuskit.vn / password123")
    console.log("   👤 User:  user@nexuskit.vn / password123")
    console.log("\n📦 Products Created:")
    console.log("   📱 Smartphones: 3 products")
    console.log("   💻 Laptops: 3 products")
    console.log("   📟 Tablets: 2 products")
    console.log("   ⌚ Smartwatches: 2 products")
    console.log("   🎧 Audio: 2 products")
    console.log("   🎮 Gaming: 2 products")
    console.log("   🏠 Smart Home: 2 products")
    console.log("   🔌 Accessories: 4 products")
    console.log("   📊 Total: 20 products")
    console.log("\n🛒 Sample Orders: 2 orders created")
    console.log("\n🚀 Ready to start! Run: npm run dev")
    console.log("🌐 Visit: http://localhost:3000")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedComprehensiveData()
