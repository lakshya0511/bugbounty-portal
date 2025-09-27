export async function GET(req) {
  const token = process.env.GITHUB_TOKEN;
  const org = "mhashtrial"; // replace

  try {
    const headers = { Authorization: `token ${token}` };

    // Step 1: Get all teams
    const teamsRes = await fetch(`https://api.github.com/orgs/${org}/teams?per_page=100`, { headers });
    const teams = await teamsRes.json();
    if (!Array.isArray(teams)) return new Response(JSON.stringify(teams), { status: 200 });

    // Step 2: Build username -> team map
    const userTeamMap = {};
    for (const team of teams) {
      const membersRes = await fetch(`https://api.github.com/orgs/${org}/teams/${team.slug}/members?per_page=100`, { headers });
      const members = await membersRes.json();
      if (Array.isArray(members)) {
        members.forEach((member) => {
          userTeamMap[member.login] = team.name;
        });
      }
    }

    // Step 3: Fetch all repos
    const reposRes = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, { headers });
    const repos = await reposRes.json();
    if (!Array.isArray(repos)) return new Response(JSON.stringify(repos), { status: 200 });

    // Step 4: Fetch issues from all repos
    const issuesPromises = repos.map(async (repo) => {
      const issuesRes = await fetch(
        `https://api.github.com/repos/${org}/${repo.name}/issues?state=open&per_page=100`,
        { headers }
      );
      const issuesData = await issuesRes.json();
      return Array.isArray(issuesData)
        ? issuesData.map((issue) => ({
            id: issue.id,
            title: issue.title,
            body: issue.body,
            reporter: issue.user.login,
            reporterTeam: userTeamMap[issue.user.login] || "Unknown Team",
            repo: repo.name,
          }))
        : [];
    });

    const allIssuesNested = await Promise.all(issuesPromises);
    const allIssues = allIssuesNested.flat();

    return new Response(JSON.stringify(allIssues), { status: 200 });
  } catch (err) {
    console.error("Failed to fetch issues:", err);
    return new Response(JSON.stringify({ message: "Failed to fetch issues" }), { status: 500 });
  }
}
