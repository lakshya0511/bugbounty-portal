import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const org = "testingDev1903"; // replace with your org

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  try {
    // Step 1: Get all teams
    const teamsRes = await fetch(`https://api.github.com/orgs/${org}/teams?per_page=100`, { headers });
    if (!teamsRes.ok) {
      const error = await teamsRes.text();
      return NextResponse.json({ message: "Failed to fetch teams", error }, { status: teamsRes.status });
    }
    const teams = await teamsRes.json();

    // Step 2: Build username -> team map
    const userTeamMap = {};
    for (const team of teams) {
      const membersRes = await fetch(
        `https://api.github.com/orgs/${org}/teams/${team.slug}/members?per_page=100`,
        { headers }
      );
      if (!membersRes.ok) continue;
      const members = await membersRes.json();
      if (Array.isArray(members)) {
        members.forEach((member) => {
          userTeamMap[member.login] = team.name;
        });
      }
    }

    // Step 3: Fetch all repos
    const reposRes = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, { headers });
    if (!reposRes.ok) {
      const error = await reposRes.text();
      return NextResponse.json({ message: "Failed to fetch repos", error }, { status: reposRes.status });
    }
    const repos = await reposRes.json();

    // Step 4: Fetch issues from all repos
    const issuesPromises = repos.map(async (repo) => {
      const issuesRes = await fetch(
        `https://api.github.com/repos/${org}/${repo.name}/issues?state=open&per_page=100`,
        { headers }
      );
      if (!issuesRes.ok) return { repo, issues: [] };
      const issuesData = await issuesRes.json();
      const issues = Array.isArray(issuesData)
        ? issuesData.map((issue) => ({
            id: issue.id,
            title: issue.title,
            body: issue.body,
            reporter: issue.user?.login || "Unknown",
            reporterTeam: userTeamMap[issue.user?.login] || "Unknown Team",
            repo: repo.name,
            url: issue.html_url,
            state: issue.state,
            createdAt: issue.created_at,
          }))
        : [];
      return { repo, issues };
    });

    const allIssuesNested = await Promise.all(issuesPromises);

    // Separate issues vs empty repos
    const issues = [];
    const issuelessRepos = [];
    allIssuesNested.forEach(({ repo, issues: repoIssues }) => {
      if (repoIssues.length === 0) issuelessRepos.push({ name: repo.name });
      else issues.push(...repoIssues);
    });

    return NextResponse.json({ issues, issuelessRepos }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch issues:", err);
    return NextResponse.json({ message: "Failed to fetch issues" }, { status: 500 });
  }
}
