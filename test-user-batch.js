const fetch = require("node-fetch");

async function testBatchEndpoint() {
  try {
    console.log("Testing batch users endpoint...");

    const response = await fetch("http://localhost:4001/api/users/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIds: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      }),
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testBatchEndpoint();
