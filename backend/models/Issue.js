import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  github_issue_id: { type: Number, unique: true },
  github_number: Number,
  repo: String,
  org: String,
  title: String,
  body: String,
  url: String,
  reporter: String,
  reporterTeam: { type: String, default: "Unknown Team" },
  labels: [String],
  created_at: Date,
  updated_at: Date,
  received_at: Date,
  status: { type: String, default: "unreviewed" },
  points: Number,
  marked_by: String,
  marked_at: Date,
  immutable: { type: Boolean, default: false },
});

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
