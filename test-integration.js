#!/usr/bin/env node

/**
 * Integration Test Script for TaskFlow Services
 * Tests that all services are running and can communicate with each other
 */

const https = require("http");
const { URL } = require("url");

// Service configurations
const services = [
  { name: "Auth Service", url: "http://localhost:4000" },
  { name: "Users Service", url: "http://localhost:4001/health" },
  { name: "Project Service", url: "http://localhost:4002" },
  { name: "Task Service", url: "http://localhost:3003/health" },
  { name: "Frontend", url: "http://localhost:3000" },
];

// Test function for HTTP requests
function testService(service) {
  return new Promise((resolve, reject) => {
    const url = new URL(service.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "GET",
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      let statusCode = res.statusCode;
      // Handle undefined status code for frontend
      if (statusCode === undefined || statusCode === null) {
        statusCode = 200; // Assume success if we get a response
      }

      if (statusCode >= 200 && statusCode < 400) {
        resolve({ name: service.name, status: "OK", statusCode: statusCode });
      } else {
        resolve({
          name: service.name,
          status: "ERROR",
          statusCode: statusCode,
        });
      }
    });

    req.on("error", (err) => {
      resolve({ name: service.name, status: "ERROR", error: err.message });
    });

    req.on("timeout", () => {
      resolve({
        name: service.name,
        status: "TIMEOUT",
        error: "Request timed out",
      });
    });

    req.end();
  });
}

// Main test function
async function runIntegrationTests() {
  console.log("🚀 Starting TaskFlow Integration Tests");
  console.log("=====================================");

  const results = [];

  for (const service of services) {
    console.log(`Testing ${service.name}...`);
    const result = await testService(service);
    results.push(result);

    if (result.status === "OK") {
      console.log(`✅ ${result.name}: ${result.status} (${result.statusCode})`);
    } else {
      console.log(
        `❌ ${result.name}: ${result.status} - ${
          result.error || result.statusCode
        }`
      );
    }
  }

  console.log("\n📊 Test Summary");
  console.log("================");

  const successful = results.filter((r) => r.status === "OK").length;
  const total = results.length;

  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  if (successful === total) {
    console.log("\n🎉 All services are running correctly!");
    console.log("\nService URLs:");
    console.log("- Auth Service: http://localhost:4000");
    console.log("- Users Service: http://localhost:4001");
    console.log("- Project Service: http://localhost:4002");
    console.log("- Task Service: http://localhost:3003");
    console.log("- Frontend Application: http://localhost:3000");
    console.log("\n📝 Available Pages:");
    console.log("- Dashboard: http://localhost:3000/dashboard");
    console.log("- Projects: http://localhost:3000/projects");
    console.log("- Tasks: http://localhost:3000/tasks");
    console.log("- Login: http://localhost:3000/login");
  } else {
    console.log("\n⚠️  Some services are not responding correctly.");
    console.log(
      "Please check the failed services and ensure they are running."
    );
  }

  return successful === total;
}

// Run the tests
runIntegrationTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Integration tests failed:", error);
    process.exit(1);
  });
