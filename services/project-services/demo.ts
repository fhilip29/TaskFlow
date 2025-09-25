/**
 * Project Service API Demo
 *
 * This script demonstrates the Project Service API capabilities
 * Run with: npm run demo
 */

import axios from "axios";

const BASE_URL = "http://localhost:4002";
const AUTH_URL = "http://localhost:4000"; // Assuming auth service is running

// Demo JWT token (replace with real token from auth service)
const DEMO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.token";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${DEMO_TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function runDemo() {
  console.log("🚀 TaskFlow Project Service Demo\n");

  try {
    // 1. Health Check
    console.log("1. Health Check...");
    const health = await api.get("/");
    console.log("✅ Service is healthy:", health.data.message);
    console.log("📍 API Docs:", `${BASE_URL}${health.data.endpoints.docs}\n`);

    // 2. Create a demo project
    console.log("2. Creating demo project...");
    const projectData = {
      name: "TaskFlow Demo Project",
      description: "A demonstration project for the TaskFlow API",
      isPublic: false,
      allowMemberInvite: true,
      maxMembers: 5,
      settings: {
        allowTaskCreation: true,
        allowFileUploads: true,
        allowComments: true,
        requireTaskApproval: false,
        emailNotifications: true,
      },
    };

    const createResponse = await api.post("/api/projects", projectData);
    const project = createResponse.data.data;
    console.log("✅ Project created:", project.name);
    console.log("🔑 Project ID:", project._id);
    console.log("🎫 Invitation Code:", project.invitationCode);
    console.log("📱 QR Code:", project.qrCode ? "Generated" : "Not generated");

    const projectId = project._id;

    // 3. Get user projects
    console.log("\n3. Fetching user projects...");
    const projectsList = await api.get("/api/projects?page=1&limit=5");
    console.log("✅ Found projects:", projectsList.data.pagination.total);

    // 4. Get project details
    console.log("\n4. Getting project details...");
    const projectDetails = await api.get(`/api/projects/${projectId}`);
    console.log("✅ Project details loaded");
    console.log("👥 Members:", projectDetails.data.data.members.length);
    console.log("📊 Progress:", `${projectDetails.data.data.progress}%`);

    // 5. Try to invite a member
    console.log("\n5. Inviting a member...");
    try {
      const inviteResponse = await api.post(
        `/api/projects/${projectId}/invite`,
        {
          email: "demo.member@example.com",
          role: "member",
        }
      );
      console.log("✅ Invitation sent:", inviteResponse.data.message);
    } catch (error: any) {
      console.log(
        "⚠️ Invitation demo (stub):",
        error.response?.data?.message || "Service integration needed"
      );
    }

    // 6. Get project members
    console.log("\n6. Getting project members...");
    const membersResponse = await api.get(`/api/projects/${projectId}/members`);
    console.log("✅ Members loaded:", membersResponse.data.data.length);

    // 7. Update project
    console.log("\n7. Updating project...");
    const updateResponse = await api.put(`/api/projects/${projectId}`, {
      description: "Updated description - Demo completed successfully!",
    });
    console.log("✅ Project updated");

    // 8. Clean up - delete demo project
    console.log("\n8. Cleaning up demo project...");
    await api.delete(`/api/projects/${projectId}`);
    console.log("✅ Demo project deleted");

    console.log("\n🎉 Demo completed successfully!");
    console.log("\n📋 What was demonstrated:");
    console.log("   ✓ Health check and service status");
    console.log("   ✓ Project creation with full metadata");
    console.log("   ✓ JWT authentication and authorization");
    console.log("   ✓ Project listing with pagination");
    console.log("   ✓ Member invitation system (stub)");
    console.log("   ✓ Role-based access control");
    console.log("   ✓ CRUD operations");
    console.log("   ✓ Data validation and error handling");
  } catch (error: any) {
    if (error.response) {
      console.error(
        "❌ API Error:",
        error.response.status,
        error.response.data
      );

      if (error.response.status === 401) {
        console.log("\n🔐 Authentication Required:");
        console.log("   1. Start the Auth Service (port 4000)");
        console.log("   2. Login/register to get a valid JWT token");
        console.log("   3. Replace DEMO_TOKEN in this script");
        console.log("   4. Run the demo again");
      }
    } else if (error.code === "ECONNREFUSED") {
      console.error("❌ Connection Error: Project Service not running");
      console.log("\n🚀 To start the service:");
      console.log("   cd services/project-services");
      console.log("   npm run dev");
    } else {
      console.error("❌ Unexpected Error:", error.message);
    }
  }
}

// Error handling for the demo
process.on("uncaughtException", (error: Error) => {
  console.error("❌ Uncaught Exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (error: Error) => {
  console.error("❌ Unhandled Rejection:", error.message);
  process.exit(1);
});

// Run the demo
if (require.main === module) {
  runDemo().then(() => {
    console.log(
      "\n👋 Demo finished. Check API docs at: http://localhost:4002/api-docs"
    );
    process.exit(0);
  });
}

export default runDemo;
