import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../services/issueService";
import { useAuth } from "../context/AuthContext";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchLeaderboard(token, 100);
        // Filter out reviewers
        const filtered = data.filter((u) => u.role !== "reviewer");
        setRows(filtered);
      } catch (err) {
        console.error("❌ Error fetching leaderboard:", err);
      }
    })();
  }, [token]);

  return (
    <div className="lb-container">
      <h1 style={{ marginBottom: "20px", color: "#194c8b" }}>Leaderboard</h1>
      <table className="lb-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>GitHub Username</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="3" className="lb-no-data">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((u, idx) => (
              <tr key={u.githubUsername}>
                <td className="lb-rank">{idx + 1}</td>
                <td className="lb-username">
                  <a
                    href={`https://github.com/${u.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lb-github-link"
                  >
                    {u.githubUsername}
                  </a>
                </td>
                <td className="lb-points">{u.totalPoints}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
