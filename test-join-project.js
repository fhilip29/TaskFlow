const mongoose = require("mongoose");

// Connect to the database
mongoose.connect("mongodb://127.0.0.1:27017/taskflowdb");

const projectMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "member", "viewer"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["active", "invited", "removed"],
    default: "invited",
  },
  lastActive: {
    type: Date,
  },
  invitationSentAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    members: [projectMemberSchema],
    invitationCode: { type: String, unique: true },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    settings: {
      isPublic: { type: Boolean, default: false },
      allowMemberInvite: { type: Boolean, default: true },
      maxMembers: Number,
    },
    metadata: {
      totalTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      progress: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

async function testJoinProject() {
  try {
    console.log("Testing join project functionality...");

    // Find a project with an invitation code
    const project = await Project.findOne({
      invitationCode: { $exists: true },
    });

    if (!project) {
      console.log("No project with invitation code found");
      process.exit(1);
    }

    console.log("Found project:", project.name);
    console.log("Invitation code:", project.invitationCode);
    console.log("Current members:", project.members.length);

    // Test user ID
    const testUserId = new mongoose.Types.ObjectId("676937ff9e3d562f1c195e42");
    const testEmail = "testuser@example.com";

    console.log("Adding test member:", {
      userId: testUserId,
      email: testEmail,
    });

    // Check if user already exists
    const existingMember = project.members.find(
      (m) =>
        m.userId?.toString() === testUserId.toString() ||
        m.email.toLowerCase() === testEmail.toLowerCase()
    );

    if (existingMember) {
      console.log("User already exists:", existingMember);
      if (existingMember.status === "active") {
        console.log("User is already an active member");
        process.exit(0);
      } else {
        console.log("Updating existing member to active...");
        existingMember.userId = testUserId;
        existingMember.email = testEmail;
        existingMember.status = "active";
        existingMember.joinedAt = new Date();
      }
    } else {
      console.log("Adding new member...");
      project.members.push({
        userId: testUserId,
        email: testEmail,
        role: "member",
        joinedAt: new Date(),
        status: "active",
      });
    }

    console.log("Project members before save:", project.members.length);
    console.log(
      "Member details:",
      project.members.map((m) => ({
        userId: m.userId?.toString(),
        email: m.email,
        role: m.role,
        status: m.status,
      }))
    );

    // Save the project
    const savedProject = await project.save();
    console.log("Project saved successfully");
    console.log("Members after save:", savedProject.members.length);

    // Verify the save by fetching again
    const verifyProject = await Project.findById(project._id);
    console.log("Verification - Members count:", verifyProject.members.length);
    console.log(
      "Verification - Member details:",
      verifyProject.members.map((m) => ({
        userId: m.userId?.toString(),
        email: m.email,
        role: m.role,
        status: m.status,
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error("Error testing join project:", error);
    process.exit(1);
  }
}

// Wait for connection
mongoose.connection.once("open", testJoinProject);
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
