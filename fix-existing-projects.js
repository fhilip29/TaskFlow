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

async function fixExistingProjects() {
  try {
    console.log("Fixing existing projects with empty member emails...");

    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects`);

    for (const project of projects) {
      let needsSave = false;

      for (const member of project.members) {
        if (!member.email || member.email === "") {
          console.log(
            `Fixing empty email for member ${member.userId} in project ${project.name}`
          );
          // Set a placeholder email based on user ID
          member.email = `user-${member.userId
            .toString()
            .slice(-8)}@placeholder.com`;
          needsSave = true;
        }
      }

      if (needsSave) {
        try {
          // Bypass validation by using updateOne instead of save()
          await Project.updateOne(
            { _id: project._id },
            { $set: { members: project.members } }
          );
          console.log(`Fixed project: ${project.name}`);
        } catch (error) {
          console.error(`Error fixing project ${project.name}:`, error);
        }
      }
    }

    console.log("Finished fixing projects");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing projects:", error);
    process.exit(1);
  }
}

// Wait for connection
mongoose.connection.once("open", fixExistingProjects);
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
