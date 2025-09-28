// Test script to verify payment API functionality
const testPaymentAPI = async () => {
    console.log("🧪 Testing Payment API...")
  
    try {
      // Test GET endpoint (status check)
      console.log("\n1. Testing API status...")
      const statusResponse = await fetch("http://localhost:3000/api/payment/create-intent", {
        method: "GET",
      })
  
      const statusData = await statusResponse.json()
      console.log("✅ API Status:", JSON.stringify(statusData, null, 2))
  
      // Test POST endpoint (create payment intent)
      console.log("\n2. Testing payment intent creation...")
      const paymentResponse = await fetch("http://localhost:3000/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 100000, // 100,000 VND
          currency: "vnd",
          metadata: {
            test: true,
            timestamp: new Date().toISOString(),
          },
        }),
      })
  
      const paymentData = await paymentResponse.json()
  
      if (paymentResponse.ok) {
        console.log("✅ Payment Intent Created Successfully:")
        console.log("- Client Secret:", paymentData.clientSecret ? "Present" : "Missing")
        console.log("- Payment Intent ID:", paymentData.paymentIntentId)
        console.log("- Amount:", paymentData.amount)
        console.log("- Currency:", paymentData.currency)
      } else {
        console.log("❌ Payment Intent Creation Failed:")
        console.log("- Error:", paymentData.error)
        console.log("- Code:", paymentData.code)
        console.log("- Debug:", paymentData.debug)
      }
    } catch (error) {
      console.error("❌ Test failed:", error.message)
    }
  }
  
  // Run the test
  testPaymentAPI()
  