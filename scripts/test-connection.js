const { MongoClient } = require("mongodb")

// Test multiple connection strings to find the correct one
const connectionStrings = [
  "mongodb+srv://hoangtrongtra2004:c0acSydB1gWsY5AH@cluster0.yakut8l.mongodb.net/nexuskit",
  "mongodb+srv://hoangtrongtra2004:JJH9lWYzBo3rNiwQ@cluster0.yakut8l.mongodb.net/nexuskit",
  // Add more if needed
]

async function testMultipleConnections() {
  console.log("🔍 Testing multiple MongoDB connection strings...")

  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i]
    const client = new MongoClient(uri)

    try {
      console.log(`\n🔄 Testing connection ${i + 1}...`)
      console.log(`URI: ${uri.replace(/:([^:@]{8})[^:@]*@/, ":$1***@")}`) // Hide password

      await client.connect()
      console.log(`✅ Connection ${i + 1} successful!`)

      const db = client.db("nexuskit")
      const collections = await db.listCollections().toArray()
      console.log(
        "📁 Available collections:",
        collections.map((c) => c.name),
      )

      // This connection works, update .env.local
      console.log(`\n🎯 Use this connection string in your .env.local:`)
      console.log(`MONGODB_URI=${uri}`)

      await client.close()
      return uri
    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed:`, error.message)
      await client.close()
    }
  }

  console.log("\n❌ All connection attempts failed!")
  console.log("\n🔧 Please check:")
  console.log("1. MongoDB Atlas cluster is running")
  console.log("2. Username and password are correct")
  console.log("3. IP address is whitelisted (0.0.0.0/0 for all IPs)")
  console.log("4. Database user has proper permissions")
}

testMultipleConnections()
