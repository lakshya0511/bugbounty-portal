import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import Issue from "./models/Issue.js";

const GITHUB_ORG = process.env.GITHUB_ORG;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_ORG || !GITHUB_TOKEN) {
  console.error("❌ GITHUB_ORG or GITHUB_TOKEN not set. Exiting fetchIssues.");
  process.exit(1);
}

const repos = ["bugtracker", "Ananya", "Ashna-Technical", "Praket", "lakshya-technical"];

// Fetch all issues from a single repository
async function fetchIssuesFromRepo(repoName) {
  try {
    const url = `https://api.github.com/repos/${GITHUB_ORG}/${repoName}/issues?state=all&per_page=100`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(`❌ Failed to fetch ${repoName}: ${err.message}`);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error(`❌ Error fetching issues for ${repoName}:`, err);
    return [];
  }
}

// Save or update an issue in MongoDB
async function saveIssueToDB(issue, repoName) {
  try {
    const existing = await Issue.findOne({ github_issue_id: issue.id });

    // Skip if nothing changed (optional optimization)
    if (existing && new Date(existing.updated_at).getTime() === new Date(issue.updated_at).getTime()) {
      return false;
    }

    await Issue.updateOne(
      { github_issue_id: issue.id },
      {
        $set: {
          github_number: issue.number,
          repo: repoName,
          org: GITHUB_ORG,
          title: issue.title,
          body: issue.body || "",
          url: issue.html_url,
          reporter: issue.user.login,
          labels: issue.labels.map(l => l.name),
          created_at: new Date(issue.created_at),
          updated_at: new Date(issue.updated_at),
          received_at: new Date(),
          status: issue.state === "closed" ? "closed" : (existing ? existing.status : "unreviewed"),
          immutable: existing ? existing.immutable : false
        }
      },
      { upsert: true }
    );

    console.log(`💾 ${existing ? "Updated" : "Saved"} issue #${issue.number} from ${repoName}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to save issue #${issue.number} from ${repoName}:`, err.message);
    return false;
  }
}

// Fetch and save issues from all repos
export async function fetchAllIssues() {
  console.log("⏳ Starting fetchAllIssues...");
  for (const repo of repos) {
    const issues = await fetchIssuesFromRepo(repo);
    for (const issue of issues) {
      // Skip pull requests
      if (!issue.pull_request) await saveIssueToDB(issue, repo);
    }
  }
  console.log("✅ fetchAllIssues completed");
}
