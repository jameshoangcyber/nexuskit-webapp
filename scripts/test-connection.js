const { MongoClient } = require("mongodb")

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://hoangtrongtra2004:JJH9lWYzBo3rNiwQ@cluster0.yakut8l.mongodb.net/nexuskit"

async function testConnection() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("🔄 Testing MongoDB connection...")
    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")

    const db = client.db("nexuskit")

    // Test collections
    const collections = await db.listCollections().toArray()
    console.log(
      "📁 Available collections:",
      collections.map((c) => c.name),
    )

    // Count documents
    const userCount = await db.collection("users").countDocuments()
    const productCount = await db.collection("products").countDocuments()
    const orderCount = await db.collection("orders").countDocuments()

    console.log("📊 Document counts:")
    console.log(`   Users: ${userCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Orders: ${orderCount}`)

    if (productCount === 0) {
      console.log("⚠️  No products found! Run the seeding script:")
      console.log("   node scripts/seed-comprehensive-data.js")
    }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
  } finally {
    await client.close()
  }
}

testConnection()
