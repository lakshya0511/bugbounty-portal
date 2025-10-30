// scripts/recalculatePoints.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Issue from "../models/Issue.js";
import User from "../models/User.mjs";

async function recalc() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to DB for recalculation...");

  // zero all users first
  await User.updateMany({}, { $set: { totalPoints: 0 } });

  const issues = await Issue.find();
  const map = new Map();

  function pts(status) {
    if (status === "valid") return 10;
    if (status === "invalid") return -5;
    return 0;
  }

  for (const issue of issues) {
    const reporter = issue.reporter;
    const p = pts(issue.status);
    if (!map.has(reporter)) map.set(reporter, 0);
    map.set(reporter, map.get(reporter) + p);
  }

  for (const [githubUsername, totalPoints] of map.entries()) {
    await User.findOneAndUpdate({ githubUsername }, { $set: { totalPoints } }, { upsert: true });
    console.log("Updated", githubUsername, totalPoints);
  }

  console.log("Recalculation done");
  process.exit(0);
}

recalc().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
