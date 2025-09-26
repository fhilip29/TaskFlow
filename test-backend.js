const testBackend = async () => {
  console.log("🚀 Testing TaskFlow Backend Services...\n");

  const services = [
    { name: "Auth Service", url: "http://localhost:4000/health" },
    { name: "Users Service", url: "http://localhost:4001/health" },
    { name: "Project Service", url: "http://localhost:4002/health" },
  ];

  for (const service of services) {
    try {
      console.log(`Testing ${service.name}...`);

      const response = await fetch(service.url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${service.name}: ${data.message || "OK"}`);
      } else {
        console.log(`❌ ${service.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${service.name}: Connection failed - ${error.message}`);
    }
  }

  console.log("\n📋 Test Summary:");
  console.log("If any service shows ❌, make sure it's running:");
  console.log("- Auth Service: cd services/auth-services && npm run dev");
  console.log("- Users Service: cd services/users-services && npm run dev");
  console.log("- Project Service: cd services/project-services && npm run dev");
  console.log("\n🌐 Frontend: http://localhost:3000");
};

// Run the test
testBackend().catch(console.error);
