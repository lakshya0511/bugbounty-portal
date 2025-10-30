import express from "express";
import User from "../models/User.mjs";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const users = await User.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select("githubUsername totalPoints role -_id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
