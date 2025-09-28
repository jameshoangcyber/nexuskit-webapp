const { MongoClient } = require("mongodb")

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://hoangtrongtra2004:JJH9lWYzBo3rNiwQ@cluster0.yakut8l.mongodb.net/nexuskit"

async function testProducts() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🔄 Testing products...")
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("nexuskit")
    const productsCollection = db.collection("products")

    // Count all products
    const totalProducts = await productsCollection.countDocuments()
    console.log(`📦 Total products in database: ${totalProducts}`)

    // Count active products
    const activeProducts = await productsCollection.countDocuments({ isActive: true })
    console.log(`✅ Active products: ${activeProducts}`)

    // Get first few products
    const sampleProducts = await productsCollection.find({ isActive: true }).limit(3).toArray()
    console.log("📋 Sample products:")
    sampleProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.price} VND`)
    })

    if (totalProducts === 0) {
      console.log("⚠️  No products found! Run the seeding script:")
      console.log("   node scripts/seed-comprehensive-data.js")
    }
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

testProducts()
