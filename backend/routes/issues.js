// routes/issues.js
import express from "express";
import Issue from "../models/Issue.js";
import User from "../models/User.mjs";
import { fetchAllIssues } from "../fetchIssues.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /issues (reviewer only) — full list
router.get("/", requireAuth, requireRole("reviewer"), async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /issues/my — for reporters to see their issues
router.get("/my", requireAuth, async (req, res) => {
  try {
    const username = req.user.githubUsername;
    const issues = await Issue.find({ reporter: username });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /issues/sync → trigger GitHub fetch manually (reviewer-only maybe)
router.post("/sync", requireAuth, requireRole("reviewer"), async (req, res) => {
  try {
    await fetchAllIssues();
    res.json({ message: "✅ Issues synced" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: map status to points
function pointsForStatus(status) {
  if (status === "valid") return 10;
  if (status === "invalid") return -5;
  return 0;
}

// PATCH /issues/:id/status → update status to valid/invalid (reviewer only)
router.patch("/:id/status", requireAuth, requireRole("reviewer"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["valid", "invalid"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'valid' or 'invalid'" });
  }

  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    if (issue.immutable) return res.status(403).json({ error: "Issue is immutable / locked" });

    // compute delta for reporter points
    const oldPoints = pointsForStatus(issue.status);
    const newPoints = pointsForStatus(status);
    const delta = newPoints - oldPoints;

    // apply status update
    issue.status = status;
    issue.marked_by = req.user.githubUsername;
    issue.marked_at = new Date();

    await issue.save();

    // update reporter's totalPoints (upsert user record if missing)
    const reporter = issue.reporter;
    const user = await User.findOneAndUpdate(
      { githubUsername: reporter },
      { $inc: { totalPoints: delta } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ issue, reporter: user });
  } catch (err) {
    console.error("❌ Error updating issue status:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
