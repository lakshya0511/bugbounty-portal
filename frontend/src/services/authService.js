// authService.js
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

export async function fetchGithubAuthUrl() {
  // If you used the redirect approach in backend: just open `${API}/auth/github`
  return `${API}/auth/github`;
}

// If backend returns JSON on callback (our current backend returns JSON), call backend route to exchange code.
// For this guide, we assume backend handles the OAuth redirect and returns { token, user } when frontend hits /auth/github/callback (optional).
// But simpler: use backend redirect flow (open /auth/github), then backend redirects to frontend with token in query.
// We'll implement a small helper to process token from query:
export function parseTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}
