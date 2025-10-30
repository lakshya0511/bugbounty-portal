const BASE_URL = "http://localhost:4000/api/issues";

// 🟦 Fetch all issues (for reviewers)
export const getAllIssues = async (token) => {
  console.log("🟦 [getAllIssues] Starting fetch...");
  try {
    const res = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("🛰️ [getAllIssues] Response status:", res.status);
    const text = await res.text();
    console.log("📦 [getAllIssues] Raw response:", text);

    const data = JSON.parse(text);
    if (!res.ok) throw new Error("Failed to fetch issues");
    return data;
  } catch (err) {
    console.error("❌ [getAllIssues] Error:", err);
    return [];
  }
};

// 🟩 Fetch only logged-in user’s issues (for reporters)
export const getMyIssues = async (token) => {
  console.log("🟩 [getMyIssues] Starting fetch...");
  try {
    const res = await fetch(`${BASE_URL}/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("🛰️ [getMyIssues] Response status:", res.status);
    const text = await res.text();
    console.log("📦 [getMyIssues] Raw response:", text);

    const data = JSON.parse(text);
    if (!res.ok) throw new Error("Failed to fetch my issues");
    return data;
  } catch (err) {
    console.error("❌ [getMyIssues] Error:", err);
    return [];
  }
};

// 🟨 Update issue status (Valid/Invalid)
export const updateIssueStatus = async (id, status, token) => {
  console.log("🟨 [updateIssueStatus] Updating issue:", id, status);
  try {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    console.log("🛰️ [updateIssueStatus] Response status:", res.status);
    const text = await res.text();
    console.log("📦 [updateIssueStatus] Raw response:", text);

    const data = JSON.parse(text);
    if (!res.ok) throw new Error("Failed to update issue status");
    return data;
  } catch (err) {
    console.error("❌ [updateIssueStatus] Error:", err);
    return null;
  }
};

// 🏁 Fetch leaderboard
export const fetchLeaderboard = async (token) => {
  console.log("🏁 [fetchLeaderboard] Fetching leaderboard...");
  try {
    const res = await fetch("http://localhost:4000/api/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("🛰️ [fetchLeaderboard] Response status:", res.status);
    const text = await res.text();
    console.log("📦 [fetchLeaderboard] Raw response:", text);

    const data = JSON.parse(text);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return data;
  } catch (err) {
    console.error("❌ [fetchLeaderboard] Error:", err);
    return [];
  }
};
