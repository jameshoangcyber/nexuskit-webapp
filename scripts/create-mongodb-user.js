// This script helps you understand what might be wrong with MongoDB setup
console.log("🔧 MongoDB Atlas Setup Checklist:")
console.log("\n1. ✅ Create Database User:")
console.log("   - Go to Database Access in MongoDB Atlas")
console.log("   - Click 'Add New Database User'")
console.log("   - Username: hoangtrongtra2004")
console.log("   - Password: [your-password]")
console.log("   - Database User Privileges: Atlas admin or Read and write to any database")

console.log("\n2. ✅ Network Access:")
console.log("   - Go to Network Access in MongoDB Atlas")
console.log("   - Click 'Add IP Address'")
console.log("   - Add 0.0.0.0/0 (Allow access from anywhere)")
console.log("   - Or add your specific IP address")

console.log("\n3. ✅ Get Connection String:")
console.log("   - Go to Database > Connect")
console.log("   - Choose 'Connect your application'")
console.log("   - Copy the connection string")
console.log("   - Replace <password> with your actual password")

console.log("\n4. ✅ Common Issues:")
console.log("   - Password contains special characters (use URL encoding)")
console.log("   - IP not whitelisted")
console.log("   - User doesn't have proper permissions")
console.log("   - Cluster is paused/stopped")

console.log("\n🔗 MongoDB Atlas Dashboard: https://cloud.mongodb.com/")
