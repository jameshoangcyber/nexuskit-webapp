const { MongoClient } = require("mongodb")

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://hoangtrongtra2004:JJH9lWYzBo3rNiwQ@cluster0.yakut8l.mongodb.net/nexuskit"

// Category mapping for consolidation
const categoryMapping = {
  // Keep existing categories as they are - they're already well organized
  smartphone: "smartphone",
  laptop: "laptop",
  tablet: "tablet",
  smartwatch: "smartwatch",
  audio: "audio",
  gaming: "gaming",
  smarthome: "smarthome",
  accessories: "accessories",

  // Map any old categories to new ones if needed
  premium: "smartphone", // Map premium to smartphone
  standard: "smartphone", // Map standard to smartphone
  lite: "smartphone", // Map lite to smartphone
  business: "laptop", // Map business to laptop
}

async function updateProductCategories() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("nexuskit")
    const productsCollection = db.collection("products")

    console.log("🔄 Updating product categories...")

    // Get all products
    const products = await productsCollection.find({}).toArray()
    console.log(`Found ${products.length} products to update`)

    let updatedCount = 0

    for (const product of products) {
      const currentCategory = product.category
      const newCategory = categoryMapping[currentCategory] || currentCategory

      if (newCategory !== currentCategory) {
        await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              category: newCategory,
              updatedAt: new Date(),
            },
          },
        )
        console.log(`Updated product "${product.name}": ${currentCategory} → ${newCategory}`)
        updatedCount++
      }
    }

    console.log(`✅ Updated ${updatedCount} products`)

    // Create category statistics
    console.log("\n📊 Category Statistics:")
    const categoryStats = await productsCollection
      .aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray()

    categoryStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count} products`)
    })

    console.log("\n🎉 Product categorization update completed!")
    console.log("📝 Summary:")
    console.log("   • Consolidated subcategories into main categories")
    console.log("   • Updated navigation to use unified 'Product Categories'")
    console.log("   • Enhanced filtering system with category counts")
    console.log("   • Created dedicated categories overview page")
  } catch (error) {
    console.error("❌ Error updating categories:", error)
  } finally {
    await client.close()
  }
}

updateProductCategories()
