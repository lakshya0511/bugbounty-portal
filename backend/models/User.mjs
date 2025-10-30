import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  githubUsername: { type: String, unique: true, required: true },
  role: { type: String, enum: ["reporter", "reviewer"], default: "reporter" },
  totalPoints: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

// Create and export explicitly
const User = mongoose.model("User", userSchema);

// ✅ Export both named and default (covers all import styles)
export { User };
export default User;
