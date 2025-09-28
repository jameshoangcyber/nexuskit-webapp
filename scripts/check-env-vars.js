// Script to check if all required environment variables are set
const requiredEnvVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "MONGODB_URI",
    "JWT_SECRET",
  ]
  
  console.log("🔍 Checking Environment Variables...\n")
  
  let allGood = true
  
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName]
    const status = value ? "✅" : "❌"
    const display = value
      ? varName.includes("SECRET") || varName.includes("KEY")
        ? `${value.substring(0, 8)}...`
        : value.substring(0, 20) + (value.length > 20 ? "..." : "")
      : "MISSING"
  
    console.log(`${status} ${varName}: ${display}`)
  
    if (!value) {
      allGood = false
    }
  })
  
  console.log("\n" + "=".repeat(50))
  
  if (allGood) {
    console.log("✅ All environment variables are configured!")
  } else {
    console.log("❌ Some environment variables are missing!")
    console.log("\nPlease check your .env.local file and ensure all required variables are set.")
  }
  
  // Additional Stripe-specific checks
  if (process.env.STRIPE_SECRET_KEY) {
    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      console.log("⚠️  WARNING: STRIPE_SECRET_KEY should start with 'sk_'")
      allGood = false
    }
  }
  
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
      console.log("⚠️  WARNING: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with 'pk_'")
      allGood = false
    }
  }
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    if (!process.env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) {
      console.log("⚠️  WARNING: STRIPE_WEBHOOK_SECRET should start with 'whsec_'")
      allGood = false
    }
  }
  
  console.log("\n🎯 Final Status:", allGood ? "READY" : "NEEDS ATTENTION")
  